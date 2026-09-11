#!/usr/bin/env node
/**
 * Vérification de bout en bout de l'API, contre un serveur local.
 *
 *   npm run dev:full                    (dans un terminal)
 *   npm run db:migrate && npm run db:seed
 *   npm run test:api -- <clé Charleen> <clé Benito>
 *
 * Couvre le cycle complet ET les refus : sans clé, mauvaise clé, question déjà
 * ouverte, réponse déjà donnée, envois trop rapprochés. Ce sont les refus qui
 * comptent le plus : le cycle nominal se voit à l'œil, les refus non.
 *
 * La section du cœur attend une demi-minute, volontairement : c'est le plancher
 * de 30 s qu'elle vérifie. `BCGLOVE_PRESSE=1` saute cette attente.
 *
 * Ce script parle au serveur, pas au code : il ne peut donc pas tourner dans
 * `npm test`, qui doit rester lançable sans rien démarrer.
 */
/** Miroir de functions/api/_limits.ts — les deux bougent ensemble. */
const SEND_COOLDOWN_MS = 30 * 1000;

const [keyA, keyB] = process.argv.slice(2);
const BASE = process.env.BCGLOVE_URL ?? 'http://localhost:8788';

if (!keyA || !keyB) {
  console.error('Usage : npm run test:api -- <clé Charleen> <clé Benito>');
  console.error('Les deux clés sont affichées par `npm run db:seed`.');
  process.exit(1);
}

let failures = 0;

async function call(key, path, init) {
  const response = await fetch(`${BASE}/api/${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${ok ? '' : ` — attendu ${expected}, reçu ${actual}`}`);
}

console.log('\nAuthentification');
check('sans clé → 401', (await call(null, 'state')).status, 401);
check('clé inconnue → 401', (await call('x'.repeat(32), 'state')).status, 401);
check('clé trop courte → 401', (await call('court', 'state')).status, 401);

console.log('\nLe cycle');
const before = await call(keyA, 'state');
check('état lisible → 200', before.status, 200);

const ask = await call(keyA, 'ask', { method: 'POST' });
check('poser la question → 201', ask.status, 201);
check('la reposer aussitôt → 409', (await call(keyA, 'ask', { method: 'POST' })).status, 409);

const incoming = await call(keyB, 'state');
check('la question est arrivée', incoming.body?.incomingAsk?.id, ask.body?.id);

const reply = await call(keyB, 'reply', {
  method: 'POST',
  body: JSON.stringify({ replyTo: ask.body.id, body: 'Oui.' }),
});
check('répondre → 201', reply.status, 201);
check(
  'répondre deux fois → 409',
  (
    await call(keyB, 'reply', {
      method: 'POST',
      body: JSON.stringify({ replyTo: ask.body.id, body: 'encore' }),
    })
  ).status,
  409,
);
check(
  'enchaîner un mot trop vite → 429',
  (await call(keyB, 'note', { method: 'POST', body: JSON.stringify({ body: 'coucou' }) })).status,
  429,
);

const after = await call(keyA, 'state');
check('la réponse est arrivée', after.body?.lastReceived?.id, reply.body?.id);
check('la question est refermée', after.body?.openAsk, null);

console.log('\nValidation des entrées');
check(
  'corps vide → 422',
  (await call(keyB, 'note', { method: 'POST', body: JSON.stringify({ body: '   ' }) })).status,
  422,
);
check(
  'corps trop long → 422',
  (await call(keyB, 'note', { method: 'POST', body: JSON.stringify({ body: 'a'.repeat(281) }) }))
    .status,
  422,
);
check(
  'répondre à une question qui n’existe pas → 404',
  (
    await call(keyB, 'reply', {
      method: 'POST',
      body: JSON.stringify({ replyTo: 999999, body: 'oui' }),
    })
  ).status,
  404,
);

/*
 * Le cœur (EF-15). Deux vérifications, et la seconde coûte une demi-minute.
 *
 * Le plancher de 30 s s'applique au cœur comme au reste — c'est justement ce
 * qu'il faut prouver (EF-15.7, « pas de spam, aucun régime de faveur »). Mais
 * du coup, pour voir passer un cœur, il faut attendre. Le script attend : une
 * vérification qui contourne la règle qu'elle est censée vérifier ne vérifie
 * rien. Passer BCGLOVE_PRESSE=1 pour sauter l'attente et ne garder que le refus.
 */
console.log('\nLe cœur');
check('un cœur trop tôt → 429', (await call(keyA, 'love', { method: 'POST' })).status, 429);

if (process.env.BCGLOVE_PRESSE) {
  console.log('  · attente du plancher sautée (BCGLOVE_PRESSE)');
} else {
  console.log(`  · attente du plancher de ${SEND_COOLDOWN_MS / 1000} s…`);
  await new Promise((resolve) => setTimeout(resolve, SEND_COOLDOWN_MS + 1500));

  const love = await call(keyA, 'love', { method: 'POST' });
  check('un cœur après le plancher → 201', love.status, 201);
  check('il a un identifiant', typeof love.body?.id, 'number');

  const seen = await call(keyB, 'state');
  // Un cœur n'a pas de corps : il ne doit PAS remplacer le dernier mot reçu,
  // qui alimente l'écran de lecture et le bandeau. Il entrera dans l'écran
  // d'accueil par lastTwo (EF-16.8), pas par ici.
  check('il ne devient pas le dernier mot reçu', seen.body?.lastReceived?.id === love.body?.id, false);

  const fil = await call(keyB, 'history');
  const dernier = fil.body?.messages?.[0];
  check('il est en tête du fil', dernier?.id, love.body?.id);
  check('de type love', dernier?.kind, 'love');
  check('et sans corps', dernier?.body ?? null, null);
}

console.log('\nHistorique');
const history = await call(keyA, 'history');
check('historique lisible → 200', history.status, 200);
check('la question et la réponse y sont', history.body?.messages?.length >= 2, true);

console.log(failures === 0 ? '\n✓ Tout passe.\n' : `\n✗ ${failures} vérification(s) en échec.\n`);
process.exit(failures === 0 ? 0 : 1);
