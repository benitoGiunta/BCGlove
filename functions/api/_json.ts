/**
 * Réponses et validation. Tout ce qui sort de l'API passe par ici, y compris les
 * erreurs : un client qui reçoit du HTML là où il attend du JSON ne sait pas quoi
 * en faire.
 */

const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: HEADERS });
}

/**
 * Une erreur ne dit que son code. Pas de message explicatif : côté client on sait
 * quoi afficher, et côté serveur on ne renseigne pas un curieux.
 */
export function fail(code: string, status: number): Response {
  return new Response(JSON.stringify({ error: code }), { status, headers: HEADERS });
}

/** Lit un corps JSON. Renvoie `null` plutôt que de lever si le corps est illisible. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Une chaîne non vide, bornée. Renvoie `null` si la valeur ne convient pas. */
export function readText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  // On compte en points de code, comme le client : sinon un message d'emojis
  // accepté à la saisie serait refusé à l'envoi.
  if (Array.from(trimmed).length > max) return null;
  return trimmed;
}

/** Un entier positif. */
export function readId(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) return null;
  return value;
}
