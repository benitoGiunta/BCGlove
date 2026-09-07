#!/usr/bin/env node
/**
 * Efface les données laissées par une vérification, et réarme les séquences de
 * première ouverture.
 *
 *   npm run db:clean -- --yes             (base locale)
 *   npm run db:clean:prod -- --yes        (production)
 *
 * POURQUOI ÇA EXISTE. Les vérifications écrivent de vraies données. `test:api`
 * pose une question et y répond, ce qui consomme aussi les deux séquences de
 * première ouverture. Et si l'on teste les notifications depuis un navigateur
 * d'ordinateur, celui-ci laisse un abonnement en base qui continuerait à sonner
 * longtemps après.
 *
 * Trois choses à remettre à zéro, donc : les messages, les séquences de première
 * ouverture, et les abonnements.
 *
 * Supprimer les abonnements est sans danger : au lancement suivant, chaque app
 * dont la permission est accordée réenregistre le sien toute seule (usePush).
 *
 * À lancer APRÈS les vérifications, AVANT d'installer l'app sur les téléphones.
 *
 * DESTRUCTIF : efface TOUS les messages. Ne jamais le lancer sur une base qui
 * contient de vrais échanges — d'où le --yes obligatoire.
 */
import { firstJson, runWrangler } from './wrangler.mjs';

const args = process.argv.slice(2);
const remote = args.includes('--remote');
const confirmed = args.includes('--yes');
const where = remote ? '--remote' : '--local';

function d1(command, json = false) {
  const result = runWrangler(
    ['d1', 'execute', 'bcglove', where, ...(json ? ['--json'] : []), '--command', command],
    { capture: true },
  );
  if (!result.ok) {
    console.error(`\n${result.message}\n`);
    process.exit(1);
  }
  return result.stdout;
}

const counts = firstJson(
  d1('SELECT (SELECT COUNT(*) FROM messages) AS m, (SELECT COUNT(*) FROM subscriptions) AS s', true),
)?.[0]?.results?.[0] ?? { m: 0, s: 0 };

if (!confirmed) {
  console.log(`\n  Base : ${remote ? 'PRODUCTION' : 'locale'}\n`);
  console.log(`  ${counts.m} message(s) seraient effacés`);
  console.log(`  ${counts.s} abonnement(s) aux notifications seraient effacés`);
  console.log('  les deux séquences de première ouverture seraient réarmées\n');
  console.log('  Rien n’a été fait. Pour confirmer, relancez avec --yes :');
  console.log(`    npm run ${remote ? 'db:clean:prod' : 'db:clean'} -- --yes\n`);
  process.exit(0);
}

d1('DELETE FROM messages; DELETE FROM subscriptions; UPDATE users SET first_open_at = NULL;');

console.log(`\n✓ ${counts.m} message(s) effacé(s).`);
console.log(`✓ ${counts.s} abonnement(s) effacé(s) — chaque app réenregistrera le sien`);
console.log('  toute seule à son prochain lancement.');
console.log('✓ Les deux séquences de première ouverture rejoueront.\n');
console.log('  N’ouvrez plus l’app avant d’avoir installé les deux téléphones.\n');
