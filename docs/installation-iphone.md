# BCGlove — Installation et recette sur iPhone

**Version** 0.1 — squelette. Rédigé pour de bon au lot 11, une fois l'app en ligne.

---

## 1. Ce qu'il faut savoir avant

Sur iPhone, **une web-app ne peut envoyer de notification que si elle a été ajoutée à l'écran
d'accueil**. Ouverte comme un site normal dans Safari, elle fonctionne — le compteur tourne,
les messages s'affichent — mais aucune notification n'arrivera. Ce n'est pas contournable :
c'est une règle d'Apple depuis iOS 16.4.

Conséquence pratique : **l'étape « Ajouter à l'écran d'accueil » n'est pas facultative**, et
c'est le seul endroit du parcours où l'on peut se tromper.

## 2. Installation, pas à pas

1. Ouvrir le lien personnel **dans Safari** (pas Chrome, pas Firefox, pas depuis Instagram ou
   WhatsApp — leur navigateur intégré ne sait pas installer une app). En cas de doute :
   copier le lien, ouvrir Safari, coller.
2. Appuyer sur le bouton **Partager** (le carré avec la flèche vers le haut, en bas de l'écran).
3. Faire défiler, choisir **« Sur l'écran d'accueil »**.
4. Le nom proposé peut être raccourci. Appuyer sur **Ajouter**.
5. **Fermer Safari**, et ouvrir l'app depuis sa nouvelle icône. Cette étape compte : c'est
   seulement là que l'app tourne en mode autonome.
6. L'app propose d'activer les notifications. Appuyer sur le bouton, puis sur **Autoriser**
   dans la fenêtre iOS.
7. Un message de bienvenue arrive pour confirmer que tout fonctionne.

## 3. Campagne de recette — lot 11

Chaque ligne doit être cochée sur **les deux appareils**.

| # | Scénario | Attendu |
|---|---|---|
| R-1 | App complètement fermée, l'autre pose la question | Notification en moins de 3 s |
| R-2 | App en arrière-plan | Notification, et l'ouvrir mène au composeur |
| R-3 | App au premier plan | Pas de bannière ; l'écran se met à jour tout seul |
| R-4 | iPhone verrouillé | Notification sur l'écran de verrouillage |
| R-5 | Mode avion, puis réactivation | Le message part au retour du réseau |
| R-6 | Mode Concentration actif | Notification silencieuse mais présente au déverrouillage |
| R-7 | iPhone redémarré | L'identité et l'abonnement sont conservés |
| R-8 | Message de 280 caractères | Lisible in-app, tronqué proprement en notification |
| R-9 | Message d'un seul mot | Occupe la bulle sans paraître perdu |
| R-10 | Deux questions coup sur coup | Une seule question ouverte, pas de double notification |
| R-11 | Sans réseau au lancement | Le compteur s'affiche quand même |
| R-12 | Après 7 jours sans ouvrir | L'abonnement est toujours valide, ou renouvelé au lancement |

## 4. Dépannage

| Symptôme | Cause probable | Remède |
|---|---|---|
| Pas de bouton « Sur l'écran d'accueil » | Ouvert hors Safari | Copier le lien et l'ouvrir dans Safari |
| « Autoriser » n'apparaît jamais | App non installée, ou permission déjà refusée | Réglages iOS → Notifications → BCGlove |
| Notifications reçues en retard | Mode Concentration, ou économie d'énergie | Réglages → Concentration → autoriser BCGlove |
| L'app affiche une vieille version | Service worker en cache | Fermer complètement l'app (glisser vers le haut), rouvrir deux fois |
| « Ce lien ne mène nulle part » | Mauvais lien, ou données du site effacées | Rouvrir le lien personnel d'origine |

## 5. Garder son lien

Le lien personnel est la seule clé d'accès. Le conserver ailleurs que dans l'app : une note,
un favori, un gestionnaire de mots de passe. Effacer les données de Safari ou changer de
téléphone sans lui signifie repartir du lien.
