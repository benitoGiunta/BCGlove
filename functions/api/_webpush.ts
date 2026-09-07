/**
 * Web Push : signature VAPID (RFC 8292) et chiffrement aes128gcm (RFC 8291).
 *
 * Écrit à la main sur WebCrypto, sans dépendance. Deux raisons :
 *  - `web-push` (npm) s'appuie sur le module `crypto` de Node et ne tourne pas
 *    sur le runtime Workers ;
 *  - ces deux RFC sont figées depuis 2017. Cent cinquante lignes qu'on relit une
 *    fois valent mieux qu'une dépendance à surveiller pendant dix ans.
 *
 * L'implémentation est vérifiée contre le vecteur de test officiel de la
 * RFC 8291 §5 (voir _webpush.test.ts) : mêmes clés, même sel, même octet de
 * sortie. C'est la seule manière de savoir que c'est juste sans un vrai appareil.
 */

const encoder = new TextEncoder();

// ---------------------------------------------------------------------------
// base64url
// ---------------------------------------------------------------------------

export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

// ---------------------------------------------------------------------------
// HKDF, tel que l'utilisent les deux RFC : une seule passe d'expansion,
// donc `HMAC(prk, info || 0x01)` tronqué. Écrit explicitement plutôt que via
// `deriveBits({name:'HKDF'})`, parce que les RFC parlent en ces termes et que
// le code doit pouvoir se relire à côté du texte.
// ---------------------------------------------------------------------------

async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const imported = await crypto.subtle.importKey(
    'raw',
    key as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', imported, data as BufferSource));
}

/** HKDF-Extract : le « sel » est la clé HMAC, pas l'inverse. */
const extract = (salt: Uint8Array, ikm: Uint8Array) => hmac(salt, ikm);

/** HKDF-Expand limité à une passe (suffisant : on ne dérive jamais plus de 32 octets). */
async function expand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const output = await hmac(prk, concat(info, Uint8Array.of(1)));
  return output.slice(0, length);
}

// ---------------------------------------------------------------------------
// Clés
// ---------------------------------------------------------------------------

/**
 * Reconstruit une clé privée P-256 importable.
 *
 * WebCrypto ne sait pas importer une clé privée EC « brute » : il lui faut du
 * JWK ou du PKCS#8. Or les clés VAPID se stockent partout sous la forme
 * (point public de 65 octets, scalaire privé de 32) — on recompose donc le JWK
 * à partir des deux, `x` et `y` étant les deux moitiés du point public.
 */
async function importPrivateKey(
  publicKey: Uint8Array,
  privateKey: Uint8Array,
  usage: 'ECDH' | 'ECDSA',
): Promise<CryptoKey> {
  if (publicKey.length !== 65 || publicKey[0] !== 0x04) {
    throw new Error('clé publique attendue au format non compressé (65 octets, préfixe 0x04)');
  }
  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: toBase64Url(publicKey.slice(1, 33)),
    y: toBase64Url(publicKey.slice(33, 65)),
    d: toBase64Url(privateKey),
    ext: true,
  };
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    usage === 'ECDH' ? { name: 'ECDH', namedCurve: 'P-256' } : { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    usage === 'ECDH' ? ['deriveBits'] : ['sign'],
  );
}

// ---------------------------------------------------------------------------
// Chiffrement du contenu (RFC 8291 §3, RFC 8188 §2)
// ---------------------------------------------------------------------------

export interface EncryptInput {
  /** Le corps à chiffrer. */
  payload: Uint8Array;
  /** `p256dh` de l'abonnement : la clé publique du navigateur, 65 octets. */
  userAgentPublicKey: Uint8Array;
  /** `auth` de l'abonnement : le secret d'authentification, 16 octets. */
  authSecret: Uint8Array;
  /** Injectables pour les tests uniquement ; tirés au sort en production. */
  salt?: Uint8Array | undefined;
  senderKeys?: { publicKey: Uint8Array; privateKey: Uint8Array } | undefined;
}

/** Le corps complet d'une requête `Content-Encoding: aes128gcm`. */
export async function encryptPayload(input: EncryptInput): Promise<Uint8Array> {
  const salt = input.salt ?? crypto.getRandomValues(new Uint8Array(16));

  // Une paire éphémère PAR MESSAGE : c'est ce qui donne au chiffrement sa
  // confidentialité persistante. Ne jamais la réutiliser d'un envoi à l'autre.
  let senderPublic: Uint8Array;
  let senderPrivateKey: CryptoKey;
  if (input.senderKeys) {
    senderPublic = input.senderKeys.publicKey;
    senderPrivateKey = await importPrivateKey(
      input.senderKeys.publicKey,
      input.senderKeys.privateKey,
      'ECDH',
    );
  } else {
    const pair = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
      'deriveBits',
    ])) as CryptoKeyPair;
    // `exportKey` est typé comme une union (brut ou JWK) : en 'raw' c'est
    // toujours un ArrayBuffer.
    senderPublic = new Uint8Array(
      (await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer,
    );
    senderPrivateKey = pair.privateKey;
  }

  const userAgentKey = await crypto.subtle.importKey(
    'raw',
    input.userAgentPublicKey as BufferSource,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );

  // Les types de Cloudflare nomment ce champ `$public` ; la norme WebCrypto — et
  // workerd, et Node — attendent `public`. On écrit la norme et on redresse le type.
  const ecdhAlgorithm = { name: 'ECDH', public: userAgentKey } as unknown as Parameters<
    SubtleCrypto['deriveBits']
  >[0];

  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits(ecdhAlgorithm, senderPrivateKey, 256),
  );

  // RFC 8291 §3.4 — combinaison des clés. Le secret d'authentification sert de
  // sel, et l'« info » lie la dérivation aux DEUX clés publiques : c'est ce qui
  // empêche de rejouer un message vers un autre abonnement.
  const prkKey = await extract(input.authSecret, ecdhSecret);
  const keyInfo = concat(
    encoder.encode('WebPush: info'),
    Uint8Array.of(0),
    input.userAgentPublicKey,
    senderPublic,
  );
  const ikm = await expand(prkKey, keyInfo, 32);

  // RFC 8188 §2.2 — dérivation de la clé et du nonce du contenu.
  const prk = await extract(salt, ikm);
  const cek = await expand(prk, concat(encoder.encode('Content-Encoding: aes128gcm'), Uint8Array.of(0)), 16);
  const nonce = await expand(prk, concat(encoder.encode('Content-Encoding: nonce'), Uint8Array.of(0)), 12);

  const aesKey = await crypto.subtle.importKey('raw', cek as BufferSource, { name: 'AES-GCM' }, false, [
    'encrypt',
  ]);

  // 0x02 délimite le DERNIER enregistrement. Un seul ici : nos charges utiles
  // font quelques centaines d'octets, très en deçà de la taille d'enregistrement.
  const record = concat(input.payload, Uint8Array.of(2));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce as BufferSource }, aesKey, record as BufferSource),
  );

  // En-tête RFC 8188 : sel(16) | taille d'enregistrement(4) | longueur de clé(1) | clé publique(65)
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, 4096, false);

  return concat(salt, recordSize, Uint8Array.of(senderPublic.length), senderPublic, ciphertext);
}

// ---------------------------------------------------------------------------
// VAPID (RFC 8292)
// ---------------------------------------------------------------------------

/** Douze heures : la RFC 8292 plafonne à 24, les services de push aussi. */
const VAPID_TTL_SECONDS = 12 * 60 * 60;

/**
 * L'en-tête `Authorization` d'une requête de push.
 * `audience` est l'ORIGINE de l'endpoint, pas l'endpoint complet.
 */
export async function vapidAuthorization(options: {
  audience: string;
  subject: string;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  now?: number | undefined;
}): Promise<string> {
  const issuedAt = Math.floor((options.now ?? Date.now()) / 1000);
  const header = toBase64Url(encoder.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = toBase64Url(
    encoder.encode(
      JSON.stringify({
        aud: options.audience,
        exp: issuedAt + VAPID_TTL_SECONDS,
        sub: options.subject,
      }),
    ),
  );
  const signingInput = `${header}.${claims}`;

  const key = await importPrivateKey(options.publicKey, options.privateKey, 'ECDSA');
  // WebCrypto rend déjà la signature en (r || s) brut, qui est le format attendu
  // par ES256. Pas de DER à déballer, contrairement à OpenSSL.
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      encoder.encode(signingInput) as BufferSource,
    ),
  );

  return `vapid t=${signingInput}.${toBase64Url(signature)}, k=${toBase64Url(options.publicKey)}`;
}

/** L'origine d'un endpoint : `https://web.push.apple.com/xxx` → `https://web.push.apple.com`. */
export function audienceOf(endpoint: string): string {
  return new URL(endpoint).origin;
}
