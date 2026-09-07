import { copy } from '../lib/copy.ts';
import { pad2, plural, speak, type Elapsed } from '../lib/elapsed.ts';
import { cx } from '../lib/cx.ts';
import { Digits } from './Digits.tsx';
import styles from './Counter.module.css';

export interface CounterProps {
  elapsed: Elapsed;
  /** Vrai quand la date d'origine n'est pas encore arrivée (EF-1.6). */
  isFuture: boolean;
}

/**
 * La carte compteur. Elle ne calcule rien : elle reçoit un `Elapsed` déjà fait.
 *
 * Toute la partie chiffrée est `aria-hidden` et doublée par une phrase unique sur
 * le conteneur (EF-1.5) : un lecteur d'écran qui énumérerait chaque cellule de
 * chiffre serait illisible.
 */
export function Counter({ elapsed, isFuture }: CounterProps) {
  const speech = isFuture ? copy.counter.speechFuture : copy.counter.speech(speak(elapsed));

  return (
    <div className={styles.card} role="group" aria-label={speech}>
      <p className={styles.lead}>{copy.counter.lead}</p>

      {isFuture ? (
        <div className={styles.future}>
          {copy.counter.future[0]}
          <br />
          {copy.counter.future[1]}
        </div>
      ) : (
        <div>
          <div className={styles.big} aria-hidden="true">
            <BigUnit
              value={elapsed.years}
              label={plural(elapsed.years, copy.counter.unitYear, copy.counter.unitYears)}
            />
            <span className={styles.separator}>·</span>
            <BigUnit value={elapsed.months} label={copy.counter.unitMonths} />
            <span className={styles.separator}>·</span>
            <BigUnit
              value={elapsed.days}
              label={plural(elapsed.days, copy.counter.unitDay, copy.counter.unitDays)}
            />
          </div>

          <div className={styles.clock} aria-hidden="true">
            <ClockGroup value={elapsed.hours} unit={copy.counter.hours} />
            <span className={styles.clockDot}>·</span>
            <ClockGroup value={elapsed.minutes} unit={copy.counter.minutes} />
            <span className={styles.clockDot}>·</span>
            <ClockGroup value={elapsed.seconds} unit={copy.counter.seconds} />
          </div>
        </div>
      )}
    </div>
  );
}

function BigUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.unit}>
      <Digits value={String(value)} className={cx(styles.value, styles.bigDigits)} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}

function ClockGroup({ value, unit }: { value: number; unit: string }) {
  return (
    <span className={styles.clockGroup}>
      <Digits value={pad2(value)} className={styles.clockValue} />
      <span className={styles.clockUnit}>{unit}</span>
    </span>
  );
}
