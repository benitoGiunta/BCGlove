# BCGlove — Backlog v2

**Statut** Idées retenues, non planifiées. Rien ici n'est engagé.

Trois demandes formulées après la mise en service de la v1. Chacune est décrite avec ce qui
existe déjà et qui la sert, ce qui coince, et les décisions qu'il faudra prendre — pour que le
jour où on s'y met, l'essentiel de la réflexion soit derrière nous.

Les identifiants `V2-x` sont stables. Une idée abandonnée reste ici, marquée abandonnée.

---

## V2-1 — Les deux derniers messages, en conversation

**L'idée.** L'écran d'accueil ne montre que le dernier message reçu, en bulle centrée. Montrer
les **deux derniers**, avec les bulles orientées selon leur auteur — celles de l'autre à gauche,
les miennes à droite — et des couleurs contrastées, comme dans une discussion.

**Ce qui existe déjà et qui sert.** Tout le travail visuel est fait : `Bubble` a une allure
`thread` (texte aligné à gauche, sans les deux points), et l'historique distingue déjà une
réponse d'un mot spontané par le remplissage — pleine contre bordée. `HistoryScreen` montre
exactement le rendu visé, en plus long.

**Ce qui coince, et c'est le vrai sujet : la hauteur.** L'écran compteur tient aujourd'hui de
874 px à 629 px, et il a fallu batailler pour ça — le bandeau des notifications a dû aller se
loger dans la place déjà réservée. Deux bulles au lieu d'une, c'est 70 à 140 px de plus dans un
budget qui n'en a plus. Trois issues, à trancher :

- réduire la carte compteur (les grands chiffres passeraient de 52 à 44 px) ;
- ne montrer la seconde bulle que si la place existe (`@media (min-height: …)`) — l'écran serait
  alors différent selon l'appareil, ce qui n'est pas grave mais doit être assumé ;
- plafonner les deux bulles à deux lignes chacune, et renvoyer la suite vers l'écran de lecture.

**La décision de DA.** La palette n'a qu'un rose. Il sert déjà à distinguer réponse et mot
spontané. Pour marquer en plus l'auteur, il faut soit s'appuyer sur la seule position — ce que
la maquette d'origine ne fait nulle part — soit introduire une seconde teinte de surface, donc
toucher à la palette. C'est un arbitrage à faire avant de coder, pas pendant.

**Côté serveur.** `/api/state` renvoie `lastReceived` ; il faudrait un `lastTwo`, tous auteurs
confondus. La requête est immédiate, la table contient déjà tout.

**Effort estimé.** Faible côté données, moyen côté mise en page. C'est la hauteur qui décidera.

---

## V2-2 — Le bouton cœur

**L'idée.** Un second bouton, rond et plus petit, à côté du bouton principal, avec un cœur.
Il ne pose pas de question : il dit. La notification doit être **nettement distincte** de celle
d'un message — « Benito te dit qu'il t'aime », en mode rappel.

**Ce que ça introduit.** Un quatrième type de message, à côté de `ask`, `reply` et `note`.
Appelons-le `love`. Il n'a pas de corps, comme `ask`.

**Le point technique à ne pas rater.** La colonne `kind` porte une contrainte
`CHECK (kind IN ('ask','reply','note'))`. Ajouter un type demande donc **une migration**, et
SQLite ne sait pas modifier une contrainte en place : il faut recréer la table et recopier les
lignes. C'est écrit une fois, proprement, dans `migrations/0002_…sql` — mais ce n'est pas un
`ALTER TABLE` d'une ligne, et c'est bien de le savoir avant de s'engager.

**Les décisions à prendre.**

- **Le débit.** Le plancher de 30 s entre deux envois a été pensé pour des messages. Un cœur
  est un geste, pas un message : faut-il le laisser passer plus souvent ? Et que se passe-t-il
  si on appuie dix fois — dix notifications, ou une seule qui se remplace ?
- **La place.** Le bouton principal fait toute la largeur. Un rond à côté veut dire réduire le
  premier, ou poser le rond en surimpression. Deux compositions très différentes.
- **L'affichage dans le fil.** Un `love` n'a pas de texte. Dans l'historique il tiendrait sur
  une ligne — « Benito a dit qu'il t'aime · hier soir » — sans bulle.
- **Sur l'écran d'accueil.** Est-ce qu'un cœur reçu occupe la zone de réponse comme un message,
  ou est-ce qu'il se contente d'exister dans l'historique et le compteur (V2-3) ?

**Effort estimé.** Moyen. La migration et la composition du bouton sont le gros du travail ;
l'envoi de la notification est déjà générique.

---

## V2-3 — Les deux compteurs

**L'idée.** Afficher combien de fois l'autre a **répondu par un message** à un « Est-ce que tu
m'aimes ? », et combien de fois il a **appuyé sur le bouton cœur**.

**La bonne nouvelle.** Il n'y a rien à stocker. La table `messages` ne fait que croître et ne
supprime jamais rien : les deux nombres sont deux `COUNT`. Et le premier compteur est
**rétroactif** — il comptera juste, y compris les échanges d'avant la v2.

```sql
-- réponses reçues
SELECT COUNT(*) FROM messages WHERE kind = 'reply' AND to_user = ?;
-- cœurs reçus
SELECT COUNT(*) FROM messages WHERE kind = 'love'  AND to_user = ?;
```

**La dépendance.** Le second compteur n'a de sens qu'avec V2-2. Le premier peut se faire seul.

**Là encore, la place.** L'écran est plein. Trois emplacements possibles, par ordre de coût :

- **dans les réglages** — gratuit en hauteur, mais on ne les regarde jamais ;
- **sous la carte compteur**, en une ligne discrète en Nunito capitales, comme les libellés
  d'unités — c'est l'emplacement le plus juste, et il coûte environ 30 px ;
- **dans la carte compteur elle-même**, en second registre sous l'horloge — le plus visible,
  mais ça charge l'objet le plus épuré de l'app.

**Une question de fond, avant la technique.** Compter les « je t'aime » peut se retourner :
un nombre qui stagne se remarque autant qu'un nombre qui monte. À décider en connaissance de
cause — c'est le genre de détail qui fait la différence entre une app qui réchauffe et une app
qui met la pression.

**Effort estimé.** Faible, une fois l'emplacement tranché.

---

## Ordre suggéré

**V2-1** est indépendante et se voit tout de suite. **V2-2** est la plus structurante — elle
touche au schéma. **V2-3** vient après V2-2, dont elle dépend à moitié.

Les trois partagent le même goulot : **la hauteur de l'écran d'accueil**. Les faire une par une
en rognant à chaque fois donnerait un écran tassé. Mieux vaut, avant de commencer, reprendre la
composition d'ensemble en sachant ce qu'elle devra porter au bout.
