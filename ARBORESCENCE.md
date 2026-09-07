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
├── tsconfig.json               TypeScript, mode strict
├── vite.config.ts              Build du front
├── wrangler.toml               Configuration Cloudflare Pages + binding D1
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
│   └── installation-iphone.md  Installation sur les iPhones et campagne de recette
│
├── design/                     La direction artistique de référence — lecture seule
│   ├── llm.txt
│   ├── source/                 La maquette d'origine, archivée telle quelle
│   └── reference/              Captures d'écran de référence
│
├── src/                        Le front. Tout ce qui tourne dans le navigateur
│   ├── llm.txt
│   ├── main.tsx                Montage React, enregistrement du service worker
│   ├── App.tsx                 Aiguillage entre les écrans
│   ├── components/             Composants d'interface (+ llm.txt)
│   ├── hooks/                  Hooks React réutilisables (+ llm.txt)
│   ├── lib/                    Logique pure : temps, API, identité, textes (+ llm.txt)
│   └── styles/                 Tokens CSS, reset, keyframes (+ llm.txt)
│
├── functions/                  L'API. Pages Functions, runtime Cloudflare Workers
│   ├── llm.txt
│   └── api/                    Une route par fichier (+ llm.txt)
│
├── public/                     Servi tel quel, sans passer par le bundler
│   ├── llm.txt
│   ├── manifest.webmanifest    Manifeste PWA
│   ├── sw.js                   Service worker — push, cache, clic sur notification
│   ├── icons/                  Icônes iOS et écrans de démarrage (+ llm.txt)
│   └── fonts/                  Polices auto-hébergées en woff2 (+ llm.txt)
│
├── migrations/                 Schéma D1, un fichier SQL numéroté par migration
│   └── llm.txt
│
└── scripts/                    Outillage local, jamais déployé
    ├── llm.txt
    └── docs-check.mjs           Vérifie les llm.txt et ARBORESCENCE.md (npm run docs:check)
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
| Changer le calcul du temps écoulé | `src/lib/elapsed.ts` |
| Changer une règle de produit | `docs/requirements.md` d'abord, le code ensuite |
| Ajouter une icône ou une police | `public/icons/` ou `public/fonts/` |

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
