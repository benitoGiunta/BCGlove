#!/usr/bin/env node
/**
 * Vérification de bout en bout de l'envoi Web Push, DANS le runtime Cloudflare.
 *
 *   npm run keys:vapid && npm run dev:full   (dans un terminal)
 *   npm run test:push -- <clé Charleen> <clé Benito>
 *
 * Ce que ça prouve, et que les tests unitaires ne prouvent pas :
 *  - le chiffrement et la signature marchent sur workerd, pas seulement sur Node
 *    (les deux n'ont pas exactement la même WebCrypto) ;
 *  - les en-têtes HTTP envoyés sont ceux qu'un service de push attend ;
 *  - un endpoint mort (404) est bien supprimé de la base.
 *
 * Le script joue le rôle du service de push ET celui du navigateur : il reçoit
 * la requête, la déchiffre avec la clé privée de l'abonnement, et compare.
 * La dérivation est réécrite ici du point de vue du RECEVEUR — c'est ce qui
 * rend la vérification indépendante de l'implémentation testée.
 */
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { webcrypto as wc } from 'node:crypto';

const [keyA, keyB] = process.argv.slice(2);
const BASE = process.env.BCGLOVE_URL ?? 'http://localhost:8788';
const PORT = 9099;

if (!keyA || !keyB) {
  console.error('Usage : npm run test:push -- <clé Charleen> <clé Benito>');
  process.exit(1);
}

const b64 = (b) =>
  Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => new Uint8Array(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
const cat = (...p) => {
  const out = new Uint8Array(p.reduce((n, x) => n + x.length, 0));
  let o = 0;
  for (const x of p) { out.set(x, o); o += x.length; }
  return out;
};
const hmac = async (key, data) =>
  new Uint8Array(
    await wc.subtle.sign(
      'HMAC',
      await wc.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
      data,
    ),
  );
const expand = async (prk, info, n) => (await hmac(prk, cat(info, Uint8Array.of(1)))).slice(0, n);
const utf8 = (s) => new TextEncoder().encode(s);

/** Le navigateur : une paire ECDH P-256 et un secret d'authentification de 16 octets. */
const uaPair = await wc.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
const uaPublic = new Uint8Array(await wc.subtle.exportKey('raw', uaPair.publicKey));
const authSecret = wc.getRandomValues(new Uint8Array(16));

/** Déchiffrement, côté receveur (RFC 8291 §3.4 puis RFC 8188 §2.2). */
async function decrypt(body) {
  const salt = body.slice(0, 16);
  const idlen = body[20];
  const asPublic = body.slice(21, 21 + idlen);
  const ciphertext = body.slice(21 + idlen);

  const asKey = await wc.subtle.importKey('raw', asPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await wc.subtle.deriveBits({ name: 'ECDH', public: asKey }, uaPair.privateKey, 256));

  const prkKey = await hmac(authSecret, ecdh);
  const ikm = await expand(prkKey, cat(utf8('WebPush: info'), Uint8Array.of(0), uaPublic, asPublic), 32);
  const prk = await hmac(salt, ikm);
  const cek = await expand(prk, cat(utf8('Content-Encoding: aes128gcm'), Uint8Array.of(0)), 16);
  const nonce = await expand(prk, cat(utf8('Content-Encoding: nonce'), Uint8Array.of(0)), 12);

  const aes = await wc.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['decrypt']);
  const plain = new Uint8Array(await wc.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, aes, ciphertext));
  // Le dernier octet est le délimiteur d'enregistrement (0x02).
  if (plain[plain.length - 1] !== 2) throw new Error('délimiteur de fin absent');
  return new TextDecoder().decode(plain.slice(0, -1));
}

/** Vérifie la signature VAPID avec la clé publique que l'en-tête annonce lui-même. */
async function checkVapid(header, audience) {
  const m = /^vapid t=([\w-]+\.[\w-]+)\.([\w-]+), k=([\w-]+)$/.exec(header ?? '');
  if (!m) throw new Error(`en-tête Authorization mal formé : ${header}`);
  const [, signingInput, signature, pub] = m;
  const raw = unb64(pub);
  const key = await wc.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x: b64(raw.slice(1, 33)), y: b64(raw.slice(33, 65)), ext: true },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
  const ok = await wc.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, unb64(signature), utf8(signingInput));
  if (!ok) throw new Error('signature VAPID invalide');
  const claims = JSON.parse(Buffer.from(signingInput.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
  if (claims.aud !== audience) throw new Error(`audience ${claims.aud}, attendu ${audience}`);
  if (!String(claims.sub).startsWith('mailto:')) throw new Error(`sub inattendu : ${claims.sub}`);
  return claims;
}

const received = [];
let respondWith = 201;
const server = createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    received.push({ url: req.url, headers: req.headers, body: new Uint8Array(Buffer.concat(chunks)) });
    res.writeHead(respondWith).end();
  });
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

const endpoint = `http://127.0.0.1:${PORT}/fake-push/abc`;
const sql =
  `DELETE FROM subscriptions; INSERT INTO subscriptions ` +
  `(id, user_id, endpoint, p256dh, auth, user_agent, created_at, fail_count) VALUES ` +
  `('smoke', 'charleen', '${endpoint}', '${b64(uaPublic)}', '${b64(authSecret)}', 'smoke', ${Date.now()}, 0);`;
const seeded = spawnSync('npx', ['wrangler', 'd1', 'execute', 'bcglove', '--local', '--command', sql], {
  stdio: ['ignore', 'ignore', 'inherit'],
});
if (seeded.status !== 0) { console.error('✗ impossible d’insérer l’abonnement de test'); process.exit(1); }

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${ok ? '' : ` — ${detail}`}`);
};

const waitForPush = async (n, ms = 6000) => {
  const until = Date.now() + ms;
  while (received.length < n && Date.now() < until) await new Promise((r) => setTimeout(r, 100));
  return received.length >= n;
};

console.log('\nEnvoi depuis le runtime Cloudflare');
const MESSAGE = "Oui. Chaque matin un peu plus qu'hier.";
const sent = await fetch(`${BASE}/api/note`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${keyB}`, 'content-type': 'application/json' },
  body: JSON.stringify({ body: MESSAGE }),
});
check('le message est accepté → 201', sent.status === 201, `reçu ${sent.status}`);
check('une notification est partie', await waitForPush(1), 'aucune requête reçue en 6 s');

if (received.length > 0) {
  const push = received[0];
  check('en-tête Content-Encoding', push.headers['content-encoding'] === 'aes128gcm', push.headers['content-encoding']);
  check('en-tête TTL présent', Boolean(push.headers.ttl), 'absent');
  check('en-tête Urgency', push.headers.urgency === 'high', push.headers.urgency);
  try {
    await checkVapid(push.headers.authorization, `http://127.0.0.1:${PORT}`);
    check('signature VAPID valide et audience correcte', true);
  } catch (error) { check('signature VAPID valide et audience correcte', false, String(error.message)); }
  try {
    const payload = JSON.parse(await decrypt(push.body));
    check('la charge se déchiffre', true);
    check('titre attendu', payload.t === "Benito t'a écrit ♡", payload.t);
    check('corps attendu', payload.b === MESSAGE, payload.b);
    check('tag présent', typeof payload.g === 'string' && payload.g.startsWith('msg-'), payload.g);
  } catch (error) { check('la charge se déchiffre', false, String(error.message)); }
}

/*
 * Le cœur (EF-15.3, EF-15.7). C'est ici que ça se joue vraiment : le test de
 * l'API voit un 201, mais seule cette charge DÉCHIFFRÉE dit ce qui s'affichera
 * sur l'écran verrouillé. Et c'est la seule notification de l'app dont le titre
 * ne porte pas de nom et dont le corps en porte un.
 *
 * Un seul envoi suffit à prouver le tag partagé : le tag vaut `love-<auteur>`,
 * sans l'identifiant du message, donc deux cœurs du même expéditeur portent
 * forcément la même chaîne et se remplacent. Un second envoi coûterait trente
 * secondes d'attente pour ne rien apprendre de plus.
 */
console.log('\nLe cœur');
await new Promise((r) => setTimeout(r, 31_000)); // le plancher entre deux envois
const heart = await fetch(`${BASE}/api/love`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${keyB}` },
});
check('le cœur est accepté → 201', heart.status === 201, `reçu ${heart.status}`);
check('une notification est partie', await waitForPush(2), 'aucune requête reçue en 6 s');

if (received.length > 1) {
  try {
    const payload = JSON.parse(await decrypt(received[1].body));
    check('titre sans nom, à la première personne', payload.t === "Je t'aime", payload.t);
    check('corps signé du nom de l’auteur', payload.b === '— Benito', payload.b);
    check('un seul tag pour tous les cœurs', payload.g === 'love-benito', payload.g);
  } catch (error) {
    check('la charge du cœur se déchiffre', false, String(error.message));
  }
}

console.log('\nEndpoint mort');
respondWith = 410;
await new Promise((r) => setTimeout(r, 31_000)); // le plancher entre deux envois
await fetch(`${BASE}/api/note`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${keyB}`, 'content-type': 'application/json' },
  body: JSON.stringify({ body: 'deuxième' }),
});
check('la notification est bien tentée', await waitForPush(3), 'aucune troisième requête');
await new Promise((r) => setTimeout(r, 1500));
const left = spawnSync('npx', ['wrangler', 'd1', 'execute', 'bcglove', '--local', '--json', '--command', 'SELECT COUNT(*) AS n FROM subscriptions'], { encoding: 'utf8' });
// wrangler préfixe parfois sa sortie d'avis (proxy, mise à jour disponible) :
// on repart du premier crochet plutôt que de parser le flux entier.
const jsonStart = left.stdout.indexOf('[');
const remaining =
  jsonStart === -1 ? undefined : JSON.parse(left.stdout.slice(jsonStart))[0]?.results?.[0]?.n;
check('un 410 supprime l’abonnement', remaining === 0, `il en reste ${remaining}`);

server.close();
console.log(failures === 0 ? '\n✓ Tout passe.\n' : `\n✗ ${failures} vérification(s) en échec.\n`);
process.exit(failures === 0 ? 0 : 1);
