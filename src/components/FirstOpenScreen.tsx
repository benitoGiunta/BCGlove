import { copy } from '../lib/copy.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import styles from './FirstOpenScreen.module.css';

export interface FirstOpenScreenProps {
  onSkip: () => void;
}

/**
 * Le tout premier écran, une seule fois dans la vie de l'app (EF-10).
 *
 * L'écran entier est cliquable pour passer : on ne bloque personne devant une
 * animation. Le bouton n'est là que pour ceux qui ne devineraient pas qu'on
 * peut toucher — et pour les lecteurs d'écran, à qui « toucher n'importe où »
 * ne dit rien.
 */
export function FirstOpenScreen({ onSkip }: FirstOpenScreenProps) {
  return (
    <main className={styles.screen} onClick={onSkip}>
      <Backdrop />
      <p className={styles.line}>{copy.firstOpen.line}</p>
      <div className={styles.skip}>
        <Button variant="quiet" onClick={onSkip}>
          {copy.firstOpen.skip}
        </Button>
      </div>
    </main>
  );
}
