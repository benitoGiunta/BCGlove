import { useState } from 'react';
import { cx } from '../lib/cx.ts';
import styles from './Bubble.module.css';

export interface BubbleProps {
  text: string;
  /** Passe à `false` dans l'historique, où chaque bulle est déjà courte. */
  clampable?: boolean | undefined;
  moreLabel?: string | undefined;
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
export function Bubble({ text, clampable = true, moreLabel = 'lire la suite' }: BubbleProps) {
  const [expanded, setExpanded] = useState(false);

  // Un seuil approché suffit : au-delà, le plafonnement CSS prend le relais et
  // n'a d'effet que si le texte dépasse réellement quatre lignes.
  const mayOverflow = clampable && Array.from(text).length > 160;
  const clamped = mayOverflow && !expanded;

  return (
    <div className={styles.wrap}>
      <div className={cx(styles.bubble, sizeClass(text))}>
        <div className={cx(styles.text, clamped && styles.clamped)}>{text}</div>
      </div>

      {clamped && (
        <button type="button" className={styles.more} onClick={() => setExpanded(true)}>
          {moreLabel}
        </button>
      )}

      <span className={cx(styles.tail, styles.tailBig)} aria-hidden="true" />
      <span className={cx(styles.tail, styles.tailSmall)} aria-hidden="true" />
    </div>
  );
}
