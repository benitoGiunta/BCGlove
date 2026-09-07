import { cx } from '../lib/cx.ts';
import styles from './Backdrop.module.css';

/** Les trois voiles de couleur qui dérivent lentement en fond. Décoratif. */
export function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={cx(styles.wash, styles.one)} />
      <div className={cx(styles.wash, styles.two)} />
      <div className={cx(styles.wash, styles.three)} />
    </div>
  );
}
