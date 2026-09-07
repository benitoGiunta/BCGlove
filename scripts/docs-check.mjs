#!/usr/bin/env node
// Vérifie les deux artefacts de navigation décrits dans CLAUDE.md §2 :
//   1. chaque dossier versionné possède un llm.txt ;
//   2. chaque llm.txt porte les cinq rubriques attendues ;
//   3. ARBORESCENCE.md mentionne chaque dossier existant.
// Sort en code 1 si quelque chose manque, avec la liste de ce qu'il faut corriger.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const IGNORED = new Set(['node_modules', 'dist', '.git', '.wrangler', '.vscode', '.idea']);
const SECTIONS = ['## Rôle', '## Contenu', '## Conventions', '## Dépendances', '## Pièges'];

/** Tous les dossiers versionnés, racine incluse, chemins relatifs en POSIX. */
function walk(dir, out = []) {
  out.push(relative(ROOT, dir) || '.');
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || IGNORED.has(entry.name)) continue;
    walk(join(dir, entry.name), out);
  }
  return out;
}

const problems = [];
const dirs = walk(ROOT).sort();

for (const dir of dirs) {
  const llm = join(ROOT, dir, 'llm.txt');
  if (!existsSync(llm)) {
    problems.push(`${dir}/llm.txt est manquant — voir CLAUDE.md §2.2 pour le format attendu`);
    continue;
  }
  const content = readFileSync(llm, 'utf8');
  const missing = SECTIONS.filter((s) => !content.includes(s));
  if (missing.length) {
    problems.push(`${dir}/llm.txt : rubrique(s) manquante(s) — ${missing.join(', ')}`);
  }
}

const arbo = existsSync(join(ROOT, 'ARBORESCENCE.md'))
  ? readFileSync(join(ROOT, 'ARBORESCENCE.md'), 'utf8')
  : (problems.push('ARBORESCENCE.md est manquant'), '');

for (const dir of dirs) {
  if (dir === '.') continue;
  const name = dir.split('/').pop();
  if (!arbo.includes(`${name}/`)) {
    problems.push(`ARBORESCENCE.md ne mentionne pas le dossier ${dir}/`);
  }
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} problème(s) de documentation :\n`);
  for (const p of problems) console.error(`  · ${p}`);
  console.error('\nCes fichiers se mettent à jour dans le même commit que le code (CLAUDE.md §2).\n');
  process.exit(1);
}

console.log(`✓ ${dirs.length} dossiers, tous documentés. ARBORESCENCE.md est à jour.`);
