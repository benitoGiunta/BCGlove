import { useState } from 'react';
import { cx } from '../lib/cx.ts';
import styles from './Emblem.module.css';

export interface EmblemProps {
  size: 'small' | 'large';
  /**
   * Quand il est fourni, l'emblème devient un BOUTON (EF-18.1) : même dessin,
   * mêmes pixels visibles, mais la zone tactile minimale d'iOS autour. Sans
   * lui il reste ce qu'il a toujours été — une image décorative qu'un lecteur
   * d'écran ignore.
   */
  onPress?: (() => void) | undefined;
  /** Le nom du bouton. Obligatoire dès qu'il y a un `onPress`. */
  label?: string | undefined;
}

/**
 * Les deux oursons — l'emblème du couple.
 *
 * Purement décoratif : `alt=""` et `aria-hidden`, un lecteur d'écran l'ignore.
 * S'il manque, le composant ne rend rien plutôt qu'une icône d'image cassée :
 * une absence discrète vaut mieux qu'un accroc au milieu de la DA.
 */
export function Emblem({ size, onPress, label }: EmblemProps) {
  const [missing, setMissing] = useState(false);
  // Si l'image manque, le bouton disparaît AVEC elle (EF-18.2) : un bouton
  // fantôme, invisible mais tappable, serait pire que l'accroc qu'on évite.
  if (missing) return null;

  const image = (
    <img
      src="/images/nous.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cx(styles.emblem, size === 'small' ? styles.small : styles.large)}
      onError={() => setMissing(true)}
    />
  );

  if (!onPress) return image;

  return (
    <button type="button" className={styles.button} aria-label={label} onClick={onPress}>
      {image}
    </button>
  );
}
