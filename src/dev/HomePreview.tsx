import { useState } from 'react';
import { CounterScreen } from '../components/CounterScreen.tsx';
import { NotificationPrompt } from '../components/NotificationPrompt.tsx';
import { elapsed } from '../lib/elapsed.ts';
import { LOVE_START } from '../lib/config.ts';
import styles from './HomePreview.module.css';

const NOW = Date.parse('2026-09-11T20:37:29');

type Case = {
  label: string;
  replyState: 'empty' | 'waiting' | 'incoming' | 'answered';
  replyText?: string;
  banner?: boolean;
};

/**
 * Les états de l'ÉCRAN d'accueil complet, à sa vraie hauteur.
 *
 * La galerie voisine montre les primitives une à une ; celle-ci sert à l'autre
 * question, celle qui a coûté le plus de temps sur ce projet : est-ce que
 * l'écran TIENT, de 874 px à 629 px, dans chacun de ses états ? Elle existe
 * pour se superposer à `design/refonte-v2/Main.dc.html`.
 */
const LONG =
  "Oui, et je le redirai demain, et tous les jours d'après, et encore le jour où j'aurai oublié comment on dit les choses.";

const CASES: Case[] = [
  { label: 'au repos', replyState: 'empty' },
  { label: 'au repos, bandeau de notification', replyState: 'empty', banner: true },
  { label: 'question posée, en attente', replyState: 'waiting' },
  { label: 'question reçue', replyState: 'incoming' },
  {
    label: 'réponse courte',
    replyState: 'answered',
    replyText: 'Oui.',
  },
  {
    label: 'réponse de trois lignes',
    replyState: 'answered',
    replyText: LONG,
  },
  // Les deux cas les plus HAUTS, et donc les seuls qui décident : hors état
  // vide, le bandeau se rend au-dessus du bouton au lieu de se loger dans la
  // zone de réponse (voir CounterScreen). Il s'ajoute alors à ce qu'elle
  // contient déjà. Ne jamais retirer ces deux états de la liste : c'est sur
  // eux que se vérifie la tenue de l'écran.
  { label: 'bandeau + question posée', replyState: 'waiting', banner: true },
  { label: 'bandeau + réponse de trois lignes', replyState: 'answered', replyText: LONG, banner: true },
];

export function HomePreview() {
  const [index, setIndex] = useState(0);
  const current = CASES[index] ?? CASES[0]!;

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        {CASES.map((item, i) => (
          <button
            key={item.label}
            type="button"
            className={i === index ? styles.on : styles.off}
            onClick={() => setIndex(i)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <CounterScreen
        viewerName="Benito"
        partnerName="Charleen"
        elapsed={elapsed(new Date(LOVE_START), new Date(NOW))}
        isFuture={false}
        now={NOW}
        replyState={current.replyState}
        replyText={current.replyText}
        answeredAt={current.replyState === 'answered' ? NOW - 40_000 : undefined}
        jolt={0}
        onAsk={() => {}}
        onWriteNote={() => {}}
        onReadMore={() => {}}
        onOpenHistory={() => {}}
        onOpenSettings={() => {}}
        banner={
          current.banner ? (
            <NotificationPrompt variant="askable" onEnable={() => {}} onDismiss={() => {}} />
          ) : undefined
        }
      />
    </div>
  );
}
