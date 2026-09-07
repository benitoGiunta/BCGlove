# BCGlove — Architecture

**Version** 0.1 · aligné sur `requirements.md` v0.1

---

## 1. Vue d'ensemble

Un seul projet Cloudflare Pages sert **le front et l'API**. Pas de second service à déployer,
pas de CORS, pas de variable d'environnement pointant d'un service vers l'autre.

```
   iPhone Charleen                                    iPhone Benito
   ┌──────────────┐                                  ┌──────────────┐
   │  PWA (écran  │                                  │  PWA (écran  │
   │   d'accueil) │                                  │   d'accueil) │
   │  + Service   │                                  │  + Service   │
   │    Worker    │                                  │    Worker    │
   └──────┬───────┘                                  └───────┬──────┘
          │ HTTPS (fetch)                                    │
          │                                                  │
          ▼                                                  ▼
   ┌─────────────────────────────────────────────────────────────────┐
   │              Cloudflare Pages  ·  bcglove.pages.dev             │
   │  ┌───────────────────────┐      ┌───────────────────────────┐   │
   │  │  Statique (dist/)     │      │  Pages Functions          │   │
   │  │  index.html, JS, CSS  │      │  /api/*   (TypeScript)    │   │
   │  │  sw.js, manifest      │      │                           │   │
   │  └───────────────────────┘      └───────────┬───────────────┘   │
   │                                             │                   │
   │                                  ┌──────────▼──────────┐        │
   │                                  │   D1 (SQLite)       │        │
   │                                  │   users, subs, msgs │        │
   │                                  └─────────────────────┘        │
   └─────────────────────────────────────┬───────────────────────────┘
                                         │ Web Push (VAPID, aes128gcm)
                                         ▼
                              ┌────────────────────────┐
                              │  Apple Push Service     │
                              │  web.push.apple.com     │
                              └────────────────────────┘
```

## 2. Stack

| Couche | Choix | Pourquoi |
|---|---|---|
| Front | **Vite + React 18 + TypeScript** | Build rapide, bundle minimal, React déjà utilisé par la maquette source |
| Style | **CSS modules + variables CSS** | Aucun framework : la DA est trop spécifique pour bénéficier d'un design system générique. Les tokens vivent dans `src/styles/tokens.css` |
| Hébergement | **Cloudflare Pages** | Gratuit sans limite de durée, HTTPS automatique, déploiement sur `git push` |
| API | **Cloudflare Pages Functions** | Même projet que le front. Runtime Workers, WebCrypto natif |
| Base | **Cloudflare D1** (SQLite) | Gratuit, ne se met jamais en veille, sauvegarde par export SQL |
| Push | **Web Push VAPID**, implémenté maison sur WebCrypto | Les bibliothèques Node (`web-push`) ne tournent pas sur Workers. ~150 lignes, zéro dépendance, zéro obsolescence |

**Ce qu'on n'utilise pas, volontairement** : aucun backend-as-a-service, aucun SDK de push
tiers (Firebase, OneSignal), aucun framework CSS, aucun state manager, aucun analytics.
Chaque brique retirée est une brique qui ne peut pas casser dans trois ans.

## 3. Modèle de données (D1)

```sql
-- Deux lignes, écrites à la main au moment de l'installation. Jamais d'inscription.
CREATE TABLE users (
  id          TEXT PRIMARY KEY,      -- 'charleen' | 'benito'
  display_name TEXT NOT NULL,        -- 'Charleen'
  key_hash    TEXT NOT NULL,         -- SHA-256 de la clé personnelle. La clé en clair n'est jamais stockée
  partner_id  TEXT NOT NULL,
  created_at  INTEGER NOT NULL
);

-- Un abonnement push par appareil. Un utilisateur peut en avoir plusieurs.
CREATE TABLE subscriptions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  endpoint    TEXT NOT NULL UNIQUE,  -- URL fournie par Apple
  p256dh      TEXT NOT NULL,         -- clé publique du client (base64url)
  auth        TEXT NOT NULL,         -- secret d'authentification (base64url)
  user_agent  TEXT,
  created_at  INTEGER NOT NULL,
  last_ok_at  INTEGER,               -- dernier envoi réussi
  fail_count  INTEGER NOT NULL DEFAULT 0
);

-- Le fil, dans une seule table. 'ask' n'a pas de corps.
CREATE TABLE messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  kind        TEXT NOT NULL,         -- 'ask' | 'reply' | 'note'
  from_user   TEXT NOT NULL REFERENCES users(id),
  to_user     TEXT NOT NULL REFERENCES users(id),
  body        TEXT,                  -- NULL si kind='ask'
  reply_to    INTEGER REFERENCES messages(id),  -- l'ask auquel on répond
  created_at  INTEGER NOT NULL,      -- ms epoch UTC
  seen_at     INTEGER                -- NULL tant que non vu par to_user
);

CREATE INDEX idx_messages_to   ON messages(to_user, created_at DESC);
CREATE INDEX idx_messages_open ON messages(kind, reply_to) WHERE kind = 'ask';
```

**Conventions.** Toutes les dates sont des entiers en millisecondes epoch UTC. Aucun booléen
(SQLite n'en a pas) : on utilise la présence ou l'absence d'un horodatage. Aucune suppression :
la table `messages` ne fait que croître, ce qui est parfaitement tenable à ce volume.

## 4. API

Toutes les routes sont sous `/api`, authentifiées par l'en-tête `Authorization: Bearer <clé>`.
La clé est le secret personnel ; le serveur en calcule le SHA-256 et cherche l'utilisateur
correspondant. Comparaison en temps constant. Aucune session, aucun cookie, aucun JWT.

| Méthode | Route | Rôle |
|---|---|---|
| `GET`  | `/api/state` | L'état complet de l'écran : moi, l'autre, la question ouverte, le dernier message reçu, le nombre de non-vus |
| `GET`  | `/api/history?before=<id>&limit=30` | Page d'historique, du plus récent au plus ancien |
| `POST` | `/api/ask` | Poser la question. Refuse (409) s'il en existe déjà une ouverte de moins de 30 min |
| `POST` | `/api/reply` | Répondre à une question ouverte. Corps : `{ replyTo, body }` |
| `POST` | `/api/note` | Envoyer un mot spontané. Corps : `{ body }` |
| `POST` | `/api/seen` | Marquer vu jusqu'à un identifiant donné |
| `POST` | `/api/push/subscribe` | Enregistrer ou rafraîchir un abonnement |
| `POST` | `/api/push/unsubscribe` | Retirer un abonnement |
| `GET`  | `/api/vapid` | Renvoie la clé publique VAPID (nécessaire au client pour s'abonner) |

**Rafraîchissement côté client.** Pas de WebSocket ni de Durable Object : `/api/state` est
appelé au lancement, à chaque retour au premier plan (`visibilitychange`), et toutes les 20 s
tant que l'écran est visible. Le push fait le reste. C'est suffisant pour deux personnes et
ça ne consomme rien.

**Limites de débit.** Une question ouverte à la fois par personne, et un plancher de 30 s
entre deux envois quels qu'ils soient. Appliqué côté serveur, pas seulement côté interface.

## 5. Le flux de notification, en détail

C'est la partie fragile du projet. Elle est décrite pas à pas parce que chaque étape a sa
manière d'échouer silencieusement sur iOS.

**Abonnement** (une fois par appareil)
1. L'app détecte qu'elle tourne en mode autonome (`navigator.standalone` ou `display-mode: standalone`). Sinon, elle affiche les instructions d'installation et s'arrête là.
2. L'utilisateur appuie sur « Activer les notifications ». **Depuis ce clic** — pas avant — l'app appelle `Notification.requestPermission()`.
3. Si accordée : `navigator.serviceWorker.ready` → `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`.
4. L'abonnement (`endpoint`, `p256dh`, `auth`) est envoyé à `/api/push/subscribe`.

**Envoi**
1. Une route (`/api/ask`, `/reply`, `/note`) écrit le message en base.
2. Elle charge les abonnements du destinataire.
3. Pour chacun : construction d'un JWT ES256 signé avec la clé privée VAPID, chiffrement de la charge utile en `aes128gcm` (RFC 8291), `POST` vers l'`endpoint`.
4. `201` → `last_ok_at` mis à jour. `404` ou `410` → l'abonnement est supprimé (endpoint mort). Autre erreur → `fail_count` incrémenté ; au-delà de 5, suppression.
5. **L'envoi du push n'est jamais bloquant** : il part dans `ctx.waitUntil()`. Une notification qui échoue ne doit pas faire échouer l'envoi du message.

**Réception**
1. Le service worker reçoit l'événement `push`, lit la charge JSON, appelle `showNotification()` avec un `tag` stable pour que les notifications se remplacent.
2. `notificationclick` : si une fenêtre de l'app est déjà ouverte, on la focalise et on lui poste un message ; sinon on ouvre l'URL cible (`/?open=reply`).

**Charge utile du push**
```json
{ "t": "Charleen a répondu ♡", "b": "Oui. Chaque matin un peu plus qu'hier.", "u": "/?open=thread", "g": "msg-142" }
```
Volontairement court : le chiffrement `aes128gcm` plafonne à ~4 ko, et le corps est de toute
façon tronqué à 110 caractères (EF-5.2).

## 6. Sécurité

- Les clés personnelles sont **des chaînes aléatoires de 32 caractères** (128 bits d'entropie), générées hors ligne.
- Seul leur **SHA-256** est stocké. Une fuite de la base ne donne accès à rien.
- La clé transite dans l'URL **une seule fois**, puis est retirée de la barre d'adresse (`replaceState`) et conservée en `localStorage`.
- Toutes les réponses d'erreur d'authentification sont identiques (`401`, corps vide) : pas de distinction entre « clé inconnue » et « clé mal formée ».
- En-têtes : `X-Robots-Tag: noindex`, CSP stricte, pas de `Referrer`.
- Aucune donnée personnelle au-delà de deux prénoms et des messages échangés.

## 7. Déploiement

`git push` sur la branche de production → Cloudflare Pages construit et publie.
Les secrets (`VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`) sont posés une fois
dans le tableau de bord. La base D1 est liée au projet par un *binding* nommé `DB`.
Procédure complète : `docs/deploiement.md`.

## 8. Ce qui a été écarté, et pourquoi

| Écarté | Raison |
|---|---|
| Supabase / Firebase | Mise en veille de l'offre gratuite, ou dépendance à un SDK volumineux qui évolue |
| `web-push` (npm) | Dépend de `crypto` Node, ne tourne pas sur le runtime Workers |
| WebSocket / Durable Objects | Complexité et coût injustifiés pour deux personnes ; le polling suffit |
| Next.js | Poids et complexité sans contrepartie : l'app fait un écran et demi |
| Tailwind | La DA est faite de valeurs très spécifiques ; les classes utilitaires la rendraient moins lisible, pas plus |
| Notifications natives APNs | Impose un compte développeur Apple à 99 €/an et un passage par l'App Store |
