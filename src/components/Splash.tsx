import { Backdrop } from './Backdrop.tsx';
import styles from './Splash.module.css';

/** Le fond seul, pendant la lecture de l'état. Aucun texte, aucun indicateur. */
export function Splash() {
  return (
    <main className={styles.screen} aria-busy="true">
      <Backdrop />
    </main>
  );
}
