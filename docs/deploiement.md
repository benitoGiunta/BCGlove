# BCGlove — Déploiement

**Version** 1.0 · à suivre dans l'ordre, de haut en bas.

Compter **une vingtaine de minutes**. Rien n'est à payer, aucune carte bancaire n'est demandée.
Les commandes se lancent depuis le dossier du projet, sur votre machine.

---

## 0. Ce que ça coûte

**Zéro euro, sans limite de durée.** Ce que deux personnes consomment, rapporté aux plafonds
de l'offre gratuite Cloudflare :

| Ressource | Offre gratuite | Ce qu'on en fait |
|---|---|---|
| Pages — déploiements | 500 / mois | quelques-uns par jour en développement |
| Pages Functions — requêtes | 100 000 / jour | quelques centaines |
| D1 — stockage | 5 Go | quelques dizaines de kilo-octets |
| D1 — lectures | 5 millions / jour | quelques milliers |
| Bande passante | illimitée | négligeable |

Le seul coût facultatif est un nom de domaine à vous (~10 €/an). Le sous-domaine
`bcglove.pages.dev` est gratuit, permanent, en HTTPS, et fonctionne parfaitement pour les
notifications.

---

## 1. Avant de commencer

**1.1 — Un compte Cloudflare.** https://dash.cloudflare.com/sign-up
Une adresse e-mail, un mot de passe, une validation par e-mail. Choisir l'offre **Free**.
Ne rien acheter, ne pas transférer de domaine, ignorer toutes les propositions payantes.

**1.2 — Activer l'authentification à deux facteurs** sur ce compte. Il hébergera des messages
privés ; c'est cinq minutes bien employées.

**1.3 — Vérifier les deux iPhones.** Réglages → Général → Informations → Version du logiciel.
**Il faut iOS 16.4 ou plus.** *(Vérifié : 26.6.1 — très au-dessus.)*

**1.4 — Node.js 20 ou plus** sur votre machine : `node --version`.

**1.5 — Rien d'autre.** Pas de compte développeur Apple, pas de service de notification tiers,
pas d'hébergeur supplémentaire, pas de base de données externe.

---

## 2. Se connecter

```bash
npm install
npx wrangler login
```

`wrangler login` ouvre le navigateur et demande d'autoriser l'accès à votre compte Cloudflare.

---

## 3. Créer la base

```bash
npx wrangler d1 create bcglove
```

La commande affiche un bloc de configuration contenant un `database_id`. **Copiez cet
identifiant** et remplacez la valeur `PLACEHOLDER_LOT_10` dans `wrangler.toml` :

```toml
[[d1_databases]]
binding = "DB"
database_name = "bcglove"
database_id = "collez-l-identifiant-ici"
migrations_dir = "migrations"
```

Puis créez les tables :

```bash
npm run db:migrate:prod
```

---

## 4. Générer les clés de notification

```bash
npm run keys:vapid -- "mailto:votre@adresse.com"
```

Le script affiche trois valeurs et écrit `.dev.vars` (git-ignoré) pour le développement local.

**Rangez la clé privée dans un gestionnaire de mots de passe maintenant.** La perdre oblige à
regénérer la paire et à réabonner les deux appareils — pas dramatique, mais évitable.

Puis posez les trois secrets en production, une commande chacun. Chacune demande la valeur,
que vous collez :

```bash
npx wrangler pages secret put VAPID_PUBLIC_KEY  --project-name bcglove
npx wrangler pages secret put VAPID_PRIVATE_KEY --project-name bcglove
npx wrangler pages secret put VAPID_SUBJECT     --project-name bcglove
```

*Si ces commandes échouent en disant que le projet n'existe pas, faites d'abord l'étape 5 et
revenez ici.*

---

## 5. Mettre en ligne

```bash
npm run build
npx wrangler pages deploy dist
```

Au premier lancement, wrangler propose de créer le projet : acceptez, nommez-le **bcglove**,
et prenez `main` comme branche de production.

La commande affiche l'URL — quelque chose comme `https://bcglove.pages.dev`. **Ouvrez-la** :
vous devez voir « Ce lien ne mène nulle part. » C'est le bon résultat : le site est en ligne,
et personne n'a encore de clé.

---

## 6. Créer les deux comptes

```bash
BCGLOVE_ORIGIN=https://bcglove.pages.dev npm run db:seed:prod
```

Le script affiche **les deux liens personnels, une seule fois**. Copiez-les tout de suite, tous
les deux, ailleurs que dans ce terminal.

> Relancer cette commande **régénère les clés** : les anciens liens cessent de fonctionner.

---

## 7. Vérifier

```bash
BCGLOVE_URL=https://bcglove.pages.dev npm run test:api -- <lien-Charleen> <lien-Benito>
```

*(en passant les clés seules, la partie après `?k=`)*

Dix-sept vérifications doivent passer. Si l'une échoue, ne continuez pas : c'est un problème de
configuration, pas de chance.

Puis suivez **`docs/installation-iphone.md`** pour les deux téléphones.

---

## 8. Les mises à jour, ensuite

Deux façons, au choix.

**À la main**, depuis votre machine :

```bash
npm run build && npx wrangler pages deploy dist
```

**Automatiquement**, en connectant GitHub : tableau de bord Cloudflare → *Workers & Pages* →
*bcglove* → *Settings* → *Builds & deployments* → *Connect to Git*. Chaque `git push` sur la
branche de production reconstruit et publie. Commande de build : `npm run build`. Dossier de
sortie : `dist`.

---

## 9. Sauvegarder

```bash
npx wrangler d1 export bcglove --remote --output backup-$(date +%F).sql
```

À lancer de temps en temps. Le fichier tient dans un e-mail. C'est tout ce qu'il faut pour
reconstruire l'app ailleurs.

---

## 10. En cas de coup dur

| Symptôme | Piste |
|---|---|
| `wrangler login` n'aboutit pas | Autorisez les fenêtres surgissantes, ou utilisez `wrangler login --browser=false` et collez l'URL |
| Le déploiement échoue | Journaux : *Workers & Pages → bcglove → Deployments → View details* |
| L'app affiche « Ce lien ne mène nulle part » avec le bon lien | Les comptes n'ont pas été créés : reprenez l'étape 6 |
| L'API renvoie 500 | `npx wrangler pages deployment tail` donne les journaux en direct |
| Les notifications ne partent pas | Les trois secrets VAPID sont-ils posés ? `npx wrangler pages secret list --project-name bcglove` |
| L'app ne se met plus à jour sur l'iPhone | Service worker en cache : voir `docs/installation-iphone.md` §5 |
