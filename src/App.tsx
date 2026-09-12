import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClaimScreen } from './components/ClaimScreen.tsx';
import { ComposeScreen } from './components/ComposeScreen.tsx';
import { CounterScreen } from './components/CounterScreen.tsx';
import { InstallScreen } from './components/InstallScreen.tsx';
import { FirstOpenScreen } from './components/FirstOpenScreen.tsx';
import { HistoryScreen } from './components/HistoryScreen.tsx';
import { InvalidScreen } from './components/InvalidScreen.tsx';
import { MessageScreen } from './components/MessageScreen.tsx';
import { NotificationPrompt } from './components/NotificationPrompt.tsx';
import { SettingsScreen } from './components/SettingsScreen.tsx';
import { Splash } from './components/Splash.tsx';
import { UnionModal } from './components/UnionModal.tsx';
import { api, ApiError } from './lib/api.ts';
import { LOVE_START } from './lib/config.ts';
import { copy } from './lib/copy.ts';
import { elapsed as computeElapsed } from './lib/elapsed.ts';
import { bootstrap, remember } from './lib/identity.ts';
import { useAppState } from './hooks/useAppState.ts';
import { useBadge } from './hooks/useBadge.ts';
import { useNow } from './hooks/useNow.ts';
import { useFirstOpen } from './hooks/useFirstOpen.ts';
import { useHistory } from './hooks/useHistory.ts';
import { usePush } from './hooks/usePush.ts';
import { Gallery } from './dev/Gallery.tsx';
import { HomePreview } from './dev/HomePreview.tsx';

type Screen = 'counter' | 'reply' | 'note' | 'message' | 'history' | 'settings';

/**
 * Aiguillage de l'application.
 *
 * ÉTAT DU LOT 6 : le cycle complet fonctionne, notifications comprises. Restent
 * l'historique (lot 8) et les finitions PWA (lot 9).
 */

/** Le refus de l'écran d'installation, retenu pour ne pas le remontrer sans cesse. */
const INSTALL_DISMISSED = 'bcglove.install-dismissed.v1';

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(INSTALL_DISMISSED) === '1';
  } catch {
    return false;
  }
}
export function App() {
  // La galerie de primitives, en développement seulement (voir src/dev/llm.txt).
  // Le garde permet à Vite de la retirer entièrement du bundle de production.
  // `?dev=1` la galerie de primitives, `?dev=home` l'écran d'accueil complet
  // dans tous ses états (voir src/dev/llm.txt).
  const dev = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get('dev')
    : null;

  // Une seule fois, avant tout rendu : la clé est lue et l'URL nettoyée.
  const initial = useMemo(() => bootstrap(), []);
  // La clé peut arriver après coup, saisie sur l'écran de reprise.
  const [key, setKey] = useState<string | null>(initial.key);
  const identity = { key, openTarget: initial.openTarget };
  const { status, state, refresh } = useAppState(key);
  const push = usePush(identity.key);
  const firstOpen = useFirstOpen();

  // Pendant le rattrapage, l'horloge bat à l'image plutôt qu'à la seconde :
  // sinon le compteur avancerait par à-coups d'une seconde.
  const now = useNow(firstOpen.phase === 'rushing' ? 16 : 1000);
  const start = useMemo(() => new Date(LOVE_START), []);
  const isFuture = start.getTime() >= now;

  // `displayNow` vaut `now` hors séquence : le cas courant ne paie rien.
  const shownNow = firstOpen.displayNow(start.getTime(), now);
  const elapsed = useMemo(
    () => computeElapsed(start, new Date(shownNow)),
    [start, shownNow],
  );

  const [screen, setScreen] = useState<Screen>('counter');
  // Chargé seulement quand l'écran est ouvert : la table ne fait que croître.
  const history = useHistory(identity.key, screen === 'history');
  const [jolt, setJolt] = useState(0);
  /** Rejoue le battement du cœur à chaque appui (EF-15.1). */
  const [loveBeat, setLoveBeat] = useState(0);
  /** Le geste qu'on est allé lire en entier sur l'écran de lecture (EF-16.6). */
  const [readingId, setReadingId] = useState<number | null>(null);
  /**
   * La modale de l'union (EF-18). Elle se superpose à l'écran d'accueil au lieu
   * de le remplacer : c'est le seul endroit de l'app où deux choses sont à
   * l'écran en même temps, et elle ne coûte donc rien à sa hauteur.
   */
  const [unionOpen, setUnionOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  useBadge(state?.unseen ?? 0);
  const [installDismissed, setInstallDismissed] = useState(readDismissed);
  const [promptDismissed, setPromptDismissed] = useState(false);

  // La séquence de première ouverture, une seule fois (EF-10). Le serveur en est
  // le juge : il l'a marquée en base dès le premier /api/state, ce qui la rend
  // injouable une seconde fois, même après réinstallation.
  useEffect(() => {
    if (state?.isFirstOpen) firstOpen.begin();
  }, [firstOpen, state?.isFirstOpen]);

  // Ouverture depuis une notification : on va droit au composeur (EF-3.1).
  const consumedTarget = useRef(false);
  useEffect(() => {
    if (consumedTarget.current || state === null) return;
    consumedTarget.current = true;
    if (identity.openTarget === 'reply' && state.incomingAsk !== null) setScreen('reply');
  }, [identity.openTarget, state]);

  // Le service worker parle à l'app : une notification reçue app ouverte, ou un
  // toucher sur une notification alors qu'une fenêtre existe déjà.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string } | null;
      if (data?.type === 'bcglove:refresh') void refresh();
      if (data?.type === 'bcglove:open') {
        void refresh();
        if (data.url?.includes('open=reply')) setScreen('reply');
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [refresh]);

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

  /**
   * Le cœur. Rien à valider, rien à composer : le geste est tout entier dans
   * l'appel. En cas de refus — le plancher de 30 s, ou le réseau absent — le
   * cœur bat quand même, et de la même façon. On ne reproche pas à quelqu'un
   * d'aimer trop souvent (EF-15.7).
   */
  const onLove = useCallback(async () => {
    buzz();
    setLoveBeat((n) => n + 1);
    if (identity.key === null) return;
    try {
      await api.love(identity.key);
      await refresh();
    } catch {
      // Volontairement muet : voir ci-dessus.
    }
  }, [identity.key, refresh]);

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

  if (dev === 'home') return <HomePreview />;
  if (dev !== null) return <Gallery />;

  if (status === 'invalid') {
    // Installée sans identité : iOS ouvre l'app sur la racine, sans le `?k=` du
    // lien, et son stockage est séparé de celui de Safari. On demande le lien
    // une fois plutôt que de laisser une impasse. Dans un navigateur, en
    // revanche, un visiteur de passage n'apprend rien (EF-7.2).
    if (push.environment === 'standalone') {
      return (
        <ClaimScreen
          onClaim={(claimed) => {
            remember(claimed);
            setKey(claimed);
          }}
        />
      );
    }
    return <InvalidScreen />;
  }
  if (state === null) return <Splash />;

  // Sur iPhone hors écran d'accueil, aucune notification n'est possible : on
  // montre comment installer plutôt qu'un bouton qui échouerait (EF-8.2).
  const needsInstall =
    !installDismissed &&
    (push.environment === 'ios-browser' || push.environment === 'ios-other-browser');

  if (firstOpen.phase === 'line') return <FirstOpenScreen onContinue={firstOpen.advance} />;

  if (screen === 'settings') {
    return (
      <SettingsScreen
        meName={state.me.name}
        personalKey={identity.key}
        pushStatus={push.status}
        onEnablePush={() => void push.enable()}
        onClose={() => setScreen('counter')}
      />
    );
  }

  if (needsInstall && screen === 'counter') {
    return (
      <InstallScreen
        environment={push.environment}
        onSkip={() => {
          try {
            window.localStorage.setItem(INSTALL_DISMISSED, '1');
          } catch {
            /* sans effet : l'écran reviendra au prochain lancement */
          }
          setInstallDismissed(true);
        }}
      />
    );
  }

  if (screen === 'history') {
    return (
      <HistoryScreen
        entries={history.entries}
        hasMore={history.hasMore}
        loading={history.loading}
        meName={state.me.name}
        partnerName={state.partner.name}
        now={now}
        onMore={history.more}
        onClose={() => setScreen('counter')}
      />
    );
  }

  if (screen === 'message') {
    // Le geste qu'on a choisi de lire, pas « le dernier reçu » : depuis EF-16
    // l'écran d'accueil en montre deux, et l'un des deux peut être le mien.
    const reading = state.lastTwo.find((gesture) => gesture.id === readingId);
    if (reading?.body) {
      return (
        <MessageScreen
          authorName={reading.mine ? state.me.name : state.partner.name}
          mine={reading.mine}
          text={reading.body}
          createdAt={reading.createdAt}
          now={now}
          onBack={() => setScreen('counter')}
        />
      );
    }
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

  // Plus de `answered` : depuis EF-16, une réponse reçue n'est plus un état de
  // la zone, c'est un geste parmi les deux derniers. Il ne reste que les trois
  // états où il y a quelque chose à DIRE plutôt qu'à montrer.
  const replyState = state.incomingAsk ? 'incoming' : state.openAsk ? 'waiting' : 'empty';

  return (
    <>
      <CounterScreen
        viewerName={state.me.name}
        partnerName={state.partner.name}
        elapsed={elapsed}
        isFuture={isFuture}
        now={now}
        replyState={replyState}
        gestures={state.lastTwo}
        jolt={jolt}
        proofCount={state.proofCount}
        loveBeat={loveBeat}
        onAsk={() => void onAsk()}
        onLove={() => void onLove()}
        onWriteNote={() => {
          setSendError(null);
          setScreen('note');
        }}
        onReadMore={(id) => {
          setReadingId(id);
          setScreen('message');
        }}
        onOpenHistory={() => setScreen('history')}
        onOpenSettings={() => setScreen('settings')}
        onOpenUnion={() => setUnionOpen(true)}
        banner={
          promptDismissed || (push.status !== 'askable' && push.status !== 'denied') ? undefined : (
            <NotificationPrompt
              variant={push.status}
              onEnable={() => void push.enable()}
              onDismiss={() => setPromptDismissed(true)}
            />
          )
        }
      />

      {unionOpen && <UnionModal onClose={() => setUnionOpen(false)} />}
    </>
  );
}
