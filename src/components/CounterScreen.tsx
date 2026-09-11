import type { ReactNode } from 'react';
import { MONOGRAM, SHOW_MONOGRAM } from '../lib/config.ts';
import { copy } from '../lib/copy.ts';
import type { Gesture } from '../lib/api.ts';
import type { Elapsed } from '../lib/elapsed.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import { Counter } from './Counter.tsx';
import { Emblem } from './Emblem.tsx';
import { ExchangeStatus } from './ExchangeStatus.tsx';
import { GesturePair } from './GesturePair.tsx';
import { HeartButton } from './HeartButton.tsx';
import { ProofCounter } from './ProofCounter.tsx';
import styles from './CounterScreen.module.css';

export interface CounterScreenProps {
  /** Celui qui regarde. Son nom est dans le header, en dédicace. */
  viewerName: string;
  /** L'autre. Son nom est dans le libellé du bouton et dans l'attente. */
  partnerName: string;
  elapsed: Elapsed;
  isFuture: boolean;
  now: number;
  /**
   * Où en est l'échange. `answered` n'existe plus : depuis EF-16, une réponse
   * reçue n'est plus un état de la zone, c'est un geste parmi `gestures`.
   */
  replyState: 'empty' | 'waiting' | 'incoming';
  /** Les deux derniers gestes, du plus ancien au plus récent (EF-16.1). */
  gestures: Gesture[];
  jolt: number;
  /**
   * Le compteur des preuves (EF-14) : les gestes reçus, tous types confondus.
   * À zéro, la ligne ne s'affiche pas du tout — « 0 je t'aime reçus » serait
   * exactement la pression que ce compteur ne doit pas exercer.
   */
  proofCount: number;
  /** Incrémenté à chaque appui sur le cœur : rejoue son battement. */
  loveBeat: number;
  onAsk: () => void;
  onLove: () => void;
  onWriteNote: () => void;
  /** Ouvre l'écran de lecture pour le geste dont le texte ne tient pas. */
  onReadMore: (id: number) => void;
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
  gestures,
  jolt,
  proofCount,
  loveBeat,
  onAsk,
  onLove,
  onWriteNote,
  onReadMore,
  onOpenHistory,
  onOpenSettings,
  banner,
}: CounterScreenProps) {
  // Quand l'autre a posé la question, le bouton principal cesse de demander et
  // se met à répondre : un seul bouton, deux rôles selon le moment.
  const answering = replyState === 'incoming';

  // Quand une question est en l'air, c'est ELLE que l'écran doit dire : la paire
  // de gestes attend son tour. Sinon les gestes prennent la place, et il ne
  // reste la ligne d'état que s'il n'y a encore rien à montrer.
  const status = replyState !== 'empty' || gestures.length === 0;
  return (
    <main className={styles.screen}>
      <Backdrop />

      <div className={styles.column}>
        {/* Une seule ligne (EF-13.1) : l'identité du couple à gauche, la
            dédicace à celui qui regarde à droite. Empilés, l'emblème, le titre
            et le monogramme coûtaient 60 px de hauteur — c'est cette place qui
            paie le bouton cœur, le compteur des preuves et la seconde bulle. */}
        <header className={styles.header}>
          <div className={styles.identity}>
            <Emblem size="small" />
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
          </div>
          <div className={styles.title}>{copy.header.title(viewerName)}</div>
        </header>

        <div className={styles.middle}>
          <Counter elapsed={elapsed} isFuture={isFuture} />
        </div>

        {proofCount > 0 && (
          <ProofCounter count={proofCount} label={copy.proof.label(proofCount)} />
        )}

        <div className={styles.bottom}>
          {/* Le bandeau ne se loge en bas que s'il n'y a rien d'autre à y
              mettre. Dès qu'il y a un geste à montrer ou une question en l'air,
              il remonte au-dessus du bouton — ce qui lui coûte sa hauteur. */}
          {!(status && replyState === 'empty') && banner}

          {/* Le bouton principal se rétrécit, le cœur prend la place libérée
              (EF-15.1). Ni surimpression, ni seconde ligne : une ligne, deux
              gestes, et un seul des deux est principal. */}
          <div className={styles.actions}>
            <Button
              className={styles.ask}
              onClick={onAsk}
              aria-label={answering ? undefined : copy.ask.buttonLabel(partnerName)}
            >
              {answering ? copy.ask.answerButton(partnerName) : copy.ask.button}
            </Button>

            <HeartButton label={copy.love.button} beat={loveBeat} onClick={onLove} />
          </div>

          {/* Le surplus de l'écran tombe ici (EF-13.7) : l'espace qui
              sépare les messages du bouton est donc le plus grand de l'écran
              par construction, sur tous les appareils. */}
          <div className={styles.messages}>
            {status ? (
              <ExchangeStatus
                state={replyState}
                partnerName={partnerName}
                jolt={jolt}
                banner={replyState === 'empty' ? banner : undefined}
              />
            ) : (
              <GesturePair gestures={gestures} now={now} onReadMore={onReadMore} />
            )}
          </div>

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
