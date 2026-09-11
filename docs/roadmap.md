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
   *Fait, et mesuré sur les états de l'écran* : l'espace messages ↔ bouton reste le plus
   grand partout, et la zone de réponse a perdu sa hauteur réservée, devenue inutile — le bouton
   est ancré en haut, les liens en bas. `src/dev/HomePreview.tsx` (`npm run dev`, `/?dev=home`)
   montre l'écran entier dans tous ses états ; c'est lui qu'on superpose à la maquette, et il
   servira aux pas suivants.

   **Un cas déborde encore, et il est assumé** : à 629 px de haut, l'état qui cumule le bandeau
   d'activation des notifications et une réponse de trois lignes demande 18 px de défilement,
   les liens tombant 2 px sous le bord. 629 px, c'est l'onglet Safari sur appareil court ; les
   deux iPhones ont l'app installée et disposent de 852 px, où tous les états tiennent avec de
   la marge. Le mode compact a repris ce qu'il pouvait sur les deux seuls écarts réglables de
   l'écran (`--gap-home`, 26 px qui deviennent 18 puis 14) ; aller plus loin voudrait dire
   rogner la carte, ce que la refonte avait précisément pour but d'éviter. Le défilement est le
   dernier recours prévu par le projet, jamais le rognage.

   **Un saut reste ouvert** : le bandeau d'activation a deux ancrages, en bas à l'état vide et
   au-dessus du bouton ailleurs, donc il saute au premier appui. Décrit dans
   `docs/design-system.md` §6. À trancher — un seul ancrage, ou l'assumer.
2. **Le type `love`** (EF-15.6) ✅ : migration `migrations/0002_widen_message_kind.sql`, qui
   recrée `messages` pour élargir la contrainte `CHECK`. À faire tôt : le bouton et le
   compteur en dépendent.

   *Fait, et le geste est complet de bout en bout sauf son bouton* : la route `/api/love`, la
   notification qui tranche (EF-15.3), le plancher de 30 s appliqué sans faveur (EF-15.7) avec
   un tag unique par expéditeur, et le rendu dans le fil — la pastille `Pill` (EF-15.5) qui dit
   « Je t'aime » à la voix de son auteur (EF-15.4). Le rendu du fil a été tiré du pas 3 vers
   celui-ci : sans lui, un cœur en base s'afficherait comme une bulle VIDE.

   *Ce qui a été prouvé, et comment.* La migration a été répétée à blanc sur une copie de la
   base peuplée : six lignes avant, six lignes après, identiques colonne par colonne, contrainte
   élargie, trois index recréés, auto-incrément continu, type inconnu toujours refusé. Le geste
   a été éprouvé contre le vrai runtime Workers — `npm run test:api` passe 24 vérifications
   dont 7 pour le cœur, et `npm run test:push` en passe 17 dont 5 qui lisent la charge
   **déchiffrée** : titre « Je t'aime », corps « — Benito », tag `love-benito`.

   `public/sw.js` n'est PAS touché, donc son `VERSION` reste à `v1` : le tag vient de la charge
   utile, le service worker n'a rien appris de nouveau.
3. **Le bouton cœur** (EF-15) et le **compteur des preuves** (EF-14). ✅

   *Fait.* Le rond de 56 px à droite, le bouton principal en `flex: 1` — mesuré à 273 px de
   large sur un 15 Pro et 282 px sur un 16 Pro, gouttière de 12 px, exactement la maquette. Son
   libellé est passé en graisse 400 (EF-15.2). Le compteur des preuves est une ligne centrée à
   16 px sous la carte et 26 px au-dessus des boutons, dans le registre de la ligne `h · min · s`.

   *Deux décisions prises en chemin.* Le compteur **ne s'affiche pas à zéro** : « 0 je t'aime
   reçus » serait exactement la pression que le backlog redoutait. Et son libellé s'accorde en
   nombre — « 1 je t'aime reçu » — là où la spécification n'avait retenu que le pluriel.

   *Prouvé de bout en bout sur l'app réelle*, pas seulement en aperçu : un appui sur le bouton
   cœur d'un téléphone fait passer le compteur de l'autre de 1 à 2. `npm run test:api` passe 28
   vérifications, dont trois neuves sur le compteur — la question ne compte pas, une réponse
   compte pour un, un cœur compte pour un — relevées AVANT l'envoi, sinon elles ne prouveraient
   rien.

   **Une limite mesurée, et assumée.** À 629 px de haut, l'état qui cumule le bandeau
   d'activation et une réponse de trois lignes demande 54 px de défilement, les liens du bas
   passant sous le bord. C'était 18 px avant ce pas : le compteur des preuves coûte les 36 px
   de différence. 629 px, c'est l'onglet Safari sur appareil court ; les deux iPhones ont l'app
   installée et 852 ou 874 px, où le pire état garde 87 px de marge. Le mode compact a repris ce
   qu'il pouvait sur les deux écarts réglables (`--gap-home` et `--gap-proof`) ; aller plus loin
   voudrait dire rogner la carte compteur, ce que la refonte a précisément pour but d'éviter.

   **Un défaut visible dans ce même état** : le bouton « Activer » du bandeau et le bouton
   principal sont deux pilules bordeaux à huit pixels l'une de l'autre et se lisent comme une
   seule masse. C'est le double ancrage du bandeau qui se voit ; l'arbitrage est ouvert.
4. **Les deux messages** (EF-16) ✅ : `lastTwo` côté API, bulles orientées côté rendu.

   *Fait.* `lastTwo` renvoie les deux derniers gestes tous auteurs confondus, du plus ancien au
   plus récent, `ask` exclu. Côté rendu, une allure `oriented` de `Bubble` : texte à gauche, les
   deux points de retour et MIROITÉS selon l'auteur, rose plein à gauche pour un geste reçu,
   crème bordé à droite pour un geste envoyé, les points portant la bordure de leur bulle. Un
   seul horodatage sous la paire, aligné du côté du plus récent.

   *Les trois cas d'EF-16.2 sont vérifiés*, côtés mesurés dans les quatre tailles d'écran : deux
   gestes reçus donnent deux roses à gauche, deux envoyés deux crème à droite, un de chacun une
   de chaque dans l'ordre chronologique. Et sur l'app réelle : la réponse de Benito à droite, le
   cœur de Charleen à gauche, puis deux gestes de Charleen tous deux à gauche.

   `ReplyArea` est devenu `ExchangeStatus` et ne porte plus la réponse reçue : il ne lui reste
   que les trois états où il y a quelque chose à dire plutôt qu'à montrer. Quand une question
   est en l'air, c'est elle que l'écran dit ; la paire attend son tour.

   **Deux corrections que la mesure a imposées à la spécification**, écrites dans EF-16.6. Le
   plafond de trois lignes ne tenait pas à deux bulles — 25 px de trop sur un 15 Pro, 3 px sur
   un 16 Pro : il passe à deux lignes quand les gestes sont deux. Et le bouton « lire la suite »
   a disparu au profit d'une bulle tappable en entier : il portait les 44 px de la zone tactile
   iOS, soit 88 px à deux gestes, assez à lui seul pour faire déborder l'écran.

**Sortie : atteinte, avec une réserve nommée.** Tous les états de l'écran tiennent **sans
défilement à 874, 852 et 760 px** — les deux iPhones réels et le palier intermédiaire. Le pire
état, le bandeau d'activation cumulé à deux gestes longs, garde 23 px de marge sur un 16 Pro et
1 px sur un 15 Pro. L'espace messages ↔ boutons reste le plus grand de l'écran partout, et
l'écran se superpose à `design/refonte-v2/Main.dc.html`.

*La réserve* : à **629 px**, trois états demandent du défilement — deux gestes longs (8 px), le
bandeau avec deux gestes courts (36 px), le bandeau avec deux gestes longs (83 px). 629 px,
c'est l'onglet Safari sur appareil court, pas un iPhone avec l'app installée. Le défilement est
le dernier recours prévu par le projet ; le rognage, jamais.

Les deux composants qui n'existaient qu'en mots ont rejoint `docs/design-system.md` §4 : la
**pastille du cœur** (EF-15.5) et le **compteur des preuves** (EF-14.5), avec le **bouton
cœur**. Aucune planche ne les dessinait.

**Ce qui reste ouvert, et c'est une décision de DA, pas un bug** : le bandeau d'activation des
notifications a deux ancrages — en bas à l'état vide, au-dessus du bouton partout ailleurs — donc
il saute au premier appui, et dans cette seconde position son bouton « Activer » se lit comme
une seule masse bordeaux avec le bouton principal, cinq pixels plus bas. Décrit dans
`docs/design-system.md` §6. Un ancrage unique le réglerait, au prix d'un peu de hauteur à l'état
vide.

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
