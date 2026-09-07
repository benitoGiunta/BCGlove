/**
 * Horodatages relatifs, en français, tels que la maquette les écrit.
 *
 * `Intl.RelativeTimeFormat` ne sait pas dire « hier soir ». Ces formulations
 * sont écrites à la main, volontairement : c'est ce qui fait la différence
 * entre une app qui parle et une app qui affiche.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** « à l'instant », « il y a 12 min », « hier soir », « il y a 3 semaines ». */
export function relative(timestamp: number, now: number): string {
  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / MINUTE);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;

  const then = new Date(timestamp);
  const current = new Date(now);

  if (sameDay(then, current)) {
    const hours = Math.floor(diff / HOUR);
    return `il y a ${hours} h`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameDay(then, yesterday)) {
    return then.getHours() >= 18 ? 'hier soir' : 'hier';
  }

  const days = Math.floor(diff / DAY);
  if (days < 7) return `il y a ${days} jours`;

  const weeks = Math.floor(days / 7);
  return `il y a ${weeks} ${weeks === 1 ? 'semaine' : 'semaines'}`;
}

const LONG = new Intl.DateTimeFormat('fr-BE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

/** La date exacte, montrée au toucher d'un horodatage relatif (EF-6.4). */
export function exact(timestamp: number): string {
  return LONG.format(new Date(timestamp));
}
