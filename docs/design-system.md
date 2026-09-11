# BCGlove — Direction artistique

**Source de vérité** `design/source/pour-charleen.dc.html`. Ce document en extrait les valeurs
et fixe les règles. En cas de doute, c'est la maquette qui tranche.

---

## 1. Le parti pris

Un intérieur, pas une interface. Papier crème, encre prune, une lumière chaude qui bouge
lentement derrière le contenu. Rien ne clignote, rien n'alerte, rien ne réclame. Les seules
choses qui bougent d'elles-mêmes sont le temps qui passe et un cœur qui respire.

Trois règles qui découlent de ce parti pris :

- **Le vide est un matériau.** L'écran principal a un seul bouton. On n'en ajoute pas.
- **La typo porte l'émotion, la couleur porte la chaleur.** Aucun élément décoratif gratuit.
- **Le mouvement est une respiration, jamais un signal.** Rien ne clignote pour attirer l'œil.

## 2. Couleurs

```css
--ink:        #4A3439;  /* texte principal, les grands chiffres */
--ink-soft:   #6B4A50;  /* phrases en Cormorant, chiffres de l'horloge */
--label:      #74545A;  /* libellés en capitales, unités */
--faint:      #7A555C;  /* horodatages, liens du bas, texte en attente */
--muted:      #A8848A;  /* monogramme */
--cream:      #FAF3EF;  /* fond de l'écran */
--card:       #FDF8F5;  /* surface de la carte compteur */
--powder:     #F2D8D5;  /* bulle de message */
--accent:     #9C5560;  /* bouton, cœur, liens */
--accent-dark:#7E434D;  /* survol des liens */
--dot:        #D3AFB1;  /* séparateurs · */

/* voiles du fond, jamais utilisés en aplat */
--wash-1: #D9A7A6;  /* opacité .07 */
--wash-2: #9C5560;  /* opacité .055 */
--wash-3: #C98F86;  /* opacité .06 */

--hairline: rgba(156, 85, 96, .09);  /* bordure de carte */
--rule:     rgba(156, 85, 96, .10);  /* filet horizontal interne */
```

**Contrastes.** `--ink` sur `--card` donne 9,4:1 ; `--faint` sur `--cream` donne 5,1:1 ;
`--card` sur `--accent` (le bouton) donne 5,6:1. Tous au-dessus de AA. `--muted` sur `--cream`
descend à 3,2:1 : réservé au monogramme décoratif, jamais à une information.

**Pas de mode sombre.** Cette DA est une DA claire. Une version sombre en serait une autre.

## 3. Typographie

**Cormorant Garamond** — les phrases, l'émotion, toujours en italique quand c'est une voix.
**Nunito** — les chiffres, les libellés, les boutons. Ce qui doit être lu vite et sans ambiguïté.

| Rôle | Famille | Taille | Graisse | Interlettrage | Style |
|---|---|---|---|---|---|
| Titre « Pour Charleen » | Cormorant | 17 px | 400 | `.16em` | capitales |
| Monogramme `BCG ♡` | Cormorant | 14 px | 400 | `.34em` | — |
| « Je t'aime depuis » | Cormorant | 23 px | 400 | — | italique |
| Grands chiffres | Nunito | 52 px | 600 | `-.02em` | chiffres tabulaires |
| Libellés d'unité | Nunito | 10 px | 700 | `.17em` | capitales |
| Horloge h·min·s | Nunito | 21 px | 600 | `.01em` | chiffres tabulaires |
| Unités de l'horloge | Nunito | 11 px | 700 | `.12em` | — |
| Bouton | Nunito | 18 px | 600 | `.01em` | — |
| Bulle de message | Cormorant | 17–21 px | 400 | — | interligne 1.35 |
| Pastille du cœur | Cormorant | 19 px | 400 | — | italique |
| Bulle orientée (accueil) | Cormorant | 17–21 px | 400 | — | alignée à gauche, deux lignes à deux gestes |
| Horodatage | Nunito | 11.5 px | 600 | `.05em` | — |

**Chiffres tabulaires obligatoires** partout où un nombre change : `font-variant-numeric:
tabular-nums; font-feature-settings: 'tnum' 1`. Sans ça, l'horloge tressaute à chaque seconde.

**Chargement.** Les deux familles sont **auto-hébergées en woff2** (sous-ensemble latin), pas
appelées chez Google : le premier affichage doit tenir hors ligne, et il n'y a aucune raison de
prévenir un tiers qu'on ouvre l'app. `font-display: swap`, pile de repli `Georgia, serif` et
`system-ui, sans-serif`.

## 4. Formes et profondeur

```css
--r-card:   30px;   /* carte compteur */
--r-button: 28px;   /* bouton pilule, moitié de sa hauteur de 56px */
--r-bubble: 22px;   /* bulle de message */
--r-pill:  999px;   /* pastille du cœur : entièrement arrondie, quelle que soit sa hauteur */

--shadow-card:   0 26px 44px -22px rgba(74,52,57,.22), 0 3px 10px -6px rgba(74,52,57,.10);
--shadow-button: 0 14px 26px -14px rgba(156,85,96,.62);
--shadow-button-hover:  0 16px 30px -14px rgba(156,85,96,.70);
--shadow-button-active: 0 8px 16px -12px rgba(156,85,96,.60);
--shadow-heart:  0 10px 20px -12px rgba(74,52,57,.28);   /* bouton cœur */

--edge-button: rgba(156,85,96,.28);   /* bordure du bouton cœur */
--edge-bubble: rgba(156,85,96,.16);   /* bordure d'une bulle envoyée */
```

**Les deux crèmes bordés ne se confondent pas et ne se fusionnent pas.** `--hairline` (.09)
distingue un mot spontané d'une réponse *dans le fil*, où les bulles se touchent : il suffit
d'un soupçon. `--edge-bubble` (.16) détache une bulle envoyée *du fond de la page*, qui est de
la même famille de crème : sans elle, la bulle n'existe pas. Deux problèmes, deux valeurs.

**Les trois objets ajoutés par la refonte v2**, tous les trois arbitrés en
`docs/requirements.md` §10 :

| Objet | Forme | Pourquoi |
|---|---|---|
| **Bouton cœur** | Rond de 56 px, crème, bordé de `--edge-button`, cœur plein en `--accent` | Il n'est pas une pilule parce qu'il ne pose pas de question : il affirme. Crème bordé et non bordeaux plein, sinon il y aurait deux boutons de même poids et il n'y en a qu'un de principal |
| **Pastille du cœur** | Rectangle entièrement arrondi, crème, bordure 1 px `--accent` pleine, texte `--accent` en Cormorant italique suivi d'un `♡` | Elle n'a PAS les deux points de la bulle : une bulle porte une parole écrite, le cœur est un geste. C'est le bordeaux du bouton principal, sans son aplat |
| **Compteur des preuves** | Une ligne centrée : nombre en 21 px / 600 `--ink-soft`, libellé en 10 px / 700 capitales espacées `--ink-label` | C'est exactement le registre de la ligne `h · min · s` de la carte, et c'est délibéré : il doit se lire comme une mesure, jamais comme un score |

Les ombres sont **basses, larges et très diffuses**, avec un décalage vertical fort et un étalement
négatif. Elles suggèrent un objet posé sur du papier, pas une carte qui flotte. Ne jamais ajouter
d'ombre à un élément qui n'en a pas dans la maquette.

**Zone tactile.** Tout élément interactif fait au moins 44 × 44 px, la règle iOS. Le bouton
principal fait 56 px de haut.

## 5. Mouvement

```css
--ease:  cubic-bezier(.16, .84, .28, 1);   /* la seule courbe du projet */
--d-in:   620ms;  /* entrée du header */
--d-card: 720ms;  /* entrée de la carte, retard 90ms */
--d-bubble: 480ms;
--d-press:  220ms;
```

| Animation | Rôle | Durée |
|---|---|---|
| `riseIn` | tout ce qui apparaît : monte de 18 px en fondu | 380–720 ms |
| `chFade` | un chiffre qui change : fondu sur place, jamais de glissement | 250 ms |
| `breathe` | le cœur en attente : échelle 1 → 1.14, opacité .55 → .9, en boucle | 2600 ms |
| `breatheHard` | appui répété pendant l'attente : sursaut à 1.5 puis retour à la boucle | 620 ms |
| `drift` | les trois voiles du fond, déphasés | 19 / 24 / 27 s |

**Règle absolue.**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

Toute animation ajoutée doit survivre à cette règle : l'écran doit rester complet et lisible
sans une seule animation.

## 6. Mise en page

Un iPhone, une colonne. La composition de l'écran d'accueil est arbitrée en
`docs/requirements.md` §10 (EF-13) — l'ordre vertical n'est pas négociable :

```
padding: 22px 26px 46px   (plus env(safe-area-inset-*))

┌────────────────────────────┐
│  En-tête, UNE ligne        │  emblème + monogramme à gauche, dédicace à droite
│                            │  26 px
│  Carte compteur            │  la seule surface — plus centrée verticalement
│                            │  26 px
│  Bouton                    │
│                            │
│          le vide           │  tout le surplus de l'écran tombe ici
│                            │
│  Derniers gestes           │  collés en bas par margin-top: auto
│  Écrire un mot · Voir tout │
└────────────────────────────┘
```

**La hiérarchie des espaces n'est pas une liste de valeurs.** Le seul espace qui varie est
celui qui sépare les derniers gestes du bouton, et il varie parce qu'il absorbe le surplus :
il reste donc le plus grand de l'écran sur tous les appareils, du 16 Pro à 874 px jusqu'à
l'onglet Safari à 629 px, sans qu'aucun nombre ne l'ait décidé.

**Rien ne saute, à une exception près.** Le bouton est ancré en haut du bloc du bas, les liens
en bas : ni l'arrivée d'une réponse ni un message de trois lignes ne déplace quoi que ce soit.
La zone de réponse n'a donc plus de hauteur réservée — elle en a eu une pendant tout le
développement de la v1, d'abord 96 px puis 132, et c'est la recomposition qui l'a rendue
inutile.

L'exception, c'est le **bandeau d'activation des notifications**, qui n'a pas un ancrage mais
deux : à l'état vide il se rend en bas, à la place du texte d'attente ; dans tous les autres
états il se rend au-dessus du bouton. Au premier appui sur le bouton, il passe donc du bas vers
le haut et pousse le bouton d'environ 80 px. C'est le seul saut qui reste à l'écran, il ne
concerne que les quelques jours où les notifications ne sont pas encore accordées, et il n'est
pas tranché : soit on lui donne un seul ancrage, soit on l'assume.

Et dans cette seconde position, son bouton « Activer » est une pilule bordeaux posée à cinq
pixels du bouton principal, qui en est une autre : les deux se lisent comme une seule masse.
C'est le même arbitrage, vu de face. Il ne se règle pas en les écartant — la hauteur n'y est
pas — mais en donnant au bandeau un ancrage unique, ou une autre forme à son bouton.

Et il n'est plus gratuit en hauteur, contrairement à ce qui valait en v1 : il n'y a plus de
place réservée où se loger, donc il coûte ce qu'il mesure. L'état le plus haut de l'écran est
celui qui le cumule avec une réponse de trois lignes — c'est celui-là qu'on mesure avant de
toucher à quoi que ce soit.

**La signature a disparu du bas de l'écran** (décision D19). Elle portait le nom de l'autre en
Cormorant italique ; désormais un seul nom est écrit à l'écran, celui de qui regarde, dans la
dédicace de l'en-tête. La place qu'elle occupait fait partie de ce qui a payé la refonte.

*Note : la maquette applique un `translateY(-79px)` au bloc du bas, artefact de l'éditeur de
design. À l'implémentation, on l'obtient proprement par la mise en page — ne pas recopier ce
décalage.*

## 7. Écriture

Le ton est celui de quelqu'un qui parle bas.

- **Tutoiement**, toujours.
- **Pas d'exclamation.** Jamais.
- **Pas d'emoji** dans l'interface. Le `♡` typographique du monogramme et des titres de
  notification est la seule exception.
- **Phrases courtes**, sans jargon. Aucun mot technique visible : ni « synchronisation », ni
  « serveur », ni « notification push » — on dit « prévenir ».
- **Les erreurs s'excusent sans paniquer** : « Le message n'est pas parti. On réessaie ? »
- **Les états vides sont des invitations**, pas des constats : « Pose-moi la question… »
- **Apostrophe droite** (`'`), jamais courbe (`’`). « Je t'aime depuis » donne le ton dans la
  maquette, et deux formes d'apostrophe dans un même écran se remarquent.
- **Aucun accord en genre.** L'app est symétrique : le même écran est lu par les deux. Toute
  phrase qui s'adresse au lecteur se tourne sans accord — « Tu les reçois » plutôt que
  « Tu es prévenu(e) », qui est laid, ou « Tu es prévenue », qui est faux une fois sur deux.
- **Les phrases toutes faites tiennent sur une ligne.** Au-delà, le bouton passe à deux lignes
  et la liste ne tient plus au-dessus du clavier.

Toutes les chaînes vivent dans `src/lib/copy.ts`, groupées par écran. Aucun texte visible n'est
écrit en dur dans un composant : c'est ce qui permet de retoucher les mots sans toucher au code.

**Deux jeux de phrases toutes faites, pas un.** Répondre à une question et écrire sans qu'on
vous ait rien demandé ne s'écrivent pas pareil : « Oui » ne veut rien dire en réponse à rien.
`quickReplies` couvre cinq situations de réponse (la tendresse, la promesse, la réponse tardive,
l'indisponibilité, l'invitation) ; `quickNotes` en couvre cinq autres (la pensée qui passe, le
manque, le soir, le retour, le mot qui ne dit rien d'autre que « toi »).

## 8. Ce que la maquette ne montre pas encore

Ces écrans n'existent pas dans le fichier source et doivent être dessinés dans le même langage :

- **le composeur de réponse** — champ de texte, compteur discret, réponses rapides ;
- **l'historique** — liste inversée groupée par jour ;
- **l'écran d'installation** — instructions « Partager → Sur l'écran d'accueil » illustrées ;
- **l'écran de réglages** — qui je suis, notifications, mon lien ;
- **l'écran de lien invalide** — neutre, une phrase, aucune information ;
- **les états d'erreur réseau** — un bandeau discret, jamais une modale.

Et trois objets qui n'étaient dans aucune maquette au départ, désormais dessinés et codés :
le bouton cœur, la pastille du cœur et le compteur des preuves — voir §4.

Principe directeur pour tous : **ils empruntent à la carte compteur** (même surface, même
rayon, même ombre) et n'introduisent aucune forme, couleur ni typo nouvelle.
