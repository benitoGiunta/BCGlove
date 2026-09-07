#!/usr/bin/env node
/**
 * Génère la paire de clés VAPID. À faire UNE SEULE FOIS dans la vie du projet.
 *
 *   npm run keys:vapid
 *
 * Écrit `.dev.vars` (git-ignoré) pour le développement local, et affiche les
 * commandes à lancer pour la production. La clé privée n'entre jamais dans le
 * dépôt : la perdre oblige à régénérer la paire et à réabonner les deux
 * appareils — la ranger dans un gestionnaire de mots de passe évite ça.
 */
import { webcrypto } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';

const toBase64Url = (bytes) =>
  Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const pair = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
  'sign',
  'verify',
]);

// Le format universel des clés VAPID : point public non compressé de 65 octets,
// scalaire privé de 32. C'est ce que `functions/api/_webpush.ts` sait recomposer.
const publicKey = toBase64Url(await webcrypto.subtle.exportKey('raw', pair.publicKey));
const jwk = await webcrypto.subtle.exportKey('jwk', pair.privateKey);
const privateKey = jwk.d;

const subject = process.argv[2] ?? 'mailto:benito@example.com';

const contents = `# Secrets de développement. Git-ignoré, ne jamais versionner.
# Généré par npm run keys:vapid le ${new Date().toISOString().slice(0, 10)}.
VAPID_PUBLIC_KEY=${publicKey}
VAPID_PRIVATE_KEY=${privateKey}
VAPID_SUBJECT=${subject}
`;

if (existsSync('.dev.vars')) {
  console.log('\n⚠ .dev.vars existe déjà — il n’a PAS été écrasé.');
  console.log('  Supprimez-le d’abord si vous voulez vraiment de nouvelles clés.\n');
} else {
  writeFileSync('.dev.vars', contents, 'utf8');
  console.log('\n✓ .dev.vars écrit (développement local).');
}

console.log('\n────────────────────────────────────────────────────────');
console.log('  Clés VAPID. La privée ne doit sortir d’ici que vers un');
console.log('  gestionnaire de mots de passe et les secrets Cloudflare.');
console.log('────────────────────────────────────────────────────────\n');
console.log(`  VAPID_PUBLIC_KEY  ${publicKey}`);
console.log(`  VAPID_PRIVATE_KEY ${privateKey}`);
console.log(`  VAPID_SUBJECT     ${subject}\n`);
console.log('  Pour la production, lancez les trois commandes puis collez la');
console.log('  valeur correspondante quand elle est demandée :\n');
for (const name of ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT']) {
  console.log(`    npx wrangler pages secret put ${name} --project-name bcglove`);
}
console.log('');
