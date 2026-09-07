/** POST /api/push/subscribe — enregistrer ou rafraîchir l'abonnement d'un appareil. */
import type { Ctx } from '../../types.ts';
import { upsertSubscription } from '../_db.ts';
import { fail, json, readJson, readText } from '../_json.ts';

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  const payload = await readJson(context.request);
  if (!payload) return fail('bad_json', 422);

  const endpoint = readText(payload.endpoint, 1024);
  const keys = payload.keys;
  if (endpoint === null || typeof keys !== 'object' || keys === null) {
    return fail('bad_input', 422);
  }

  const { p256dh, auth } = keys as Record<string, unknown>;
  const publicKey = readText(p256dh, 256);
  const secret = readText(auth, 256);
  if (publicKey === null || secret === null) return fail('bad_input', 422);

  // On n'accepte que des endpoints https : un endpoint en clair n'existe pas
  // chez les services de push, et en accepter un ouvrirait une porte inutile.
  if (!endpoint.startsWith('https://')) return fail('bad_endpoint', 422);

  await upsertSubscription(context.env, {
    id: crypto.randomUUID(),
    userId: context.data.user.id,
    endpoint,
    p256dh: publicKey,
    auth: secret,
    ua: context.request.headers.get('User-Agent'),
    at: Date.now(),
  });

  return json({ ok: true }, 201);
};
