import { useState, type ReactNode } from 'react';
import { copy } from '../lib/copy.ts';
import { exact, relative } from '../lib/relative.ts';
import { cx } from '../lib/cx.ts';
import { Bubble } from './Bubble.tsx';
import styles from './ReplyArea.module.css';

export interface ReplyAreaProps {
  /**
   * empty    — rien n'a encore été posé
   * waiting  — j'ai posé la question, l'autre n'a pas répondu
   * incoming — l'autre m'a posé la question, c'est à moi de répondre
   * answered — un mot est arrivé
   */
  state: 'empty' | 'waiting' | 'incoming' | 'answered';
  partnerName: string;
  /** Le texte de la réponse, quand `state` vaut 'answered'. */
  text?: string | undefined;
  answeredAt?: number | undefined;
  now: number;
  /** Incrémenté à chaque appui pendant l'attente : rejoue le sursaut du cœur. */
  jolt: number;
  /** Ouvre l'écran de lecture quand le message ne tient pas en trois lignes. */
  onReadMore?: (() => void) | undefined;
  /**
   * L'invitation à activer les notifications. Elle prend la place du texte
   * d'attente quand il n'y a rien encore : c'est ce qui la rend gratuite en
   * hauteur sur l'écran, au moment précis — le premier lancement — où elle est
   * la plus utile.
   */
  banner?: ReactNode;
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
  onReadMore,
  banner,
}: ReplyAreaProps) {
  const [showExact, setShowExact] = useState(false);

  return (
    <div className={styles.area} aria-live="polite">
      {state === 'empty' && (
        <div className={styles.stack}>{banner ?? <p className={styles.empty}>{copy.ask.empty}</p>}</div>
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

      {state === 'incoming' && (
        <div className={styles.stack}>
          <p className={styles.waiting}>
            <span className={styles.heart} aria-hidden="true" />
            {copy.ask.incoming(partnerName)}
          </p>
        </div>
      )}

      {state === 'answered' && text !== undefined && (
        <div className={styles.stack}>
          {/* Trois lignes sur cet écran : au-delà, le message pousserait la
              signature hors de l'écran. La suite se lit à part. */}
          <Bubble text={text} maxLines={3} onMore={onReadMore} />
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
