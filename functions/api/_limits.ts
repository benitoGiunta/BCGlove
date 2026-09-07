/**
 * Les règles de débit, appliquées CÔTÉ SERVEUR.
 *
 * Griser un bouton dans l'interface ne protège de rien : c'est ici que ça compte.
 * Les valeurs doublent celles de src/lib/config.ts — les deux doivent bouger
 * ensemble. Elles ne sont pas partagées parce que src/ est du code navigateur et
 * que functions/ ne doit rien lui emprunter (voir functions/llm.txt).
 */

/** Plancher entre deux envois, quel qu'en soit le type. */
export const SEND_COOLDOWN_MS = 30 * 1000;

/** Délai avant de pouvoir reposer une question restée sans réponse (EF-2.4). */
export const RELANCE_DELAY_MS = 30 * 60 * 1000;

/** Longueur maximale d'un message, en points de code (D9). */
export const MAX_MESSAGE = 280;

/** Au-delà, un abonnement push est considéré mort et supprimé. */
export const MAX_PUSH_FAILURES = 5;
