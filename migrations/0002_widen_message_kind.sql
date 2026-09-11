-- BCGlove — migration 0002 : le quatrième geste.
--
-- Le cœur (EF-15) introduit un type de message `love`, sans corps comme `ask`.
-- La colonne `kind` porte une contrainte CHECK, et SQLite ne modifie pas une
-- contrainte en place : il faut recréer la table et RECOPIER les lignes.
--
-- L'app est en service sur deux iPhones. Ces lignes sont l'historique ET le
-- compteur des preuves, qui n'est qu'un COUNT sur cette table (EF-14.6). Un
-- DROP sans la recopie les efface toutes les deux, définitivement.
-- Sauvegarder avant : `npx wrangler d1 export bcglove --remote --output backup.sql`.
--
-- Trois précautions, dans l'ordre où elles comptent :
--
-- 1. Pas de BEGIN ni de COMMIT. D1 exécute les instructions d'un fichier de
--    migration comme un lot déjà transactionnel, et refuse une transaction
--    imbriquée. Ne pas en ajouter « pour être sûr » : ça fait échouer le lot.
-- 2. La nouvelle table se référence ELLE-MÊME sur `reply_to`, pas l'ancienne.
--    Si elle pointait vers `messages`, le DROP d'après violerait la clé
--    étrangère. Le RENAME final réécrit la référence vers `messages`.
-- 3. La recopie est ORDONNÉE par id. Une réponse pointe toujours vers une
--    question plus ancienne, donc plus petite : insérer dans l'ordre garantit
--    que le parent existe déjà quand l'enfant arrive, sans avoir à différer la
--    vérification des clés.
--
-- Pas de `IF NOT EXISTS` sur le CREATE, volontairement : si un essai précédent
-- avait laissé une table `messages_new` derrière lui, on veut que la migration
-- échoue bruyamment plutôt que de recopier dans une table déjà remplie.

CREATE TABLE messages_new (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  kind       TEXT NOT NULL CHECK (kind IN ('ask', 'reply', 'note', 'love')),
  from_user  TEXT NOT NULL REFERENCES users (id),
  to_user    TEXT NOT NULL REFERENCES users (id),
  body       TEXT,                         -- NULL si kind = 'ask' ou 'love'
  reply_to   INTEGER REFERENCES messages_new (id),
  created_at INTEGER NOT NULL,
  seen_at    INTEGER
);

INSERT INTO messages_new (id, kind, from_user, to_user, body, reply_to, created_at, seen_at)
SELECT id, kind, from_user, to_user, body, reply_to, created_at, seen_at
FROM messages
ORDER BY id;

DROP TABLE messages;

ALTER TABLE messages_new RENAME TO messages;

-- Les index partent avec l'ancienne table : on les recrée à l'identique.
CREATE INDEX IF NOT EXISTS idx_messages_to ON messages (to_user, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_from ON messages (from_user, created_at DESC);
-- Retrouver vite la question ouverte : un 'ask' auquel rien ne répond.
CREATE INDEX IF NOT EXISTS idx_messages_replyto ON messages (reply_to);
