import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, dayLabel, groupByDay } from './days.ts';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m, d, h).getTime();

test('la journée est locale, pas UTC', () => {
  // 23 h et 1 h le lendemain sont deux journées, quel que soit le fuseau.
  assert.notEqual(dayKey(at(2026, 8, 7, 23)), dayKey(at(2026, 8, 8, 1)));
  assert.equal(dayKey(at(2026, 8, 7, 0)), dayKey(at(2026, 8, 7, 23)));
});

test('les deux jours les plus récents portent un nom', () => {
  const now = at(2026, 8, 7);
  assert.equal(dayLabel(now, now, "Aujourd'hui", 'Hier'), "Aujourd'hui");
  assert.equal(dayLabel(at(2026, 8, 6), now, "Aujourd'hui", 'Hier'), 'Hier');
});

test('au-delà, une date, avec une majuscule et sans l’année en cours', () => {
  const now = at(2026, 8, 7);
  const recent = dayLabel(at(2026, 8, 1), now, "Aujourd'hui", 'Hier');
  assert.match(recent, /^[A-ZÀ-Ý]/, `pas de majuscule : ${recent}`);
  assert.equal(recent.includes('2026'), false, "l'année en cours est superflue");
  assert.equal(dayLabel(at(2025, 8, 1), now, "Aujourd'hui", 'Hier').includes('2025'), true);
});

test('le groupement préserve l’ordre et ne coupe pas une journée en deux', () => {
  const items = [
    { id: 3, t: at(2026, 8, 7, 18) },
    { id: 2, t: at(2026, 8, 7, 9) },
    { id: 1, t: at(2026, 8, 5, 20) },
  ];
  const groups = groupByDay(items, (i) => i.t, () => 'peu importe');
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0]?.items.map((i) => i.id), [3, 2]);
  assert.deepEqual(groups[1]?.items.map((i) => i.id), [1]);
});

test('une liste vide ne produit aucun groupe', () => {
  assert.deepEqual(groupByDay([], () => 0, () => ''), []);
});
