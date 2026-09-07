/**
 * Envoi des notifications Web Push.
 *
 * ÉTAT DU LOT 5 : l'interface est posée et appelée par les routes, mais la
 * signature VAPID et le chiffrement aes128gcm restent à écrire — c'est le lot 6.
 * En attendant, `notify` ne fait rien et le dit. Ce choix est délibéré : les
 * routes doivent déjà appeler le push au bon endroit et de la bonne manière
 * (jamais bloquant), pour que le lot 6 n'ait qu'à remplir le corps de la fonction.
 */
import type { Env } from '../types.ts';
import { subscriptionsOf } from './_db.ts';

export interface PushPayload {
  /** Titre, court et fixe. */
  t: string;
  /** Corps, déjà tronqué à 110 caractères par l'appelant (EF-5.2). */
  b: string;
  /** Où mène le toucher de la notification. */
  u: string;
  /** Le tag : deux notifications d'un même échange se remplacent (EF-9.3). */
  g: string;
}

/**
 * Prévient une personne sur tous ses appareils.
 *
 * À N'APPELER QUE dans `ctx.waitUntil()` : une notification qui échoue ne doit
 * jamais faire échouer l'écriture du message qu'elle annonce.
 */
export async function notify(env: Env, userId: string, payload: PushPayload): Promise<void> {
  const subscriptions = await subscriptionsOf(env, userId);
  if (subscriptions.length === 0) return;

  // TODO(lot 6) — pour chaque abonnement :
  //   1. JWT ES256 signé avec VAPID_PRIVATE_KEY (RFC 8292) ;
  //   2. chiffrement de `payload` en aes128gcm avec p256dh + auth (RFC 8291) ;
  //   3. POST vers l'endpoint ;
  //   4. 201 → noteSubscriptionOk ; 404/410 → deleteSubscription ;
  //      autre → noteSubscriptionFailure, puis purge au-delà de MAX_PUSH_FAILURES.
  console.warn(
    `push non envoyé (lot 6 non implémenté) : ${subscriptions.length} abonnement(s) ` +
      `pour ${userId} — « ${payload.t} »`,
  );
}
