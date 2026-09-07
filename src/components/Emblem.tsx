import { useState } from 'react';
import { cx } from '../lib/cx.ts';
import styles from './Emblem.module.css';

export interface EmblemProps {
  size: 'small' | 'large';
}

/**
 * Les deux oursons — l'emblème du couple.
 *
 * Purement décoratif : `alt=""` et `aria-hidden`, un lecteur d'écran l'ignore.
 * S'il manque, le composant ne rend rien plutôt qu'une icône d'image cassée :
 * une absence discrète vaut mieux qu'un accroc au milieu de la DA.
 */
export function Emblem({ size }: EmblemProps) {
  const [missing, setMissing] = useState(false);
  if (missing) return null;

  return (
    <img
      src="/images/nous.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cx(styles.emblem, size === 'small' ? styles.small : styles.large)}
      onError={() => setMissing(true)}
    />
  );
}
