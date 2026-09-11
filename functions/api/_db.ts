/**
 * Toutes les requêtes D1 du projet, une fonction par requête.
 *
 * Les routes n'écrivent pas de SQL : elles appellent d'ici. C'est ce qui permet de
 * relire le schéma et ses usages au même endroit quand une migration le fait bouger.
 */
import type { Env } from '../types.ts';

export interface UserRow {
  id: string;
  display_name: string;
  key_hash: string;
  partner_id: string;
  first_open_at: number | null;
}

export interface MessageRow {
  id: number;
  kind: 'ask' | 'reply' | 'note' | 'love';
  from_user: string;
  to_user: string;
  body: string | null;
  reply_to: number | null;
  created_at: number;
  seen_at: number | null;
}

export interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Les deux utilisateurs. Il n'y en a jamais plus : on les charge tous. */
export function allUsers(env: Env): Promise<UserRow[]> {
  return env.DB.prepare(
    'SELECT id, display_name, key_hash, partner_id, first_open_at FROM users',
  )
    .all<UserRow>()
    .then((r) => r.results);
}

export function userById(env: Env, id: string): Promise<UserRow | null> {
  return env.DB.prepare(
    'SELECT id, display_name, key_hash, partner_id, first_open_at FROM users WHERE id = ?',
  )
    .bind(id)
    .first<UserRow>();
}

export function markFirstOpen(env: Env, userId: string, at: number): Promise<unknown> {
  // `first_open_at IS NULL` rend l'écriture idempotente : la séquence de première
  // ouverture ne peut pas être rejouée, même en cas de double appel (EF-10.3).
  return env.DB.prepare('UPDATE users SET first_open_at = ? WHERE id = ? AND first_open_at IS NULL')
    .bind(at, userId)
    .run();
}

/**
 * La question que `userId` a posée et qui attend encore une réponse.
 * Un 'ask' est ouvert tant qu'aucun 'reply' ne le désigne.
 */
export function openAskFrom(env: Env, userId: string): Promise<MessageRow | null> {
  return env.DB.prepare(
    `SELECT * FROM messages
      WHERE kind = 'ask' AND from_user = ?
        AND NOT EXISTS (SELECT 1 FROM messages r WHERE r.reply_to = messages.id)
      ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(userId)
    .first<MessageRow>();
}

/** La question qu'on a reçue et à laquelle on n'a pas encore répondu. */
export function openAskTo(env: Env, userId: string): Promise<MessageRow | null> {
  return env.DB.prepare(
    `SELECT * FROM messages
      WHERE kind = 'ask' AND to_user = ?
        AND NOT EXISTS (SELECT 1 FROM messages r WHERE r.reply_to = messages.id)
      ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(userId)
    .first<MessageRow>();
}

export function askById(env: Env, id: number): Promise<MessageRow | null> {
  return env.DB.prepare("SELECT * FROM messages WHERE id = ? AND kind = 'ask'")
    .bind(id)
    .first<MessageRow>();
}

export function hasReplyTo(env: Env, askId: number): Promise<MessageRow | null> {
  return env.DB.prepare('SELECT * FROM messages WHERE reply_to = ? LIMIT 1')
    .bind(askId)
    .first<MessageRow>();
}

/**
 * Le dernier mot reçu de l'autre — c'est lui qu'affiche l'écran principal.
 *
 * `love` en est volontairement ABSENT : un cœur n'a pas de corps, et cet
 * appel-ci alimente l'écran de lecture et le bandeau de notification, qui ont
 * tous deux besoin d'un texte. Le cœur entre dans le fil par `lastTwo`, qui
 * sera exposé avec les deux derniers gestes (EF-16.8).
 */
export function lastFromPartner(env: Env, userId: string): Promise<MessageRow | null> {
  return env.DB.prepare(
    `SELECT * FROM messages
      WHERE to_user = ? AND kind IN ('reply', 'note')
      ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(userId)
    .first<MessageRow>();
}

/** Sert au plancher entre deux envois, quel que soit le type. */
export function lastSentAt(env: Env, userId: string): Promise<number | null> {
  return env.DB.prepare('SELECT MAX(created_at) AS t FROM messages WHERE from_user = ?')
    .bind(userId)
    .first<{ t: number | null }>()
    .then((r) => r?.t ?? null);
}

/**
 * Le compteur des preuves (EF-14) : les gestes de tendresse REÇUS, les trois
 * types qui en sont — une réponse, un mot spontané, un cœur. La question n'en
 * est pas une : la poser n'est pas y répondre (EF-14.2).
 *
 * Rien à stocker. La table ne fait que croître et ne supprime jamais rien, donc
 * ce compte est juste par construction — et RÉTROACTIF : il comptera les
 * échanges d'avant la v2 sans qu'on ait à les rattraper.
 *
 * Chacun voit ce qu'il a reçu, jamais un total de couple (EF-14.3).
 */
export function countReceivedGestures(env: Env, userId: string): Promise<number> {
  return env.DB.prepare(
    `SELECT COUNT(*) AS n FROM messages
      WHERE to_user = ? AND kind IN ('reply', 'note', 'love')`,
  )
    .bind(userId)
    .first<{ n: number }>()
    .then((r) => r?.n ?? 0);
}

export function countUnseen(env: Env, userId: string): Promise<number> {
  return env.DB.prepare('SELECT COUNT(*) AS n FROM messages WHERE to_user = ? AND seen_at IS NULL')
    .bind(userId)
    .first<{ n: number }>()
    .then((r) => r?.n ?? 0);
}

export function markSeen(env: Env, userId: string, upToId: number, at: number): Promise<unknown> {
  return env.DB.prepare(
    'UPDATE messages SET seen_at = ? WHERE to_user = ? AND id <= ? AND seen_at IS NULL',
  )
    .bind(at, userId, upToId)
    .run();
}

/** Une page d'historique, du plus récent au plus ancien. */
export function history(
  env: Env,
  userId: string,
  before: number | null,
  limit: number,
): Promise<MessageRow[]> {
  const clause = before === null ? '' : 'AND id < ?';
  const statement = env.DB.prepare(
    `SELECT * FROM messages
      WHERE (from_user = ? OR to_user = ?) ${clause}
      ORDER BY id DESC LIMIT ?`,
  );
  const bound =
    before === null
      ? statement.bind(userId, userId, limit)
      : statement.bind(userId, userId, before, limit);
  return bound.all<MessageRow>().then((r) => r.results);
}

export interface NewMessage {
  kind: 'ask' | 'reply' | 'note' | 'love';
  fromUser: string;
  toUser: string;
  body: string | null;
  replyTo: number | null;
  createdAt: number;
}

export async function insertMessage(env: Env, message: NewMessage): Promise<MessageRow> {
  const row = await env.DB.prepare(
    `INSERT INTO messages (kind, from_user, to_user, body, reply_to, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING *`,
  )
    .bind(
      message.kind,
      message.fromUser,
      message.toUser,
      message.body,
      message.replyTo,
      message.createdAt,
    )
    .first<MessageRow>();
  if (!row) throw new Error("l'insertion du message n'a rien renvoyé");
  return row;
}

export function subscriptionsOf(env: Env, userId: string): Promise<SubscriptionRow[]> {
  return env.DB.prepare('SELECT id, endpoint, p256dh, auth FROM subscriptions WHERE user_id = ?')
    .bind(userId)
    .all<SubscriptionRow>()
    .then((r) => r.results);
}

export function upsertSubscription(
  env: Env,
  sub: { id: string; userId: string; endpoint: string; p256dh: string; auth: string; ua: string | null; at: number },
): Promise<unknown> {
  // L'endpoint est unique : un même appareil qui se réabonne met à jour ses clés
  // au lieu de créer un doublon, et repart d'un compteur d'échecs à zéro.
  return env.DB.prepare(
    `INSERT INTO subscriptions (id, user_id, endpoint, p256dh, auth, user_agent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (endpoint) DO UPDATE SET
       user_id = excluded.user_id,
       p256dh = excluded.p256dh,
       auth = excluded.auth,
       user_agent = excluded.user_agent,
       fail_count = 0`,
  )
    .bind(sub.id, sub.userId, sub.endpoint, sub.p256dh, sub.auth, sub.ua, sub.at)
    .run();
}

export function deleteSubscription(env: Env, endpoint: string): Promise<unknown> {
  return env.DB.prepare('DELETE FROM subscriptions WHERE endpoint = ?').bind(endpoint).run();
}

export function noteSubscriptionOk(env: Env, id: string, at: number): Promise<unknown> {
  return env.DB.prepare('UPDATE subscriptions SET last_ok_at = ?, fail_count = 0 WHERE id = ?')
    .bind(at, id)
    .run();
}

export function noteSubscriptionFailure(env: Env, id: string): Promise<unknown> {
  return env.DB.prepare('UPDATE subscriptions SET fail_count = fail_count + 1 WHERE id = ?')
    .bind(id)
    .run();
}

export function pruneFailedSubscriptions(env: Env, maxFailures: number): Promise<unknown> {
  return env.DB.prepare('DELETE FROM subscriptions WHERE fail_count >= ?').bind(maxFailures).run();
}
