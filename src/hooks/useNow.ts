import { useEffect, useState } from 'react';

/**
 * L'horloge du compteur.
 *
 * Deux pièges traités ici :
 *  - un `setInterval` d'une seconde dérive quand l'app passe en arrière-plan
 *    (iOS le ralentit ou le suspend) : on ne cumule jamais, on relit
 *    `Date.now()` à chaque tour ;
 *  - au retour au premier plan, on resynchronise immédiatement plutôt que
 *    d'attendre le prochain tour, sinon l'affichage reste figé jusqu'à une
 *    seconde après la reprise.
 *
 * Sur iOS installé sur l'écran d'accueil, `visibilitychange` est l'événement
 * fiable ; `focus` et `blur` ne le sont pas.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = () => setNow(Date.now());

    const start = () => {
      tick();
      timer = setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    };

    const onVisibility = () => {
      stop();
      if (document.visibilityState === 'visible') start();
    };

    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [intervalMs]);

  return now;
}
