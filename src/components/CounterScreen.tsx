import { MONOGRAM, SHOW_MONOGRAM, SHOW_SIGNATURE } from '../lib/config.ts';
import { copy } from '../lib/copy.ts';
import type { Elapsed } from '../lib/elapsed.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import { Counter } from './Counter.tsx';
import { ReplyArea } from './ReplyArea.tsx';
import styles from './CounterScreen.module.css';

export interface CounterScreenProps {
  partnerName: string;
  elapsed: Elapsed;
  isFuture: boolean;
  now: number;
  replyState: 'empty' | 'waiting' | 'answered';
  replyText?: string | undefined;
  answeredAt?: number | undefined;
  jolt: number;
  onAsk: () => void;
}

/**
 * L'écran principal. Il ne calcule rien et n'appelle rien : il reçoit tout et
 * rend. Toute la logique vit dans les hooks appelés par App.
 */
export function CounterScreen({
  partnerName,
  elapsed,
  isFuture,
  now,
  replyState,
  replyText,
  answeredAt,
  jolt,
  onAsk,
}: CounterScreenProps) {
  return (
    <main className={styles.screen}>
      <Backdrop />

      <div className={styles.column}>
        <header className={styles.header}>
          <div className={styles.title}>{copy.header.title(partnerName)}</div>
          {SHOW_MONOGRAM && (
            <div className={styles.monogram} aria-hidden="true">
              {MONOGRAM}&nbsp;&#9825;
            </div>
          )}
        </header>

        <div className={styles.middle}>
          <Counter elapsed={elapsed} isFuture={isFuture} />
        </div>

        <div className={styles.bottom}>
          <Button onClick={onAsk} aria-label={copy.ask.buttonLabel(partnerName)}>
            {copy.ask.button}
          </Button>

          <ReplyArea
            state={replyState}
            partnerName={partnerName}
            text={replyText}
            answeredAt={answeredAt}
            now={now}
            jolt={jolt}
          />

          {SHOW_SIGNATURE && (
            <div className={styles.signature}>{copy.signature(partnerName)}</div>
          )}
        </div>
      </div>
    </main>
  );
}
