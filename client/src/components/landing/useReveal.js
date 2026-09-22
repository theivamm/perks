import { useEffect, useRef } from 'react';

/**
 * Activa el sistema de entrada .wt-reveal dentro del elemento referenciado.
 * Contenido visible por defecto (sin JS o si algo falla); recién al montar
 * se agrega .wt-js y un IntersectionObserver revela cada .wt-reveal una vez.
 * Respeta prefers-reduced-motion y limpia el observer al desmontar.
 */
export function useReveal() {
  const scopeRef = useRef(null);

  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return undefined;

    root.classList.add('wt-js');

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = root.querySelectorAll('.wt-reveal');

    if (prefersReduced) {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    els.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return scopeRef;
}
