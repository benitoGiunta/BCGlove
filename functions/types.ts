/**
 * Les liaisons dont disposent les Pages Functions à l'exécution.
 * Déclarées ici une fois, et jamais dupliquées dans les routes.
 */
export interface Env {
  /** La base D1, liée au projet Pages sous le nom `DB` (voir wrangler.toml). */
  DB: D1Database;

  /** Clés VAPID, posées en secrets — jamais dans le dépôt. Voir .env.example. */
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  /** `mailto:…` — exigé par la RFC 8292, sert de contact au service de push. */
  VAPID_SUBJECT: string;
}

/** Ce que le middleware d'authentification dépose pour les routes. */
export interface RequestData extends Record<string, unknown> {
  user: { id: string; displayName: string; partnerId: string };
}

export type Ctx = EventContext<Env, string, RequestData>;
