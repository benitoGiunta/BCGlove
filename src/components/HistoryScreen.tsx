import type { HistoryEntry } from '../lib/api.ts';
import { copy } from '../lib/copy.ts';
import { cx } from '../lib/cx.ts';
import { dayLabel, groupByDay } from '../lib/days.ts';
import { exact, relative } from '../lib/relative.ts';
import { Bubble } from './Bubble.tsx';
import { Button } from './Button.tsx';
import styles from './HistoryScreen.module.css';

export interface HistoryScreenProps {
  entries: HistoryEntry[];
  hasMore: boolean;
  loading: boolean;
  meName: string;
  partnerName: string;
  now: number;
  onMore: () => void;
  onClose: () => void;
}

function whoLabel(entry: HistoryEntry, meName: string, partnerName: string): string {
  const name = entry.mine ? meName : partnerName;
  if (entry.kind === 'ask') return copy.history.asked(name);
  if (entry.kind === 'reply') return copy.history.replied(name);
  return copy.history.noted(name);
}

/**
 * Le fil complet, du plus récent au plus ancien, groupé par journée.
 *
 * Aucune suppression, aucune édition : ce qui est envoyé est envoyé (EF-6.5).
 */
export function HistoryScreen({
  entries,
  hasMore,
  loading,
  meName,
  partnerName,
  now,
  onMore,
  onClose,
}: HistoryScreenProps) {
  const groups = groupByDay(
    entries,
    (entry) => entry.createdAt,
    (timestamp) => dayLabel(timestamp, now, copy.history.today, copy.history.yesterday),
  );

  return (
    <main className={styles.screen}>
      <div className={styles.column}>
        <h1 className={styles.title}>{copy.history.title}</h1>

        <div className={styles.list}>
          {entries.length === 0 && !loading && <p className={styles.empty}>{copy.history.empty}</p>}

          {groups.map((group) => (
            <section key={group.key} className={styles.day}>
              <div className={styles.dayLabel}>{group.label}</div>

              {group.items.map((entry) => (
                <article
                  key={entry.id}
                  className={cx(styles.entry, entry.mine ? styles.mine : styles.theirs)}
                >
                  <div className={styles.who} title={exact(entry.createdAt)}>
                    {whoLabel(entry, meName, partnerName)} · {relative(entry.createdAt, now)}
                  </div>

                  {entry.kind === 'ask' ? (
                    <div className={styles.question}>{copy.ask.button}</div>
                  ) : (
                    <div className={styles.bubbleWrap}>
                      <Bubble
                        text={entry.body ?? ''}
                        clampable={false}
                        variant="thread"
                        tone={entry.kind === 'note' ? 'outlined' : 'filled'}
                      />
                    </div>
                  )}
                </article>
              ))}
            </section>
          ))}
        </div>

        <div className={styles.footer}>
          {hasMore && (
            <Button variant="quiet" onClick={onMore} disabled={loading}>
              {loading ? copy.history.loading : copy.history.more}
            </Button>
          )}
          <Button variant="quiet" onClick={onClose}>
            {copy.history.close}
          </Button>
        </div>
      </div>
    </main>
  );
}
