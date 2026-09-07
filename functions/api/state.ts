/** GET /api/state — tout ce dont l'écran a besoin, en un appel. */
import type { Ctx } from '../types.ts';
import {
  countUnseen,
  lastFromPartner,
  markFirstOpen,
  openAskFrom,
  openAskTo,
  userById,
} from './_db.ts';
import { json, fail } from './_json.ts';
import { RELANCE_DELAY_MS } from './_limits.ts';
import { notify } from './_push.ts';

export const onRequestGet = async (context: Ctx): Promise<Response> => {
  const { env, data } = context;
  const me = data.user;

  const partner = await userById(env, me.partnerId);
  if (!partner) return fail('partner_missing', 500);

  const [mine, incoming, last, unseen, self] = await Promise.all([
    openAskFrom(env, me.id),
    openAskTo(env, me.id),
    lastFromPartner(env, me.id),
    countUnseen(env, me.id),
    userById(env, me.id),
  ]);

  const now = Date.now();
  const firstOpenAt = self?.first_open_at ?? null;

  // La séquence de première ouverture (EF-10) se joue une seule fois. On marque
  // le passage dès le premier /api/state, sans bloquer la réponse : c'est ce
  // premier appel qui EST la première ouverture.
  if (firstOpenAt === null) {
    context.waitUntil(markFirstOpen(env, me.id, now));

    // Le seul push que personne ne déclenche volontairement (EF-10.6) : l'autre
    // apprend que l'app vient d'être ouverte pour la première fois.
    context.waitUntil(
      notify(env, partner.id, {
        t: `${me.displayName} vient d'ouvrir ♡`,
        b: 'Le compteur a démarré.',
        u: '/',
        g: 'first-open',
      }),
    );
  }

  return json({
    now,
    me: { id: me.id, name: me.displayName },
    partner: { id: partner.id, name: partner.display_name },
    /** Vrai une seule fois dans la vie de l'app, pour ce compte. */
    isFirstOpen: firstOpenAt === null,
    /** Ma question en attente de réponse. */
    openAsk: mine && { id: mine.id, createdAt: mine.created_at, canRelance: now - mine.created_at >= RELANCE_DELAY_MS },
    /** La question de l'autre, à laquelle je dois répondre. */
    incomingAsk: incoming && { id: incoming.id, createdAt: incoming.created_at },
    /** Le dernier mot reçu — c'est lui qu'affiche la bulle. */
    lastReceived: last && {
      id: last.id,
      kind: last.kind,
      body: last.body,
      createdAt: last.created_at,
    },
    unseen,
  });
};
