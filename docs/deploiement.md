# BCGlove — Déploiement

**Version** 0.1 — les prérequis (§1) sont définitifs et peuvent être faits dès maintenant.
Les sections §2 à §6 seront vérifiées pas à pas au lot 10, quand le code existera.

---

## 0. Ce que ça coûte

**Zéro euro, sans limite de durée.** Détail de ce qui est consommé pour deux personnes :

| Ressource | Offre gratuite Cloudflare | Consommation attendue |
|---|---|---|
| Pages — déploiements | 500 / mois | quelques-uns par jour en développement |
| Pages Functions — requêtes | 100 000 / jour | quelques centaines |
| D1 — stockage | 5 Go | quelques dizaines de kilo-octets |
| D1 — lectures | 5 millions / jour | quelques milliers |
| Bande passante | illimitée | négligeable |

Aucune carte bancaire n'est demandée pour l'offre gratuite. Le seul coût optionnel est un nom
de domaine personnalisé (~10 €/an) ; le sous-domaine `*.pages.dev` est gratuit, permanent, en
HTTPS, et fonctionne parfaitement pour les notifications.

## 1. Prérequis — à faire dès maintenant

**1.1 — Un compte Cloudflare.** https://dash.cloudflare.com/sign-up
Une adresse e-mail, un mot de passe, une validation par e-mail. Choisir l'offre **Free**.
Ne rien acheter, ne pas transférer de domaine, ignorer toutes les propositions payantes.

**1.2 — Activer l'authentification à deux facteurs** sur ce compte. Ce compte hébergera des
messages privés ; c'est cinq minutes bien employées.

**1.3 — Vérifier les deux iPhones.** Réglages → Général → Informations → Version du logiciel.
**Il faut iOS 16.4 ou plus.** En dessous, aucune notification web n'est possible : c'est une
limite d'Apple, pas du projet. Mettre à jour si nécessaire.

**1.4 — Rien d'autre.** Pas de compte développeur Apple, pas de service de notification tiers,
pas d'hébergeur supplémentaire, pas de base de données externe.

**1.5 — Ce qui vous attend, une fois le compte créé.** Une dizaine de minutes, en cinq
commandes que je détaille au §2. À l'issue : l'app est en ligne, les deux liens personnels sont
générés, et il ne reste qu'à les ouvrir sur les deux iPhones.

## 2. Création du projet — lot 10

Squelette de la procédure, à dérouler et vérifier le moment venu.

```bash
npm install -g wrangler       # outil en ligne de commande Cloudflare
wrangler login                # ouvre le navigateur, autorise l'accès

wrangler d1 create bcglove              # crée la base ; noter l'identifiant retourné
wrangler d1 execute bcglove --remote --file=migrations/0001_init.sql

wrangler pages project create bcglove   # crée le projet Pages
```

Puis, dans le tableau de bord Cloudflare, lier la base au projet (*Settings → Functions → D1
bindings*, nom du binding : `DB`) et connecter le dépôt GitHub pour le déploiement automatique.

## 3. Secrets — lot 10

```bash
npm run keys:vapid            # génère la paire de clés, une seule fois, à conserver

wrangler pages secret put VAPID_PRIVATE_KEY --project-name bcglove
wrangler pages secret put VAPID_PUBLIC_KEY  --project-name bcglove
wrangler pages secret put VAPID_SUBJECT     --project-name bcglove   # mailto:…
```

La clé privée VAPID **ne doit jamais entrer dans le dépôt**. Si elle est perdue, il faut
regénérer la paire et réabonner les deux appareils — pas dramatique, mais évitable : la
conserver dans un gestionnaire de mots de passe.

## 4. Peuplement des deux utilisateurs — lot 10

Un script génère les deux clés personnelles, en stocke les empreintes en base, et affiche les
deux liens à envoyer. Les liens ne sont affichés **qu'une seule fois**.

## 5. Déploiement continu — lot 10

Une fois GitHub connecté, chaque `git push` sur la branche de production déclenche un build et
une mise en ligne. Les branches de travail obtiennent une URL de prévisualisation.

## 6. Sauvegarde et restauration — lot 10

```bash
wrangler d1 export bcglove --remote --output backup-$(date +%F).sql
```

À lancer de temps en temps. Le fichier tient dans un e-mail.

## 7. En cas de coup dur

| Symptôme | Piste |
|---|---|
| Le build échoue | Journaux dans *Workers & Pages → bcglove → Deployments* |
| L'API renvoie 500 | `wrangler pages deployment tail` pour les journaux en direct |
| Les notifications ne partent plus | Vérifier les secrets VAPID, puis la table `subscriptions` (endpoints purgés ?) |
| L'app ne se met plus à jour sur l'iPhone | Service worker en cache : voir `docs/installation-iphone.md` §Dépannage |
