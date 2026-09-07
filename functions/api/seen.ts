/** POST /api/seen — marquer vu jusqu'à un identifiant donné. */
import type { Ctx } from '../types.ts';
import { markSeen } from './_db.ts';
import { fail, json, readId, readJson } from './_json.ts';

export const onRequestPost = async (context: Ctx): Promise<Response> => {
  const payload = await readJson(context.request);
  if (!payload) return fail('bad_json', 422);

  const upTo = readId(payload.upTo);
  if (upTo === null) return fail('bad_input', 422);

  await markSeen(context.env, context.data.user.id, upTo, Date.now());
  return json({ ok: true });
};
