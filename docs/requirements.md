# BCGlove — Requirements

**Version** 0.2 (après second tour de questions)
**Date** 2026-09-07
**Statut** Arbitré, sauf six points en attente — voir §9

---

## 1. Intention

Une web-app privée pour deux personnes, Charleen et Benito. Elle tient dans un seul écran et
répond à une seule question posée de deux manières : *depuis combien de temps ?* et *est-ce que
c'est toujours vrai ?*

Trois gestes, pas un de plus :

1. **Regarder** le temps écoulé depuis la date d'origine, qui avance sous les yeux ;
2. **Demander** — un bouton envoie « Est-ce que tu m'aimes ? » à l'autre, qui reçoit une notification sur son iPhone ;
3. **Répondre** — l'autre ouvre la notification, écrit un mot, qui déclenche une notification en retour et s'affiche dans l'app du premier.

Le succès ne se mesure pas en métriques. Il se mesure au fait que l'app soit ouverte sans
raison, et que la notification arrive **à coup sûr**, dans la seconde, sans que personne n'ait
à comprendre pourquoi elle n'est pas arrivée.

## 2. Personas et appareils

| | Charleen | Benito |
|---|---|---|
| Rôle | destinataire principal de l'attention | auteur du projet |
| Appareil | iPhone, iOS ≥ 16.4 *(modèle à confirmer)* | iPhone, iOS ≥ 16.4 *(modèle à confirmer)* |
| Installation | PWA sur l'écran d'accueil | PWA sur l'écran d'accueil |
| Compétence technique attendue | aucune | complète |

Aucun autre utilisateur. Pas d'inscription, pas de compte, pas de mot de passe.

## 3. Décisions arbitrées

| # | Sujet | Décision | Conséquence |
|---|---|---|---|
| D1 | Hébergement | **Cloudflare** (Pages + Pages Functions + D1) | Un seul compte, un seul déploiement, gratuit sans expiration, pas de mise en veille de la base |
| D2 | Sens des échanges | **Symétrique + message spontané** | Les deux ont exactement la même app ; chacun peut demander, répondre, ou envoyer un mot sans sollicitation |
| D3 | Historique | **Dernière réponse visible + historique replié** | L'écran principal reste celui de la maquette ; l'historique est un second plan accessible d'un geste |
| D4 | Identité | **Lien secret personnel** | Chacun ouvre une fois une URL `https://…/?k=<clé>` ; l'app mémorise l'identité. Aucun écran de connexion |
| D5 | Plateforme | **PWA + Web Push (VAPID)** | Contrainte technique, pas un choix : c'est la seule voie vers une notification iPhone sans compte développeur Apple à 99 €/an |
| D6 | Compte Cloudflare | **Créé au lot 6** | Les lots 1 à 5 se développent en local. L'infra n'est montée qu'au moment où le push l'exige |
| D7 | Effet de surprise | **Charleen ne sait pas** | Première ouverture mise en scène (EF-10). Benito installe l'app lui-même sur l'iPhone de Charleen : elle ne doit avoir aucune étape technique à franchir |
| D8 | Nom et icône | **« BCGlove »**, monogramme `BCG` bordeaux sur fond crème | Nom du manifeste, nom sous l'icône, préfixe des titres de notification |
| D9 | Longueur des messages | **280 caractères** | Assez pour une phrase vraie, assez court pour que la bulle reste belle et la notification lisible |

## 4. Exigences fonctionnelles

### EF-1 — Compteur « Je t'aime depuis »

- **EF-1.1** L'écran affiche le temps écoulé depuis une **date d'origine configurée**, décomposé en `années · mois · jours` en grands chiffres, puis `heures · minutes · secondes` sur une ligne secondaire.
- **EF-1.2** Le calcul est **calendaire**, pas arithmétique : « 1 mois » signifie le même quantième du mois suivant, pas 30 jours. L'algorithme du fichier source (`elapsed()`) est conservé, avec report des retenues.
- **EF-1.3** Le compteur se rafraîchit **chaque seconde** tant que l'écran est visible. Il se met en pause quand l'onglet passe en arrière-plan et se resynchronise à la reprise (pas de dérive).
- **EF-1.4** Les libellés s'accordent en nombre (« 1 an » / « 4 ans », « 1 jour » / « 12 jours »).
- **EF-1.5** Le compteur est **lisible par un lecteur d'écran** via une phrase unique (`aria-label`), pas chiffre par chiffre.
- **EF-1.6** Si la date d'origine est dans le futur, l'app affiche le message d'attente prévu par la maquette au lieu du compteur.

### EF-2 — Demander (« Est-ce que tu m'aimes ? »)

- **EF-2.1** Un bouton unique, pleine largeur, envoie la question à l'autre personne.
- **EF-2.2** L'envoi déclenche une **notification push** sur l'iPhone de l'autre, même app fermée.
- **EF-2.3** Tant que la question est sans réponse, l'app affiche l'état d'attente (« Benito n'a pas encore répondu… » avec le cœur qui bat).
- **EF-2.4** Appuyer à nouveau pendant l'attente ne crée **pas** une seconde question : ça relance l'animation du cœur (le « jolt » de la maquette). Une **relance réelle** (nouveau push) n'est possible qu'après un délai à définir (voir Q-6).
- **EF-2.5** Un retour haptique (`navigator.vibrate`) accompagne l'appui quand le navigateur le supporte. *Note : Safari iOS ne supporte pas l'API Vibration — le code doit dégrader silencieusement.*
- **EF-2.6** L'app est utilisable sans notification autorisée : la question part quand même, l'autre la verra à sa prochaine ouverture, et l'app le dit clairement.

### EF-3 — Répondre

- **EF-3.1** Ouvrir la notification ouvre l'app **directement sur le composeur de réponse**, pas sur l'écran d'accueil.
- **EF-3.2** Le composeur est un champ de texte libre, avec compteur de caractères et bouton d'envoi.
- **EF-3.3** L'envoi crée la réponse, déclenche la notification chez le demandeur, et l'affiche dans son app.
- **EF-3.4** Des **réponses rapides** pré-écrites sont proposées sous le champ (les trois phrases du fichier source servent de point de départ) — un appui les insère dans le champ, où elles restent modifiables.
- **EF-3.5** Une question déjà répondue ne peut pas l'être deux fois ; le composeur bascule alors en « message spontané » (EF-4).

### EF-4 — Message spontané

- **EF-4.1** À tout moment, sans question préalable, on peut envoyer un mot à l'autre.
- **EF-4.2** Même traitement que la réponse : notification + affichage in-app.
- **EF-4.3** Visuellement distingué d'une réponse dans l'historique (une réponse répond à quelque chose, un mot spontané non).

### EF-5 — Longueur des messages

- **EF-5.1** **Saisie** : limite dure à **280 caractères**. Le compteur n'apparaît qu'au-delà de 200, en discret, et passe à la couleur d'accent au-delà de 260. Au-delà de la limite, la frappe est bloquée (pas de troncature silencieuse).
- **EF-5.2** **Notification** : le corps est tronqué à **110 caractères**, sur une frontière de mot, suivi de « … ». Le titre reste court et fixe (« Charleen a répondu ♡ »). Rationnel : iOS affiche ~2 lignes en bannière repliée, ~4 déplié.
- **EF-5.3** **Bulle in-app** : le texte s'affiche en entier. Au-delà de **4 lignes**, il est plafonné avec un dégradé et un lien « lire la suite » qui déplie sur place.
- **EF-5.4** La taille de police de la bulle **s'adapte à la longueur** : 21 px jusqu'à 60 caractères, 19 px jusqu'à 140, 17 px au-delà. Un message court doit occuper l'écran, un message long doit rester lisible.
- **EF-5.5** Les retours à la ligne saisis sont préservés à l'affichage ; les lignes vides multiples sont réduites à une.

### EF-6 — Historique

- **EF-6.1** L'écran principal n'affiche que **le dernier échange**, conformément à la maquette.
- **EF-6.2** Un geste (glissement vers le haut depuis le bas de l'écran, doublé d'un lien discret pour l'accessibilité) ouvre l'historique complet.
- **EF-6.3** L'historique est une liste inversée (le plus récent en haut), groupée par jour, avec dates en toutes lettres.
- **EF-6.4** Chaque entrée indique qui, quoi, quand. Les horodatages sont **relatifs et humains** (« à l'instant », « il y a 12 min », « hier soir », « il y a 3 jours »), avec la date exacte au toucher.
- **EF-6.5** Aucune suppression, aucune édition. Ce qui est envoyé est envoyé.

### EF-7 — Identité et première ouverture

- **EF-7.1** À la première ouverture avec `?k=<clé>`, l'app résout l'identité, la stocke localement, et **nettoie l'URL** (`history.replaceState`) pour que la clé ne reste pas visible.
- **EF-7.2** Sans clé valide et sans identité stockée, l'app affiche un écran neutre (« Ce lien ne mène nulle part ») — aucune fuite d'information.
- **EF-7.3** L'identité stockée survit à la fermeture de l'app, aux redémarrages de l'iPhone, et aux mises à jour de l'app.
- **EF-7.4** Un écran de réglages minimal, accessible discrètement, permet de : voir qui on est, réactiver les notifications, et retrouver son lien.

### EF-8 — Onboarding notifications

- **EF-8.1** Au premier lancement **depuis l'écran d'accueil**, l'app propose d'activer les notifications, en une phrase, avec un bouton. La demande de permission part de cet appui.
- **EF-8.1b** Compte tenu de D7, ce parcours est conçu pour être **franchi par Benito sur l'iPhone de Charleen**, avant qu'elle ne découvre l'app. Il doit donc être court et sans état intermédiaire à mémoriser.
- **EF-8.2** Si l'app est ouverte **dans Safari et non installée**, l'app affiche des instructions d'installation illustrées (Partager → Sur l'écran d'accueil) au lieu du bouton, car la permission échouerait.
- **EF-8.3** Si la permission a été refusée, l'app l'indique dans les réglages avec le chemin exact pour la rétablir (Réglages iOS → Notifications → BCGlove).
- **EF-8.4** L'abonnement push est **revalidé à chaque lancement** ; s'il a expiré, il est renouvelé silencieusement.

### EF-9 — Notifications, comportement

- **EF-9.1** Toucher une notification ouvre l'app sur le bon écran (EF-3.1). Si l'app est déjà ouverte, elle y navigue sans recharger.
- **EF-9.2** Si l'app est **au premier plan** au moment de la réception, pas de bannière système : la mise à jour se fait directement dans l'interface.
- **EF-9.3** Les notifications d'un même échange se **remplacent** (même `tag`) plutôt que de s'empiler.
- **EF-9.4** Le badge de l'icône reflète le nombre d'éléments non vus, et se remet à zéro à la lecture.

### EF-10 — Première ouverture (mise en scène)

Découle de D7 : Charleen découvre l'app sans savoir qu'elle existe. Le premier lancement n'est
pas un écran d'accueil, c'est un moment.

- **EF-10.1** À la toute première ouverture par Charleen — et à celle-là seulement — l'app ne
  montre pas immédiatement le compteur. Elle affiche une courte séquence : le fond seul, puis
  une phrase, puis le compteur qui se met en route et rattrape le temps réel.
- **EF-10.2** Le rattrapage est **animé** : les chiffres montent depuis zéro jusqu'à la valeur
  réelle en environ deux secondes, puis l'horloge prend le relais à la seconde.
- **EF-10.3** La séquence n'est jouable **qu'une fois**, et ne se rejoue jamais — pas même après
  une réinstallation. L'indicateur est stocké côté serveur, pas seulement en local.
- **EF-10.4** Elle est passable d'un appui : personne ne doit être bloqué devant une animation.
- **EF-10.5** Sous `prefers-reduced-motion`, la séquence est remplacée par un simple fondu sur
  la phrase, puis le compteur.
- **EF-10.6** L'ouverture de la séquence par Charleen **prévient Benito** par une notification.
  C'est le seul moment où l'app envoie un push que personne n'a déclenché volontairement.

## 5. Exigences non fonctionnelles

| # | Exigence | Cible |
|---|---|---|
| ENF-1 | Coût d'exploitation | **0 €/mois**, sans limite de durée, sans carte bancaire requise |
| ENF-2 | Délai bout en bout d'une notification | < 3 s en conditions normales |
| ENF-3 | Premier affichage du compteur | < 1 s depuis l'icône, y compris hors ligne (coquille en cache) |
| ENF-4 | Disponibilité hors ligne | Le compteur fonctionne sans réseau ; l'envoi est mis en file et part au retour du réseau |
| ENF-5 | Confidentialité | Contenu accessible uniquement via les deux clés ; pas d'indexation ; pas d'analytics ; pas de tiers |
| ENF-6 | Longévité | Doit tourner sans intervention pendant des années. Aucune dépendance à un service qui expire ou se met en veille |
| ENF-7 | Accessibilité | Contrastes AA sur les textes, `prefers-reduced-motion` respecté, navigation lecteur d'écran cohérente |
| ENF-8 | Empreinte | Bundle JS < 120 ko gzip |
| ENF-9 | Rendu | Aucun débordement horizontal, encoche et barre d'accueil respectées (`env(safe-area-inset-*)`) |

## 6. Direction artistique

Reprise intégrale de la maquette, formalisée dans `docs/design-system.md`. En résumé :

- **Palette** crème et rose poudré : fond `#FAF3EF`, carte `#FDF8F5`, accent `#9C5560`, bulle `#F2D8D5`, encre `#4A3439`
- **Typographies** Cormorant Garamond (les phrases, en italique) et Nunito (les chiffres, les boutons)
- **Formes** rayons généreux (30 px les cartes, 28 px le bouton, 22 px les bulles), ombres basses et diffuses
- **Mouvement** apparitions montantes, cœur qui respire, formes floues qui dérivent en fond — tout neutralisé sous `prefers-reduced-motion`
- **Ton** tutoiement, phrases courtes, jamais d'exclamation, jamais d'emoji dans l'interface (le `♡` typographique excepté)

Ce qui change par rapport au fichier source :
- la date, les réponses et le délai de 9 s étaient **fictifs** — ils deviennent réels ;
- le `localStorage` de démonstration devient une vraie base partagée ;
- l'écran unique devient trois écrans (compteur, composeur, historique) plus deux états (installation, réglages) ;
- l'app devient symétrique : le header, la signature et les textes se retournent selon qui regarde.

## 7. Hors périmètre

Explicitement écarté, pour rester tenable :

- application native iOS / App Store ;
- photos, audio, vidéo dans les messages ;
- plus de deux utilisateurs ;
- accusés de lecture temps réel façon messagerie ;
- widget iOS écran d'accueil (impossible depuis une PWA) ;
- mode sombre — la DA est une DA claire, assumée ;
- traduction : français uniquement.

## 8. Risques

| Risque | Impact | Parade |
|---|---|---|
| L'app n'est pas installée sur l'écran d'accueil → aucune notification | Bloquant | Écran d'installation dédié (EF-8.2), et vérification à chaque lancement |
| iOS purge le service worker après plusieurs semaines sans ouverture | Notification perdue | Revalidation de l'abonnement à chaque lancement (EF-8.4), et détection des endpoints morts côté serveur |
| Perte de la clé personnelle (téléphone changé, cache vidé) | Perte d'accès | Le lien est conservé hors de l'app (note, favori) ; procédure de régénération documentée |
| Cloudflare change ses conditions gratuites | Migration | Aucun service propriétaire : SQLite + Web Push standard, portable en un après-midi |
| Notification silencieuse par mode Concentration | Message manqué | Aucune parade technique ; documenté dans le guide d'installation |

## 9. Questions ouvertes — tour 3

Six points restants. Seul Q-1 bloque ; les autres ont une valeur par défaut posée dans le code,
signalée par un commentaire `TODO(Q-x)` et modifiable en une ligne.

- **Q-1 — La date d'origine.** *(bloquant pour le contenu, pas pour le code)* Jour, et si
  possible heure. Sans heure, il faut en choisir une, le compteur affichant des secondes.
  Fuseau supposé `Europe/Brussels`. **Valeur d'attente : une constante bien visible dans
  `src/lib/config.ts`.**
- **Q-3 — Monogramme et signature.** On garde `BCG ♡` en tête d'écran ? La signature
  « — Benito » devient-elle le prénom de l'autre selon qui regarde ?
  **Défaut posé : monogramme conservé, signature dynamique.**
- **Q-4 — Les réponses rapides.** Les trois phrases du fichier source, telles quelles,
  réécrites, ou remplacées ? **Défaut posé : les trois phrases d'origine, dans `copy.ts`.**
- **Q-6 — La relance.** Délai avant de pouvoir renvoyer une question sans réponse.
  **Défaut posé : 30 minutes.**
- **Q-9 — Versions d'iOS des deux iPhones.** **En dessous de 16.4, tout le volet notification
  tombe.** C'est le seul point qui pourrait remettre le projet en cause ; à vérifier avant
  le lot 6.
- **Q-10 — Autre chose ?** Une phrase, une date, un détail qui aurait sa place et que la
  maquette ne montre pas.

### Tranché aux tours précédents

D1 à D9 (§3). Les questions Q-2 (nom et icône), Q-5 (longueur), Q-7 (surprise) et Q-8
(hébergement, timing du compte) sont closes. Q-8 reste ouverte sur un seul point mineur :
sous-domaine `bcglove.pages.dev` gratuit, ou domaine personnel (~10 €/an) — à trancher au
lot 10, sans conséquence sur le code.
