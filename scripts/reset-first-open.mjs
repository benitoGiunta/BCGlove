#!/usr/bin/env node
/**
 * Réarme la séquence de première ouverture pour une personne.
 *
 *   npm run db:reset-first-open -- charleen            (base locale)
 *   npm run db:reset-first-open -- charleen --remote   (production)
 *
 * POURQUOI ÇA EXISTE. La séquence ne se joue qu'une fois, et c'est voulu. Mais
 * installer l'app sur le téléphone de quelqu'un demande de l'ouvrir — ne
 * serait-ce que pour activer les notifications. Cette ouverture-là consommerait
 * la séquence, et la personne à qui elle est destinée ne la verrait jamais.
 *
 * À lancer donc APRÈS avoir préparé le téléphone, et AVANT de le rendre.
 */
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const remote = args.includes('--remote');
const person = args.find((value) => !value.startsWith('--'));

if (person !== 'charleen' && person !== 'benito') {
  console.error('Usage : npm run db:reset-first-open -- <charleen|benito> [--remote]');
  process.exit(1);
}

const result = spawnSync(
  'npx',
  [
    'wrangler',
    'd1',
    'execute',
    'bcglove',
    remote ? '--remote' : '--local',
    '--command',
    `UPDATE users SET first_open_at = NULL WHERE id = '${person}'`,
  ],
  { stdio: ['ignore', 'inherit', 'inherit'] },
);

if (result.status !== 0) {
  console.error('\n✗ Échec. La séquence n’a pas été réarmée.');
  process.exit(1);
}

console.log(`\n✓ La séquence de première ouverture rejouera pour ${person}.`);
console.log('  Ne rouvrez plus l’app sur son téléphone avant de le lui rendre.\n');
