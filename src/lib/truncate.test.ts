import { test } from 'node:test';
import assert from 'node:assert/strict';
import { truncate, normalizeBody } from './truncate.ts';

test('laisse intact un texte plus court que la limite', () => {
  assert.equal(truncate('Oui.', 110), 'Oui.');
});

test('coupe sur une frontière de mot', () => {
  const out = truncate('Oui, et je le redirai demain, et tous les jours après', 30);
  assert.ok(out.endsWith('…'));
  assert.ok(!out.includes('deman…'), `coupe au milieu d'un mot : ${out}`);
});

test('ne coupe pas un caractère composé en deux', () => {
  // 4 emojis composés = 4 points de code perçus, bien plus d'unités UTF-16.
  const out = truncate('♡♡♡♡♡♡♡♡', 5);
  assert.ok(!out.includes('�'));
  assert.ok(Array.from(out).length <= 5);
});

test('ne laisse pas de ponctuation orpheline avant les points de suspension', () => {
  assert.ok(!truncate('Je t’aime, et puis voilà, vraiment', 15).includes(',…'));
});

test('réduit les lignes vides multiples à une seule', () => {
  assert.equal(normalizeBody('a\n\n\n\nb'), 'a\n\nb');
});
