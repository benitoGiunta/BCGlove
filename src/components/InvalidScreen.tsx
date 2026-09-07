import { copy } from '../lib/copy.ts';
import { Backdrop } from './Backdrop.tsx';
import styles from './InvalidScreen.module.css';

/**
 * Sans clé, ou avec une clé refusée. Une phrase, et rien d'autre : ni « clé
 * invalide », ni « utilisateur inconnu », ni bouton pour réessayer. Un visiteur
 * qui tombe là ne doit pas apprendre qu'il y a quelque chose derrière (EF-7.2).
 */
export function InvalidScreen() {
  return (
    <main className={styles.screen}>
      <Backdrop />
      <p className={styles.line}>{copy.invalid.title}</p>
    </main>
  );
}
