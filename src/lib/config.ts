/**
 * Les quelques valeurs qui définissent ce projet-ci plutôt qu'un autre.
 * Tout ce qui est marqué TODO(Q-x) attend une réponse — voir docs/requirements.md §9.
 */

/**
 * La date d'origine du compteur : le 12 juillet 2025.
 *
 * Format ISO local, sans suffixe de fuseau : la date est vécue à Bruxelles,
 * pas en UTC. `new Date('2025-07-12T00:00:00')` est interprétée dans le fuseau
 * de l'appareil, ce qui est exactement le comportement voulu ici.
 *
 * TODO(Q-1b) — L'HEURE est encore à minuit, faute de mieux. Tant qu'elle y reste,
 * la ligne h · min · s affiche simplement l'heure qu'il est, ce qui la rend un peu
 * redondante avec l'horloge du téléphone. Une heure qui veut dire quelque chose
 * lui redonnerait du sens. Une seule ligne à changer.
 */
export const LOVE_START = '2025-07-12T00:00:00';

/** Les deux personnes. Les identifiants servent de clés en base. */
export const PEOPLE = {
  charleen: { id: 'charleen', name: 'Charleen', partner: 'benito' },
  benito: { id: 'benito', name: 'Benito', partner: 'charleen' },
} as const;

export type PersonId = keyof typeof PEOPLE;

/** Longueur maximale d'un message saisi (D9). */
export const MAX_MESSAGE = 280;

/** Seuils d'apparition puis d'alerte du compteur de caractères (EF-5.1). */
export const COUNTER_VISIBLE_AT = 200;
export const COUNTER_WARN_AT = 260;

/** Longueur maximale du corps d'une notification (EF-5.2). */
export const MAX_NOTIFICATION_BODY = 110;

/**
 * Délai avant de pouvoir relancer une question restée sans réponse (EF-2.4).
 * TODO(Q-6) — valeur d'attente : 30 minutes.
 */
export const RELANCE_DELAY_MS = 30 * 60 * 1000;

/** Plancher entre deux envois quels qu'ils soient, appliqué côté serveur. */
export const SEND_COOLDOWN_MS = 30 * 1000;

/** Rafraîchissement de l'état tant que l'écran est visible. */
export const POLL_INTERVAL_MS = 20 * 1000;

/**
 * Le monogramme du header. FIXE, et volontairement : B pour Benito, C pour
 * Charleen, G pour la lettre commune de leurs deux noms. Ce n'est pas le
 * monogramme d'une personne, c'est celui de l'union — il ne bascule donc pas
 * d'un téléphone à l'autre.
 */
export const SHOW_MONOGRAM = true;
export const MONOGRAM = 'BCG';

/** La signature, elle, bascule : Charleen lit « — Benito », et réciproquement. */
export const SHOW_SIGNATURE = true;
