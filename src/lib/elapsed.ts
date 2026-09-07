/**
 * Calcul calendaire du temps écoulé.
 *
 * « Calendaire » et non arithmétique : un mois est le même quantième du mois
 * suivant, pas 30 jours.
 *
 * DIVERGENCE ASSUMÉE AVEC LA MAQUETTE. L'algorithme de
 * design/source/pour-charleen.dc.html soustrait les champs de date un à un puis
 * reporte les retenues en une seule passe. Ça se casse dès que le quantième de
 * départ dépasse le nombre de jours du mois emprunté : du 31 janvier au 1er mars,
 * il rend « 1 mois et −1 jour ». Il rend aussi « 0 an, 11 mois, 30 jours » le
 * 28 février pour une histoire commencée un 29 février — le jour même où on
 * fêterait l'anniversaire.
 *
 * On procède donc autrement : on ancre d'abord les mois (avec l'écrêtage de fin
 * de mois usuel, le 31 devenant le 30 ou le 28), puis on compte les jours restants
 * un par un — au plus 31 tours, et juste par rapport à l'heure d'été.
 *
 * Aucune dépendance à React ni au DOM : testable seul.
 */

export interface Elapsed {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const ZERO: Elapsed = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

/** Nombre de jours du mois de `year`/`month` (0 = janvier). */
function daysInMonth(year: number, month: number): number {
  // Le jour 0 du mois suivant est le dernier jour du mois demandé.
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Ajoute `n` mois en gardant l'heure, avec l'écrêtage de fin de mois :
 * 31 janvier + 1 mois = 28 ou 29 février, pas le 3 mars.
 */
function addMonths(date: Date, n: number): Date {
  const day = date.getDate();
  const result = new Date(date.getTime());
  result.setDate(1); // évite le débordement pendant le changement de mois
  result.setMonth(result.getMonth() + n);
  result.setDate(Math.min(day, daysInMonth(result.getFullYear(), result.getMonth())));
  return result;
}

/**
 * Temps écoulé entre deux instants, décomposé et normalisé.
 * Renvoie `ZERO` si `to` précède `from`.
 */
export function elapsed(from: Date, to: Date): Elapsed {
  if (to.getTime() <= from.getTime()) return ZERO;

  // 1. Les mois entiers : on prend l'écart brut, puis on recule d'un cran si
  //    l'ancre dépasse la date d'arrivée.
  let totalMonths =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (addMonths(from, totalMonths).getTime() > to.getTime()) totalMonths -= 1;

  // 2. Les jours entiers restants, comptés un par un depuis l'ancre.
  //    `setDate(+1)` reste juste au passage à l'heure d'été, contrairement à
  //    une division par 86 400 000.
  const anchor = addMonths(from, totalMonths);
  let cursor = anchor;
  let days = 0;
  for (;;) {
    const next = new Date(cursor.getTime());
    next.setDate(next.getDate() + 1);
    if (next.getTime() > to.getTime()) break;
    cursor = next;
    days += 1;
    /* c8 ignore next */
    if (days > 40) break; // garde-fou : ne peut pas arriver, ne doit pas boucler
  }

  // 3. Le reste, en heures d'horloge murale.
  let hours = to.getHours() - cursor.getHours();
  let minutes = to.getMinutes() - cursor.getMinutes();
  let seconds = to.getSeconds() - cursor.getSeconds();
  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) hours += 24;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    hours,
    minutes,
    seconds,
  };
}

/** Accord en nombre : 0 et 1 au singulier, comme en français. */
export function plural(n: number, one: string, many: string): string {
  return n <= 1 ? one : many;
}

/** Une phrase unique pour les lecteurs d'écran (EF-1.5). */
export function speak(e: Elapsed): string {
  return [
    `${e.years} ${plural(e.years, 'an', 'ans')}`,
    `${e.months} mois`,
    `${e.days} ${plural(e.days, 'jour', 'jours')}`,
    `${e.hours} ${plural(e.hours, 'heure', 'heures')}`,
    `${e.minutes} ${plural(e.minutes, 'minute', 'minutes')}`,
  ].join(', ');
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
