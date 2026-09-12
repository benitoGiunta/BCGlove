# CLAUDE.md — BCGlove

Guide de travail pour toute session Claude Code (ou tout autre agent) sur ce dépôt.
À lire **en entier** avant la première modification.

---

## 1. Ce qu'est le projet

**BCGlove** est une web-app privée destinée à **exactement deux personnes** : Charleen et Benito.
Elle s'installe sur iPhone via « Ajouter à l'écran d'accueil » (PWA) et remplit trois fonctions :

1. afficher **le temps écoulé depuis une date d'origine** (« Je t'aime depuis… »), au dixième de seconde près côté horloge ;
2. permettre à l'un d'**envoyer la question « Est-ce que tu m'aimes ? »** à l'autre, qui reçoit une **notification push** sur son iPhone ;
3. permettre à celui qui reçoit d'**écrire une réponse libre**, qui déclenche à son tour une notification chez l'autre et s'affiche dans l'app.

Ce n'est pas un produit commercial. Les critères de qualité sont, dans l'ordre :
**justesse émotionnelle du rendu > fiabilité de la notification > simplicité de maintenance > performance.**

Documents de référence, à consulter avant toute décision :

| Document | Contenu |
|---|---|
| `docs/requirements.md` | Le quoi : exigences fonctionnelles et non-fonctionnelles, décisions arbitrées |
| `docs/roadmap.md` | Le quand : lots de développement, ordre, critères de sortie |
| `docs/architecture.md` | Le comment : stack, modèle de données, API, flux de notification |
| `docs/design-system.md` | La DA : tokens, typo, composants, animations |
| `docs/deploiement.md` | Mise en production Cloudflare, pas à pas |
| `docs/installation-iphone.md` | Installation et recette sur les deux iPhones |
| `docs/backlog.md` | Les idées pour une v2 — rien d'engagé |

---

## 2. Les deux artefacts de navigation : `ARBORESCENCE.md` et `llm.txt`

Ce dépôt maintient deux artefacts documentaires dont la mise à jour est **obligatoire**.
Ils existent pour qu'un agent (ou un humain) puisse comprendre où poser son code **sans lire
tout le dépôt**. Les traiter comme du code, pas comme de la documentation décorative.

### 2.1 `ARBORESCENCE.md` (un seul, à la racine)

**Rôle.** La carte globale du dépôt : l'arbre complet des dossiers et des fichiers qui comptent,
chacun suivi d'une ligne expliquant sa raison d'être. C'est le point d'entrée quand on ne sait
pas encore où aller.

**Ce qu'il contient.**
- l'arbre, en bloc de code, dossiers et fichiers signifiants uniquement ;
- une glose d'une ligne par entrée (à quoi ça sert, pas ce que ça contient) ;
- une section « Où poser quoi » : tableau `type de changement → dossier cible` ;
- une section « Volontairement absent » : ce qu'on a décidé de ne PAS avoir, et pourquoi
  (évite qu'un agent réintroduise une dépendance ou un dossier écarté).

**Ce qu'il ne contient pas.** Les fichiers générés (`node_modules/`, `dist/`, `.wrangler/`),
les fichiers de lock, les assets individuels d'un dossier d'assets (on décrit le dossier).

**Quand le mettre à jour.** *Dans le même commit* que le changement, dès qu'on :
- crée ou supprime un dossier ;
- crée, supprime ou renomme un fichier listé dans l'arbre ;
- change la responsabilité d'un fichier déjà listé (sa glose devient fausse).

Renommer un fichier sans toucher `ARBORESCENCE.md` est un bug, au même titre qu'un import cassé.

### 2.2 `llm.txt` (un par dossier, sans exception)

**Rôle.** La fiche locale du dossier où l'on se trouve. `ARBORESCENCE.md` dit *où aller* ;
`llm.txt` dit *comment travailler une fois arrivé*. Un agent qui ouvre un fichier de `src/lib/`
doit pouvoir lire `src/lib/llm.txt` et connaître les conventions du dossier sans remonter.

**Format.** Texte brut, ~10 à 40 lignes, toujours ces cinq rubriques dans cet ordre :

```
# <chemin/du/dossier>

## Rôle
Une à trois phrases. La responsabilité du dossier, et sa frontière :
ce qui a le droit d'y vivre, ce qui n'y a pas sa place.

## Contenu
Une ligne par fichier ou sous-dossier direct : `nom` — ce que c'est.
Les sous-dossiers sont listés mais pas dépliés (ils ont leur propre llm.txt).

## Conventions
Les règles locales : nommage, style d'export, ordre des imports, unités,
patterns imposés, patterns interdits. Ce qu'on ne devinerait pas en lisant le code.

## Dépendances
Ce que ce dossier a le droit d'importer, et ce qui a le droit de l'importer.
C'est ici qu'on documente le sens des flèches, pour empêcher les cycles.

## Pièges
Les erreurs déjà commises, les contraintes non évidentes (Safari iOS, D1, service worker…).
Rubrique la plus précieuse : on y écrit ce qu'on aurait aimé savoir avant.
```

**Quand le mettre à jour.** *Dans le même commit* que le changement, dès qu'on :
- ajoute ou supprime un fichier direct du dossier → rubrique **Contenu** ;
- introduit une convention ou en change une → rubrique **Conventions** ;
- ajoute un import vers un nouveau dossier → rubrique **Dépendances** ;
- perd du temps sur un piège → rubrique **Pièges** (l'écrire immédiatement, c'est la valeur du fichier).

**Quand en créer un.** À la seconde même où l'on crée un dossier. Un dossier sans `llm.txt`
est un dossier incomplet ; le commit qui le crée est incomplet.

**Vérification.** `npm run docs:check` échoue si un dossier versionné n'a pas de `llm.txt`,
ou si `ARBORESCENCE.md` ne mentionne pas un dossier existant. À lancer avant chaque commit.

### 2.3 Comment les utiliser en début de session

1. lire `CLAUDE.md` (ce fichier) ;
2. lire `ARBORESCENCE.md` pour localiser la zone de travail ;
3. lire le `llm.txt` du dossier visé **et** ceux des dossiers dont il dépend ;
4. seulement ensuite, ouvrir le code.

Cette séquence remplace un `grep` à l'aveugle sur le dépôt.

### 2.4 Comment les tenir à jour, en pratique

La mise à jour n'est pas une passe de fin de chantier : c'est le **même commit** que le code.
Le tableau ci-dessous est la table de correspondance à appliquer sans réfléchir.

| Ce que je viens de faire | Ce que je mets à jour, dans le même commit |
|---|---|
| Créer un dossier | Son `llm.txt` (les cinq rubriques, même courtes) **et** l'arbre de `ARBORESCENCE.md` |
| Supprimer un dossier | Le retirer de `ARBORESCENCE.md` (et de la ligne « Où poser quoi » s'il y figurait) |
| Créer un fichier | La rubrique **Contenu** du `llm.txt` du dossier, et l'arbre s'il est signifiant |
| Renommer un fichier | Les deux : l'arbre **et** la rubrique Contenu. Un renommage sans ça est un bug, au même titre qu'un import cassé |
| Supprimer un fichier | Les deux, même quand c'est une variante écartée — un `llm.txt` qui liste un fichier absent ment |
| Changer ce que fait un fichier | Sa glose dans l'arbre, si elle est devenue fausse |
| Poser un premier import vers un autre dossier | La rubrique **Dépendances** des deux côtés : ce que j'importe, ce qui m'importe |
| Adopter ou changer une convention locale | La rubrique **Conventions** |
| Perdre du temps sur un piège | La rubrique **Pièges**, immédiatement, avant d'oublier pourquoi |
| Écarter une dépendance ou un dossier | La section « Volontairement absent » de `ARBORESCENCE.md`, avec la raison |
| Créer un document dans `docs/` | Le tableau des documents de référence du §1 de ce fichier |

**Trois principes derrière le tableau.**

- **L'arbre dit *où aller*, le `llm.txt` dit *comment travailler une fois arrivé*.** Une
  information qui répond à « où ? » va dans l'arbre ; une qui répond à « comment ? » va dans le
  `llm.txt`. On ne duplique pas.
- **La glose décrit une raison d'être, pas un contenu.** « Le tuyau de la notification », pas
  « contient trois fonctions ». Une glose qui liste survit mal ; une glose qui explique survit.
- **Un dossier sans `llm.txt` est un dossier incomplet.** `npm run docs:check` le dit, mais il
  passe après : le réflexe vient avant l'outil.

**Le mot de la fin, avant de committer.** `npm run docs:check`. Il échoue si un dossier versionné
n'a pas de `llm.txt`, ou si `ARBORESCENCE.md` ignore un dossier existant. Il ne sait pas dire si
une glose est devenue fausse — ça, c'est à la relecture.

---

## 3. Commandes

```bash
npm install            # dépendances
npm run dev            # front Vite seul, port 5173 (pas d'API)
npm run dev:full       # front + Pages Functions + D1 locale (wrangler) — le vrai mode de dev
npm run build          # build de production dans dist/
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run docs:check     # vérifie ARBORESCENCE.md et les llm.txt
npm run db:migrate     # applique migrations/ sur la D1 locale
npm run db:migrate:prod# applique migrations/ sur la D1 de production
npm run keys:vapid     # génère une paire de clés VAPID (à faire une seule fois)
```

## 4. Règles de code

- **TypeScript strict.** Pas de `any` implicite, pas de `@ts-ignore` sans commentaire justifiant.
- **Français dans l'UI, anglais dans le code.** Toutes les chaînes visibles vivent dans
  `src/lib/copy.ts` — jamais en dur dans un composant. Les identifiants, commentaires
  techniques et noms de fichiers sont en anglais.
- **Les tokens de design ne se dupliquent pas.** Toute couleur, rayon, durée ou typo vient de
  `src/styles/tokens.css`. Une valeur hexadécimale écrite en dur dans un composant est un bug.
- **Pas de dépendance sans raison écrite.** Chaque ajout à `package.json` se justifie dans le
  message de commit. On préfère 60 lignes maison à une dépendance de 400 ko.
- **Le temps est toujours en millisecondes epoch UTC** côté données. La conversion en heure
  locale se fait uniquement à l'affichage.
- **Aucun secret dans le dépôt.** Clés VAPID et clés personnelles vivent dans les secrets
  Cloudflare et dans `.dev.vars` (git-ignoré). `.env.example` documente les noms attendus.
- **`prefers-reduced-motion` est respecté partout.** Toute animation ajoutée doit avoir sa
  neutralisation.

## 5. Contraintes à ne jamais perdre de vue

- **iOS 16.4 minimum**, et le push web **ne fonctionne que si l'app est ajoutée à l'écran
  d'accueil**. En onglet Safari classique, `Notification.requestPermission()` échoue. Tout
  parcours d'onboarding doit tenir compte de cet état.
- **La permission de notification doit être demandée depuis un geste utilisateur direct**
  (un `click`), jamais au chargement.
- **Cloudflare D1 n'est pas Postgres** : SQLite, pas de type booléen (0/1), pas de `RETURNING`
  sur toutes les versions, dates stockées en entier.
- **Le service worker est un fichier à part** (`public/sw.js`), non bundlé par Vite, et doit
  être servi depuis la racine du domaine pour avoir la portée complète.

## 6. Git

- Branche de travail : `claude/love-counter-app-5cclx6`.
- Un commit = un lot cohérent, avec `ARBORESCENCE.md` et les `llm.txt` à jour dedans.
- Messages de commit en français, à l'impératif : « Ajoute le compteur temps réel ».

---

## 7. Le cycle d'une idée, de l'envie au code

Aucune idée ne va directement dans le code. Elle traverse quatre documents, chacun avec un rôle
distinct, et **chaque étape laisse un pointeur vers la suivante**. C'est ce qui permet de
reprendre le fil après un contexte perdu.

```
envie exprimée → docs/backlog.md      « l'idée, et ce qui coince »
                       ↓
              design/<chantier>/       maquettes .dc.html, pour DÉCIDER
                       ↓
              docs/requirements.md     la spécification — fait foi
                       ↓
              docs/roadmap.md          un lot, avec un critère de sortie
                       ↓
                     le code
```

**Ce que chaque document a le droit de dire.**

- `docs/backlog.md` — l'énoncé d'une demande et le raisonnement autour : ce qui existe déjà, ce
  qui coince, les issues envisagées. Identifiants `V2-x`, stables. **Rien n'y est engagé.** Une
  entrée arbitrée y **reste**, avec un encadré qui pointe vers son exigence : le raisonnement
  garde sa valeur même quand la décision est prise.
- `design/<chantier>/` — les maquettes qui servent à **décider**, jamais à déployer. Un dossier
  par chantier (`design/refonte-v2/`), un script qui les génère depuis les tokens réels du
  projet, jamais de valeur inventée. Une variante écartée se **supprime** (et son `llm.txt` avec).
  La page de canevas est un artefact de sortie, git-ignoré.
- `docs/requirements.md` — la spécification, et **la seule source qui fait foi**. Une décision
  arbitrée y devient une ligne `Dx` ; un comportement attendu, une exigence `EF-x`. En cas de
  divergence avec le backlog ou une maquette, c'est ce document qui gagne. Il doit suffire à
  coder **sans rouvrir les maquettes**.
- `docs/roadmap.md` — le lot, son ordre interne, son critère de sortie. Il ne redit pas la
  spécification, il pointe vers elle.

**La règle qui fait tenir l'ensemble.** Une exigence est écrite quand elle est **tranchée**, pas
quand elle est envisagée. Ce qui reste ouvert est nommé comme tel, à l'endroit où ça se
tranchera. Un « à voir » sans point de chute est une dette.

---

## 8. Comment mener un chantier

Le §7 dit *par où passe* une idée. Celui-ci dit *comment on exécute* une fois qu'elle est
tranchée. Ces règles-là ne sont pas propres au projet — elles sont propres à la façon de
travailler qu'on attend ici, et il ne faut pas les redemander à chaque session.

### 8.1 S'orchestrer, plutôt que tout faire soi-même

Un chantier se découpe en **tâches et sous-tâches nommées**, et se délègue à des **agents et
sous-agents** quand la nature du travail s'y prête. Trois cas où déléguer paie toujours :

- **l'inventaire d'impact** — « où le champ `kind` est-il lu, écrit, validé, typé ? » : c'est
  un balayage large dont on ne veut que la conclusion, pas les fichiers ;
- **la relecture adverse** d'un diff avant de committer — un second regard qui n'a pas écrit
  le code trouve ce que celui qui l'a écrit ne voit plus ;
- **la vérification** qui tourne longtemps et dont on n'attend qu'un verdict.

Ce qui ne se délègue pas : écrire la documentation du projet. Sa voix est trop particulière, et
un sous-agent la rend plate.

### 8.2 Choisir le modèle et l'effort selon la tâche

Pour chaque agent, chaque tâche, chaque sous-tâche, on choisit **le modèle et le niveau
d'effort les plus adéquats à la nature du travail** — pas le plus puissant par réflexe. Un
balayage de fichiers ne demande pas le même modèle qu'un arbitrage de mise en page ou qu'une
relecture de migration destructive. Sur-dimensionner coûte ; sous-dimensionner fait rater.

### 8.3 Paralléliser ce qui est indépendant, séquencer ce qui a un rapport de précédence

C'est la règle qui décide de la forme du chantier, et elle se pose avant de commencer :

- **En parallèle** tout ce qui ne dépend de rien d'autre : lire le code pendant qu'un
  inventaire tourne, mesurer deux tailles d'écran, lancer types et lint ensemble, relire un
  diff pendant qu'on écrit le message de commit.
- **En séquence** tout ce qui a un **rapport de précédence** réel, et il faut le nommer. Par
  exemple, sur le lot 13 : la migration devait précéder la route, qui devait précéder le
  bouton, qui devait précéder la mesure de tenue. Paralléliser là aurait donné du travail à
  refaire.

Le test est simple : si B a besoin d'un résultat de A, c'est séquentiel. Sinon c'est parallèle,
et les lancer l'un après l'autre est du temps perdu.

**Un corollaire qui a déjà coûté.** Une attente en arrière-plan doit avoir une condition qui
peut devenir vraie, et une fin. Une boucle qui guette un marqueur dans un fichier qui a changé
de forme tourne indéfiniment sans que personne le voie.
