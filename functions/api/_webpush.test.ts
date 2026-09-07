import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  audienceOf,
  encryptPayload,
  fromBase64Url,
  toBase64Url,
  vapidAuthorization,
} from './_webpush.ts';

/**
 * Le vecteur de test officiel de la RFC 8291 §5 et de son annexe A.
 *
 * C'est LA vérification qui compte : sans un vrai appareil, seule la
 * reproduction octet pour octet de l'exemple de la norme prouve que le
 * chiffrement est juste. Une implémentation qui se contenterait de se
 * déchiffrer elle-même passerait le test tout en étant fausse — il suffirait
 * de se tromper de la même manière des deux côtés.
 */
const RFC8291 = {
  plaintext: 'When I grow up, I want to be a watermelon',
  authSecret: 'BTBZMqHH6r4Tts7J_aSIgg',
  receiverPublic:
    'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
  senderPublic:
    'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8',
  senderPrivate: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
  salt: 'DGv6ra1nlYgDCS1FRnbzlw',
  body:
    'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27ml' +
    'mlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPT' +
    'pK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN',
};

test('reproduit octet pour octet l’exemple de chiffrement de la RFC 8291', async () => {
  const encrypted = await encryptPayload({
    payload: new TextEncoder().encode(RFC8291.plaintext),
    userAgentPublicKey: fromBase64Url(RFC8291.receiverPublic),
    authSecret: fromBase64Url(RFC8291.authSecret),
    salt: fromBase64Url(RFC8291.salt),
    senderKeys: {
      publicKey: fromBase64Url(RFC8291.senderPublic),
      privateKey: fromBase64Url(RFC8291.senderPrivate),
    },
  });

  assert.equal(toBase64Url(encrypted), RFC8291.body);
});

test('l’en-tête aes128gcm est bien formé', async () => {
  const encrypted = await encryptPayload({
    payload: new TextEncoder().encode('coucou'),
    userAgentPublicKey: fromBase64Url(RFC8291.receiverPublic),
    authSecret: fromBase64Url(RFC8291.authSecret),
  });

  assert.equal(encrypted.length > 16 + 4 + 1 + 65, true, 'le corps doit dépasser son en-tête');
  const view = new DataView(encrypted.buffer, encrypted.byteOffset);
  assert.equal(view.getUint32(16, false), 4096, 'taille d’enregistrement');
  assert.equal(encrypted[20], 65, 'longueur de la clé publique');
  assert.equal(encrypted[21], 0x04, 'point non compressé');
});

test('deux envois du même message donnent deux corps différents', async () => {
  const input = {
    payload: new TextEncoder().encode('identique'),
    userAgentPublicKey: fromBase64Url(RFC8291.receiverPublic),
    authSecret: fromBase64Url(RFC8291.authSecret),
  };
  const first = toBase64Url(await encryptPayload(input));
  const second = toBase64Url(await encryptPayload(input));
  // Sel et paire éphémère tirés au sort à chaque envoi : c'est ce qui donne au
  // chiffrement sa confidentialité persistante.
  assert.notEqual(first, second);
});

test('base64url fait l’aller-retour, y compris sans remplissage', () => {
  for (const length of [1, 2, 3, 16, 32, 65]) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    assert.deepEqual(fromBase64Url(toBase64Url(bytes)), bytes);
  }
  assert.equal(toBase64Url(Uint8Array.of(0xff, 0xfe)).includes('='), false, 'pas de remplissage');
  assert.equal(/[+/]/.test(toBase64Url(Uint8Array.of(0xfb, 0xff))), false, 'alphabet URL');
});

test('l’en-tête VAPID est un JWT ES256 signé, vérifiable avec la clé publique', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ]);
  const publicKey = new Uint8Array(
    (await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer,
  );
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const privateKey = fromBase64Url(jwk.d as string);

  const header = await vapidAuthorization({
    audience: 'https://web.push.apple.com',
    subject: 'mailto:benito@example.com',
    publicKey,
    privateKey,
    now: 1_700_000_000_000,
  });

  const match = /^vapid t=([\w-]+\.[\w-]+)\.([\w-]+), k=([\w-]+)$/.exec(header);
  assert.ok(match, `en-tête mal formé : ${header}`);
  const signingInput = match[1] as string;
  const signature = match[2] as string;
  const advertisedKey = match[3] as string;

  assert.equal(advertisedKey, toBase64Url(publicKey), 'la clé annoncée est la clé publique');

  const parts = signingInput.split('.');
  const decodedHeader = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[0] as string)));
  const claims = JSON.parse(new TextDecoder().decode(fromBase64Url(parts[1] as string)));
  assert.deepEqual(decodedHeader, { typ: 'JWT', alg: 'ES256' });
  assert.equal(claims.aud, 'https://web.push.apple.com');
  assert.equal(claims.sub, 'mailto:benito@example.com');
  assert.equal(claims.exp, 1_700_000_000 + 12 * 60 * 60, 'expiration à douze heures');

  const valid = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    pair.publicKey,
    fromBase64Url(signature) as BufferSource,
    new TextEncoder().encode(signingInput) as BufferSource,
  );
  assert.equal(valid, true, 'la signature doit se vérifier avec la clé publique annoncée');
});

test('l’audience est l’origine de l’endpoint, jamais l’endpoint entier', () => {
  assert.equal(
    audienceOf('https://web.push.apple.com/QLJ8k2s9Hn4uY?x=1'),
    'https://web.push.apple.com',
  );
});
