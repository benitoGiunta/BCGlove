import { useEffect } from 'react';

/**
 * La pastille sur l'icône de l'app (EF-9.4).
 *
 * `setAppBadge` n'existe pas partout, et sur iOS il faut la permission de
 * notification. On tente, et on ignore l'échec : une pastille absente n'est pas
 * un problème, une exception au lancement si.
 */
export function useBadge(count: number): void {
  useEffect(() => {
    const navigatorWithBadge = navigator as Navigator & {
      setAppBadge?: (count?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };

    try {
      if (count > 0) void navigatorWithBadge.setAppBadge?.(count)?.catch(() => undefined);
      else void navigatorWithBadge.clearAppBadge?.()?.catch(() => undefined);
    } catch {
      /* sans effet */
    }
  }, [count]);
}
