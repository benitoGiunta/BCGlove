import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ComposeScreen } from './components/ComposeScreen.tsx';
import { CounterScreen } from './components/CounterScreen.tsx';
import { InvalidScreen } from './components/InvalidScreen.tsx';
import { MessageScreen } from './components/MessageScreen.tsx';
import { Splash } from './components/Splash.tsx';
import { api, ApiError } from './lib/api.ts';
import { LOVE_START } from './lib/config.ts';
import { copy } from './lib/copy.ts';
import { elapsed as computeElapsed } from './lib/elapsed.ts';
import { bootstrap } from './lib/identity.ts';
import { useAppState } from './hooks/useAppState.ts';
import { useNow } from './hooks/useNow.ts';
import { Gallery } from './dev/Gallery.tsx';

type Screen = 'counter' | 'reply' | 'note' | 'message';

/**
 * Aiguillage de l'application.
 *
 * ÉTAT DU LOT 7 : le cycle complet demander → répondre → afficher fonctionne
 * entre deux appareils, mais SANS notification — l'envoi du push est encore un
 * appel à vide (voir functions/api/_push.ts). Le lot 6 le remplit, et branche
 * ici l'ouverture directe sur le composeur depuis une notification.
 */
export function App() {
  // La galerie de primitives, en développement seulement (voir src/dev/llm.txt).
  // Le garde permet à Vite de la retirer entièrement du bundle de production.
  const showGallery =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has('dev');

  // Une seule fois, avant tout rendu : la clé est lue et l'URL nettoyée.
  const identity = useMemo(() => bootstrap(), []);
  const { status, state, refresh } = useAppState(identity.key);

  const now = useNow(1000);
  const start = useMemo(() => new Date(LOVE_START), []);
  const isFuture = start.getTime() >= now;
  const elapsed = useMemo(() => computeElapsed(start, new Date(now)), [start, now]);

  const [screen, setScreen] = useState<Screen>('counter');
  const [jolt, setJolt] = useState(0);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Ouverture depuis une notification : on va droit au composeur (EF-3.1).
  const consumedTarget = useRef(false);
  useEffect(() => {
    if (consumedTarget.current || state === null) return;
    consumedTarget.current = true;
    if (identity.openTarget === 'reply' && state.incomingAsk !== null) setScreen('reply');
  }, [identity.openTarget, state]);

  // Ce qui est affiché est vu.
  const seenUpTo = useRef(0);
  useEffect(() => {
    const received = state?.lastReceived;
    if (!received || identity.key === null) return;
    if (screen !== 'counter' || received.id <= seenUpTo.current) return;
    seenUpTo.current = received.id;
    void api.seen(identity.key, received.id).catch(() => {
      // Sans conséquence visible : le prochain lancement réessaiera.
    });
  }, [identity.key, screen, state?.lastReceived]);

  const buzz = () => {
    // Safari iOS n'implémente pas l'API Vibration : on dégrade en silence.
    try {
      navigator.vibrate?.(12);
    } catch {
      /* sans effet */
    }
  };

  const onAsk = useCallback(async () => {
    buzz();
    if (identity.key === null || state === null) return;

    // L'autre attend une réponse de moi : le bouton répond au lieu de demander.
    if (state.incomingAsk !== null) {
      setScreen('reply');
      return;
    }

    // Une question déjà posée et encore fraîche : le cœur sursaute, rien ne part.
    if (state.openAsk !== null && !state.openAsk.canRelance) {
      setJolt((n) => n + 1);
      return;
    }

    try {
      await api.ask(identity.key);
      await refresh();
    } catch {
      // Refus du serveur (question déjà ouverte, envoi trop rapproché) ou réseau
      // absent : pour qui regarde, c'est la même chose — la question est partie,
      // ou elle partira. Le cœur sursaute, rien d'autre n'a à être dit.
      setJolt((n) => n + 1);
    }
  }, [identity.key, refresh, state]);

  const onSend = useCallback(
    async (body: string) => {
      if (identity.key === null || state === null) return;
      setSending(true);
      setSendError(null);
      try {
        if (screen === 'reply' && state.incomingAsk !== null) {
          await api.reply(identity.key, state.incomingAsk.id, body);
        } else {
          await api.note(identity.key, body);
        }
        await refresh();
        setScreen('counter');
      } catch (error) {
        setSendError(
          error instanceof ApiError && error.code === 'offline'
            ? copy.errors.offline
            : copy.errors.failed,
        );
      } finally {
        setSending(false);
      }
    },
    [identity.key, refresh, screen, state],
  );

  if (showGallery) return <Gallery />;
  if (status === 'invalid') return <InvalidScreen />;
  if (state === null) return <Splash />;

  if (screen === 'message' && state.lastReceived?.body) {
    return (
      <MessageScreen
        partnerName={state.partner.name}
        text={state.lastReceived.body}
        createdAt={state.lastReceived.createdAt}
        now={now}
        onBack={() => setScreen('counter')}
      />
    );
  }

  if (screen === 'reply' || screen === 'note') {
    return (
      <ComposeScreen
        partnerName={state.partner.name}
        isReply={screen === 'reply'}
        sending={sending}
        errorMessage={sendError}
        onSend={(body) => void onSend(body)}
        onCancel={() => {
          setSendError(null);
          setScreen('counter');
        }}
      />
    );
  }

  const replyState = state.incomingAsk
    ? 'incoming'
    : state.openAsk
      ? 'waiting'
      : state.lastReceived
        ? 'answered'
        : 'empty';

  return (
    <CounterScreen
      viewerName={state.me.name}
      partnerName={state.partner.name}
      elapsed={elapsed}
      isFuture={isFuture}
      now={now}
      replyState={replyState}
      replyText={state.lastReceived?.body ?? undefined}
      answeredAt={state.lastReceived?.createdAt}
      jolt={jolt}
      onAsk={() => void onAsk()}
      onWriteNote={() => {
        setSendError(null);
        setScreen('note');
      }}
      onReadMore={() => setScreen('message')}
    />
  );
}
