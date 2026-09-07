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
