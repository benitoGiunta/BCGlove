/**
 * Middleware global : en-têtes de sécurité pour tout, authentification pour /api.
 *
 * Il tourne aussi sur les fichiers statiques, d'où le filtrage explicite : on ne
 * demande pas de clé pour servir une police.
 */
import type { Ctx } from './types.ts';
import { allUsers } from './api/_db.ts';

/** Comparaison en temps constant : ne s'arrête pas au premier octet différent. */
function equalConstantTime(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function harden(response: Response): Response {
  const out = new Response(response.body, response);
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  out.headers.set('X-Content-Type-Options', 'nosniff');
  out.headers.set('Referrer-Policy', 'no-referrer');
  out.headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  out.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      // Vite injecte les styles des CSS modules dans une balise <style>.
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'",
    ].join('; '),
  );
  return out;
}

export const onRequest = async (context: Ctx): Promise<Response> => {
  const url = new URL(context.request.url);

  if (!url.pathname.startsWith('/api/')) {
    return harden(await context.next());
  }

  const header = context.request.headers.get('Authorization') ?? '';
  const key = header.startsWith('Bearer ') ? header.slice(7) : '';

  // Une seule et même réponse quelle que soit la cause : clé absente, mal formée
  // ou inconnue. Un 401 ne doit pas renseigner celui qui essaie.
  const refuse = () =>
    harden(
      new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      }),
    );

  if (key.length < 16 || key.length > 128) return refuse();

  const hash = await sha256Hex(key);
  // Il n'y a que deux utilisateurs : on les charge tous les deux et on compare en
  // temps constant, plutôt que de laisser la base faire une recherche par index.
  const users = await allUsers(context.env);
  const user = users.find((candidate) => equalConstantTime(candidate.key_hash, hash));
  if (!user) return refuse();

  context.data.user = {
    id: user.id,
    displayName: user.display_name,
    partnerId: user.partner_id,
  };

  return harden(await context.next());
};
