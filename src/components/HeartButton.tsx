import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../lib/cx.ts';
import styles from './HeartButton.module.css';

export interface HeartButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Le bouton n'a pas de libellé visible — le cœur EST le libellé. Il lui faut
   * donc un nom pour qui ne le voit pas.
   */
  label: string;
  /**
   * Incrémenté à chaque appui : rejoue le battement. Il porte sur le cœur et
   * non sur le bouton, pour que l'élément focalisé ne soit jamais remonté — un
   * appui au clavier perdrait sinon le focus.
   */
  beat?: number | undefined;
}

/**
 * Le bouton cœur (EF-15.1).
 *
 * Un rond de la hauteur du bouton principal, posé à sa droite. Il ne pose pas
 * de question, il affirme : d'où la forme, qui n'est pas celle d'une pilule, et
 * l'absence de mot. Crème bordé plutôt que bordeaux plein — un aplat de plus
 * aurait fait deux boutons de même poids, et il n'y en a qu'un de principal.
 */
export function HeartButton({ label, beat = 0, className, ...rest }: HeartButtonProps) {
  return (
    <button type="button" aria-label={label} {...rest} className={cx(styles.heart, className)}>
      <span key={beat} className={cx(styles.mark, beat > 0 && styles.beat)}>
        <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
          <path
            d="M12 20.4c-.3 0-.6-.1-.8-.3C7 16.4 3.2 13 3.2 9.2 3.2 6.4 5.4 4.2 8.1 4.2c1.5
               0 2.9.7 3.9 1.9 1-1.2 2.4-1.9 3.9-1.9 2.7 0 4.9 2.2 4.9 5 0 3.8-3.8 7.2-8
               10.9-.2.2-.5.3-.8.3z"
          />
        </svg>
      </span>
    </button>
  );
}
