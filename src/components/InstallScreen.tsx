import { copy } from '../lib/copy.ts';
import type { Environment } from '../lib/standalone.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import styles from './InstallScreen.module.css';

export interface InstallScreenProps {
  environment: Environment;
  onSkip: () => void;
}

/** Le glyphe « Partager » d'iOS. Le montrer vaut mieux que le décrire. */
function ShareGlyph() {
  return (
    <svg
      className={styles.share}
      width="15"
      height="19"
      viewBox="0 0 15 19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.5 1.2v10.4" />
      <path d="M4.2 4.3 7.5 1l3.3 3.3" />
      <path d="M3.4 7.6H1.9v9.5h11.2V7.6h-1.5" />
    </svg>
  );
}

/**
 * Affiché sur iPhone quand l'app n'est pas sur l'écran d'accueil (EF-8.2).
 *
 * Ce n'est pas une invitation marketing : sans cette étape, `requestPermission()`
 * échoue et aucune notification n'arrivera jamais. C'est une limite d'Apple, pas
 * un choix — mais elle doit se franchir sans qu'on ait à l'expliquer.
 */
export function InstallScreen({ environment, onSkip }: InstallScreenProps) {
  const wrongBrowser = environment === 'ios-other-browser';

  return (
    <main className={styles.screen}>
      <Backdrop />

      <div className={styles.column}>
        <div className={styles.card}>
          <p className={styles.title}>{copy.install.title}</p>

          {wrongBrowser ? (
            <p className={styles.step}>{copy.install.wrongBrowser}</p>
          ) : (
            <ol className={styles.steps}>
              <li className={styles.step}>
                <span className={styles.number}>1</span>
                <span>
                  Touche <ShareGlyph /> en bas de l&apos;écran.
                </span>
              </li>
              <li className={styles.step}>
                <span className={styles.number}>2</span>
                <span>Choisis « Sur l&apos;écran d&apos;accueil », puis « Ajouter ».</span>
              </li>
              <li className={styles.step}>
                <span className={styles.number}>3</span>
                <span>Ouvre l&apos;app depuis sa nouvelle icône.</span>
              </li>
            </ol>
          )}

          <p className={styles.note}>{copy.install.why}</p>
        </div>

        <div className={styles.skip}>
          <Button variant="quiet" onClick={onSkip}>
            {copy.install.skip}
          </Button>
        </div>
      </div>
    </main>
  );
}
