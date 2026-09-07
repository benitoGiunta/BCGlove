# BCGlove — Roadmap de développement

**Version** 0.1 · aligné sur `requirements.md` v0.1

Douze lots. Chacun a un **critère de sortie vérifiable** : tant qu'il n'est pas atteint, le lot
n'est pas fini et on ne passe pas au suivant. Les lots 1 à 4 ne demandent aucun compte
Cloudflare : le développement démarre en local et la question de l'hébergement ne se pose
qu'au lot 8.

---

## Lot 0 — Fondations documentaires ✅ *(ce chantier)*

Structure du dépôt, `CLAUDE.md`, `ARBORESCENCE.md`, `llm.txt` partout, les six documents de
`docs/`, la DA source archivée dans `design/`.

**Sortie.** `npm run docs:check` passe. Un agent qui ouvre le dépôt sait où poser quoi.

---

## Lot 1 — Socle technique

Vite + React + TypeScript strict, ESLint, structure `src/`, script `docs:check`,
`wrangler.toml`, migration D1 initiale, `.gitignore`, `.env.example`.

**Sortie.** `npm run dev` sert une page blanche stylée, `npm run typecheck` et
`npm run lint` passent, `npm run db:migrate` crée les tables en local.

---

## Lot 2 — Design system

`src/styles/tokens.css` (couleurs, typo, rayons, ombres, durées, easings extraits de la
maquette), chargement des polices, `reset.css`, gestion de `env(safe-area-inset-*)`, primitives
`Button`, `Card`, `Bubble`, `Field`, et les keyframes `riseIn` / `breathe` / `drift`.

**Sortie.** Une page de démonstration interne montre toutes les primitives ; aucune valeur
hexadécimale n'existe hors de `tokens.css` ; `prefers-reduced-motion` neutralise tout.

---

## Lot 3 — L'écran compteur

Le cœur visuel. Portage du calcul calendaire `elapsed()`, composant `Counter`, ligne
`h · min · s` qui tourne, chiffres à largeur fixe, formes floues du fond, header et
signature, pause en arrière-plan et resynchronisation.

S'y ajoute la **séquence de première ouverture** (EF-10, décision D7) : le compteur monte de
zéro jusqu'au temps réel en deux secondes avant que l'horloge ne prenne le relais, une seule
fois dans la vie de l'app, passable d'un appui.

**Sortie.** Sur un iPhone en local, l'écran est **indiscernable de la maquette**, le compteur
avance sans à-coup, il ne dérive pas après cinq minutes en arrière-plan, et la séquence de
première ouverture ne se rejoue pas au second lancement.

---

## Lot 4 — Identité et navigation

Résolution de `?k=`, nettoyage de l'URL, persistance locale, écran « lien invalide », bascule
symétrique des textes selon qui regarde, routage entre les trois écrans (compteur / composeur /
historique), écran de réglages.

**Sortie.** Deux navigateurs ouverts avec deux clés différentes montrent deux perspectives
miroir. La clé n'apparaît plus dans la barre d'adresse après la première ouverture.

---

## Lot 5 — API et base

Les neuf routes de `docs/architecture.md`, l'authentification par clé, les règles de débit,
la migration D1, un script de peuplement des deux utilisateurs.

**Sortie.** Toutes les routes répondent correctement en local via `wrangler pages dev`,
y compris les cas d'erreur (401, 409, 429). Un jeu de tests d'intégration les couvre.

---

## Lot 6 — Web Push

Le plus délicat. Génération des clés VAPID, signature JWT ES256 sur WebCrypto, chiffrement
`aes128gcm`, `public/sw.js`, parcours d'abonnement, détection du mode autonome, écran
d'instructions d'installation, purge des abonnements morts.

**Sortie.** Un push envoyé depuis une route de test arrive **sur un vrai iPhone**, app fermée,
en moins de trois secondes. C'est le seul critère qui compte, et il ne peut être validé qu'en
conditions réelles — ce lot force donc le déploiement du lot 8 en avance si nécessaire.

---

## Lot 7 — Demander, répondre, écrire

Le bouton et ses états, le composeur avec les règles de longueur (EF-5), les réponses rapides,
le message spontané, la bulle adaptative, l'ouverture directe sur le composeur depuis une
notification, la file d'envoi hors ligne.

**Sortie.** Le cycle complet demander → notifier → répondre → notifier → afficher fonctionne
entre deux appareils. Un message de 280 caractères et un message d'un mot sont tous deux beaux.

---

## Lot 8 — Historique

Le geste d'ouverture, la liste inversée groupée par jour, les horodatages relatifs, la
pagination, la distinction visuelle réponse / mot spontané.

**Sortie.** Cent messages injectés se parcourent sans saccade et sans perte de place.

---

## Lot 9 — PWA

`manifest.webmanifest`, jeu d'icônes iOS complet, écrans de démarrage, couleur de barre d'état,
mise en cache de la coquille pour un démarrage hors ligne, gestion des mises à jour du service
worker, badge d'icône.

**Sortie.** L'app ajoutée à l'écran d'accueil s'ouvre en plein écran sans barre Safari,
affiche le compteur hors ligne, et son icône est correcte à toutes les tailles.

---

## Lot 10 — Infrastructure et mise en production

Création du projet Pages, base D1, secrets, liaison GitHub pour le déploiement automatique,
peuplement des deux utilisateurs, génération des deux liens secrets, en-têtes de sécurité,
procédure de sauvegarde.

**Sortie.** L'app est en ligne sur son URL définitive, en HTTPS, et un `git push` la met à jour
sans intervention. `docs/deploiement.md` est vérifié pas à pas, sans étape implicite.

---

## Lot 11 — Installation et recette sur iPhone

Installation sur les deux appareils, activation des notifications, et la campagne de tests de
`docs/installation-iphone.md` : app fermée, app en arrière-plan, app au premier plan, téléphone
verrouillé, mode avion puis retour, mode Concentration, redémarrage, message très long,
message très court, deux questions coup sur coup.

**Sortie.** Chaque scénario est coché. Les échecs sont documentés avec leur parade.

---

## Lot 12 — Revue et itérations

Passage en revue ensemble : ce qui sonne juste, ce qui sonne faux, les mots à changer, les
rythmes d'animation à ajuster. C'est le lot qui décide de la qualité finale, et il n'a pas de
critère de sortie technique.

---

## Ordonnancement

```
Lot 0 ─ Lot 1 ─┬─ Lot 2 ─ Lot 3 ─┐
               │                 ├─ Lot 7 ─ Lot 8 ─┐
               ├─ Lot 4 ─────────┤                 ├─ Lot 9 ─ Lot 10 ─ Lot 11 ─ Lot 12
               └─ Lot 5 ─ Lot 6 ─┘                 │
                        └── déploiement anticipé ───┘
```

Les lots 2-3 (le visuel) et 5-6 (le tuyau) sont indépendants et peuvent avancer en parallèle.
Le lot 6 est le seul qui **exige du matériel réel** : il conditionne le calendrier.

## Ce dont j'ai besoin de vous, et quand

| Quand | Ce qu'il me faut |
|---|---|
| Avant le lot 3 | La date d'origine (Q-1) et les textes (Q-3, Q-4) — des valeurs d'attente sont posées en attendant |
| Avant le lot 6 | Un compte Cloudflare (D6), les versions d'iOS vérifiées (Q-9), et un iPhone pour tester |
| Avant le lot 10 | Le choix du domaine (Q-8) |
| Avant le lot 11 | Les deux iPhones, une demi-heure |
