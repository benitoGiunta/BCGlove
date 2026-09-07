import { useState } from 'react';
import { copy } from '../lib/copy.ts';
import { extractKey } from '../lib/identity.ts';
import { Backdrop } from './Backdrop.tsx';
import { Button } from './Button.tsx';
import styles from './ClaimScreen.module.css';

export interface ClaimScreenProps {
  onClaim: (key: string) => void;
}

/**
 * L'app est installée sur l'écran d'accueil, mais elle n'a pas d'identité.
 *
 * Ça arrive nécessairement au moins une fois : iOS ouvre l'app installée sur la
 * racine du site, sans le `?k=` du lien, et le stockage de l'app installée est
 * séparé de celui de Safari — la clé mémorisée dans le navigateur y est donc
 * invisible. Plutôt qu'une impasse, on demande le lien une fois. Après, c'est
 * réglé pour toujours.
 *
 * N'apparaît QU'EN mode autonome : dans un navigateur, un visiteur de passage
 * garde le message neutre et n'apprend rien (EF-7.2).
 */
export function ClaimScreen({ onClaim }: ClaimScreenProps) {
  const [text, setText] = useState('');
  const [failed, setFailed] = useState(false);

  const submit = () => {
    const key = extractKey(text);
    if (key === null) {
      setFailed(true);
      return;
    }
    onClaim(key);
  };

  return (
    <main className={styles.screen}>
      <Backdrop />

      <div className={styles.column}>
        <div className={styles.card}>
          <p className={styles.title}>{copy.claim.title}</p>

          <textarea
            className={styles.field}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setFailed(false);
            }}
            placeholder={copy.claim.placeholder}
            aria-label={copy.claim.placeholder}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />

          {failed && <p className={styles.error}>{copy.claim.failed}</p>}

          <div className={styles.actions}>
            <Button onClick={submit} disabled={text.trim().length === 0}>
              {copy.claim.submit}
            </Button>
          </div>

          <p className={styles.help}>{copy.claim.help}</p>
        </div>
      </div>
    </main>
  );
}
