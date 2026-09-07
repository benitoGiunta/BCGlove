import { useEffect, useState } from 'react';

/**
 * Le CSS neutralise déjà toutes les animations sous `prefers-reduced-motion`
 * (voir styles/reset.css). Ce hook sert aux cas que le CSS ne couvre pas :
 * une séquence pilotée en JavaScript, comme la première ouverture (EF-10.5),
 * doit être remplacée, pas seulement figée.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
