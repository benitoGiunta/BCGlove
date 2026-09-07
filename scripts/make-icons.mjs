#!/usr/bin/env node
/**
 * Produit les icônes ET les écrans de démarrage PNG, en rendant les gabarits
 * de ce dossier dans Chromium via Playwright.
 *
 * Ce n'est pas un script du quotidien : il ne tourne que lorsque l'icône change.
 * Playwright n'est pas une dépendance du projet — passer son chemin en argument :
 *
 *   node scripts/make-icons.mjs /chemin/vers/playwright
 */
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const [, , playwrightPath, executablePath] = process.argv;
if (!playwrightPath) {
  console.error('Usage : node scripts/make-icons.mjs <chemin/playwright> [<chemin/chromium>]');
  process.exit(1);
}

const { chromium } = await import(playwrightPath);
const iconTemplate = pathToFileURL(resolve('scripts/icon-template.html')).href;
const splashTemplate = pathToFileURL(resolve('scripts/splash-template.html')).href;
const out = resolve('public/icons');
mkdirSync(out, { recursive: true });

/**
 * Les tailles d'écran de démarrage iOS, en points CSS et densité.
 * iOS n'accepte QUE la taille exacte de l'appareil : une taille approchante
 * n'est pas affichée du tout, elle est ignorée en silence.
 */
const SPLASHES = [
  ['splash-402x874', 402, 874, 3],   // iPhone 16 Pro
  ['splash-440x956', 440, 956, 3],   // iPhone 16 Pro Max
  ['splash-393x852', 393, 852, 3],   // iPhone 14 Pro, 15, 16
  ['splash-430x932', 430, 932, 3],   // iPhone 14 Pro Max, 15 Plus, 16 Plus
  ['splash-390x844', 390, 844, 3],   // iPhone 12, 13, 14
  ['splash-428x926', 428, 926, 3],   // iPhone 12 Pro Max, 13 Pro Max
  ['splash-375x812', 375, 812, 3],   // iPhone X, XS, 11 Pro
  ['splash-375x667', 375, 667, 2],   // iPhone SE
];

const browser = await chromium.launch(executablePath ? { executablePath } : {});

for (const [name, size, scale] of [
  ['icon-180', 180, 1],
  ['icon-192', 192, 1],
  ['icon-512', 512, 1],
  // « maskable » : le contenu doit tenir dans les 80 % centraux, le système
  // rognant le reste selon la forme de l'appareil.
  ['maskable-512', 512, 0.72],
]) {
  const page = await browser.newPage({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: size / 512,
  });
  await page.goto(iconTemplate, { waitUntil: 'networkidle' });
  await page.evaluate((s) => {
    document.documentElement.style.setProperty('--scale', String(s));
  }, scale);
  await page.screenshot({ path: `${out}/${name}.png` });
  await page.close();
  console.log(`${name}.png — ${size}×${size}`);
}

for (const [name, width, height, density] of SPLASHES) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: density,
  });
  await page.goto(splashTemplate, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/${name}.png` });
  await page.close();
  console.log(`${name}.png — ${width * density}×${height * density}`);
}

await browser.close();
