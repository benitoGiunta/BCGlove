/**
 * Où tourne l'app, et ce que ça autorise.
 *
 * Tout le volet notification en dépend : sur iPhone, une web-app ne peut
 * s'abonner aux notifications QUE si elle a été ajoutée à l'écran d'accueil.
 * Dans un onglet Safari, `Notification.requestPermission()` échoue — d'où un
 * écran d'installation plutôt qu'un bouton qui ne marcherait pas (EF-8.2).
 */

export type Environment =
  /** Ajoutée à l'écran d'accueil : tout est possible. */
  | 'standalone'
  /** Safari sur iPhone, en onglet : il faut d'abord installer. */
  | 'ios-browser'
  /** Un navigateur qui ne sait pas installer (Chrome iOS, navigateur intégré). */
  | 'ios-other-browser'
  /** Ordinateur, Android : les notifications marchent sans installer. */
  | 'other';

function isIos(): boolean {
  // Un iPad récent s'annonce comme un Mac : on le reconnaît à son écran tactile.
  return (
    /iphone|ipod|ipad/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  // Deux signaux, parce que le premier est propre à Safari et le second standard.
  const legacy = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return legacy || window.matchMedia('(display-mode: standalone)').matches;
}

export function environment(): Environment {
  if (isStandalone()) return 'standalone';
  if (!isIos()) return 'other';
  // Safari est le SEUL navigateur iOS capable d'ajouter à l'écran d'accueil.
  // Chrome, Firefox et les navigateurs intégrés (Instagram, WhatsApp) affichent
  // « CriOS », « FxiOS » ou rien d'exploitable.
  const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
  return isSafari ? 'ios-browser' : 'ios-other-browser';
}

/** Les notifications sont-elles seulement envisageables ici ? */
export function canSubscribe(): boolean {
  const env = environment();
  return (
    (env === 'standalone' || env === 'other') &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}
