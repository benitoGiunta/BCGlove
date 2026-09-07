# BCGlove

Une web-app privée pour deux personnes. Elle compte le temps écoulé depuis une date, et permet
de demander à l'autre s'il aime toujours — et de recevoir la réponse sur son iPhone.

S'installe sur l'écran d'accueil (PWA), envoie de vraies notifications iOS, tourne
gratuitement sur Cloudflare.

## Démarrer

```bash
npm install
npm run dev        # front seul
npm run dev:full   # front + API + base locale
```

## Documentation

Commencer par **[`CLAUDE.md`](CLAUDE.md)**, puis **[`ARBORESCENCE.md`](ARBORESCENCE.md)**.

| | |
|---|---|
| [`docs/requirements.md`](docs/requirements.md) | Ce que fait l'app, et pourquoi |
| [`docs/roadmap.md`](docs/roadmap.md) | Les lots de développement |
| [`docs/architecture.md`](docs/architecture.md) | Stack, données, API, notifications |
| [`docs/design-system.md`](docs/design-system.md) | La direction artistique |
| [`docs/deploiement.md`](docs/deploiement.md) | Mise en ligne |
| [`docs/installation-iphone.md`](docs/installation-iphone.md) | Installation sur les iPhones |

## État

Lot 0 terminé — fondations documentaires. Le développement commence au lot 1.
