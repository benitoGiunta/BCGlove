/*
 * BCGlove — service worker.
 *
 * VERSION : à incrémenter à CHAQUE modification de ce fichier. C'est ce qui
 * déclenche la mise à jour chez les clients ; sans ça, iOS peut garder l'ancienne
 * version pendant des semaines.
 */
const VERSION = 'v1';
const SHELL_CACHE = `bcglove-shell-${VERSION}`;

/*
 * Ce fichier n'est PAS bundlé par Vite : il est servi tel quel depuis la racine
 * du domaine, ce qui lui donne la portée complète. Donc pas de TypeScript, pas
 * d'import de module, rien qui demande une compilation.
 *
 * Les fichiers construits portent un condensat dans leur nom, qui change à
 * chaque build : on ne peut pas les précacher par une liste écrite à la main.
 * On précache donc la coquille, et le reste se met en cache à l'usage.
 */
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-180.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      // Un fichier manquant ne doit pas empêcher l'installation : mieux vaut un
      // service worker sans cache qu'aucun service worker — sans lui, pas de
      // notification du tout.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== SHELL_CACHE).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  );
});

/*
 * Réseau d'abord, cache en secours. L'inverse ferait afficher un compteur figé
 * après un déploiement. Les appels à l'API ne sont jamais mis en cache : un état
 * périmé y serait pire que pas d'état du tout.
 */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          // Navigation hors ligne vers une URL inconnue : on rend la racine,
          // qui est en cache. Le compteur s'affichera (EF-3 hors ligne).
          if (request.mode === 'navigate') return caches.match('/');
          return Response.error();
        }),
      ),
  );
});

/*
 * Réception d'une notification.
 *
 * `userVisibleOnly: true` est imposé par les navigateurs : tout push DOIT
 * afficher quelque chose. En cas de charge illisible, on affiche donc un message
 * générique plutôt que rien — sans quoi le navigateur peut révoquer l'abonnement.
 */
self.addEventListener('push', (event) => {
  let payload = { t: 'BCGlove', b: 'Tu as un message.', u: '/', g: 'bcglove' };
  try {
    if (event.data) payload = Object.assign(payload, event.data.json());
  } catch (error) {
    // Charge absente ou illisible : on garde le message générique.
  }

  event.waitUntil(
    (async () => {
      // Si l'app est déjà au premier plan, pas de bannière système : on lui
      // demande de se rafraîchir, et elle montre le message dans l'interface
      // (EF-9.2).
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const visible = clients.some((client) => client.visibilityState === 'visible');
      if (visible) {
        for (const client of clients) client.postMessage({ type: 'bcglove:refresh' });
        return;
      }

      await self.registration.showNotification(payload.t, {
        body: payload.b,
        // Même tag : deux notifications d'un même échange se remplacent au lieu
        // de s'empiler (EF-9.3).
        tag: payload.g,
        renotify: true,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: { url: payload.u },
      });
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Une fenêtre déjà ouverte : on la ramène au premier plan et on lui dit où
      // aller, plutôt que de recharger l'app (EF-9.1).
      for (const client of clients) {
        if ('focus' in client) {
          client.postMessage({ type: 'bcglove:open', url: target });
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })(),
  );
});
