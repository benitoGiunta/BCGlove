/**
 * Le client de l'API.
 *
 * Les types décrivent ce que les routes de `functions/api/` renvoient. Ils sont
 * écrits à la main plutôt que partagés : `src/` est du code navigateur et
 * `functions/` tourne sur le runtime Workers — les deux ne doivent pas s'importer
 * (voir functions/llm.txt). Quand une route change, ce fichier change avec elle.
 */

export interface Person {
  id: string;
  name: string;
}

export interface OpenAsk {
  id: number;
  createdAt: number;
  /** Vrai quand le délai de relance est passé : un nouvel appui repartira vraiment. */
  canRelance: boolean;
}

export interface IncomingAsk {
  id: number;
  createdAt: number;
}

/**
 * Le dernier mot reçu. Pas de `love` ici : un cœur n'a pas de corps, et cette
 * forme-là sert l'écran de lecture et le bandeau. Le cœur arrivera par
 * `lastTwo` (EF-16.8).
 */
export interface Received {
  id: number;
  kind: 'reply' | 'note';
  body: string | null;
  createdAt: number;
}

export interface AppState {
  now: number;
  me: Person;
  partner: Person;
  isFirstOpen: boolean;
  openAsk: OpenAsk | null;
  incomingAsk: IncomingAsk | null;
  lastReceived: Received | null;
  unseen: number;
}

export interface HistoryEntry {
  id: number;
  kind: 'ask' | 'reply' | 'note' | 'love';
  mine: boolean;
  body: string | null;
  createdAt: number;
}

export interface HistoryPage {
  messages: HistoryEntry[];
  hasMore: boolean;
}

/** Une erreur d'API porte son code : c'est lui qui décide du message affiché. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

async function call<T>(key: string, path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
        Authorization: `Bearer ${key}`,
      },
    });
  } catch {
    // Réseau absent : un code à part, pour distinguer « pas de réseau » de
    // « le serveur a refusé ».
    throw new ApiError('offline', 0);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(payload?.error ?? 'unknown', response.status);
  }

  return (await response.json()) as T;
}

export const api = {
  state: (key: string) => call<AppState>(key, 'state'),

  history: (key: string, before?: number) =>
    call<HistoryPage>(key, `history${before === undefined ? '' : `?before=${before}`}`),

  ask: (key: string) => call<{ id: number }>(key, 'ask', { method: 'POST' }),

  reply: (key: string, replyTo: number, body: string) =>
    call<{ id: number }>(key, 'reply', {
      method: 'POST',
      body: JSON.stringify({ replyTo, body }),
    }),

  note: (key: string, body: string) =>
    call<{ id: number }>(key, 'note', { method: 'POST', body: JSON.stringify({ body }) }),

  /** Le cœur : rien à envoyer, le geste est tout entier dans l'appel (EF-15). */
  love: (key: string) => call<{ id: number }>(key, 'love', { method: 'POST' }),

  vapid: (key: string) => call<{ publicKey: string }>(key, 'vapid'),

  subscribe: (key: string, subscription: PushSubscriptionJSON) =>
    call<{ ok: true }>(key, 'push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    }),

  seen: (key: string, upTo: number) =>
    call<{ ok: true }>(key, 'seen', { method: 'POST', body: JSON.stringify({ upTo }) }),
};
