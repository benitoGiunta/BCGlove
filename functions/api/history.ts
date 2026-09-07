/** GET /api/history?before=<id>&limit=<n> — une page du fil, du plus récent au plus ancien. */
import type { Ctx } from '../types.ts';
import { history } from './_db.ts';
import { json } from './_json.ts';

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export const onRequestGet = async (context: Ctx): Promise<Response> => {
  const url = new URL(context.request.url);
  const me = context.data.user;

  const rawBefore = Number(url.searchParams.get('before'));
  const before = Number.isInteger(rawBefore) && rawBefore > 0 ? rawBefore : null;

  const rawLimit = Number(url.searchParams.get('limit'));
  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

  // On demande un élément de plus que la page pour savoir s'il y a une suite,
  // sans compter la table entière.
  const rows = await history(context.env, me.id, before, limit + 1);
  const hasMore = rows.length > limit;

  return json({
    messages: rows.slice(0, limit).map((row) => ({
      id: row.id,
      kind: row.kind,
      mine: row.from_user === me.id,
      body: row.body,
      createdAt: row.created_at,
    })),
    hasMore,
  });
};
