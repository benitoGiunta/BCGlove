import type { ReactNode } from 'react';
import { copy } from '../lib/copy.ts';
import { cx } from '../lib/cx.ts';
import styles from './ExchangeStatus.module.css';

export interface ExchangeStatusProps {
  /**
   * empty    — rien n'a encore été posé, ou rien à montrer
   * waiting  — j'ai posé la question, l'autre n'a pas répondu
   * incoming — l'autre m'a posé la question, c'est à moi de répondre
   */
  state: 'empty' | 'waiting' | 'incoming';
  partnerName: string;
  /** Incrémenté à chaque appui pendant l'attente : rejoue le sursaut du cœur. */
  jolt: number;
  /**
   * L'invitation à activer les notifications. Elle prend la place du texte
   * d'attente quand il n'y a rien d'autre : c'est ce qui la rend la moins
   * coûteuse au moment précis — le premier lancement — où elle est la plus
   * utile.
   */
  banner?: ReactNode;
}

/**
 * Où en est l'échange, en une ligne.
 *
 * Ce composant s'appelait `ReplyArea` et portait aussi la réponse reçue. Depuis
 * EF-16, les gestes reçus et envoyés vivent dans `GesturePair` : il ne reste ici
 * que les trois états où il n'y a rien à montrer mais quelque chose à dire.
 * C'est `CounterScreen` qui choisit entre les deux.
 *
 * `aria-live="polite"` : un changement d'état s'annonce sans interrompre.
 */
export function ExchangeStatus({ state, partnerName, jolt, banner }: ExchangeStatusProps) {
  return (
    <div className={styles.area} aria-live="polite">
      {state === 'empty' && (
        <div className={styles.stack}>
          {banner ?? <p className={styles.empty}>{copy.ask.empty}</p>}
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

      {state === 'incoming' && (
        <div className={styles.stack}>
          <p className={styles.waiting}>
            <span className={styles.heart} aria-hidden="true" />
            {copy.ask.incoming(partnerName)}
          </p>
        </div>
      )}
    </div>
  );
}
