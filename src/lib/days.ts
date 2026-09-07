/**
 * Regroupement de messages par jour, pour l'historique.
 *
 * Les deux jours les plus récents portent un nom plutôt qu'une date : personne
 * ne lit « lundi 7 septembre » pour dire « aujourd'hui ».
 */

const DAY_LABEL = new Intl.DateTimeFormat('fr-BE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const DAY_LABEL_WITH_YEAR = new Intl.DateTimeFormat('fr-BE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Une clé stable par journée locale — pas UTC : la journée est celle qu'on a vécue. */
export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function dayLabel(timestamp: number, now: number, today: string, yesterday: string): string {
  if (dayKey(timestamp) === dayKey(now)) return today;

  const previous = new Date(now);
  previous.setDate(previous.getDate() - 1);
  if (dayKey(timestamp) === dayKey(previous.getTime())) return yesterday;

  const label =
    new Date(timestamp).getFullYear() === new Date(now).getFullYear()
      ? DAY_LABEL.format(new Date(timestamp))
      : DAY_LABEL_WITH_YEAR.format(new Date(timestamp));

  // Intl met la majuscule nulle part : « lundi 7 septembre » devient « Lundi… ».
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export interface DayGroup<T> {
  key: string;
  label: string;
  items: T[];
}

/**
 * Regroupe une liste DÉJÀ TRIÉE (du plus récent au plus ancien) par journée,
 * en préservant l'ordre.
 */
export function groupByDay<T>(
  items: T[],
  timestampOf: (item: T) => number,
  labelOf: (timestamp: number) => string,
): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const timestamp = timestampOf(item);
    const key = dayKey(timestamp);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, label: labelOf(timestamp), items: [item] });
  }
  return groups;
}
