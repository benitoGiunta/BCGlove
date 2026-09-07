/** POST /api/note — envoyer un mot sans que rien n'ait été demandé (EF-4). */
import type { Ctx } from '../types.ts';
import { insertMessage, lastSentAt, userById } from './_db.ts';
import { fail, json, readJson, readText } from './_json.ts';
import { notify } from './_push.ts';
import { MAX_MESSAGE, SEND_COOLDOWN_MS } from './_limits.ts';
import { truncateForPush } from './_truncate.ts';

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  const { env, data } = context;
  const me = data.user;
  const now = Date.now();

  const payload = await readJson(context.request);
  if (!payload) return fail('bad_json', 422);

  const body = readText(payload.body, MAX_MESSAGE);
  if (body === null) return fail('bad_input', 422);

  const last = await lastSentAt(env, me.id);
  if (last !== null && now - last < SEND_COOLDOWN_MS) return fail('too_fast', 429);

  const partner = await userById(env, me.partnerId);
  if (!partner) return fail('partner_missing', 500);

  const message = await insertMessage(env, {
    kind: 'note',
    fromUser: me.id,
    toUser: partner.id,
    body,
    replyTo: null,
    createdAt: now,
  });

  context.waitUntil(
    notify(env, partner.id, {
      t: `${me.displayName} t'a écrit ♡`,
      b: truncateForPush(body),
      u: '/',
      g: `msg-${message.id}`,
    }),
  );

  return json({ id: message.id, createdAt: message.created_at }, 201);
};
