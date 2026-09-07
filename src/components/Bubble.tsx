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
}: BubbleProps) {
  const [expanded, setExpanded] = useState(false);

  // Seuil approché, calé sur le nombre de lignes : au-delà, le plafonnement CSS
  // prend le relais et n'a d'effet que si le texte dépasse réellement la limite.
  const mayOverflow = clampable && Array.from(text).length > maxLines * 40;
  const clamped = mayOverflow && !expanded;

  return (
    <div className={styles.wrap}>
      <div
        className={cx(styles.bubble, sizeClass(text))}
        style={{ '--bubble-lines': maxLines } as CSSProperties}
      >
        <div className={cx(styles.text, clamped && styles.clamped)}>{text}</div>
      </div>

      {clamped && (
        <button
          type="button"
          className={styles.more}
          onClick={() => (onMore ? onMore() : setExpanded(true))}
        >
          {moreLabel}
        </button>
      )}

      <span className={cx(styles.tail, styles.tailBig)} aria-hidden="true" />
      <span className={cx(styles.tail, styles.tailSmall)} aria-hidden="true" />
    </div>
  );
}
