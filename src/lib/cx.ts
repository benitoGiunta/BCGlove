/**
 * Concatène des noms de classe en ignorant tout ce qui est vide.
 *
 * Nécessaire parce que `noUncheckedIndexedAccess` fait de `styles.machin` un
 * `string | undefined` : un gabarit littéral y écrirait « undefined » dans
 * l'attribut class, en silence.
 */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
