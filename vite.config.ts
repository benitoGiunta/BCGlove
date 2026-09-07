import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Cloudflare Pages sert dist/ ; functions/ reste à la racine du dépôt.
    outDir: 'dist',
    target: 'es2022',
    // Un seul écran : pas de découpage, un fichier se charge plus vite que trois.
    cssCodeSplit: false,
  },
  server: {
    port: 5173,
    // En `npm run dev`, l'API n'existe pas : les appels /api échouent proprement.
    // Le vrai mode de développement est `npm run dev:full`.
  },
});
