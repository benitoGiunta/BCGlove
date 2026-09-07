import type { ReactNode } from 'react';
import { MONOGRAM, SHOW_MONOGRAM, SHOW_SIGNATURE } from '../lib/config.ts';
import { copy } from '../lib/copy.ts';
import type { Elapsed } from '../lib/elapsed.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import { Counter } from './Counter.tsx';
import { ReplyArea } from './ReplyArea.tsx';
import styles from './CounterScreen.module.css';

export interface CounterScreenProps {
  /** Celui qui regarde. Son nom est dans le header, en dédicace. */
  viewerName: string;
  /** L'autre. Son nom est dans la signature et dans l'attente. */
  partnerName: string;
  elapsed: Elapsed;
  isFuture: boolean;
  now: number;
  replyState: 'empty' | 'waiting' | 'incoming' | 'answered';
  replyText?: string | undefined;
  answeredAt?: number | undefined;
  jolt: number;
  onAsk: () => void;
  onWriteNote: () => void;
  onReadMore: () => void;
  /** Le bandeau d'activation des notifications, quand il y a lieu de le montrer. */
  banner?: ReactNode;
}

/**
 * L'écran principal. Il ne calcule rien et n'appelle rien : il reçoit tout et
 * rend. Toute la logique vit dans les hooks appelés par App.
 */
export function CounterScreen({
  viewerName,
  partnerName,
  elapsed,
  isFuture,
  now,
  replyState,
  replyText,
  answeredAt,
  jolt,
  onAsk,
  onWriteNote,
  onReadMore,
  banner,
}: CounterScreenProps) {
  // Quand l'autre a posé la question, le bouton principal cesse de demander et
  // se met à répondre : un seul bouton, deux rôles selon le moment.
  const answering = replyState === 'incoming';
  return (
    <main className={styles.screen}>
      <Backdrop />

      <div className={styles.column}>
        <header className={styles.header}>
          <div className={styles.title}>{copy.header.title(viewerName)}</div>
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
          {banner}

          <Button
            onClick={onAsk}
            aria-label={answering ? undefined : copy.ask.buttonLabel(partnerName)}
          >
            {answering ? copy.ask.answerButton(partnerName) : copy.ask.button}
          </Button>

          <ReplyArea
            state={replyState}
            partnerName={partnerName}
            text={replyText}
            answeredAt={answeredAt}
            now={now}
            jolt={jolt}
            onReadMore={onReadMore}
          />

          {SHOW_SIGNATURE && (
            <div className={styles.signature}>{copy.signature(partnerName)}</div>
          )}

          <div className={styles.note}>
            <Button variant="quiet" onClick={onWriteNote}>
              {copy.ask.note}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
