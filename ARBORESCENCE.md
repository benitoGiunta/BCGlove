# Arborescence — BCGlove

Carte du dépôt. Chaque entrée est suivie de sa raison d'être.
**À mettre à jour dans le même commit que tout ajout, suppression ou renommage.**
Les règles de tenue de ce fichier sont dans `CLAUDE.md` §2.1.

---

```
BCGlove/
├── CLAUDE.md                   Guide de travail des agents. À lire en premier
├── ARBORESCENCE.md             Ce fichier — la carte du dépôt
├── README.md                   Présentation courte, pour un humain qui arrive
├── llm.txt                     Fiche du dossier racine
├── package.json                Dépendances et scripts npm
├── tsconfig.json               TypeScript strict — le front
├── tsconfig.test.json          Idem, plus les types Node, pour les tests
├── tsconfig.functions.json     Runtime Workers : pas de DOM, types Cloudflare
├── vite.config.ts              Build du front
├── wrangler.toml               Configuration Cloudflare Pages + binding D1
├── .eslintrc.cjs               Règles de lint
├── .gitignore
├── .env.example                Noms des variables attendues (jamais de valeurs)
├── index.html                  Point d'entrée HTML du front
│
├── docs/                       Toute la documentation de conception
│   ├── llm.txt
│   ├── requirements.md         Le QUOI — exigences, décisions, questions ouvertes
│   ├── roadmap.md              Le QUAND — les douze lots et leurs critères de sortie
│   ├── architecture.md         Le COMMENT — stack, modèle de données, API, flux push
│   ├── design-system.md        La DA — tokens, typo, formes, mouvement, ton
│   ├── deploiement.md          Mise en production Cloudflare, pas à pas
│   ├── installation-iphone.md  Installation sur les iPhones et campagne de recette
│   └── backlog.md              Idées retenues pour une v2, non planifiées
│
├── design/                     La direction artistique : la référence, et ses chantiers
│   ├── llm.txt
│   ├── source/                 La maquette d'origine, archivée telle quelle (lecture seule)
│   ├── reference/              Captures d'écran de référence (lecture seule)
│   └── refonte-v2/             Maquettes de la refonte de l'écran d'accueil (+ llm.txt)
│
├── src/                        Le front. Tout ce qui tourne dans le navigateur
│   ├── llm.txt
│   ├── main.tsx                Montage React, enregistrement du service worker
│   ├── App.tsx                 Aiguillage entre les écrans
│   ├── components/             Composants d'interface (+ llm.txt)
│   ├── hooks/                  Hooks React réutilisables (+ llm.txt)
│   ├── lib/                    Logique pure : temps, API, identité, textes (+ llm.txt)
│   ├── styles/                 Tokens CSS, reset, keyframes (+ llm.txt)
│   └── dev/                    Galerie de primitives, développement seul (+ llm.txt)
│
├── functions/                  L'API. Pages Functions, runtime Cloudflare Workers
│   ├── llm.txt
│   ├── types.ts                Liaisons D1 et secrets, déclarées une seule fois
│   ├── _middleware.ts          Authentification par clé, en-têtes de sécurité
│   └── api/                    Une route par fichier (+ llm.txt)
│       └── push/               Abonnement et désabonnement d'un appareil (+ llm.txt)
│
├── public/                     Servi tel quel, sans passer par le bundler
│   ├── llm.txt
│   ├── manifest.webmanifest    Manifeste PWA
│   ├── sw.js                   Service worker — push, cache, clic sur notification
│   │                             (PORTE UN NUMÉRO DE VERSION : l'incrémenter à chaque modification)
│   ├── icons/                  Icônes et 8 écrans de démarrage iOS (+ llm.txt)
│   ├── images/                  L'emblème du couple (+ llm.txt)
│   └── fonts/                  Polices auto-hébergées en woff2 + licence (+ llm.txt)
│
├── migrations/                 Schéma D1, un fichier SQL numéroté par migration
│   ├── llm.txt
│   └── 0001_init.sql           users, subscriptions, messages, et leurs index
│
└── scripts/                    Outillage local, jamais déployé
    ├── llm.txt
    ├── docs-check.mjs           Vérifie les llm.txt et ARBORESCENCE.md (npm run docs:check)
    ├── seed-users.mjs           Crée les deux comptes et affiche leurs liens, une seule fois
    ├── gen-vapid.mjs            Génère la paire de clés VAPID, une seule fois
    ├── api-smoke.mjs            Vérifie l'API de bout en bout contre un serveur local
    ├── push-smoke.mjs           Vérifie l'envoi de notifications dans le runtime Cloudflare
    ├── reset-first-open.mjs     Réarme la séquence de première ouverture
    ├── reset-test-data.mjs      Efface les messages de test, réarme les deux séquences
    ├── wrangler.mjs             Lance wrangler depuis un script, Windows compris
    ├── make-icons.mjs           Rend icônes et écrans de démarrage, via Chromium
    ├── icon-template.html       Le gabarit de l'icône : monogramme sur fond crème
    └── splash-template.html     Le gabarit des écrans de démarrage iOS
```

## Où poser quoi

| Ce que je veux faire | Où |
|---|---|
| Changer un mot visible à l'écran | `src/lib/copy.ts` — jamais dans un composant |
| Changer une couleur, un rayon, une durée | `src/styles/tokens.css` — jamais en dur |
| Ajouter un écran | `src/components/`, puis l'aiguillage dans `src/App.tsx` |
| Ajouter une route d'API | `functions/api/` — un fichier par route |
| Changer le schéma de la base | Une **nouvelle** migration dans `migrations/` — jamais modifier une migration déjà appliquée |
| Toucher au comportement des notifications | `public/sw.js` (réception) et `functions/api/_push.ts` (envoi) |
| Toucher à la cryptographie du push | `functions/api/_webpush.ts` — et faire passer `npm test` |
| Changer le calcul du temps écoulé | `src/lib/elapsed.ts` |
| Changer une règle de produit | `docs/requirements.md` d'abord, le code ensuite |
| Changer une limite (longueur, délai) | `src/lib/config.ts` **et** `functions/api/_limits.ts` — les deux |
| Ajuster la tenue sur écran court | Le mode compact, en bas de `src/styles/tokens.css` |
| Ajouter une icône ou une police | `public/icons/` ou `public/fonts/` |
| Ajouter une image dans l'app | `public/images/`, affichée par `src/components/Emblem.tsx` |
| Voir un composant dans tous ses états | `src/dev/Gallery.tsx`, puis `npm run dev` et `/?dev=1` |
| Décider une mise en page avant de coder | `design/refonte-v2/`, puis `python3 build.py` |

## Volontairement absent

Écarté après réflexion. Ne pas réintroduire sans mettre à jour `docs/architecture.md` §8.

- **`node_modules/`, `dist/`, `.wrangler/`** — générés, jamais versionnés
- **Framework CSS** (Tailwind, etc.) — la DA repose sur des valeurs trop spécifiques
- **State manager** (Redux, Zustand) — l'état tient dans deux hooks
- **`web-push` (npm)** — dépend du `crypto` de Node, ne tourne pas sur Workers
- **Backend-as-a-service** (Supabase, Firebase) — mise en veille ou SDK volumineux
- **Analytics, tracking, tiers quels qu'ils soient** — c'est une app privée pour deux personnes
- **`_ds/`** — le design system « Shale/bstorm » présent dans le zip d'origine appartenait à un
  autre projet et a été retiré. Aucun de ses tokens ne s'applique ici
