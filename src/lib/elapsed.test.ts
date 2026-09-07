import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elapsed, plural, ZERO } from './elapsed.ts';

test('compte en mois calendaires, pas en tranches de 30 jours', () => {
  // Du 31 janvier au 1er mars : 1 mois et 1 jour, pas 29 jours.
  const e = elapsed(new Date(2024, 0, 31), new Date(2024, 2, 1));
  assert.equal(e.months, 1);
  assert.equal(e.days, 1);
});

test('emprunte le bon nombre de jours au mois précédent', () => {
  // Février 2024 compte 29 jours (année bissextile).
  const e = elapsed(new Date(2024, 0, 15), new Date(2024, 2, 10));
  assert.equal(e.months, 1);
  assert.equal(e.days, 24); // 15 janv. → 15 févr. → +24 j = 10 mars
});

test('un anniversaire exact ne laisse aucun reste', () => {
  const e = elapsed(new Date(2019, 5, 14, 18, 30, 0), new Date(2025, 5, 14, 18, 30, 0));
  assert.deepEqual(e, { years: 6, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test('reporte les retenues en cascade jusqu’aux années', () => {
  // Une seconde avant l'anniversaire : tout doit descendre d'un cran.
  const e = elapsed(new Date(2019, 5, 14, 18, 30, 0), new Date(2025, 5, 14, 18, 29, 59));
  assert.equal(e.years, 5);
  assert.equal(e.months, 11);
  assert.equal(e.hours, 23);
  assert.equal(e.minutes, 59);
  assert.equal(e.seconds, 59);
});

test('le 29 février s’anniversarise au 28, pas la veille d’un an', () => {
  // Le jour où l'on fête, le compteur doit dire « 1 an » — pas « 11 mois et 30 jours ».
  const e = elapsed(new Date(2024, 1, 29, 12, 0, 0), new Date(2025, 1, 28, 12, 0, 0));
  assert.equal(e.years, 1);
  assert.equal(e.months, 0);
  assert.equal(e.days, 0);
});

test('après l’écrêtage, le compte reprend sans reculer', () => {
  const e = elapsed(new Date(2024, 1, 29, 12, 0, 0), new Date(2025, 2, 1, 12, 0, 0));
  assert.equal(e.years, 1);
  assert.equal(e.months, 0);
  assert.equal(e.days, 1);
});

test('ne rend jamais de composante négative, sur trois ans de dates', () => {
  const from = new Date(2019, 5, 14, 18, 30, 0);
  const cursor = new Date(2024, 0, 1, 7, 3, 11);
  for (let i = 0; i < 1100; i += 1) {
    const e = elapsed(from, cursor);
    for (const [k, v] of Object.entries(e)) {
      assert.ok(v >= 0, `${k} négatif au ${cursor.toDateString()} : ${v}`);
    }
    assert.ok(e.months < 12, `mois hors bornes : ${e.months}`);
    assert.ok(e.days < 32, `jours hors bornes : ${e.days}`);
    cursor.setDate(cursor.getDate() + 1);
  }
});

test('une date future rend zéro plutôt qu’un négatif', () => {
  assert.deepEqual(elapsed(new Date(2030, 0, 1), new Date(2025, 0, 1)), ZERO);
});

test('accord français : 0 et 1 au singulier', () => {
  assert.equal(plural(0, 'jour', 'jours'), 'jour');
  assert.equal(plural(1, 'jour', 'jours'), 'jour');
  assert.equal(plural(2, 'jour', 'jours'), 'jours');
});
