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
