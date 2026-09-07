/**
 * Envoi des notifications Web Push.
 *
 * La cryptographie vit dans `_webpush.ts`, vérifiée contre le vecteur de test de
 * la RFC 8291. Ici, seule la logique d'envoi : à qui, avec quels en-têtes, et
 * que faire quand ça échoue.
 */
import type { Env } from '../types.ts';
import {
  deleteSubscription,
  noteSubscriptionFailure,
  noteSubscriptionOk,
  pruneFailedSubscriptions,
  subscriptionsOf,
  type SubscriptionRow,
} from './_db.ts';
import { MAX_PUSH_FAILURES } from './_limits.ts';
import { audienceOf, encryptPayload, fromBase64Url, vapidAuthorization } from './_webpush.ts';

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
 * Quatre heures. Assez pour qu'un téléphone éteint la reçoive au rallumage,
 * assez court pour qu'un « est-ce que tu m'aimes ? » d'avant-hier n'arrive pas
 * ce matin.
 */
const TTL_SECONDS = 4 * 60 * 60;

async function sendTo(
  env: Env,
  subscription: SubscriptionRow,
  payload: PushPayload,
): Promise<void> {
  const body = await encryptPayload({
    payload: new TextEncoder().encode(JSON.stringify(payload)),
    userAgentPublicKey: fromBase64Url(subscription.p256dh),
    authSecret: fromBase64Url(subscription.auth),
  });

  const authorization = await vapidAuthorization({
    audience: audienceOf(subscription.endpoint),
    subject: env.VAPID_SUBJECT,
    publicKey: fromBase64Url(env.VAPID_PUBLIC_KEY),
    privateKey: fromBase64Url(env.VAPID_PRIVATE_KEY),
  });

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: String(TTL_SECONDS),
      // « high » : ces messages sont attendus. Sans ça, iOS peut les retarder
      // pour économiser la batterie.
      Urgency: 'high',
    },
    body: body as BodyInit,
  });

  if (response.status === 404 || response.status === 410) {
    // L'abonnement est mort : l'app a été désinstallée, ou iOS l'a révoqué.
    // Le supprimer tout de suite, sinon la table se remplit de fantômes.
    await deleteSubscription(env, subscription.endpoint);
    return;
  }

  if (!response.ok) {
    await noteSubscriptionFailure(env, subscription.id);
    console.warn(`push refusé (${response.status}) pour ${subscription.id}`);
    return;
  }

  await noteSubscriptionOk(env, subscription.id, Date.now());
}

/**
 * Prévient une personne sur tous ses appareils.
 *
 * À N'APPELER QUE dans `ctx.waitUntil()` : une notification qui échoue ne doit
 * jamais faire échouer l'écriture du message qu'elle annonce. C'est pour ça que
 * cette fonction ne lève jamais.
 */
export async function notify(env: Env, userId: string, payload: PushPayload): Promise<void> {
  if (!env.VAPID_PRIVATE_KEY || !env.VAPID_PUBLIC_KEY || !env.VAPID_SUBJECT) {
    console.warn('push non configuré : secrets VAPID absents');
    return;
  }

  const subscriptions = await subscriptionsOf(env, userId);
  if (subscriptions.length === 0) return;

  // En parallèle, et chacun isolé : un appareil qui répond mal ne doit pas
  // empêcher l'autre d'être prévenu.
  await Promise.all(
    subscriptions.map((subscription) =>
      sendTo(env, subscription, payload).catch((error: unknown) => {
        console.warn(`push en échec pour ${subscription.id} :`, error);
        return noteSubscriptionFailure(env, subscription.id);
      }),
    ),
  );

  await pruneFailedSubscriptions(env, MAX_PUSH_FAILURES);
}
