import { copy } from '../lib/copy.ts';
import { exact, relative } from '../lib/relative.ts';
import { Backdrop } from './Backdrop.tsx';
import { Bubble } from './Bubble.tsx';
import { Button } from './Button.tsx';
import styles from './MessageScreen.module.css';

export interface MessageScreenProps {
  partnerName: string;
  text: string;
  createdAt: number;
  now: number;
  onBack: () => void;
}

/**
 * Un message, en entier, sans rien autour.
 *
 * L'écran compteur plafonne la bulle à trois lignes pour ne pas déborder ; ce
 * qui dépasse se lit ici. C'était ça ou rendre l'écran principal défilant, ce qui
 * aurait poussé le compteur hors de vue à l'ouverture — le contraire de ce que
 * l'app est censée montrer en premier.
 */
export function MessageScreen({
  partnerName,
  text,
  createdAt,
  now,
  onBack,
}: MessageScreenProps) {
  return (
    <main className={styles.screen}>
      <Backdrop />

      <div className={styles.column}>
        <div className={styles.from}>{copy.message.from(partnerName)}</div>

        <div className={styles.middle}>
          <Bubble text={text} clampable={false} />
          <div className={styles.stamp} title={exact(createdAt)}>
            {relative(createdAt, now)}
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="quiet" onClick={onBack}>
            {copy.message.back}
          </Button>
        </div>
      </div>
    </main>
  );
}
