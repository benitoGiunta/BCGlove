# BCGlove — Requirements

**Version** 1.0
**Date** 2026-09-07
**Statut** Entièrement arbitré. Aucune question ouverte.

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
| D10 | Date d'origine | **12 juillet 2025, 15 h** | Fuseau `Europe/Brussels`, dans `src/lib/config.ts` |
| D11 | Monogramme | **`BCG` fixe, identique sur les deux téléphones** | B pour Benito, C pour Charleen, G pour la lettre commune de leurs deux noms. Ce n'est pas le monogramme d'une personne mais d'une union : il ne bascule pas. *La signature qui basculait, elle, a disparu de l'écran d'accueil — voir D19* |
| D12 | Header | **Le nom de celui qui regarde** | « Pour Charleen » sur l'iPhone de Charleen. La dédicace s'adresse au lecteur. *Elle portait le nom de l'autre par la signature du bas ; depuis D19 c'est le libellé du bouton et les messages qui s'en chargent* |
| D13 | Réponses rapides | **Cinq phrases, une par situation** | Pas cinq façons de dire oui : la tendresse, la promesse, la réponse tardive, l'indisponibilité, l'invitation |
| D14 | Refonte de l'écran d'accueil | **Arbitrée sur maquette avant tout code** (§10) | Les trois idées du backlog (V2-1, V2-2, V2-3) tiennent sur un seul écran, dessiné puis validé dans `design/refonte-v2/` |
| D15 | En-tête | **Une seule ligne, emblème et monogramme à gauche, dédicace à droite** | Libère les ~60 px que coûtaient l'emblème centré et le monogramme sur trois registres. C'est ce qui rend la refonte possible |
| D16 | Bouton cœur | **Un rond de 56 px à droite du bouton principal**, qui se rétrécit | Deux gestes sur une seule ligne, sans surimpression. Le bouton principal garde sa hauteur de 56 px |
| D17 | Compteur des preuves | **Sous la carte, en une ligne**, `47 JE T'AIME REÇUS` | L'emplacement médian du backlog V2-3. ~30 px, dans le registre typographique de la ligne `h · min · s` |
| D18 | Deux messages | **Reçu en rose plein à gauche, envoyé en crème bordé à droite** | La position porte l'auteur, la couleur le confirme. Aucune teinte nouvelle : la palette existante suffit |
| D19 | Signature du bas | **Supprimée de l'écran d'accueil** | Le nom de l'autre est déjà porté par la bulle reçue et par la dédicace de l'en-tête. Les ~25 px libérés vont aux messages |
| D20 | Notification du cœur | **Titre `Je t'aime`, corps `— <Nom>`** | Les trois autres notifications sont des comptes rendus à la troisième personne (« Charleen a répondu ♡ »). Celle-ci ne raconte pas : elle dit. C'est la forme, pas seulement le sens, qui tranche |
| D21 | Le cœur dans le fil | **Pastille crème, bordure et texte en `--accent`** | Le bordeaux du bouton principal, sans son aplat. Aucune bulle du fil ne porte de bordure bordeaux pleine : le cœur est le seul |
| D22 | Le cœur à l'accueil | **Il occupe une des deux places** | L'accueil montre les deux derniers gestes, texte ou cœur. L'écran dit toujours ce qui vient de se passer |
| D23 | Périmètre du compteur | **Réponses + mots spontanés + cœurs, tous reçus** | Trois façons de dire la même chose comptent pareil. Un « Est-ce que tu m'aimes ? » n'est pas un je t'aime : `ask` est exclu |
| D24 | Débit du cœur | **Pas de spam** : le plancher de 30 s s'applique au cœur comme au reste, et les cœurs partagent un seul `tag` de notification | Rien de neuf à écrire : le plancher est déjà côté serveur pour tous les types, et le remplacement par `tag` existe depuis EF-9.3. Dix appuis d'affilée donnent au plus dix lignes en base et **une seule** notification à l'écran |
| D25 | Mise à jour de l'app en service | **Aucune réinstallation, jamais** | La clé vit dans le `localStorage` de l'app installée, l'abonnement push dans la D1 : un déploiement ne touche ni l'un ni l'autre. C'est une contrainte de conception, pas une observation |

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
- **EF-4.3** Visuellement distingué d'une réponse dans l'historique. La palette n'ayant qu'un rose, la distinction se fait au **remplissage** : une réponse est une bulle pleine, un mot spontané une bulle bordée.

### EF-5 — Longueur des messages

- **EF-5.1** **Saisie** : limite dure à **280 caractères**. Le compteur n'apparaît qu'au-delà de 200, en discret, et passe à la couleur d'accent au-delà de 260. Au-delà de la limite, la frappe est bloquée (pas de troncature silencieuse).
- **EF-5.2** **Notification** : le corps est tronqué à **110 caractères**, sur une frontière de mot, suivi de « … ». Le titre reste court et fixe (« Charleen a répondu ♡ »). Rationnel : iOS affiche ~2 lignes en bannière repliée, ~4 déplié.
- **EF-5.3** **Bulle in-app** : sur l'écran compteur, le texte est plafonné à **3 lignes** suivies d'un lien « lire la suite ». *Révisé en v0.3 : le dépliage sur place était prévu, mais un message de 280 caractères poussait alors la signature hors de l'écran. « Lire la suite » ouvre donc un écran de lecture dédié (EF-11), où le message est seul. L'alternative — rendre l'écran principal défilant — aurait poussé le compteur hors de vue à l'ouverture, c'est-à-dire l'exact contraire de ce que l'app doit montrer en premier.*
- **EF-5.4** La taille de police de la bulle **s'adapte à la longueur** : 21 px jusqu'à 60 caractères, 19 px jusqu'à 140, 17 px au-delà. Un message court doit occuper l'écran, un message long doit rester lisible.
- **EF-5.5** Les retours à la ligne saisis sont préservés à l'affichage ; les lignes vides multiples sont réduites à une.

### EF-6 — Historique

- **EF-6.1** L'écran principal n'affiche que **le dernier échange**, conformément à la maquette.
- **EF-6.2** Un lien discret, en bas de l'écran compteur, ouvre l'historique complet. *Révisé en v0.3 : un glissement vers le haut était prévu, mais l'écran d'historique défile déjà — le geste serait entré en conflit avec son défilement. Et un lien se découvre, là où un geste se devine.*
- **EF-6.3** L'historique est une liste inversée (le plus récent en haut), groupée par jour, avec dates en toutes lettres.
- **EF-6.4** Chaque entrée indique qui, quoi, quand. Les horodatages sont **relatifs et humains** (« à l'instant », « il y a 12 min », « hier soir », « il y a 3 jours »), avec la date exacte au toucher.
- **EF-6.5** Aucune suppression, aucune édition. Ce qui est envoyé est envoyé.

### EF-7 — Identité et première ouverture

- **EF-7.1** À la première ouverture avec `?k=<clé>`, l'app résout l'identité et la stocke localement. Elle **ne nettoie l'URL qu'une fois installée** sur l'écran d'accueil. *Révisé en v1.1, après un échec sur un vrai iPhone : « Sur l'écran d'accueil » enregistre l'URL telle qu'elle est au moment du geste. Une URL nettoyée donnait donc une icône qui ouvrait l'app sans identité — d'autant que l'app installée a son propre stockage, séparé de celui de Safari, et n'y retrouve pas la clé mémorisée par le navigateur. En mode autonome il n'y a plus de barre d'adresse, donc plus rien à cacher : on nettoie là, et le stockage prend le relais.*
- **EF-7.2** Sans clé valide et sans identité stockée, l'app affiche un écran neutre (« Ce lien ne mène nulle part ») — aucune fuite d'information.
- **EF-7.2b** *Exception, en mode autonome uniquement :* l'app installée propose de **coller son lien**, une fois. Sans ça, une app installée qui n'a pas reçu la clé est une impasse dont on ne sort pas. Le cas ne se présente qu'à quelqu'un qui a délibérément installé l'app, et l'écran ne dit rien de plus qu'« il faut un lien ».
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
- **EF-10.3b** *Conséquence de D7, découverte à l'implémentation :* préparer l'iPhone de
  Charleen oblige à ouvrir l'app, ne serait-ce que pour activer les notifications — ce qui
  consommerait la séquence avant qu'elle ne la voie. `npm run db:reset-first-open -- charleen`
  la réarme. À lancer après avoir préparé le téléphone, avant de le rendre.
- **EF-10.4** La phrase **attend un toucher** ; elle ne s'efface pas d'elle-même. *Révisé en v1.1 : elle disparaissait après 2,6 s, ce qui ne laissait pas le temps de lire une phrase qu'on découvre. Une indication discrète apparaît après un moment.*
- **EF-10.5** Sous `prefers-reduced-motion`, la séquence est remplacée par un simple fondu sur
  la phrase, puis le compteur.
- **EF-10.6** L'ouverture de la séquence par Charleen **prévient Benito** par une notification.
  C'est le seul moment où l'app envoie un push que personne n'a déclenché volontairement.

### EF-11 — Écran de lecture

- **EF-11.1** Un message trop long pour l'écran compteur se lit sur un écran à lui : le nom de l'expéditeur, le message en entier, son horodatage, et un retour.
- **EF-11.2** C'est le seul écran du projet autorisé à défiler. Un mot très long ne doit jamais être tronqué là.
- **EF-11.3** Il n'introduit aucune forme, couleur ni typographie nouvelle : même bulle, même fond, mêmes bordures.

### EF-12 — Tenue sur les écrans courts

- **EF-12.1** L'écran compteur doit tenir **en entier**, sans rognage ni défilement, depuis un iPhone récent en mode autonome (~874 px) jusqu'à un onglet Safari sur iPhone mini (~629 px).
- **EF-12.2** Le resserrement passe par des **tokens** (marges, taille des chiffres, hauteur réservée), pas par des règles dans les composants : aucun composant n'a à savoir qu'il est à l'étroit.
- **EF-12.3** Aucun débordement horizontal, à aucune taille.

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
| ENF-10 | Continuité de service | Une mise à jour ne coûte **aucune réinstallation** : ni rouvrir le lien secret, ni refaire « Ajouter à l'écran d'accueil », ni réactiver les notifications (D25). Détaillé dans `docs/deploiement.md` §8 |

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

## 9. Questions ouvertes

**Aucune.** D1 à D25 (§3) couvrent l'ensemble des arbitrages.

Un seul point reste à trancher, au lot 10, et il n'a aucune conséquence sur le code :
sous-domaine `bcglove.pages.dev` gratuit, ou domaine personnel (~10 €/an).

La refonte du lot 13 est entièrement arbitrée, débit du cœur compris (§10).

---

## 10. La refonte de l'écran d'accueil (v2)

**Statut** **Codée en entier**, et en ligne. Les quatre pas du lot 13 sont faits : la
recomposition (EF-13), le geste `love` et sa migration (EF-15.3 à EF-15.7), le bouton et le
compteur (EF-15.1, EF-15.2, EF-14), les deux derniers gestes (EF-16).

Cette section reste la spécification qui **fait foi**. Trois endroits portent, en italique, un
écart entre ce qui avait été écrit sur maquette et ce que la mesure a imposé : le plafond de
lignes (EF-16.6), l'affichage à zéro et l'accord du libellé (EF-14), et la levée du point de
vigilance sur la pastille (EF-15.5). Ces écarts sont la spécification désormais, pas des
exceptions à elle.

Les maquettes vivent dans `design/refonte-v2/` (`Actuel.dc.html` l'avant, `Main.dc.html`
l'après), générées par `build.py` depuis les tokens réels du projet. Elles ont servi à décider ;
elles ne montrent ni la pastille du cœur, ni le cas de deux gestes du même auteur. C'est cette
section qui fait foi, pas elles.

**Origine** Les trois idées de `docs/backlog.md` — V2-1 (deux messages en conversation),
V2-2 (bouton cœur), V2-3 (compteur des preuves) — partageaient un même goulot : la hauteur de
l'écran. Les faire une par une aurait tassé l'écran trois fois. Elles sont donc traitées
**ensemble**, comme une recomposition, et c'est cette recomposition qui est spécifiée ici.

### EF-13 — Composition de l'écran d'accueil

Ordre vertical, de haut en bas. Cible **393 × 852** (iPhone 15 Pro, le plus petit des deux
appareils réels) ; le 16 Pro offre 402 × 874.

- **EF-13.1 En-tête, une seule ligne** (`min-height: 44px`, `justify-content: space-between`) :
  à gauche l'emblème (38 px) et le monogramme `BCG ♡` côte à côte, à droite la dédicace
  (« Pour Charleen » / « Pour Benito », toujours le nom de celui qui regarde — D12).
- **EF-13.2 Carte compteur**, inchangée : phrase, `années · mois · jours`, filet, `h · min · s`.
- **EF-13.3 Compteur des preuves**, une ligne centrée sous la carte (EF-14).
- **EF-13.4 Ligne de boutons** : le bouton principal, rétréci, et le bouton cœur (EF-15).
- **EF-13.5 Les deux derniers gestes** — réponse, mot ou cœur — en bulles orientées (EF-16),
  suivis d'un seul horodatage, celui du plus récent.
- **EF-13.6 Les liens du bas** : « Écrire un mot · Voir tout ». **La signature disparaît**
  (D19).
- **EF-13.7 Hiérarchie des espaces.** L'espace entre les messages et les boutons est le
  **plus grand de l'écran**, plus grand que celui entre les boutons et le compteur. Il est
  obtenu par construction (`margin-top: auto` sur le bloc des messages), pas par une valeur
  choisie : il absorbe le surplus et reste donc le plus grand sur tous les appareils.
- **EF-13.8** La bande d'état d'iOS reste **vide** : on ne dessine jamais de fausse barre.

### EF-14 — Compteur des preuves

- **EF-14.1** **Un seul nombre**, la somme de **trois** gestes reçus : les réponses à un
  « Est-ce que tu m'aimes ? », les **mots spontanés**, et les **cœurs**. Pas trois compteurs :
  trois nombres inviteraient à les comparer, alors que ce sont trois façons de dire la même
  chose.
- **EF-14.2** Un `ask` **ne compte pas**. Poser la question n'est pas y répondre.
- **EF-14.3** Le compteur ne compte que ce que **celui qui regarde a reçu**. Sur l'iPhone de
  Charleen il compte les gestes de Benito, et l'inverse sur celui de Benito. Ce n'est pas un
  total de couple : chacun voit ce qu'il a reçu.
- **EF-14.4** Libellé : **« je t'aime reçus »**, rendu en capitales — « 47 JE T'AIME REÇUS ».
  Le libellé arrondit un peu : un mot spontané n'est pas littéralement un « je t'aime ». C'est
  assumé — le compte est celui des gestes de tendresse reçus, et aucune formulation plus exacte
  ne tenait sur une ligne sans devenir administrative.

  *Deux précisions apportées par le code.* Le libellé **s'accorde en nombre** — « 1 je t'aime
  reçu » — là où cette exigence n'avait retenu que le pluriel. Et la ligne **ne s'affiche pas
  du tout quand le compteur vaut zéro** : « 0 je t'aime reçus » serait exactement la pression
  que ce compteur ne doit pas exercer, celle que `docs/backlog.md` redoutait sous V2-3.
- **EF-14.5** Registre typographique de la ligne `h · min · s` : nombre à 21 px / 600 en
  `--ink-soft`, libellé à 10 px / 700, interlettrage `0.17em`, en `--ink-label`. Il se lit
  comme une mesure, jamais comme un score.
- **EF-14.6** Requête unique, sans rien à stocker :
  `SELECT COUNT(*) FROM messages WHERE to_user = ? AND kind IN ('reply','note','love')`.
  Elle est **rétroactive** : les réponses et les mots d'avant la v2 comptent.
- **EF-14.7** Tant que le bouton cœur n'existe pas (EF-15), le compteur compte déjà réponses et mots spontanés. Il est juste dès
  le premier jour ; les cœurs le rejoignent ensuite.

### EF-15 — Bouton cœur

**Le geste.** Il ne pose pas une question, il ne demande pas de réponse : il affirme. Tout ce
qui suit découle de ça — la notification, le fil, la couleur.

- **EF-15.1 Le bouton.** Un rond de **56 px** (la hauteur du bouton principal), fond
  `--surface-card`, bordure `rgba(156, 85, 96, 0.28)`, cœur en `--accent`, à **droite** du
  bouton principal, 12 px de gouttière. Le bouton principal passe en `flex: 1` et garde ses
  56 px de hauteur.
- **EF-15.2** Le libellé du bouton principal est en graisse **400** (pas 600) et porte
  `white-space: nowrap` : la largeur restante suffit en Nunito, mais pas avec la police de
  repli le temps qu'elle charge.
- **EF-15.3 La notification tranche par sa forme.** Les trois autres sont des comptes rendus :
  `<Nom> te demande ♡`, `<Nom> a répondu ♡`, `<Nom> t'a écrit ♡` — quelqu'un raconte ce qu'un
  autre a fait. Celle du cœur ne raconte pas :

  | Geste | Titre | Corps |
  |---|---|---|
  | `ask` | `Charleen te demande ♡` | `Est-ce que tu m'aimes ?` |
  | `reply` | `Charleen a répondu ♡` | le texte du message |
  | `note` | `Charleen t'a écrit ♡` | le texte du message |
  | **`love`** | **`Je t'aime`** | **`— Charleen`** |

  Ni troisième personne, ni verbe d'action, ni `♡` en suffixe : les mots eux-mêmes, puis la
  signature. C'est la seule notification dont le **titre ne contient pas de nom**, et la seule
  dont le **corps en contient un** : le renversement se voit sur l'écran verrouillé avant même
  d'être lu. Les chaînes vivent dans `src/lib/copy.ts` sous `push`, comme les trois autres.
- **EF-15.4 Le cœur dans le fil tranche aussi, dans les mots.** Il s'écrit **à la voix de son
  auteur**, jamais en compte rendu : la ligne dit `Je t'aime`, avec l'horodatage habituel. Pas
  de « Benito a dit qu'il t'aime » — ce serait la voix d'un narrateur, et il n'y a pas de
  narrateur dans cette app.
- **EF-15.5 Et dans la couleur.** Une **pastille** (rectangle entièrement arrondi, rayon égal à
  la moitié de sa hauteur), fond `--surface-card`, **bordure 1 px `--accent`**, texte
  `--accent` en Cormorant italique, suivi d'un `♡`. C'est le bordeaux du bouton principal, sans
  son aplat.
  - Elle **n'a pas les deux points** de la bulle. Une bulle porte une parole écrite ; le cœur
    est un geste. L'absence de points fait partie du contraste.
  - Elle suit la **même règle d'alignement** que les bulles : reçue à gauche, envoyée à droite.
    L'alignement seul porte la direction, puisque la pastille a la même couleur dans les deux
    sens.
  - **Point de vigilance connu.** La bulle d'un message envoyé est déjà crème, avec une bordure
    claire (`rgba(156, 85, 96, 0.16)`). La pastille du cœur est crème avec une bordure
    **pleine** `--accent` : c'est la même famille, à sept fois l'opacité de bordure près. Si à
    l'usage les deux se confondent sur un vrai écran, la parade est l'aplat bordeaux (fond
    `--accent`, texte `--accent-on`), déjà envisagé et écarté au profit de la discrétion. Ne
    pas changer avant de l'avoir vu sur un iPhone.

    *Vu, et levé.* Sur l'écran réel les deux ne se confondent pas : le liseré de la bulle
    envoyée est sept fois plus pâle que la bordure de la pastille, et l'œil fait la différence
    sans hésiter. L'aplat bordeaux reste noté comme parade, sans avoir lieu de s'appliquer.
- **EF-15.6 Le type de message.** Quatrième type, `love`, sans corps, comme `ask`. La colonne
  `kind` porte une contrainte `CHECK` : SQLite ne la modifie pas en place, il faut **recréer la
  table et recopier les lignes** dans une migration `migrations/0002_*.sql`.
- **EF-15.7 Le débit : pas de spam.** Le cœur n'a **aucun régime de faveur**.
  - Le plancher de **30 s** entre deux envois (`SEND_COOLDOWN_MS`) s'applique au cœur comme aux
    messages. Il est déjà écrit côté serveur pour tous les types : il n'y a rien à ajouter, et
    surtout rien à assouplir.
  - Tous les cœurs d'un même expéditeur partagent **un seul `tag`** de notification. Le
    mécanisme existe depuis EF-9.3 : une nouvelle notification portant le même tag **remplace**
    la précédente au lieu de s'empiler. Dix appuis ne donnent donc jamais dix bannières.
  - Le compteur (EF-14.1) compte chaque appui **enregistré**, donc au plus un par 30 s. Aucune
    règle supplémentaire n'est nécessaire pour l'empêcher de s'emballer.
  - Une seule pastille apparaît dans le fil par appui. Deux cœurs d'affilée sont deux lignes,
    comme deux messages d'affilée — le fil est un journal, il ne dédoublonne pas.

### EF-16 — Les deux derniers gestes

- **EF-16.1** Les **deux derniers** gestes, **tous auteurs confondus** et **tous types
  confondus** — réponse, mot spontané ou cœur (D22). Un `ask` n'y figure pas : il n'a pas de
  contenu, et c'est le bouton lui-même qui le porte.
- **EF-16.2 L'apparence dépend de l'AUTEUR, pas de la place.** Il y a deux personnes, Benito et
  Charleen ; sur un iPhone donné, « moi » est celui qui regarde et « l'autre » est celui qui a
  reçu la dédicace de la signature. Trois cas se présentent donc naturellement, et les trois
  sont normaux :

  | Les deux derniers gestes | Ce que l'écran montre |
  |---|---|
  | Deux de l'autre | Deux bulles **roses**, les deux à gauche |
  | Deux de moi | Deux bulles **crème**, les deux à droite |
  | Un de chacun | Une rose à gauche, une crème à droite, dans l'ordre chronologique |

  Aucune place n'est réservée à personne : il n'y a pas « la ligne de l'autre » et « la mienne ».
- **EF-16.3 Reçu** : bulle **rose plein** (`--surface-bubble`), alignée à **gauche**.
  **Envoyé** : bulle **crème** (`--surface-card`) **bordée** (`rgba(156, 85, 96, 0.16)`),
  alignée à **droite**. Aucune teinte nouvelle n'est introduite. Un cœur suit EF-15.5.
- **EF-16.4 Les deux points de la bulle sont conservés et miroités** : en bas à gauche pour un
  geste reçu (9 px à `left: 4px; bottom: 2px`, 5 px à `left: -3px; bottom: -4px`), en bas à
  droite pour un envoyé (`right: 4px` et `right: -3px`, mêmes tailles). Ils font lire la
  direction avant même la couleur.
- **EF-16.5** Les points d'une bulle **envoyée** portent la **même bordure que leur bulle**.
  Sans elle, leur crème est celui du fond de l'écran : ils existent mais sont invisibles.
- **EF-16.6** Texte en Cormorant droit, selon l'échelle de longueur existante
  (`--fs-bubble-s/m/l`), largeur maximale **86 %**. Au-delà du plafond, la lecture complète va
  sur l'écran de lecture (EF-11), comme aujourd'hui.

  **Le plafond dépend du nombre de gestes : trois lignes quand il n'y en a qu'un, DEUX quand ils
  sont deux.** *Corrigé après mesure : cette exigence disait trois lignes dans tous les cas,
  hérité du temps où l'écran n'en montrait qu'une. À deux bulles de trois lignes, l'écran
  déborde de 25 px sur un iPhone 15 Pro et de 3 px sur un 16 Pro — donc sur les deux appareils
  réels. Le plafond existe pour que ça rentre : il suit ce qui rentre, pas un nombre écrit
  d'avance.*

  **Une bulle tronquée s'ouvre en la touchant**, sans bouton « lire la suite » en dessous.
  C'est une contrainte de hauteur avant d'être une question d'ergonomie : ce bouton porte la
  zone tactile minimale d'iOS, 44 px, et à deux gestes il en coûtait 88 — assez, à lui seul,
  pour faire déborder l'écran. Une bulle dépasse déjà 44 px de haut : elle est sa propre zone
  tactile. Son nom accessible reste « lire la suite ».
- **EF-16.7** Un **seul horodatage**, sous la paire, aligné du côté du geste le plus récent.
- **EF-16.8 Côté API.** `/api/state` expose un `lastTwo` : les deux dernières lignes de
  `messages` où `kind IN ('reply','note','love')`, tous auteurs confondus, chacune avec son
  `kind`, son auteur et son horodatage. `lastReceived` reste exposé — il sert encore à l'écran
  de lecture et au bandeau de notification.

### EF-17 — Ce que la refonte ne change pas

Les gestes existants restent des gestes existants : EF-1 (le calcul du compteur), EF-7
(l'identité), EF-9 (le comportement des notifications), EF-10 (la première ouverture), EF-11
(l'écran de lecture) et EF-12 (la tenue sur les écrans courts) sont **inchangés**. Le bandeau
d'onboarding notification continue de se loger dans la place déjà réservée.
