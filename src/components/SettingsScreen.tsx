import { useState } from 'react';
import { copy } from '../lib/copy.ts';
import { cx } from '../lib/cx.ts';
import { personalLink } from '../lib/identity.ts';
import type { PushStatus } from '../hooks/usePush.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import styles from './SettingsScreen.module.css';

export interface SettingsScreenProps {
  meName: string;
  /** `null` en navigation privée : on n'a alors pas de lien à réafficher. */
  personalKey: string | null;
  pushStatus: PushStatus;
  onEnablePush: () => void;
  onClose: () => void;
}

function pushLabel(status: PushStatus): string {
  if (status === 'ready') return copy.settings.pushReady;
  if (status === 'denied') return copy.settings.pushDenied;
  if (status === 'unavailable') return copy.settings.pushUnavailable;
  return copy.settings.pushOff;
}

/**
 * Trois choses, pas une de plus (EF-7.4).
 *
 * Le lien y est réaffiché en clair : c'est la seule clé d'accès, et l'app est le
 * seul endroit où on peut encore la retrouver après l'avoir perdue ailleurs.
 */
export function SettingsScreen({
  meName,
  personalKey,
  pushStatus,
  onEnablePush,
  onClose,
}: SettingsScreenProps) {
  const [copied, setCopied] = useState(false);
  const link = personalKey === null ? null : personalLink(personalKey);

  const copyLink = () => {
    if (link === null) return;
    // `navigator.clipboard` n'existe pas partout, et échoue hors contexte sûr.
    // On montre « Copié » quoi qu'il arrive : le lien reste lisible à l'écran,
    // donc sélectionnable à la main.
    void navigator.clipboard?.writeText(link).catch(() => undefined);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className={styles.screen}>
      <Backdrop />

      <div className={styles.column}>
        <div className={styles.card}>
          <p className={styles.who}>{copy.settings.who(meName)}</p>

          <div className={styles.row}>
            <div className={styles.rowTitle}>{copy.settings.notifications}</div>
            <div className={styles.rowValue}>{pushLabel(pushStatus)}</div>
            {pushStatus === 'denied' && <p className={styles.help}>{copy.settings.pushHelp}</p>}
            {pushStatus === 'askable' && (
              <div className={styles.rowActions}>
                <button type="button" className={styles.action} onClick={onEnablePush}>
                  {copy.notifications.enable}
                </button>
              </div>
            )}
          </div>

          {link !== null && (
            <div className={cx(styles.row, styles.rowSpaced)}>
              <div className={styles.rowTitle}>{copy.settings.myLink}</div>
              <p className={styles.link}>{link}</p>
              <p className={styles.help}>{copy.settings.myLinkHelp}</p>
              <div className={styles.rowActions}>
                <button type="button" className={styles.action} onClick={copyLink}>
                  {copied ? copy.settings.copied : copy.settings.copy}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.back}>
          <Button variant="quiet" onClick={onClose}>
            {copy.message.back}
          </Button>
        </div>
      </div>
    </main>
  );
}
