/**
 * L'identité, côté navigateur.
 *
 * Le lien personnel `https://…/?k=<clé>` est ouvert UNE fois. On en retient la clé,
 * on la retire de la barre d'adresse, et on ne la redemande plus jamais (EF-7).
 *
 * Aucune validation ici : c'est le serveur qui dit si la clé vaut quelque chose.
 * Ce module ne fait que la transporter.
 */

import { environment } from './standalone.ts';

const STORAGE_KEY = 'bcglove.key.v1';

/** Une clé personnelle fait 32 caractères d'un alphabet réduit (voir seed-users.mjs). */
const KEY_PATTERN = /^[a-z2-9]{16,128}$/;

/** L'écran sur lequel ouvrir l'app, quand on arrive depuis une notification. */
export type OpenTarget = 'reply' | null;

export interface Bootstrap {
  key: string | null;
  openTarget: OpenTarget;
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Navigation privée, stockage refusé : on continue sans mémoire.
    return null;
  }
}

function store(key: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
  } catch {
    /* sans effet : la clé restera valable pour cette session seulement */
  }
}

export function forget(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sans effet */
  }
}

/**
 * Résout l'identité au démarrage, et nettoie l'URL.
 *
 * LA CLÉ N'EST RETIRÉE DE L'ADRESSE QU'UNE FOIS L'APP INSTALLÉE. Tant qu'on est
 * dans Safari, elle doit y rester : « Sur l'écran d'accueil » enregistre l'URL
 * telle qu'elle est au moment du geste, et une URL nettoyée donnerait une icône
 * qui ouvre l'app sans identité. C'est exactement le bug qu'on a vu — d'autant
 * que l'app installée a son propre stockage, séparé de celui de Safari : elle ne
 * retrouve pas la clé mémorisée dans le navigateur.
 *
 * En mode autonome il n'y a plus de barre d'adresse, donc plus rien à cacher :
 * on nettoie, et le stockage prend le relais.
 */
export function bootstrap(): Bootstrap {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get('k');
  const openParam = url.searchParams.get('open');
  const openTarget: OpenTarget = openParam === 'reply' ? 'reply' : null;

  if (fromUrl && KEY_PATTERN.test(fromUrl)) store(fromUrl);

  const installed = environment() === 'standalone';
  if (openParam || (fromUrl && installed)) {
    if (installed) url.searchParams.delete('k');
    url.searchParams.delete('open');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  return { key: fromUrl ?? readStored(), openTarget };
}

/**
 * Extrait une clé d'un lien collé, ou d'une clé collée seule.
 * Renvoie `null` si ça n'y ressemble pas — on ne devine pas.
 */
export function extractKey(input: string): string | null {
  const trimmed = input.trim();
  if (KEY_PATTERN.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const key = parsed.searchParams.get('k');
    if (key && KEY_PATTERN.test(key)) return key;
  } catch {
    /* ce n'était pas une URL */
  }

  return null;
}

/** Mémorise une clé saisie à la main, depuis l'écran de reprise. */
export function remember(key: string): void {
  store(key);
}

/** Reconstruit le lien personnel, pour l'écran de réglages (EF-7.4). */
export function personalLink(key: string): string {
  return `${window.location.origin}/?k=${encodeURIComponent(key)}`;
}
