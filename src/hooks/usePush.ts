import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import { canSubscribe, environment, type Environment } from '../lib/standalone.ts';

export type PushStatus =
  /** On ne sait pas encore. */
  | 'unknown'
  /** Impossible ici : app non installée, ou navigateur sans push. */
  | 'unavailable'
  /** Possible, mais pas encore demandé. */
  | 'askable'
  /** Refusé. Seuls les réglages iOS peuvent revenir dessus. */
  | 'denied'
  /** Abonné et enregistré côté serveur. */
  | 'ready';

export interface UsePush {
  status: PushStatus;
  environment: Environment;
  /** À appeler DEPUIS UN CLIC. Jamais dans un effet : Safari refuserait. */
  enable: () => Promise<void>;
}

function toUint8Array(base64Url: string): Uint8Array {
  const padded = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toBase64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  let binary = '';
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * L'abonnement aux notifications.
 *
 * Trois règles qui viennent toutes de Safari iOS :
 *  - la permission ne se demande QUE depuis un geste utilisateur direct ;
 *  - rien n'est possible tant que l'app n'est pas sur l'écran d'accueil ;
 *  - un abonnement peut être révoqué sans prévenir, donc on le revalide à chaque
 *    lancement plutôt que de faire confiance à ce qu'on a enregistré (EF-8.4).
 */
export function usePush(key: string | null): UsePush {
  const [status, setStatus] = useState<PushStatus>('unknown');
  const env = environment();

  /** Envoie l'abonnement au serveur. Partagé entre la revalidation et l'activation. */
  const register = useCallback(
    async (subscription: PushSubscription) => {
      if (key === null) return;
      const json = subscription.toJSON();
      await api.subscribe(key, {
        endpoint: subscription.endpoint,
        keys: {
          // `toJSON()` suffit partout, mais Safari a longtemps rendu un objet
          // incomplet : on retombe sur `getKey()`, qui n'a jamais menti.
          p256dh: json.keys?.p256dh ?? toBase64Url(subscription.getKey('p256dh')),
          auth: json.keys?.auth ?? toBase64Url(subscription.getKey('auth')),
        },
      });
    },
    [key],
  );

  // Revalidation au lancement.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!canSubscribe()) {
        if (!cancelled) setStatus('unavailable');
        return;
      }
      if (Notification.permission === 'denied') {
        if (!cancelled) setStatus('denied');
        return;
      }
      if (Notification.permission !== 'granted') {
        if (!cancelled) setStatus('askable');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (!existing) {
          // Permission accordée mais plus d'abonnement : iOS l'a révoqué.
          // On peut le refaire sans redemander la permission.
          if (!cancelled) setStatus('askable');
          return;
        }
        await register(existing);
        if (!cancelled) setStatus('ready');
      } catch {
        if (!cancelled) setStatus('askable');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, register]);

  const enable = useCallback(async () => {
    if (key === null || !canSubscribe()) {
      setStatus('unavailable');
      return;
    }

    // Cet appel DOIT partir du clic. Déplacé dans un effet, Safari l'ignore.
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus(permission === 'denied' ? 'denied' : 'askable');
      return;
    }

    try {
      // La clé publique VAPID vient du serveur plutôt que du bundle : elle peut
      // changer sans qu'on ait à reconstruire l'app.
      const { publicKey } = await api.vapid(key);

      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          // Imposé par les navigateurs : tout push doit afficher quelque chose.
          userVisibleOnly: true,
          applicationServerKey: toUint8Array(publicKey) as BufferSource,
        }));

      await register(subscription);
      setStatus('ready');
    } catch {
      setStatus('askable');
    }
  }, [key, register]);

  return { status, environment: env, enable };
}
