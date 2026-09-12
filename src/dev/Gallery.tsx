import { useState, type ReactNode } from 'react';
import type { Gesture } from '../lib/api.ts';
import { Bubble } from '../components/Bubble.tsx';
import { Emblem } from '../components/Emblem.tsx';
import { Button } from '../components/Button.tsx';
import { Counter } from '../components/Counter.tsx';
import { HeartButton } from '../components/HeartButton.tsx';
import { Pill } from '../components/Pill.tsx';
import { ProofCounter } from '../components/ProofCounter.tsx';
import { UnionModal } from '../components/UnionModal.tsx';
import { ExchangeStatus } from '../components/ExchangeStatus.tsx';
import { GesturePair } from '../components/GesturePair.tsx';
import { copy } from '../lib/copy.ts';
import { elapsed, ZERO } from '../lib/elapsed.ts';
import styles from './Gallery.module.css';

const NOW = Date.parse('2026-09-07T21:00:00');

const SHORT = 'Oui.';
const MEDIUM = "Oui. Chaque matin un peu plus qu'hier.";
const LONG =
  "Oui, et je le redirai demain, et tous les jours d'après, et encore le jour où " +
  "j'aurai oublié comment on dit les choses, parce que ça, ça ne s'oublie pas — " +
  'ça reste quelque part sous les mots, tout au fond, bien au chaud.';

/**
 * Les paires de gestes de la galerie. Écrites à la main : on veut voir les
 * trois cas d'apparence d'EF-16.2 sans avoir à les provoquer en base.
 */
const geste = (
  id: number,
  mine: boolean,
  body: string | null,
  kind: Gesture['kind'] = body === null ? 'love' : 'note',
  ago = 0,
): Gesture => ({ id, kind, mine, body, createdAt: NOW - ago });

const PAIRE_MIXTE: Gesture[] = [
  geste(1, false, SHORT, 'reply', 9 * 60_000),
  geste(2, true, MEDIUM, 'note', 40_000),
];
const PAIRE_RECUE: Gesture[] = [
  geste(3, false, 'Tu me manques.', 'note', 12 * 60_000),
  geste(4, false, SHORT, 'reply', 30_000),
];
const PAIRE_ENVOYEE: Gesture[] = [
  geste(5, true, 'Je rentre tôt ce soir.', 'note', 20 * 60_000),
  geste(6, true, SHORT, 'reply', 60_000),
];
const PAIRE_COEUR: Gesture[] = [
  geste(7, false, null, 'love', 5 * 60_000),
  geste(8, true, MEDIUM, 'note', 20_000),
];
const PAIRE_LONGUE: Gesture[] = [geste(9, false, LONG, 'reply', 90_000)];

function Section({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.legend}>{legend}</div>
      {children}
    </section>
  );
}

/** Galerie interne. Voir src/dev/llm.txt — jamais incluse en production. */
export function Gallery() {
  const [union, setUnion] = useState(false);
  return (
    <div className={styles.page}>
      <Section legend="Compteur — en cours">
        <Counter elapsed={elapsed(new Date('2019-06-14T18:30:00'), new Date(NOW))} isFuture={false} />
      </Section>

      <Section legend="Compteur — date d’origine dans le futur">
        <Counter elapsed={ZERO} isFuture />
      </Section>

      <Section legend="Compteur — tout à zéro (première seconde)">
        <Counter elapsed={ZERO} isFuture={false} />
      </Section>

      <Section legend="Bouton — repos / désactivé">
        <Button>{copy.ask.button}</Button>
        <div style={{ height: 12 }} />
        <Button disabled>{copy.ask.button}</Button>
      </Section>

      <Section legend="Modale de l'union — la première superposition du projet">
        <Button variant="quiet" onClick={() => setUnion(true)}>
          Ouvrir la modale
        </Button>
        {union && <UnionModal onClose={() => setUnion(false)} />}
      </Section>

      <Section legend="Emblème — décoratif, puis tappable (la zone monte à 44 px)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Emblem size="small" />
          <Emblem size="small" onPress={() => {}} label={copy.union.open} />
        </div>
      </Section>

      <Section legend="Ligne de boutons — le principal rétréci, le cœur à sa droite">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button style={{ flex: 1 }}>{copy.ask.button}</Button>
          <HeartButton label={copy.love.button} />
        </div>
      </Section>

      <Section legend="Bouton cœur — repos / désactivé">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <HeartButton label={copy.love.button} />
          <HeartButton label={copy.love.button} disabled />
        </div>
      </Section>

      <Section legend="Compteur des preuves — un, quelques-uns, beaucoup">
        <ProofCounter count={1} label={copy.proof.label(1)} />
        <ProofCounter count={47} label={copy.proof.label(47)} />
        <ProofCounter count={1284} label={copy.proof.label(1284)} />
      </Section>

      <Section legend="Pastille du cœur — telle qu'elle paraît dans le fil">
        <Pill text={copy.love.said} />
      </Section>

      <Section legend="Pastille du cœur — à côté d'une bulle envoyée, le cas à surveiller">
        <Pill text={copy.love.said} />
        <div style={{ height: 10 }} />
        <Bubble text={SHORT} clampable={false} variant="thread" tone="outlined" />
      </Section>

      <Section legend="État de l'échange — rien encore">
        <ExchangeStatus state="empty" partnerName="Benito" jolt={0} />
      </Section>

      <Section legend="État de l'échange — question posée, en attente">
        <ExchangeStatus state="waiting" partnerName="Benito" jolt={0} />
      </Section>

      <Section legend="État de l'échange — question reçue">
        <ExchangeStatus state="incoming" partnerName="Benito" jolt={0} />
      </Section>

      {/* Les TROIS cas d'EF-16.2, et ils sont tous les trois normaux : c'est
          l'auteur qui décide de l'apparence, jamais la place. */}
      <Section legend="Deux gestes — un de chacun, dans l'ordre chronologique">
        <GesturePair gestures={PAIRE_MIXTE} now={NOW} onReadMore={() => {}} />
      </Section>

      <Section legend="Deux gestes — les deux de l'autre, donc deux roses à gauche">
        <GesturePair gestures={PAIRE_RECUE} now={NOW} onReadMore={() => {}} />
      </Section>

      <Section legend="Deux gestes — les deux de moi, donc deux crème à droite">
        <GesturePair gestures={PAIRE_ENVOYEE} now={NOW} onReadMore={() => {}} />
      </Section>

      <Section legend="Deux gestes — un cœur et un mot">
        <GesturePair gestures={PAIRE_COEUR} now={NOW} onReadMore={() => {}} />
      </Section>

      <Section legend="Deux gestes — un seul, et un message qui déborde">
        <GesturePair gestures={PAIRE_LONGUE} now={NOW} onReadMore={() => {}} />
      </Section>

      <Section legend="Bulle — un mot (21 px)">
        <div className={styles.row}>
          <Bubble text={SHORT} />
        </div>
      </Section>

      <Section legend="Bulle — une phrase (19 px)">
        <div className={styles.row}>
          <Bubble text={MEDIUM} />
        </div>
      </Section>

      <Section legend="Bulle — 280 caractères, plafonnée à 4 lignes (17 px)">
        <div className={styles.row}>
          <Bubble text={LONG} />
        </div>
      </Section>
    </div>
  );
}
