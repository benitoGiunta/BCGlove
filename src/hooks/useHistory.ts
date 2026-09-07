import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, type HistoryEntry } from '../lib/api.ts';

export interface UseHistory {
  entries: HistoryEntry[];
  hasMore: boolean;
  loading: boolean;
  failed: boolean;
  /** Charge la page suivante, la plus ancienne. */
  more: () => void;
}

/**
 * L'historique, page par page.
 *
 * On ne charge jamais tout : la table ne fait que croître, et rien n'oblige à
 * lire dix ans de messages pour en afficher trente.
 */
export function useHistory(key: string | null, active: boolean): UseHistory {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(
    async (before?: number) => {
      if (key === null) return;
      setLoading(true);
      setFailed(false);
      try {
        const page = await api.history(key, before);
        setEntries((current) => (before === undefined ? page.messages : [...current, ...page.messages]));
        setHasMore(page.hasMore);
      } catch (error) {
        if (error instanceof ApiError) setFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [key],
  );

  // On (re)charge à l'ouverture de l'écran, pas au montage de l'app : l'historique
  // ne sert à rien tant qu'on ne le regarde pas.
  useEffect(() => {
    if (active) void load();
  }, [active, load]);

  const more = useCallback(() => {
    const last = entries[entries.length - 1];
    if (last && !loading) void load(last.id);
  }, [entries, load, loading]);

  return { entries, hasMore, loading, failed, more };
}
