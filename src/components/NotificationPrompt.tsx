import { copy } from '../lib/copy.ts';
import { Button } from './Button.tsx';
import styles from './NotificationPrompt.module.css';

export interface NotificationPromptProps {
  variant: 'askable' | 'denied';
  onEnable: () => void;
  onDismiss: () => void;
}

/**
 * L'invitation à activer les notifications, en bandeau au-dessus du bouton.
 *
 * Pas une modale : le compteur est ce que l'app est censée montrer en premier, et
 * rien ne doit se mettre devant. Le bouton « Activer » déclenche
 * `requestPermission()` DEPUIS LE CLIC — c'est la seule manière que Safari accepte.
 */
export function NotificationPrompt({ variant, onEnable, onDismiss }: NotificationPromptProps) {
  if (variant === 'denied') {
    return (
      <div className={styles.banner}>
        <p className={styles.denied}>
          {copy.notifications.denied[0]}
          <br />
          {copy.notifications.denied[1]}
        </p>
        <div className={styles.actions}>
          <Button variant="quiet" onClick={onDismiss}>
            {copy.notifications.dismiss}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <p className={styles.text}>{copy.notifications.body}</p>
      <div className={styles.actions}>
        <Button variant="quiet" onClick={onDismiss}>
          {copy.notifications.later}
        </Button>
        <button type="button" className={styles.enable} onClick={onEnable}>
          {copy.notifications.enable}
        </button>
      </div>
    </div>
  );
}
