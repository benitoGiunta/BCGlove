import { cx } from '../lib/cx.ts';
import styles from './Digits.module.css';

export interface DigitsProps {
  /** La valeur à afficher, déjà mise en forme (« 07 », « 2 »). */
  value: string;
  className?: string | undefined;
}

/**
 * Affiche un nombre caractère par caractère, chacun dans une cellule de largeur
 * fixe. La `key` porte la valeur du caractère : React remonte l'élément quand le
 * chiffre change, ce qui rejoue le fondu — et seulement pour les chiffres qui
 * ont bougé.
 */
export function Digits({ value, className }: DigitsProps) {
  return (
    <span className={cx(styles.row, className)} aria-hidden="true">
      {Array.from(value).map((char, index) => (
        <span key={`${index}-${char}`} className={styles.cell}>
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  );
}
