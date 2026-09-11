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

## Lot 1 — Socle technique ✅

Vite + React + TypeScript strict, ESLint, structure `src/`, script `docs:check`,
`wrangler.toml`, migration D1 initiale, `.gitignore`, `.env.example`.

**Sortie.** `npm run dev` sert une page blanche stylée, `npm run typecheck` et
`npm run lint` passent, `npm run db:migrate` crée les tables en local.

---

## Lot 2 — Design system ✅

`src/styles/tokens.css` (couleurs, typo, rayons, ombres, durées, easings extraits de la
maquette), chargement des polices, `reset.css`, gestion de `env(safe-area-inset-*)`, primitives
`Button`, `Card`, `Bubble`, `Field`, et les keyframes `riseIn` / `breathe` / `drift`.

**Sortie.** Une page de démonstration interne montre toutes les primitives ; aucune valeur
hexadécimale n'existe hors de `tokens.css` ; `prefers-reduced-motion` neutralise tout.

---

## Lot 3 — L'écran compteur ✅

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

## Lot 4 — Identité et navigation ✅

Résolution de `?k=`, nettoyage de l'URL, persistance locale, écran « lien invalide », bascule
symétrique des textes selon qui regarde, routage entre les trois écrans (compteur / composeur /
historique), écran de réglages.

**Sortie.** Deux navigateurs ouverts avec deux clés différentes montrent deux perspectives
miroir. La clé n'apparaît plus dans la barre d'adresse après la première ouverture.

---

## Lot 5 — API et base ✅

Les neuf routes de `docs/architecture.md`, l'authentification par clé, les règles de débit,
la migration D1, un script de peuplement des deux utilisateurs.

**Sortie.** ✅ `npm run test:api` couvre le cycle complet et les refus — 17 vérifications :
401 sans clé et sur clé inconnue, 409 sur question déjà ouverte et sur double réponse,
429 sur envois rapprochés, 422 sur corps vide ou trop long, 404 sur question inexistante.

---

## Lot 6 — Web Push ✅ *(sauf validation sur appareil réel)*

Le plus délicat. Génération des clés VAPID, signature JWT ES256 sur WebCrypto, chiffrement
`aes128gcm`, `public/sw.js`, parcours d'abonnement, détection du mode autonome, écran
d'instructions d'installation, purge des abonnements morts.

**Sortie.** ✅ pour tout ce qui se vérifie sans matériel :

- le chiffrement reproduit **octet pour octet** le vecteur de test officiel de la RFC 8291 §5
  (`npm test`). C'est la seule preuve qui vaille : une implémentation qui se contenterait de se
  déchiffrer elle-même passerait un test tout en étant fausse ;
- `npm run test:push` envoie une vraie notification **depuis le runtime Cloudflare** vers un
  faux service de push local, qui la déchiffre avec une implémentation receveur écrite
  séparément, vérifie la signature VAPID et les en-têtes, et confirme qu'un 410 supprime
  l'abonnement — 12 vérifications ;
- le service worker s'enregistre, met la coquille en cache, et l'écran d'installation
  apparaît exactement dans les cas où la permission échouerait (10 vérifications).

⏳ **Reste le seul critère qui compte vraiment** : un push qui arrive sur un vrai iPhone, app
fermée, en moins de trois secondes. Il demande le compte Cloudflare (lot 10) et un appareil.

---

## Lot 7 — Demander, répondre, écrire ✅

Le bouton et ses états, le composeur avec les règles de longueur (EF-5), les réponses rapides,
le message spontané, la bulle adaptative, l'ouverture directe sur le composeur depuis une
notification, la file d'envoi hors ligne.

S'y ajoute l'**écran de lecture** (EF-11), né du constat qu'un message de 280 caractères
poussait la signature hors de l'écran.

**Sortie.** ✅ Le cycle demander → répondre → afficher fonctionne entre deux navigateurs. Un
message de 280 caractères et un message d'un mot sont tous deux beaux. **La notification
elle-même reste à faire (lot 6)** : sans elle, l'autre voit le message à sa prochaine ouverture.

---

## Lot 8 — Historique ✅

Un lien discret, la liste inversée groupée par jour, les horodatages relatifs, la pagination,
la distinction visuelle réponse / mot spontané.

*Révisé : le glissement vers le haut prévu par EF-6.2 est remplacé par un lien discret. Sur un
écran dont la liste défile déjà, un geste de glissement entre en conflit avec le défilement —
et un lien se découvre, là où un geste se devine.*

**Sortie.** ✅ Quarante messages sur treize jours se parcourent sans saccade ; la liste défile
dans son cadre pendant que le titre et les boutons restent en place ; la pagination va chercher
la page suivante ; aucun débordement horizontal.

---

## Lot 9 — PWA ✅ *(sauf ce qui se voit sur un vrai iPhone)*

`manifest.webmanifest`, jeu d'icônes iOS complet, écrans de démarrage, couleur de barre d'état,
mise en cache de la coquille pour un démarrage hors ligne, gestion des mises à jour du service
worker, badge d'icône.

S'y ajoutent l'**écran de réglages** (EF-7.4), atteint par le monogramme, et la **séquence de
première ouverture** (EF-10), déplacée ici depuis le lot 3 : elle dépend de l'état serveur.

**Sortie.** ✅ Manifeste, jeu d'icônes, huit écrans de démarrage, mise en cache de la coquille,
pastille sur l'icône, réglages, séquence de première ouverture — vérifiée : elle joue une fois,
le compteur rattrape le temps réel, et elle ne se rejoue pas au rechargement.

⏳ Ce qui ne se vérifie que sur l'appareil : le rendu plein écran sans barre Safari, l'icône sur
l'écran d'accueil, et l'écran de démarrage.

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

## Lot 13 — Refonte de l'écran d'accueil (v2)

Les trois demandes du backlog en **un seul chantier**, parce qu'elles partagent la hauteur de
l'écran. La mise en page est déjà arbitrée sur maquette : `docs/requirements.md §10`
(D14 à D25, EF-13 à EF-17) est la spécification, `design/refonte-v2/` la référence visuelle.

**Le maquettage est fait** — il n'y a plus à dessiner, seulement à coder, dans cet ordre :

1. **La recomposition** (EF-13) ✅ : en-tête sur une ligne, signature du bas supprimée. C'est ce
   pas qui libère la place ; les trois suivants n'ont plus de contrainte de hauteur.
   *Fait, et mesuré* : aucun débordement de 874 px à 629 px, dans les six états de l'écran, et
   l'espace messages ↔ bouton reste le plus grand partout (33 px au pire, contre 26 px entre la
   carte et le bouton). La zone de réponse a perdu sa hauteur réservée, devenue inutile : le
   bouton est ancré en haut, les liens en bas, plus rien ne peut sauter. `src/dev/HomePreview.tsx`
   (`npm run dev`, `/?dev=home`) montre l'écran entier dans ses six états — c'est lui qu'on
   superpose à la maquette, et il servira aux trois pas suivants.
2. **Le type `love`** (EF-15.6) : migration `migrations/0002_*.sql` qui recrée `messages` pour
   élargir la contrainte `CHECK`. À faire tôt : le bouton et le compteur en dépendent.
3. **Le bouton cœur** (EF-15) et le **compteur des preuves** (EF-14).
4. **Les deux messages** (EF-16) : `lastTwo` côté API, bulles orientées côté rendu.

**Sortie.** L'écran tient toujours de 874 px à 629 px, tests unitaires et de rendu à jour, et
l'écran réel se superpose à `design/refonte-v2/Main.dc.html` sans écart visible. Deux choses
n'existent qu'en mots dans la spécification et devront rejoindre `docs/design-system.md` en
tant que composants au moment où elles sont codées : la **pastille du cœur** (EF-15.5) et le
**compteur des preuves** (EF-14.5). Aucune planche ne les dessine — la pastille n'a jamais été
maquettée.

**Rien ne reste à trancher.** Le débit du cœur l'a été aussi : pas de spam, plancher de 30 s
inchangé et un seul `tag` de notification (EF-15.7).

**La contrainte qui domine ce lot : l'app est en service.** Les deux iPhones l'utilisent. Une
mise à jour ne doit coûter aucune réinstallation (ENF-10), ce qui donne trois garde-fous, tous
détaillés dans `docs/deploiement.md` §8 :

- la migration `0002` **recopie** les lignes de `messages` avant de remplacer la table. Un
  `DROP` sans recopie efface l'historique et le compteur d'un coup. Sauvegarde d'abord ;
- `VERSION` dans `public/sw.js` est incrémenté, sans quoi la refonte ne descend pas sur les
  téléphones ;
- `bcglove.key.v1` garde son nom, et `db:clean:prod` reste hors du chemin.

---

## Ordonnancement

```
Lot 0 ─ Lot 1 ─┬─ Lot 2 ─ Lot 3 ─┐
               │                 ├─ Lot 7 ─ Lot 8 ─┐
               ├─ Lot 4 ─────────┤                 ├─ Lot 9 ─ Lot 10 ─ Lot 11 ─ Lot 12
               └─ Lot 5 ─ Lot 6 ─┘                 │
                        └── déploiement anticipé ───┘

Lot 12 ─ Lot 13   (la refonte v2, après l'usage réel)
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
| Avant le lot 13 | Rien : la mise en page est déjà arbitrée (§10 des requirements) |
