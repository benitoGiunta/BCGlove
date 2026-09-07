import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../lib/cx.ts';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'quiet' | undefined;
}

/**
 * Primitive muette : aucun texte en dur, aucune donnée, aucun appel réseau.
 * `type="button"` par défaut — un bouton dans un formulaire ne doit jamais
 * soumettre par accident.
 */
export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  const base = variant === 'primary' ? styles.button : styles.quiet;
  return <button type="button" {...rest} className={cx(base, className)} />;
}
