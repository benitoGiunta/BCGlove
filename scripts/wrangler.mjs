/**
 * Lancer wrangler depuis un script Node, sur n'importe quel système.
 *
 * POURQUOI CE FICHIER EXISTE. Les scripts appelaient `spawnSync('npx', […])`.
 * Sous Windows, `npx` est un fichier `.cmd` que `spawnSync` ne sait pas exécuter
 * sans passer par un shell : le processus ne démarre jamais, `status` vaut `null`,
 * et rien ne s'affiche. On invoque donc directement le point d'entrée JavaScript
 * de wrangler avec le Node courant — pas de shell, pas de `.cmd`, pas de
 * réinterprétation des guillemets (ce qui compte : on lui passe du SQL).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ENTRY = resolve('node_modules/wrangler/bin/wrangler.js');

/**
 * @param {string[]} args
 * @param {{ capture?: boolean }} [options]
 * @returns {{ ok: boolean, stdout: string, message: string }}
 */
export function runWrangler(args, options = {}) {
  if (!existsSync(ENTRY)) {
    return {
      ok: false,
      stdout: '',
      message: "wrangler est introuvable. Lancez d'abord : npm install",
    };
  }

  const result = spawnSync(process.execPath, [ENTRY, ...args], {
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : ['ignore', 'inherit', 'inherit'],
  });

  // Trois façons d'échouer, et il faut les distinguer : le processus n'a pas
  // démarré, il a été tué, ou il a rendu un code non nul.
  if (result.error) {
    return { ok: false, stdout: '', message: `wrangler n'a pas pu démarrer : ${result.error.message}` };
  }
  if (result.signal) {
    return { ok: false, stdout: result.stdout ?? '', message: `wrangler a été interrompu (${result.signal})` };
  }
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    return {
      ok: false,
      stdout: result.stdout ?? '',
      message: detail || `wrangler a rendu le code ${result.status}`,
    };
  }

  return { ok: true, stdout: result.stdout ?? '', message: '' };
}

/**
 * Extrait le JSON de la sortie de wrangler, qui la préfixe parfois d'avis
 * (proxy détecté, mise à jour disponible) que `JSON.parse` refuse.
 */
export function firstJson(output) {
  const start = output.indexOf('[');
  if (start === -1) return null;
  try {
    return JSON.parse(output.slice(start));
  } catch {
    return null;
  }
}
