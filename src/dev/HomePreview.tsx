import { useState } from 'react';
import type { Gesture } from '../lib/api.ts';
import { CounterScreen } from '../components/CounterScreen.tsx';
import { NotificationPrompt } from '../components/NotificationPrompt.tsx';
import { elapsed } from '../lib/elapsed.ts';
import { LOVE_START } from '../lib/config.ts';
import styles from './HomePreview.module.css';

const NOW = Date.parse('2026-09-11T20:37:29');

const COURT = 'Oui.';
const MOYEN = "Oui. Chaque matin un peu plus qu'hier.";
const LONG =
  "Oui, et je le redirai demain, et tous les jours d'après, et encore le jour où j'aurai " +
  'oublié comment on dit les choses.';

const geste = (
  id: number,
  mine: boolean,
  body: string | null,
  kind: Gesture['kind'],
  ago: number,
): Gesture => ({ id, kind, mine, body, createdAt: NOW - ago });

type Case = {
  label: string;
  replyState: 'empty' | 'waiting' | 'incoming';
  gestures?: Gesture[];
  banner?: boolean;
  /** Zéro masque la ligne : c'est un état à voir, pas un cas limite oublié. */
  proofCount?: number;
};

/**
 * Les états de l'ÉCRAN d'accueil complet, à sa vraie hauteur.
 *
 * La galerie voisine montre les primitives une à une ; celle-ci sert à l'autre
 * question, celle qui a coûté le plus de temps sur ce projet : est-ce que
 * l'écran TIENT, de 874 px à 629 px, dans chacun de ses états ? Elle existe
 * pour se superposer à `design/refonte-v2/Main.dc.html`.
 *
 * Les trois derniers cas sont les plus HAUTS, et donc les seuls qui décident.
 * Ne jamais les retirer de la liste.
 */
const CASES: Case[] = [
  { label: 'au repos', replyState: 'empty' },
  { label: 'compteur à zéro', replyState: 'empty', proofCount: 0 },
  { label: 'compteur à quatre chiffres', replyState: 'empty', proofCount: 1284 },
  { label: 'question posée, en attente', replyState: 'waiting' },
  { label: 'question reçue', replyState: 'incoming' },
  {
    label: 'un seul geste, reçu',
    replyState: 'empty',
    gestures: [geste(1, false, MOYEN, 'reply', 40_000)],
  },
  {
    label: 'un de chacun — une rose, une crème',
    replyState: 'empty',
    gestures: [geste(1, false, COURT, 'reply', 9 * 60_000), geste(2, true, MOYEN, 'note', 40_000)],
  },
  {
    label: 'deux de l’autre — deux roses à gauche',
    replyState: 'empty',
    gestures: [
      geste(1, false, 'Tu me manques.', 'note', 12 * 60_000),
      geste(2, false, COURT, 'reply', 30_000),
    ],
  },
  {
    label: 'deux de moi — deux crème à droite',
    replyState: 'empty',
    gestures: [
      geste(1, true, 'Je rentre tôt ce soir.', 'note', 20 * 60_000),
      geste(2, true, COURT, 'reply', 60_000),
    ],
  },
  {
    label: 'un cœur reçu et un mot envoyé',
    replyState: 'empty',
    gestures: [geste(1, false, null, 'love', 5 * 60_000), geste(2, true, MOYEN, 'note', 20_000)],
  },
  {
    label: 'deux cœurs, un de chacun',
    replyState: 'empty',
    gestures: [geste(1, false, null, 'love', 6 * 60_000), geste(2, true, null, 'love', 15_000)],
  },
  {
    label: 'deux gestes longs, sans bandeau',
    replyState: 'empty',
    gestures: [geste(1, false, LONG, 'reply', 9 * 60_000), geste(2, true, LONG, 'note', 40_000)],
  },
  {
    label: 'bandeau + question posée',
    replyState: 'waiting',
    banner: true,
  },
  {
    label: 'bandeau + deux gestes courts',
    replyState: 'empty',
    banner: true,
    gestures: [geste(1, false, COURT, 'reply', 9 * 60_000), geste(2, true, COURT, 'note', 40_000)],
  },
  {
    label: 'bandeau + deux gestes longs — le pire cas',
    replyState: 'empty',
    banner: true,
    gestures: [geste(1, false, LONG, 'reply', 9 * 60_000), geste(2, true, LONG, 'note', 40_000)],
  },
];

export function HomePreview() {
  const [index, setIndex] = useState(0);
  const [beat, setBeat] = useState(0);
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
        proofCount={current.proofCount ?? 47}
        loveBeat={beat}
        onLove={() => setBeat((n) => n + 1)}
        replyState={current.replyState}
        gestures={current.gestures ?? []}
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
