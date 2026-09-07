/** POST /api/ask — poser la question. */
import type { Ctx } from '../types.ts';
import { insertMessage, lastSentAt, openAskFrom, userById } from './_db.ts';
import { fail, json } from './_json.ts';
import { notify } from './_push.ts';
import { RELANCE_DELAY_MS, SEND_COOLDOWN_MS } from './_limits.ts';

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  const { env, data } = context;
  const me = data.user;
  const now = Date.now();

  const open = await openAskFrom(env, me.id);
  if (open && now - open.created_at < RELANCE_DELAY_MS) {
    // Une question déjà posée et encore fraîche : le client fait battre le cœur
    // au lieu d'envoyer une seconde notification (EF-2.4).
    return fail('already_open', 409);
  }

  const last = await lastSentAt(env, me.id);
  if (last !== null && now - last < SEND_COOLDOWN_MS) return fail('too_fast', 429);

  const partner = await userById(env, me.partnerId);
  if (!partner) return fail('partner_missing', 500);

  const message = await insertMessage(env, {
    kind: 'ask',
    fromUser: me.id,
    toUser: partner.id,
    body: null,
    replyTo: null,
    createdAt: now,
  });

  context.waitUntil(
    notify(env, partner.id, {
      t: `${me.displayName} te demande ♡`,
      b: "Est-ce que tu m'aimes ?",
      u: '/?open=reply',
      g: `ask-${message.id}`,
    }),
  );

  return json({ id: message.id, createdAt: message.created_at }, 201);
};
