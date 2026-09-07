import { useState } from 'react';
import { COUNTER_VISIBLE_AT, COUNTER_WARN_AT, MAX_MESSAGE } from '../lib/config.ts';
import { copy } from '../lib/copy.ts';
import { cx } from '../lib/cx.ts';
import { normalizeBody } from '../lib/truncate.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import styles from './ComposeScreen.module.css';

export interface ComposeScreenProps {
  partnerName: string;
  /** `true` quand on répond à une question, `false` pour un mot spontané (EF-4). */
  isReply: boolean;
  sending: boolean;
  errorMessage: string | null;
  onSend: (body: string) => void;
  onCancel: () => void;
}

/** Longueur en points de code : la même unité que la validation serveur. */
function length(text: string): number {
  return Array.from(text).length;
}

export function ComposeScreen({
  partnerName,
  isReply,
  sending,
  errorMessage,
  onSend,
  onCancel,
}: ComposeScreenProps) {
  const [text, setText] = useState('');
  // Un mot spontané ne répond à rien : les phrases toutes faites ne peuvent pas
  // être les mêmes que celles d'une réponse.
  const suggestions = isReply ? copy.compose.quickReplies : copy.compose.quickNotes;
  const count = length(text);
  const remaining = MAX_MESSAGE - count;
  const canSend = text.trim().length > 0 && count <= MAX_MESSAGE && !sending;

  return (
    <main className={styles.screen}>
      <Backdrop />

      <div className={styles.column}>
        <h1 className={styles.heading}>
          {isReply ? copy.compose.heading(partnerName) : copy.compose.headingNote(partnerName)}
        </h1>

        <div className={styles.card}>
          <textarea
            className={styles.field}
            value={text}
            onChange={(event) => {
              // Frappe bloquée à la limite, jamais tronquée en silence (EF-5.1).
              const next = event.target.value;
              if (length(next) <= MAX_MESSAGE) setText(next);
            }}
            placeholder={copy.compose.placeholder}
            aria-label={copy.compose.placeholder}
            maxLength={MAX_MESSAGE * 2}
            autoFocus
          />

          <div
            className={cx(
              styles.meter,
              count >= COUNTER_VISIBLE_AT && styles.meterVisible,
              count >= COUNTER_WARN_AT && styles.meterWarn,
            )}
            aria-hidden={count < COUNTER_VISIBLE_AT}
          >
            {copy.compose.remaining(remaining)}
          </div>
        </div>

        <div className={styles.quick}>
          <div className={styles.quickTitle}>{copy.compose.quickTitle}</div>
          <div className={styles.quickList}>
            {suggestions.map((phrase) => (
              <button
                key={phrase}
                type="button"
                className={styles.quickItem}
                // On insère dans le champ plutôt que d'envoyer directement :
                // une phrase toute faite doit pouvoir être retouchée avant de partir.
                onClick={() => setText(phrase)}
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <Button disabled={!canSend} onClick={() => onSend(normalizeBody(text))}>
            {sending ? copy.compose.sending : copy.compose.send}
          </Button>

          {errorMessage !== null && <p className={styles.error}>{errorMessage}</p>}

          <div className={styles.back}>
            <Button variant="quiet" onClick={onCancel} disabled={sending}>
              {copy.compose.cancel}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
