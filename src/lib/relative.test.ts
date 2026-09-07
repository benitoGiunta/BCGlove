import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relative } from './relative.ts';

const at = (y: number, m: number, d: number, h = 12, mi = 0) =>
  new Date(y, m, d, h, mi).getTime();

test('moins d’une minute : « à l’instant »', () => {
  const now = at(2025, 5, 14, 12, 0);
  assert.equal(relative(now - 30_000, now), "à l'instant");
});

test('minutes puis heures, dans la même journée', () => {
  const now = at(2025, 5, 14, 12, 0);
  assert.equal(relative(at(2025, 5, 14, 11, 48), now), 'il y a 12 min');
  assert.equal(relative(at(2025, 5, 14, 8, 0), now), 'il y a 4 h');
});

test('« hier soir » après 18 h, « hier » avant', () => {
  const now = at(2025, 5, 14, 10, 0);
  assert.equal(relative(at(2025, 5, 13, 21, 0), now), 'hier soir');
  assert.equal(relative(at(2025, 5, 13, 9, 0), now), 'hier');
});

test('jours puis semaines, avec accord', () => {
  const now = at(2025, 5, 14);
  assert.equal(relative(at(2025, 5, 11), now), 'il y a 3 jours');
  assert.equal(relative(at(2025, 5, 6), now), 'il y a 1 semaine');
  assert.equal(relative(at(2025, 4, 25), now), 'il y a 2 semaines');
});
