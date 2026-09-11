#!/usr/bin/env node
/**
 * Mise en production, d'un seul geste et avec les garde-fous.
 *
 *   npm run deploy:prod -- --yes
 *
 * POURQUOI CE SCRIPT EXISTE. La suite d'opérations est courte mais son ordre
 * n'est pas négociable, et une seule d'entre elles est destructive : la
 * migration 0002 recrée la table `messages`, qui porte l'historique du couple
 * ET le compteur des preuves (EF-14.6). Enchaîner ça à la main, un soir, sur
 * une app en service, c'est exactement la situation où l'on oublie la
 * sauvegarde. Le script ne l'oublie pas, et il refuse d'avancer si la
 * sauvegarde est vide ou si le nombre de lignes a bougé.
 *
 * Ce qu'il fait, dans cet ordre :
 *   1. vérifie que wrangler est authentifié ;
 *   2. exporte la base de production dans backup-<horodatage>.sql ;
 *   3. vérifie que cette sauvegarde contient vraiment quelque chose ;
 *   4. compte les lignes AVANT ;
 *   5. applique les migrations en attente ;
 *   6. recompte, relit le schéma, et compare — s'il manque une ligne, il crie ;
 *   7. construit le front ;
 *   8. déploie ;
 *   9. vérifie que le site en ligne sert bien la nouvelle version.
 *
 * Ce qu'il ne fait pas, et n'a pas à faire : toucher au `VERSION` de
 * `public/sw.js`. Le service worker sert le RÉSEAU d'ABORD : une nouvelle
 * version descend sur les téléphones à la prochaine ouverture, sans
 * réinstallation et sans qu'on ait rien à incrémenter. Le numéro ne compte que
 * si `sw.js` lui-même change.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { firstJson, runWrangler } from './wrangler.mjs';

const BASE = 'bcglove';
const SITE = 'https://bcglove.pages.dev';

if (!process.argv.includes('--yes')) {
  console.error('\nMise en production de BCGlove.\n');
  console.error('Cette commande applique les migrations en attente sur la base de PRODUCTION,');
  console.error('celle que les deux iPhones utilisent, puis déploie le site.');
  console.error('Une sauvegarde est prise avant toute chose et le script s’arrête si elle est vide.\n');
  console.error('Pour confirmer :  npm run deploy:prod -- --yes\n');
  process.exit(1);
}

/** Un pas du scénario. On annonce avant, on conclut après : un script muet inquiète. */
let etape = 0;
const pas = (titre) => console.log(`\n[${++etape}] ${titre}`);
const bon = (message) => console.log(`    ✓ ${message}`);
const stop = (message, suite) => {
  console.error(`    ✗ ${message}`);
  if (suite) console.error(`\n${suite}\n`);
  process.exit(1);
};

/** Un binaire de node_modules, lancé avec le Node courant — jamais par npx. */
function runNodeBin(relatif, args, titre) {
  const entree = resolve(relatif);
  if (!existsSync(entree)) stop(`${relatif} est introuvable.`, 'Lancez d’abord : npm install');
  const r = spawnSync(process.execPath, [entree, ...args], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  if (r.error) stop(`${titre} n’a pas pu démarrer : ${r.error.message}`);
  if (r.signal) stop(`${titre} a été interrompu (${r.signal})`);
  if (r.status !== 0) stop(`${titre} a échoué (code ${r.status})`);
}

/** Une requête sur la base de production, dont on veut le résultat. */
function interroge(sql) {
  const r = runWrangler(['d1', 'execute', BASE, '--remote', '--json', '--command', sql], {
    capture: true,
  });
  if (!r.ok) stop(`la requête a échoué : ${r.message}`);
  const json = firstJson(r.stdout);
  const lignes = json?.[0]?.results;
  if (!Array.isArray(lignes)) stop('réponse illisible de la base', r.stdout.slice(0, 400));
  return lignes;
}

// ---------------------------------------------------------------- 1. les accès
pas('Vérification des accès Cloudflare');
{
  const r = runWrangler(['whoami'], { capture: true });
  if (!r.ok || /not authenticated/i.test(r.stdout)) {
    stop(
      'wrangler n’est pas authentifié.',
      'Lancez  npx wrangler login  (il ouvre un navigateur), puis relancez cette commande.\n' +
        'Sur une machine sans navigateur, posez un jeton d’API dans CLOUDFLARE_API_TOKEN.',
    );
  }
  bon('authentifié');
}

// ------------------------------------------------------------ 2. la sauvegarde
const horodatage = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const sauvegarde = `backup-${horodatage}.sql`;

pas(`Sauvegarde de la base de production dans ${sauvegarde}`);
{
  const r = runWrangler(['d1', 'export', BASE, '--remote', '--output', sauvegarde]);
  if (!r.ok) stop(`l’export a échoué : ${r.message}`, 'Rien n’a été modifié.');
  if (!existsSync(sauvegarde)) stop('le fichier de sauvegarde n’a pas été créé.', 'Rien n’a été modifié.');

  const taille = statSync(sauvegarde).size;
  const contenu = readFileSync(sauvegarde, 'utf8');
  // Une sauvegarde qui ne contient pas la table qu'on va recréer ne protège de
  // rien. C'est le seul filet : on le vérifie avant de s'en servir.
  if (taille < 500 || !/CREATE TABLE.*messages/is.test(contenu)) {
    stop(
      `la sauvegarde paraît vide ou incomplète (${taille} octets).`,
      'Rien n’a été modifié. N’allez pas plus loin sans une sauvegarde lisible.',
    );
  }
  bon(`${taille} octets, la table messages y est`);
  console.log('      (ce fichier est git-ignoré : gardez-le ailleurs qu’ici)');
}

// -------------------------------------------------------------- 3. l'état d'avant
pas('État de la base avant migration');
const avant = {
  messages: interroge('SELECT COUNT(*) AS n FROM messages')[0]?.n ?? null,
  utilisateurs: interroge('SELECT COUNT(*) AS n FROM users')[0]?.n ?? null,
  abonnements: interroge('SELECT COUNT(*) AS n FROM subscriptions')[0]?.n ?? null,
};
bon(`${avant.messages} message(s), ${avant.utilisateurs} utilisateur(s), ${avant.abonnements} abonnement(s)`);

// ---------------------------------------------------------------- 4. migration
pas('Application des migrations en attente');
{
  const r = runWrangler(['d1', 'migrations', 'apply', BASE, '--remote']);
  if (!r.ok) {
    stop(
      `la migration a échoué : ${r.message}`,
      `La sauvegarde est dans ${sauvegarde}. Vérifiez l’état de la base avant de réessayer.`,
    );
  }
  bon('migrations appliquées');
}

// ------------------------------------------------------------- 5. la vérification
pas('Vérification : aucune ligne perdue');
{
  const apres = interroge('SELECT COUNT(*) AS n FROM messages')[0]?.n ?? null;
  if (apres !== avant.messages) {
    stop(
      `${avant.messages} message(s) avant, ${apres} après.`,
      `L’historique a bougé. RESTAUREZ depuis ${sauvegarde} avant toute autre chose.`,
    );
  }
  bon(`${apres} message(s), comme avant`);

  const schema = interroge("SELECT sql FROM sqlite_master WHERE name = 'messages'")[0]?.sql ?? '';
  if (!/'love'/.test(schema)) {
    stop("la contrainte de `kind` n’accepte toujours pas 'love'.", 'Le geste du cœur échouerait en ligne.');
  }
  bon("la contrainte accepte le geste 'love'");

  const index = interroge(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'messages' AND name NOT LIKE 'sqlite_%'",
  ).map((l) => l.name);
  if (index.length < 3) stop(`il ne reste que ${index.length} index sur messages`, index.join(', '));
  bon(`${index.length} index en place`);
}

// ------------------------------------------------------------------- 6. le build
pas('Construction du front');
runNodeBin('node_modules/typescript/bin/tsc', ['--noEmit'], 'la vérification des types');
runNodeBin('node_modules/vite/bin/vite.js', ['build'], 'le build');
bon('dist/ est à jour');

// --------------------------------------------------------------- 7. le déploiement
pas('Déploiement');
{
  const r = runWrangler(['pages', 'deploy', 'dist', '--project-name', BASE]);
  if (!r.ok) stop(`le déploiement a échoué : ${r.message}`, 'La base, elle, est bien migrée.');
  bon('déployé');
}

// ------------------------------------------------------------ 8. la preuve en ligne
pas('Vérification du site en ligne');
try {
  const page = await fetch(`${SITE}/`, { cache: 'no-store' });
  const html = await page.text();
  const bundle = html.match(/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0];
  if (!bundle) stop('impossible de trouver le bundle dans la page servie');

  const js = await (await fetch(`${SITE}/${bundle}`, { cache: 'no-store' })).text();
  // Un marqueur qui n'existe que depuis la refonte : s'il est là, c'est bien la
  // nouvelle version qui est servie, pas une page en cache.
  if (!js.includes("je t'aime reçus")) {
    stop(
      `le site sert encore ${bundle}, sans le compteur des preuves.`,
      'Le déploiement peut mettre une minute à se propager. Relancez la vérification seule :\n' +
        `  curl -s ${SITE}/ | grep -o 'assets/index-[^"]*'`,
    );
  }
  bon(`${bundle} sert la nouvelle version`);
} catch (error) {
  console.error(`    ! la vérification en ligne n’a pas abouti : ${String(error)}`);
  console.error('      Le déploiement a réussi ; c’est seulement le contrôle qui n’a pas pu se faire.');
}

console.log('\n✓ En production.\n');
console.log('Aucune réinstallation à faire sur les iPhones :');
console.log('  · le domaine ne change pas, donc les liens personnels restent valables ;');
console.log('  · l’identité vit dans le localStorage sous bcglove.key.v1, intouché ;');
console.log('  · les abonnements aux notifications sont indexés par leur endpoint, intouchés ;');
console.log('  · le service worker sert le réseau d’abord : la nouvelle version arrive à la');
console.log('    prochaine ouverture de l’app, d’elle-même.\n');
console.log(`Sauvegarde d’avant migration : ${sauvegarde}\n`);
