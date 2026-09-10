# BCGlove — Backlog v2

**Statut** **V2-1, V2-2 et V2-3 sont arbitrées.** Elles ne sont plus des idées : leur mise en
page a été dessinée dans `design/refonte-v2/`, tranchée, et spécifiée dans
`docs/requirements.md §10` (décisions D14 à D19, exigences EF-13 à EF-17). Le lot 13 de
`docs/roadmap.md` porte leur développement.

**Ce que cette page reste.** L'énoncé des trois demandes et le raisonnement qui a mené aux
arbitrages : ce qui existait déjà, ce qui coinçait, les issues envisagées. À lire quand on veut
comprendre *pourquoi* la refonte a cette forme. Pour savoir *quoi* coder, c'est
`docs/requirements.md §10` qui fait foi — et lui seul, en cas de divergence.

Trois demandes formulées après la mise en service de la v1. Chacune est décrite avec ce qui
existait déjà et qui la servait, ce qui coinçait, et les décisions à prendre. Les encadrés
disent ce qui a été tranché ; le texte en dessous est conservé tel quel, y compris les issues
écartées — c'est lui qui explique pourquoi.

Les identifiants `V2-x` sont stables. Une idée abandonnée reste ici, marquée abandonnée ; une
idée arbitrée reste ici, avec le pointeur vers son exigence.

---

## V2-1 — Les deux derniers messages, en conversation

> **Arbitrée** → EF-16. Bulles orientées : reçu en rose plein à gauche, envoyé en crème bordé
> à droite, les deux points miroités. La hauteur est trouvée en resserrant l'en-tête sur une
> ligne (D15) et en supprimant la signature du bas (D19) — pas en réduisant la carte compteur.

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

> **Arbitrée** → EF-15. Un rond de 56 px à droite du bouton principal, qui se rétrécit en
> `flex: 1` — ni surimpression, ni deuxième ligne. Restent ouverts, et seulement eux : le débit
> du geste et son rendu dans l'historique (EF-15.5).

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

## V2-3 — Le compteur des preuves

> **Arbitrée** → EF-14. Un seul nombre, « 47 JE T'AIME REÇUS », en une ligne sous la carte
> compteur : l'emplacement médian des trois envisagés plus bas.

**L'idée.** **Un seul nombre**, qui additionne les deux mesures : les fois où l'autre a répondu
par un message à un « Est-ce que tu m'aimes ? », et les fois où il a appuyé sur le bouton cœur.

*Corrigé après une première rédaction qui en faisait deux compteurs séparés : c'est bien un
total unique.* Et c'est mieux ainsi — un seul nombre se lit d'un coup d'œil, là où deux
invitent à les comparer, ce qui n'a aucun sens ici.

**La bonne nouvelle.** Il n'y a rien à stocker. La table `messages` ne fait que croître et ne
supprime jamais rien : les deux nombres sont deux `COUNT`. Et le premier compteur est
**rétroactif** — il comptera juste, y compris les échanges d'avant la v2.

```sql
SELECT COUNT(*) FROM messages
 WHERE to_user = ? AND kind IN ('reply', 'love');
```

Une seule requête, un seul nombre. Et comme `kind` est indexé par `to_user`, elle reste
immédiate quel que soit le volume.

**La dépendance.** V2-2 doit exister pour que les cœurs entrent dans le total. Avant ça, le
compteur fonctionne déjà — il ne compte que les réponses.

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

## Ordre — tranché

Les trois partageaient le même goulot : **la hauteur de l'écran d'accueil**. Les faire une par
une en rognant à chaque fois aurait donné un écran tassé.

C'est donc l'inverse qui a été fait : la composition d'ensemble a été reprise d'abord, en
sachant ce qu'elle devrait porter au bout. Elle est arbitrée (EF-13). Le développement suit cet
ordre, en un seul lot (lot 13) :

1. la recomposition de l'écran (EF-13) — c'est elle qui libère la place ;
2. le type `love` et sa migration (EF-15.4), qui débloque tout le reste ;
3. le bouton cœur (EF-15) et le compteur (EF-14) ;
4. les deux messages (EF-16), qui n'attendent que la place.
