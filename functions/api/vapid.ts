/**
 * GET /api/vapid — la clé publique VAPID.
 *
 * Le client en a besoin pour s'abonner (`applicationServerKey`). Elle est publique
 * par nature ; c'est la privée qui est un secret. On passe quand même par l'API
 * plutôt que de l'inscrire dans le bundle : la clé peut changer sans reconstruire.
 */
import type { Ctx } from '../types.ts';
import { fail, json } from './_json.ts';

export const onRequestGet = (context: Ctx): Response => {
  const key = context.env.VAPID_PUBLIC_KEY;
  if (!key) return fail('push_not_configured', 503);
  return json({ publicKey: key });
};
