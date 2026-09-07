import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion.ts';

/**
 * La séquence de première ouverture (EF-10).
 *
 * Charleen découvre l'app sans savoir qu'elle existe : le premier lancement
 * n'est pas un écran d'accueil, c'est un moment. Une phrase, puis le compteur
 * qui rattrape le temps réel en deux secondes.
 *
 * Le rattrapage n'interpole PAS les années, mois et jours un à un — ce serait
 * incohérent en chemin. Il interpole l'INSTANT : le compteur part de la date
 * d'origine et court jusqu'à maintenant, comme si l'histoire se rejouait en
 * accéléré. Les composantes restent donc justes à chaque image.
 */
export type Phase =
  /** Rien encore : on attend de savoir si c'est la première ouverture. */
  | 'idle'
  /** La phrase, seule sur le fond. */
  | 'line'
  /** Le compteur court de la date d'origine jusqu'à maintenant. */
  | 'rushing'
  /** Fini — et ça ne se rejouera jamais. */
  | 'done';

const LINE_MS = 2600;
const RUSH_MS = 2200;

/** Décélération franche : rapide au départ, posée à l'arrivée. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export interface UseFirstOpen {
  phase: Phase;
  /**
   * L'instant à afficher. Vaut `now` hors séquence ; pendant le rattrapage,
   * un instant intermédiaire entre la date d'origine et maintenant.
   */
  displayNow: (start: number, now: number) => number;
  /** Démarre la séquence. Sans effet si elle a déjà eu lieu. */
  begin: () => void;
  /** Passe la séquence. Personne ne doit rester bloqué devant une animation. */
  skip: () => void;
}

export function useFirstOpen(): UseFirstOpen {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [rushStart, setRushStart] = useState<number | null>(null);

  const begin = useCallback(() => {
    setPhase((current) => (current === 'idle' ? 'line' : current));
  }, []);

  const skip = useCallback(() => {
    setPhase('done');
    setRushStart(null);
  }, []);

  useEffect(() => {
    if (phase !== 'line') return;
    const timer = window.setTimeout(() => {
      // Sous prefers-reduced-motion, la phrase est remplacée par un fondu et le
      // compteur apparaît directement à sa valeur (EF-10.5).
      if (reduced) {
        setPhase('done');
        return;
      }
      setRushStart(Date.now());
      setPhase('rushing');
    }, LINE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== 'rushing') return;
    const timer = window.setTimeout(() => {
      setPhase('done');
      setRushStart(null);
    }, RUSH_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const displayNow = useCallback(
    (start: number, now: number) => {
      if (phase !== 'rushing' || rushStart === null) return now;
      const progress = Math.min(1, (Date.now() - rushStart) / RUSH_MS);
      return start + easeOut(progress) * (now - start);
    },
    [phase, rushStart],
  );

  return { phase, displayNow, begin, skip };
}
