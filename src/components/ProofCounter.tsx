import styles from './ProofCounter.module.css';

export interface ProofCounterProps {
  count: number;
  label: string;
}

/**
 * Le compteur des preuves (EF-14).
 *
 * UN seul nombre, jamais trois : trois nombres inviteraient à les comparer,
 * alors que ce sont trois façons de dire la même chose. Il reprend le registre
 * typographique de la ligne `h · min · s` de la carte, et c'est délibéré — il
 * doit se lire comme une mesure, pas comme un score.
 */
export function ProofCounter({ count, label }: ProofCounterProps) {
  return (
    <div className={styles.row}>
      <span className={styles.value}>{count}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
