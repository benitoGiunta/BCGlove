# BCGlove — Installation et recette sur iPhone

**Version** 1.0 · à faire après `docs/deploiement.md`.

Compter **dix minutes par téléphone**, plus une demi-heure à deux pour la recette.

---

## 1. Ce qu'il faut savoir avant

Sur iPhone, **une web-app ne peut envoyer de notification que si elle a été ajoutée à l'écran
d'accueil**. Ouverte comme un site normal dans Safari, elle fonctionne — le compteur tourne, les
messages s'affichent — mais aucune notification n'arrivera. Ce n'est pas contournable : c'est
une règle d'Apple depuis iOS 16.4.

Conséquence pratique : **l'étape « Sur l'écran d'accueil » n'est pas facultative**, et c'est le
seul endroit du parcours où l'on peut se tromper. L'app le détecte et affiche les instructions
d'elle-même si on ouvre le lien dans un onglet.

---

## 2. Installation, pas à pas

1. Ouvrir le lien personnel **dans Safari**. Pas Chrome, pas Firefox, et surtout pas depuis
   Instagram, WhatsApp ou un e-mail — leur navigateur intégré ne sait pas installer une app.
   En cas de doute : copier le lien, ouvrir Safari, coller.
2. Appuyer sur **Partager** — le carré avec la flèche vers le haut, en bas de l'écran.
3. Faire défiler, choisir **« Sur l'écran d'accueil »**.
4. Le nom proposé est *BCGlove*. Appuyer sur **Ajouter**.
5. **Fermer Safari complètement**, et ouvrir l'app depuis sa nouvelle icône. Cette étape compte :
   c'est seulement là que l'app tourne en mode autonome, et donc que les notifications
   deviennent possibles.
6. L'app propose d'activer les notifications. Appuyer sur **Activer**, puis sur **Autoriser**
   dans la fenêtre iOS.
7. Vérifier dans les réglages de l'app — le monogramme `BCG ♡` en haut — que la ligne
   *Notifications* dit bien « Tu es prévenue ».

---

## 3. Si vous préparez le téléphone de l'autre

Les étapes 5 à 7 demandent d'**ouvrir l'app**, ce qui consomme la séquence de première
ouverture — celle que la personne est censée découvrir.

L'ordre compte, et il n'est pas intuitif. Le voici en entier.

1. **Installer et activer les notifications** sur son téléphone (étapes 2.1 à 2.7).
2. **Faire la recette** (§4) pendant que vous avez les deux appareils en main. C'est le seul
   moment où c'est possible.
3. **Effacer les messages de test, en gardant les abonnements** :

   ```bash
   npm run db:clean:prod -- --yes --garde-abonnements
   ```

   `--garde-abonnements` est essentiel ici. Sans lui, les abonnements sont effacés, et chaque
   app doit être rouverte pour se réabonner — ce qui reconsommerait la séquence qu'on vient de
   réarmer. Le mode sans l'option ne sert qu'AVANT d'installer les téléphones.

4. **Ne plus ouvrir l'app** sur son téléphone. La moindre ouverture consommerait la découverte.
   Vous pouvez vérifier depuis le vôtre que tout va bien : envoyez-lui un mot, sa notification
   arrivera sans que l'app s'ouvre.

Si vous avez déjà rouvert l'app par mégarde, ce n'est pas grave — réarmez :

```bash
npm run db:reset-first-open -- charleen --remote
```

---

## 4. Recette, à deux

Chaque ligne se coche sur **les deux appareils**, en inversant les rôles.

| # | Scénario | Attendu |
|---|---|---|
| R-1 | App complètement fermée, l'autre pose la question | Notification en moins de 3 s |
| R-2 | App en arrière-plan | Notification, et l'ouvrir mène droit au composeur |
| R-3 | App au premier plan | Pas de bannière ; l'écran se met à jour tout seul |
| R-4 | iPhone verrouillé | Notification sur l'écran de verrouillage |
| R-5 | Mode avion, puis réactivation | Le message part au retour du réseau |
| R-6 | Mode Concentration actif | Notification silencieuse mais présente au déverrouillage |
| R-7 | iPhone redémarré | L'identité et l'abonnement sont conservés |
| R-8 | Message de 280 caractères | Trois lignes puis « lire la suite » ; tronqué proprement en notification |
| R-9 | Message d'un seul mot | Occupe la bulle sans paraître perdu |
| R-10 | Deux questions coup sur coup | Le cœur sursaute, une seule notification part |
| R-11 | Sans réseau au lancement | Le compteur s'affiche quand même |
| R-12 | Historique | « Voir tout » montre le fil groupé par journée |
| R-13 | Après 7 jours sans ouvrir | L'abonnement tient toujours, ou est renouvelé au lancement |

**R-13 est le seul qui demande d'attendre.** Notez-le quelque part et vérifiez-le dans une
semaine : c'est le scénario où une PWA iOS déçoit le plus souvent.

---

## 5. Dépannage

| Symptôme | Cause probable | Remède |
|---|---|---|
| Pas de « Sur l'écran d'accueil » dans le menu Partager | Ouvert hors Safari | Copier le lien, l'ouvrir dans Safari |
| L'app montre les instructions d'installation alors qu'elle est installée | Ouverte depuis Safari et non depuis l'icône | Fermer Safari, ouvrir depuis l'icône |
| « Autoriser » n'apparaît jamais | App non installée, ou permission déjà refusée | Réglages iOS → Notifications → BCGlove |
| Notifications reçues en retard | Mode Concentration, ou économie d'énergie | Réglages → Concentration → autoriser BCGlove |
| L'app affiche une vieille version | Service worker en cache | Fermer complètement l'app (glisser vers le haut), rouvrir **deux fois** |
| « Ce lien ne mène nulle part » | Mauvais lien, ou données du site effacées | Rouvrir le lien personnel d'origine |
| Le lien personnel est perdu | — | Il est réaffiché dans les réglages de l'app, sur l'autre téléphone le sien uniquement. Sinon, régénérer (`db:seed:prod`) — ce qui invalide les deux |

---

## 6. Garder son lien

Le lien personnel est la seule clé d'accès. Le conserver **ailleurs que dans l'app** : une note,
un favori, un gestionnaire de mots de passe. Effacer les données de Safari ou changer de
téléphone sans lui signifie repartir du lien.

L'app le réaffiche dans ses réglages, tant qu'on y a accès : monogramme `BCG ♡` → *Mon lien* →
*Copier*.
