/**
 * POST /api/love — dire je t'aime, en un geste (EF-15).
 *
 * Le cœur n'est pas un message court : c'est un geste. Il n'a pas de corps,
 * comme `ask`, mais contrairement à `ask` il n'attend pas de réponse — donc
 * aucun conflit à détecter, aucune relance à retarder. La route est la plus
 * courte de l'API, et c'est normal.
 */
import type { Ctx } from '../types.ts';
import { insertMessage, lastSentAt, userById } from './_db.ts';
import { fail, json } from './_json.ts';
import { notify } from './_push.ts';
import { SEND_COOLDOWN_MS } from './_limits.ts';

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  const { env, data } = context;
  const me = data.user;
  const now = Date.now();

  // Pas de spam, et aucun régime de faveur (EF-15.7) : le plancher de 30 s
  // s'applique au cœur comme au reste. Il n'y a rien à assouplir ici.
  const last = await lastSentAt(env, me.id);
  if (last !== null && now - last < SEND_COOLDOWN_MS) return fail('too_fast', 429);

  const partner = await userById(env, me.partnerId);
  if (!partner) return fail('partner_missing', 500);

  const message = await insertMessage(env, {
    kind: 'love',
    fromUser: me.id,
    toUser: partner.id,
    body: null,
    replyTo: null,
    createdAt: now,
  });

  context.waitUntil(
    notify(env, partner.id, {
      // La notification tranche par sa FORME (EF-15.3). Les trois autres sont
      // des comptes rendus — « <Nom> te demande ♡ ». Celle-ci ne raconte pas :
      // les mots d'abord, la signature ensuite. C'est la seule dont le titre ne
      // porte pas de nom, et la seule dont le corps en porte un.
      t: "Je t'aime",
      b: `— ${me.displayName}`,
      u: '/',
      // UN SEUL tag pour tous les cœurs d'un même expéditeur (EF-15.7), là où
      // les autres routes en font un par message. C'est ce qui fait que dix
      // appuis se remplacent au lieu de s'empiler sur l'écran verrouillé.
      g: `love-${me.id}`,
    }),
  );

  return json({ id: message.id, createdAt: message.created_at }, 201);
};
