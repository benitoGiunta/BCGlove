#!/usr/bin/env node
/**
 * Efface les données laissées par une vérification, et réarme les séquences de
 * première ouverture.
 *
 *   npm run db:clean -- --yes             (base locale)
 *   npm run db:clean:prod -- --yes        (production)
 *
 * POURQUOI ÇA EXISTE. `npm run test:api` écrit de vraies données : il pose une
 * question, y répond, et lit l'état des deux comptes — ce qui consomme aussi les
 * deux séquences de première ouverture. Sans ce nettoyage, le tout premier
 * message de l'historique serait un artefact de test.
 *
 * À lancer APRÈS la vérification, AVANT d'installer l'app sur les téléphones.
 *
 * DESTRUCTIF : efface TOUS les messages. Ne jamais le lancer sur une base qui
 * contient de vrais échanges — d'où le --yes obligatoire.
 */
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const remote = args.includes('--remote');
const confirmed = args.includes('--yes');
const where = remote ? '--remote' : '--local';

function d1(command, json = false) {
  const result = spawnSync(
    'npx',
    ['wrangler', 'd1', 'execute', 'bcglove', where, ...(json ? ['--json'] : []), '--command', command],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(1);
  }
  return result.stdout;
}

// wrangler préfixe parfois sa sortie d'avis : on repart du premier crochet.
function firstJson(output) {
  const start = output.indexOf('[');
  return start === -1 ? null : JSON.parse(output.slice(start));
}

const before = firstJson(d1('SELECT COUNT(*) AS n FROM messages', true))?.[0]?.results?.[0]?.n ?? 0;

if (!confirmed) {
  console.log(`\n  Base : ${remote ? 'PRODUCTION' : 'locale'}`);
  console.log(`  ${before} message(s) seraient effacés, et les deux séquences de`);
  console.log('  première ouverture réarmées.\n');
  console.log('  Rien n’a été fait. Pour confirmer, relancez avec --yes :');
  console.log(`    npm run ${remote ? 'db:clean:prod' : 'db:clean'} -- --yes\n`);
  process.exit(0);
}

d1('DELETE FROM messages; UPDATE users SET first_open_at = NULL;');

console.log(`\n✓ ${before} message(s) effacé(s).`);
console.log('✓ Les deux séquences de première ouverture rejoueront.\n');
console.log('  N’ouvrez plus l’app avant d’avoir installé les deux téléphones.\n');
