/** POST /api/reply — répondre à une question ouverte. */
import type { Ctx } from '../types.ts';
import { askById, hasReplyTo, insertMessage, lastSentAt, userById } from './_db.ts';
import { fail, json, readId, readJson, readText } from './_json.ts';
import { notify } from './_push.ts';
import { MAX_MESSAGE, SEND_COOLDOWN_MS } from './_limits.ts';
import { truncateForPush } from './_truncate.ts';

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  const { env, data } = context;
  const me = data.user;
  const now = Date.now();

  const payload = await readJson(context.request);
  if (!payload) return fail('bad_json', 422);

  const replyTo = readId(payload.replyTo);
  const body = readText(payload.body, MAX_MESSAGE);
  if (replyTo === null || body === null) return fail('bad_input', 422);

  const ask = await askById(env, replyTo);
  // On ne répond qu'à une question qui nous était adressée, et qu'une seule fois.
  if (!ask || ask.to_user !== me.id) return fail('no_such_ask', 404);
  if (await hasReplyTo(env, replyTo)) return fail('already_answered', 409);

  const last = await lastSentAt(env, me.id);
  if (last !== null && now - last < SEND_COOLDOWN_MS) return fail('too_fast', 429);

  const partner = await userById(env, me.partnerId);
  if (!partner) return fail('partner_missing', 500);

  const message = await insertMessage(env, {
    kind: 'reply',
    fromUser: me.id,
    toUser: partner.id,
    body,
    replyTo,
    createdAt: now,
  });

  context.waitUntil(
    notify(env, partner.id, {
      t: `${me.displayName} a répondu ♡`,
      b: truncateForPush(body),
      u: '/',
      g: `msg-${message.id}`,
    }),
  );

  return json({ id: message.id, createdAt: message.created_at }, 201);
};
