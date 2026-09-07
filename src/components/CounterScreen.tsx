import type { ReactNode } from 'react';
import { MONOGRAM, SHOW_MONOGRAM, SHOW_SIGNATURE } from '../lib/config.ts';
import { copy } from '../lib/copy.ts';
import type { Elapsed } from '../lib/elapsed.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import { Counter } from './Counter.tsx';
import { Emblem } from './Emblem.tsx';
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
  onOpenHistory: () => void;
  onOpenSettings: () => void;
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
  onOpenHistory,
  onOpenSettings,
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
          <Emblem size="small" />
          <div className={styles.title}>{copy.header.title(viewerName)}</div>
          {SHOW_MONOGRAM && (
            <button
              type="button"
              className={styles.monogram}
              onClick={onOpenSettings}
              aria-label={copy.settings.title}
            >
              {MONOGRAM}&nbsp;&#9825;
            </button>
          )}
        </header>

        <div className={styles.middle}>
          <Counter elapsed={elapsed} isFuture={isFuture} />
        </div>

        <div className={styles.bottom}>
          {/* Hors état vide, le bandeau reste au-dessus du bouton : la zone de
              réponse a alors un message à montrer, qui passe avant. */}
          {replyState !== 'empty' && banner}

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
            banner={replyState === 'empty' ? banner : undefined}
          />

          {SHOW_SIGNATURE && (
            <div className={styles.signature}>{copy.signature(partnerName)}</div>
          )}

          <div className={styles.links}>
            <Button variant="quiet" onClick={onWriteNote}>
              {copy.ask.note}
            </Button>
            <span className={styles.linkSeparator} aria-hidden="true">
              ·
            </span>
            <Button variant="quiet" onClick={onOpenHistory}>
              {copy.history.open}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
