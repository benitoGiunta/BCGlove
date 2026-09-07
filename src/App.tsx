import { useCallback, useMemo, useState } from 'react';
import { CounterScreen } from './components/CounterScreen.tsx';
import { LOVE_START } from './lib/config.ts';
import { elapsed as computeElapsed } from './lib/elapsed.ts';
import { useNow } from './hooks/useNow.ts';
import { Gallery } from './dev/Gallery.tsx';

/**
 * Aiguillage de l'application.
 *
 * ÉTAT DU LOT 3 : l'écran compteur est complet et fidèle à la maquette. La
 * question et la réponse sont encore locales — elles seront branchées sur
 * l'API au lot 5 et sur le push au lot 6. L'identité (lot 4) posera aussi le
 * vrai prénom du partenaire à la place de la valeur d'attente ci-dessous.
 */
export function App() {
  // La galerie de primitives, en développement seulement (voir src/dev/llm.txt).
  // Le garde permet à Vite de la retirer entièrement du bundle de production.
  const showGallery =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has('dev');

  const now = useNow(1000);

  const start = useMemo(() => new Date(LOVE_START), []);
  const isFuture = start.getTime() >= now;
  const elapsed = useMemo(() => computeElapsed(start, new Date(now)), [start, now]);

  // Provisoire (lot 5) : la question ne quitte pas encore l'appareil.
  const [asked, setAsked] = useState(false);
  const [jolt, setJolt] = useState(0);

  const onAsk = useCallback(() => {
    // Safari iOS n'implémente pas l'API Vibration : on dégrade en silence.
    try {
      navigator.vibrate?.(12);
    } catch {
      /* sans effet */
    }
    setAsked((already) => {
      if (already) setJolt((n) => n + 1);
      return true;
    });
  }, []);

  if (showGallery) return <Gallery />;

  return (
    <CounterScreen
      partnerName="Benito"
      elapsed={elapsed}
      isFuture={isFuture}
      now={now}
      replyState={asked ? 'waiting' : 'empty'}
      jolt={jolt}
      onAsk={onAsk}
    />
  );
}
