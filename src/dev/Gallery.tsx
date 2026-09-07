import type { ReactNode } from 'react';
import { Bubble } from '../components/Bubble.tsx';
import { Button } from '../components/Button.tsx';
import { Counter } from '../components/Counter.tsx';
import { ReplyArea } from '../components/ReplyArea.tsx';
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

      <Section legend="Zone de réponse — vide">
        <ReplyArea state="empty" partnerName="Benito" now={NOW} jolt={0} />
      </Section>

      <Section legend="Zone de réponse — en attente">
        <ReplyArea state="waiting" partnerName="Benito" now={NOW} jolt={0} />
      </Section>

      <Section legend="Zone de réponse — réponse courte">
        <ReplyArea
          state="answered"
          partnerName="Benito"
          text={MEDIUM}
          answeredAt={NOW - 40_000}
          now={NOW}
          jolt={0}
        />
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
