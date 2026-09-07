import { useState } from 'react';
import { copy } from '../lib/copy.ts';
import { exact, relative } from '../lib/relative.ts';
import { cx } from '../lib/cx.ts';
import { Bubble } from './Bubble.tsx';
import styles from './ReplyArea.module.css';

export interface ReplyAreaProps {
  /** `null` tant qu'aucune question n'a été posée. */
  state: 'empty' | 'waiting' | 'answered';
  partnerName: string;
  /** Le texte de la réponse, quand `state` vaut 'answered'. */
  text?: string | undefined;
  answeredAt?: number | undefined;
  now: number;
  /** Incrémenté à chaque appui pendant l'attente : rejoue le sursaut du cœur. */
  jolt: number;
}

/**
 * Les trois états de la zone de réponse, à hauteur constante.
 * `aria-live="polite"` : l'arrivée d'une réponse est annoncée sans interrompre.
 */
export function ReplyArea({
  state,
  partnerName,
  text,
  answeredAt,
  now,
  jolt,
}: ReplyAreaProps) {
  const [showExact, setShowExact] = useState(false);

  return (
    <div className={styles.area} aria-live="polite">
      {state === 'empty' && (
        <div className={styles.stack}>
          <p className={styles.empty}>{copy.ask.empty}</p>
        </div>
      )}

      {state === 'waiting' && (
        <div className={styles.stack}>
          <p className={styles.waiting}>
            <span
              // La clé change à chaque sursaut : React remonte l'élément,
              // ce qui rejoue l'animation depuis son début.
              key={jolt}
              className={cx(styles.heart, jolt > 0 && styles.heartJolt)}
              aria-hidden="true"
            />
            {copy.ask.waiting(partnerName)}
          </p>
        </div>
      )}

      {state === 'answered' && text !== undefined && (
        <div className={styles.stack}>
          <Bubble text={text} />
          {answeredAt !== undefined && (
            <button
              type="button"
              className={styles.stamp}
              onClick={() => setShowExact((v) => !v)}
              title={exact(answeredAt)}
            >
              {showExact ? exact(answeredAt) : relative(answeredAt, now)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
