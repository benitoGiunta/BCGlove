-- BCGlove — schéma initial.
-- D1 est du SQLite : pas de booléen, pas de NOW(), dates en entiers (ms epoch UTC).
-- L'absence d'un horodatage remplace le « faux » : seen_at NULL = pas encore vu.

-- Deux lignes, écrites par scripts/seed-users.mjs. Jamais d'inscription.
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,          -- 'charleen' | 'benito'
  display_name  TEXT NOT NULL,
  key_hash      TEXT NOT NULL,             -- SHA-256 hex de la clé personnelle
  partner_id    TEXT NOT NULL,
  first_open_at INTEGER,                   -- EF-10.3 : la séquence ne se rejoue jamais
  created_at    INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_key ON users (key_hash);

-- Un abonnement push par appareil. Une personne peut en avoir plusieurs.
CREATE TABLE IF NOT EXISTS subscriptions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users (id),
  endpoint   TEXT NOT NULL UNIQUE,         -- l'URL fournie par le service de push
  p256dh     TEXT NOT NULL,                -- clé publique du client, base64url
  auth       TEXT NOT NULL,                -- secret d'authentification, base64url
  user_agent TEXT,
  created_at INTEGER NOT NULL,
  last_ok_at INTEGER,
  fail_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions (user_id);

-- Le fil, dans une seule table. Un 'ask' n'a pas de corps.
CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  kind       TEXT NOT NULL CHECK (kind IN ('ask', 'reply', 'note')),
  from_user  TEXT NOT NULL REFERENCES users (id),
  to_user    TEXT NOT NULL REFERENCES users (id),
  body       TEXT,                         -- NULL si kind = 'ask'
  reply_to   INTEGER REFERENCES messages (id),
  created_at INTEGER NOT NULL,
  seen_at    INTEGER
);

CREATE INDEX IF NOT EXISTS idx_messages_to ON messages (to_user, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_from ON messages (from_user, created_at DESC);
-- Retrouver vite la question ouverte : un 'ask' auquel rien ne répond.
CREATE INDEX IF NOT EXISTS idx_messages_replyto ON messages (reply_to);
