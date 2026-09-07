/**
 * L'identité, côté navigateur.
 *
 * Le lien personnel `https://…/?k=<clé>` est ouvert UNE fois. On en retient la clé,
 * on la retire de la barre d'adresse, et on ne la redemande plus jamais (EF-7).
 *
 * Aucune validation ici : c'est le serveur qui dit si la clé vaut quelque chose.
 * Ce module ne fait que la transporter.
 */

const STORAGE_KEY = 'bcglove.key.v1';

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
 * Le nettoyage compte : sans lui, la clé reste visible dans la barre d'adresse,
 * dans l'historique de Safari, et dans tout partage d'écran.
 */
export function bootstrap(): Bootstrap {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get('k');
  const openParam = url.searchParams.get('open');
  const openTarget: OpenTarget = openParam === 'reply' ? 'reply' : null;

  if (fromUrl && fromUrl.length >= 16) store(fromUrl);

  if (fromUrl || openParam) {
    url.searchParams.delete('k');
    url.searchParams.delete('open');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  return { key: fromUrl ?? readStored(), openTarget };
}

/** Reconstruit le lien personnel, pour l'écran de réglages (EF-7.4). */
export function personalLink(key: string): string {
  return `${window.location.origin}/?k=${encodeURIComponent(key)}`;
}
