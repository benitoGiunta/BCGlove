/** POST /api/push/unsubscribe — retirer l'abonnement d'un appareil. */
import type { Ctx } from '../../types.ts';
import { deleteSubscription } from '../_db.ts';
import { fail, json, readJson, readText } from '../_json.ts';

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  const payload = await readJson(context.request);
  if (!payload) return fail('bad_json', 422);

  const endpoint = readText(payload.endpoint, 1024);
  if (endpoint === null) return fail('bad_input', 422);

  await deleteSubscription(context.env, endpoint);
  return json({ ok: true });
};
