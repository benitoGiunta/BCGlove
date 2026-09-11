import { useState, type CSSProperties } from 'react';
import { cx } from '../lib/cx.ts';
import styles from './Bubble.module.css';

export interface BubbleProps {
  text: string;
  /** Passe à `false` là où le message doit être lu en entier. */
  clampable?: boolean | undefined;
  /** Nombre de lignes avant plafonnement. */
  maxLines?: number | undefined;
  moreLabel?: string | undefined;
  /**
   * `featured` (défaut) suit la maquette, `thread` est l'allure de l'historique,
   * `oriented` celle de l'écran d'accueil : texte aligné à gauche comme dans le
   * fil, mais les deux points reviennent, et miroités (EF-16.4).
   */
  variant?: 'featured' | 'thread' | 'oriented' | undefined;
  /**
   * De quel côté la bulle se pose, et donc de quel côté descendent ses deux
   * points. Pure géométrie : la primitive ne sait pas qui écrit, c'est
   * l'appelant qui traduit l'auteur en côté (EF-16.2).
   */
  side?: 'left' | 'right' | undefined;
  /**
   * `filled` rose plein, `outlined` crème à bordure pâle (un mot spontané dans
   * le fil, EF-4.3), `edged` crème à bordure franche (un geste envoyé sur
   * l'écran d'accueil, EF-16.3).
   */
  tone?: 'filled' | 'outlined' | 'edged' | undefined;
  /**
   * Quand il est fourni, « lire la suite » APPELLE ceci au lieu de déplier sur
   * place. C'est ce qui permet à l'écran compteur d'ouvrir un écran de lecture
   * plutôt que de laisser le message déborder sous la signature.
   */
  onMore?: (() => void) | undefined;
}

/** Choisit la taille de police d'après la longueur du message (EF-5.4). */
function sizeClass(text: string): string | undefined {
  const length = Array.from(text).length;
  if (length <= 60) return styles.short;
  if (length <= 140) return styles.medium;
  return styles.long;
}

/**
 * La bulle de réponse. Primitive muette : elle ne connaît ni l'expéditeur, ni la
 * date, ni le réseau — juste un texte à porter joliment.
 */
export function Bubble({
  text,
  clampable = true,
  maxLines = 4,
  moreLabel = 'lire la suite',
  onMore,
  variant = 'featured',
  side = 'left',
  tone = 'filled',
}: BubbleProps) {
  const thread = variant === 'thread';
  const oriented = variant === 'oriented';
  const right = side === 'right';
  const [expanded, setExpanded] = useState(false);

  // Seuil approché, calé sur le nombre de lignes : au-delà, le plafonnement CSS
  // prend le relais et n'a d'effet que si le texte dépasse réellement la limite.
  const mayOverflow = clampable && Array.from(text).length > maxLines * 40;
  const clamped = mayOverflow && !expanded;

  // Sur l'écran d'accueil, une bulle tronquée s'ouvre en la touchant, sans
  // bouton sous elle : voir `.tappable` dans le CSS — c'est une décision de
  // hauteur autant que d'ergonomie.
  const tappable = oriented && clamped && onMore !== undefined;

  const skin = cx(
    styles.bubble,
    sizeClass(text),
    (thread || oriented) && styles.thread,
    tone === 'outlined' && styles.outlined,
    tone === 'edged' && styles.edged,
  );
  const lines = { '--bubble-lines': maxLines } as CSSProperties;
  const body = <div className={cx(styles.text, clamped && styles.clamped)}>{text}</div>;

  return (
    <div className={cx(styles.wrap, thread && styles.wrapThread, oriented && styles.wrapOriented)}>
      {tappable ? (
        <button
          type="button"
          className={cx(skin, styles.tappable)}
          style={lines}
          aria-label={moreLabel}
          onClick={() => onMore?.()}
        >
          {body}
        </button>
      ) : (
        <div className={skin} style={lines}>
          {body}
        </div>
      )}

      {clamped && !tappable && (
        <button
          type="button"
          className={styles.more}
          onClick={() => (onMore ? onMore() : setExpanded(true))}
        >
          {moreLabel}
        </button>
      )}

      {!thread && (
        <>
          <span
            className={cx(
              styles.tail,
              styles.tailBig,
              right && styles.tailRight,
              tone === 'edged' && styles.tailEdged,
            )}
            aria-hidden="true"
          />
          <span
            className={cx(
              styles.tail,
              styles.tailSmall,
              right && styles.tailRight,
              tone === 'edged' && styles.tailEdged,
            )}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}
