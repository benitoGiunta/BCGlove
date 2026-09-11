import type { ReactNode } from 'react';
import { MONOGRAM, SHOW_MONOGRAM } from '../lib/config.ts';
import { copy } from '../lib/copy.ts';
import type { Elapsed } from '../lib/elapsed.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import { Counter } from './Counter.tsx';
import { Emblem } from './Emblem.tsx';
import { HeartButton } from './HeartButton.tsx';
import { ProofCounter } from './ProofCounter.tsx';
import { ReplyArea } from './ReplyArea.tsx';
import styles from './CounterScreen.module.css';

export interface CounterScreenProps {
  /** Celui qui regarde. Son nom est dans le header, en dédicace. */
  viewerName: string;
  /** L'autre. Son nom est dans le libellé du bouton et dans l'attente. */
  partnerName: string;
  elapsed: Elapsed;
  isFuture: boolean;
  now: number;
  replyState: 'empty' | 'waiting' | 'incoming' | 'answered';
  replyText?: string | undefined;
  answeredAt?: number | undefined;
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
          {/* Hors état vide, le bandeau reste au-dessus du bouton : la zone de
              réponse a alors un message à montrer, qui passe avant. */}
          {replyState !== 'empty' && banner}

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
