import styles from './Pill.module.css';

export interface PillProps {
  text: string;
}

/**
 * La pastille du cœur (EF-15.5).
 *
 * Un rectangle entièrement arrondi, crème, bordé de bordeaux plein, texte
 * bordeaux en Cormorant italique suivi d'un cœur. C'est le bordeaux du bouton
 * principal, sans son aplat.
 *
 * Elle n'a PAS les deux points de la bulle, et c'est délibéré : une bulle porte
 * une parole écrite, le cœur est un geste. L'absence de points fait partie du
 * contraste. Primitive muette, comme `Bubble` : elle ne sait ni qui l'envoie ni
 * quand — seul le texte arrive par props.
 */
export function Pill({ text }: PillProps) {
  return (
    <div className={styles.pill}>
      {text}
      {/* Le cœur typographique, pas un emoji — la seule exception admise par la
          DA (voir docs/design-system.md §7). Décoratif : il ne s'énonce pas. */}
      <span className={styles.heart} aria-hidden="true">
        &#9825;
      </span>
    </div>
  );
}
