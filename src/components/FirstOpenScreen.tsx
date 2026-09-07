import { copy } from '../lib/copy.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import { Emblem } from './Emblem.tsx';
import styles from './FirstOpenScreen.module.css';

export interface FirstOpenScreenProps {
  onContinue: () => void;
}

/**
 * Le tout premier écran, une seule fois dans la vie de l'app (EF-10).
 *
 * La phrase attend qu'on la touche — elle ne s'efface pas d'elle-même. L'écran
 * entier est la cible ; l'indication n'apparaît qu'après un moment, le temps de
 * lire, et sert aussi de bouton pour les lecteurs d'écran, à qui « toucher
 * n'importe où » ne dit rien.
 */
export function FirstOpenScreen({ onContinue }: FirstOpenScreenProps) {
  return (
    <main className={styles.screen} onClick={onContinue}>
      <Backdrop />
      <div className={styles.mark}>
        <Emblem size="large" />
        <p className={styles.line}>{copy.firstOpen.line}</p>
      </div>
      <div className={styles.hint}>
        <Button variant="quiet" onClick={onContinue}>
          {copy.firstOpen.hint}
        </Button>
      </div>
    </main>
  );
}
