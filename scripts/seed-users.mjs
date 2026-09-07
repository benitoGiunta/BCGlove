#!/usr/bin/env node
/**
 * Crée les deux utilisateurs et leurs clés personnelles.
 *
 *   node scripts/seed-users.mjs --local     (base de développement)
 *   node scripts/seed-users.mjs --remote    (production)
 *
 * Les clés en clair sont affichées UNE SEULE FOIS, ici, et ne sont écrites nulle
 * part : seul leur SHA-256 part en base. Une fuite de la base ne donne donc accès
 * à rien. Copiez les deux liens avant de fermer ce terminal.
 *
 * Relancer le script REGÉNÈRE les clés : les anciens liens cessent de fonctionner.
 */
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const target = process.argv.includes('--remote') ? '--remote' : '--local';

/**
 * 32 caractères d'un alphabet sans ambiguïté visuelle (ni 0/O, ni 1/l/I) :
 * ces liens sont parfois relus à l'œil ou dictés. ~165 bits d'entropie.
 */
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
function makeKey() {
  const bytes = randomBytes(32);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');

const people = [
  { id: 'charleen', name: 'Charleen', partner: 'benito' },
  { id: 'benito', name: 'Benito', partner: 'charleen' },
].map((person) => {
  const key = makeKey();
  return { ...person, key, hash: sha256(key) };
});

const now = Date.now();
const sql = people
  .map(
    (p) =>
      `INSERT INTO users (id, display_name, key_hash, partner_id, first_open_at, created_at) ` +
      `VALUES ('${p.id}', '${p.name}', '${p.hash}', '${p.partner}', NULL, ${now}) ` +
      `ON CONFLICT (id) DO UPDATE SET key_hash = excluded.key_hash;`,
  )
  .join('\n');

// Seules les EMPREINTES passent par la ligne de commande. Les clés en clair
// n'y apparaissent jamais — elles resteraient dans l'historique du shell.
const result = spawnSync(
  'npx',
  ['wrangler', 'd1', 'execute', 'bcglove', target, '--command', sql],
  { stdio: ['ignore', 'inherit', 'inherit'] },
);

if (result.status !== 0) {
  console.error('\n✗ L’écriture en base a échoué. Rien n’a été créé, aucun lien n’est valable.');
  process.exit(1);
}

// Le domaine de production n'est connu qu'après le premier déploiement, et il
// change si vous prenez un domaine à vous. D'où la variable d'environnement.
const origin =
  process.env.BCGLOVE_ORIGIN ??
  (target === '--remote' ? 'https://bcglove.pages.dev' : 'http://localhost:8788');

console.log('\n────────────────────────────────────────────────────────');
console.log('  Les deux liens personnels. Affichés une seule fois.');
console.log('────────────────────────────────────────────────────────\n');
for (const person of people) {
  console.log(`  ${person.name}`);
  console.log(`  ${origin}/?k=${person.key}\n`);
}
console.log('  À ouvrir dans Safari, puis « Sur l’écran d’accueil ».');
console.log('  Gardez-les ailleurs que dans l’app : c’est la seule clé.\n');
