import { useState } from 'react';
import type { Gesture } from '../lib/api.ts';
import { copy } from '../lib/copy.ts';
import { cx } from '../lib/cx.ts';
import { exact, relative } from '../lib/relative.ts';
import { Bubble } from './Bubble.tsx';
import { Pill } from './Pill.tsx';
import styles from './GesturePair.module.css';

export interface GesturePairProps {
  /** Un ou deux gestes, du plus ancien au plus récent. Jamais plus (EF-16.1). */
  gestures: Gesture[];
  now: number;
  /** Ouvre l'écran de lecture pour le geste dont le texte ne tient pas. */
  onReadMore: (id: number) => void;
}

/**
 * Les deux derniers gestes de l'échange (EF-16).
 *
 * La règle qui gouverne tout : **l'apparence suit l'AUTEUR, pas la place**. Il
 * n'y a pas « la ligne de l'autre » et « la mienne ». Deux gestes de la même
 * personne donnent donc deux bulles du même côté et de la même couleur, et
 * c'est normal — les trois cas d'EF-16.2 sont trois cas normaux.
 *
 * Un seul horodatage, sous la paire, aligné du côté du geste le plus récent
 * (EF-16.7) : deux horodatages pour deux gestes à quelques minutes d'écart
 * feraient un tableau de bord, pas une conversation.
 */
export function GesturePair({ gestures, now, onReadMore }: GesturePairProps) {
  const [showExact, setShowExact] = useState(false);
  const latest = gestures[gestures.length - 1];
  if (!latest) return null;

  /*
   * Le plafond dépend du NOMBRE de gestes, et c'est une mesure qui l'a décidé.
   * EF-16.6 disait trois lignes — hérité du temps où il n'y avait qu'une bulle,
   * qui avait toute la place. À deux, trois lignes chacune débordent de 25 px
   * sur un iPhone 15 Pro et de 3 px sur un 16 Pro : ça ne tient pas, même sur
   * les vrais appareils. Deux lignes chacune quand ils sont deux, trois quand
   * il n'y en a qu'un. Le plafond existe pour que ça rentre ; il suit donc ce
   * qui rentre, pas un nombre écrit d'avance.
   */
  const maxLines = gestures.length > 1 ? 2 : 3;

  return (
    <div className={styles.pair} aria-live="polite">
      {gestures.map((gesture) => (
        <div
          key={gesture.id}
          className={cx(styles.row, gesture.mine ? styles.right : styles.left)}
        >
          {gesture.kind === 'love' ? (
            <Pill text={copy.love.said} />
          ) : (
            <Bubble
              text={gesture.body ?? ''}
              variant="oriented"
              side={gesture.mine ? 'right' : 'left'}
              tone={gesture.mine ? 'edged' : 'filled'}
              /* Au-delà, la suite se lit sur l'écran de lecture (EF-16.6) :
                 un message de 280 caractères pousserait les liens du bas sous
                 le bord. */
              maxLines={maxLines}
              onMore={() => onReadMore(gesture.id)}
            />
          )}
        </div>
      ))}

      <div className={cx(styles.row, latest.mine ? styles.right : styles.left)}>
        <button
          type="button"
          className={styles.stamp}
          onClick={() => setShowExact((v) => !v)}
          title={exact(latest.createdAt)}
        >
          {showExact ? exact(latest.createdAt) : relative(latest.createdAt, now)}
        </button>
      </div>
    </div>
  );
}
