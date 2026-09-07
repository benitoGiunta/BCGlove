#!/usr/bin/env node
/**
 * Produit les icônes PNG à partir de scripts/icon-template.html, en les rendant
 * dans Chromium via Playwright.
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
const template = pathToFileURL(resolve('scripts/icon-template.html')).href;
const out = resolve('public/icons');
mkdirSync(out, { recursive: true });

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
  await page.goto(template, { waitUntil: 'networkidle' });
  await page.evaluate((s) => {
    document.documentElement.style.setProperty('--scale', String(s));
  }, scale);
  await page.screenshot({ path: `${out}/${name}.png` });
  await page.close();
  console.log(`${name}.png — ${size}×${size}`);
}

await browser.close();
