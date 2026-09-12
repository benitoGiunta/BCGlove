import { useEffect, useRef } from 'react';
import { LOVE_START } from '../lib/config.ts';
import { copy } from '../lib/copy.ts';
import { dayAndYear } from '../lib/relative.ts';
import { Emblem } from './Emblem.tsx';
import styles from './UnionModal.module.css';

export interface UnionModalProps {
  onClose: () => void;
}

/**
 * La modale de l'union (EF-18). La PREMIÈRE superposition de l'app, et la seule
 * prévue.
 *
 * Le reste du projet remplace l'écran plutôt que de le recouvrir, et une règle
 * dit même que rien ne se met devant le compteur. Cette règle vise ce que l'app
 * DÉCIDE de montrer — l'invitation aux notifications est un bandeau pour cette
 * raison. Ce que l'utilisateur ouvre d'un geste volontaire est autre chose : il
 * savait ce qu'il faisait, et il peut le refermer de trois manières (D28).
 *
 * Elle n'a qu'un seul élément focalisable, la croix. Le piège à focus consiste
 * donc à ramener la tabulation sur elle, ce qui est à la fois le plus simple et
 * le plus correct : rien derrière la carte n'est atteignable au clavier.
 */
export function UnionModal({ onClose }: UnionModalProps) {
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Retenu AVANT de déplacer le focus : c'est là qu'il devra revenir, et sur
    // l'écran d'accueil c'est l'emblème (EF-18.8).
    const origine = document.activeElement;
    close.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      event.preventDefault();
      close.current?.focus();
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (origine instanceof HTMLElement) origine.focus();
    };
  }, [onClose]);

  return (
    // Le voile referme au toucher (EF-18.7). Pas d'équivalent clavier à
    // écrire : Échap fait exactement ça, et la croix est là pour les yeux.
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={styles.card}
        role="dialog"
        aria-modal="true"
        aria-label={copy.union.title}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={close}
          type="button"
          className={styles.close}
          aria-label={copy.union.close}
          onClick={onClose}
        >
          {/* Le signe multiplié, pas une croix dessinée : le projet écrit ses
              symboles en typographie, comme le ♡ du monogramme. */}
          <span aria-hidden="true">&#215;</span>
        </button>

        {/* Le médaillon (EF-18.4) : l'image est brune et rose pâle, sur l'aplat
            bordeaux elle perdait son contraste. C'est le seul endroit de l'app
            où une surface crème est posée sur du bordeaux. */}
        <div className={styles.medallion}>
          <Emblem size="large" />
        </div>

        <p className={styles.phrase}>{copy.union.phrase(dayAndYear(Date.parse(LOVE_START)))}</p>
      </div>
    </div>
  );
}
