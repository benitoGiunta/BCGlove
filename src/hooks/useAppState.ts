import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, type AppState } from '../lib/api.ts';
import { POLL_INTERVAL_MS } from '../lib/config.ts';

export type Status = 'loading' | 'ready' | 'invalid' | 'offline' | 'error';

export interface UseAppState {
  status: Status;
  state: AppState | null;
  /** Relit l'état depuis le serveur. À appeler après tout envoi. */
  refresh: () => Promise<void>;
}

/**
 * L'état serveur, tenu à jour.
 *
 * Trois déclencheurs, et pas un de plus : le lancement, le retour au premier plan,
 * et un intervalle tant que l'écran est visible. Le push complétera l'ensemble au
 * lot 6 — il n'y a ni WebSocket ni Durable Object, et pour deux personnes il n'en
 * faut pas.
 */
export function useAppState(key: string | null): UseAppState {
  const [status, setStatus] = useState<Status>(key === null ? 'invalid' : 'loading');
  const [state, setState] = useState<AppState | null>(null);

  // Une requête en vol ne doit pas écraser un état plus récent.
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    if (key === null) return;
    const mine = ++generation.current;
    try {
      const next = await api.state(key);
      if (mine !== generation.current) return;
      setState(next);
      setStatus('ready');
    } catch (error) {
      if (mine !== generation.current) return;
      if (error instanceof ApiError && error.status === 401) setStatus('invalid');
      else if (error instanceof ApiError && error.code === 'offline') {
        // Hors ligne avec un état déjà chargé : on garde ce qu'on affiche.
        setStatus((previous) => (previous === 'ready' ? 'ready' : 'offline'));
      } else setStatus('error');
    }
  }, [key]);

  useEffect(() => {
    if (key === null) {
      setStatus('invalid');
      return;
    }

    void refresh();

    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      timer = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
    };

    const onVisibility = () => {
      stop();
      if (document.visibilityState === 'visible') {
        // Resynchroniser tout de suite : au retour, l'écran doit être à jour
        // avant le prochain tour d'intervalle.
        void refresh();
        start();
      }
    };

    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [key, refresh]);

  return { status, state, refresh };
}
