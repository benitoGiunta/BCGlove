/**
 * Troncature d'un texte pour le corps d'une notification (EF-5.2).
 *
 * Deux pièges évités ici :
 *  - on compte en points de code, pas en unités UTF-16 : couper un emoji ou un
 *    caractère composé en deux affiche un carré blanc sur iOS ;
 *  - on coupe sur une frontière de mot, pas au milieu.
 */

export function truncate(text: string, max: number): string {
  const chars = Array.from(text.trim());
  if (chars.length <= max) return text.trim();

  // On réserve un caractère pour les points de suspension.
  const head = chars.slice(0, max - 1).join('');
  const lastSpace = head.lastIndexOf(' ');

  // On ne remonte à l'espace précédent que s'il ne fait pas perdre trop de texte.
  const cut = lastSpace > max * 0.6 ? head.slice(0, lastSpace) : head;

  return `${cut.replace(/[\s,;:.!?—-]+$/u, '')}…`;
}

/** Réduit les lignes vides multiples à une seule (EF-5.5). */
export function normalizeBody(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
