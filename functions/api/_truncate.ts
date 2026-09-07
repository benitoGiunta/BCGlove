/**
 * Troncature du corps d'une notification (EF-5.2).
 *
 * Doublon assumé de src/lib/truncate.ts : `functions/` ne doit rien importer de
 * `src/` (code navigateur contre runtime Workers). Les deux implémentations
 * doivent rester d'accord — c'est vingt lignes, contre un couplage entre deux
 * environnements qui n'ont pas les mêmes règles.
 */

const MAX_NOTIFICATION_BODY = 110;

export function truncateForPush(text: string, max = MAX_NOTIFICATION_BODY): string {
  // En points de code : couper un caractère composé en deux affiche un carré
  // blanc sur iOS.
  const chars = Array.from(text.trim());
  if (chars.length <= max) return text.trim();

  const head = chars.slice(0, max - 1).join('');
  const lastSpace = head.lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? head.slice(0, lastSpace) : head;

  return `${cut.replace(/[\s,;:.!?—-]+$/u, '')}…`;
}
