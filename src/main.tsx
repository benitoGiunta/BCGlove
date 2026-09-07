import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';

// L'ordre compte : les polices et le reset avant les tokens, les keyframes en dernier.
import './styles/fonts.css';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/keyframes.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root introuvable');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/*
 * Le service worker, enregistré APRÈS le rendu : il n'est utile qu'aux
 * notifications et au cache, et rien ne justifie de retarder le compteur pour
 * lui. Servi depuis la racine, il a la portée complète (voir public/llm.txt).
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      // Sans service worker : pas de notification, pas de hors-ligne, mais
      // l'app fonctionne. Ça ne doit jamais casser le démarrage.
      console.warn('service worker non enregistré :', error);
    });
  });
}
