import { useEffect, useRef, useState } from 'react';
import { StepVisual } from './HowItWorksScenes.jsx';

const STEPS = [
  {
    title: 'Creás un cupón.',
    body: 'Elegís el premio y la cantidad de puntos para conseguirlo. Puede ser un descuento o ese pequeño regalo que representa a tu negocio.',
  },
  {
    title: 'Tus clientes lo activan.',
    body: 'Entran al perfil de tu negocio, acceden con Google y eligen el cupón que quieren empezar a completar.',
  },
  {
    title: 'Cada visita puede sumar.',
    body: 'Cuando corresponde sumar un punto, escaneás el QR de su cupón y lo registrás desde el panel. El cliente puede ver cómo avanza.',
  },
  {
    title: 'Llega el premio. Y otra vuelta.',
    body: 'Al completar la meta, el cupón queda listo para canjear. Lo validás en tu negocio y el cliente puede activar otro para volver a empezar.',
  },
];

const FRIENDLY = [
  'Vos marcás las reglas.',
  'El cliente se suma al juego.',
  'Cada visita suma un puntito.',
  'Premio cumplido, otra vuelta.',
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const stepRefs = useRef([]);
  const btnRefs = useRef([]);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.dataset.stepIndex);
          if (!Number.isNaN(idx)) setActive(idx);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const select = (idx) => {
    setActive(idx);
    btnRefs.current[idx]?.focus({ preventScroll: true });
    stepRefs.current[idx]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  };

  const onKeyDown = (e, idx) => {
    const count = STEPS.length;
    let next = null;
    if (e.key === 'ArrowDown') next = (idx + 1) % count;
    if (e.key === 'ArrowUp') next = (idx - 1 + count) % count;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = count - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    btnRefs.current[next]?.focus();
  };

  return (
    <section id="como-funciona" className="relative px-4 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="wt-bg-blob" style={{ width: 340, height: 340, background: '#ffc4e1', top: '-4%', left: '-6%' }} />
      </div>

      <div className="relative mx-auto max-w-[1280px]">
        <div className="wt-reveal max-w-2xl">
          <p className="wt-eyebrow">Cómo funciona</p>
          <h2 className="wt-h2 mt-5 text-[var(--wt-text)]">De una visita a las ganas de volver.</h2>
          <p className="wt-body mt-5">
            Vos definís el beneficio. Tus clientes van sumando. Cada uno puede seguir su progreso desde el celular.
          </p>
        </div>

        <div className="mt-14 lg:grid lg:grid-cols-2 lg:gap-20">
          {/* Pasos — timeline con selección por scroll, clic y teclado */}
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute left-6 top-4 bottom-4 hidden w-px border-l-2 border-dashed border-[rgba(20,36,37,0.12)] lg:block"
            />

            <div>
              {STEPS.map((s, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={s.title}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                      btnRefs.current[i] = el?.querySelector('[data-step-btn]');
                    }}
                    data-step-index={i}
                    className="wt-reveal relative"
                    style={{ '--wt-delay': `${i * 60}ms` }}
                  >
                    <button
                      type="button"
                      data-step-btn
                      aria-current={isActive ? 'step' : undefined}
                      onClick={() => select(i)}
                      onKeyDown={(e) => onKeyDown(e, i)}
                      className="relative z-10 block w-full cursor-pointer text-left transition-opacity hover:opacity-100 focus-visible:opacity-100"
                    >
                      <span className="flex items-start gap-4 py-6 first:pt-0 sm:gap-5 lg:min-h-[54vh] lg:items-center lg:py-0">
                        <span
                          className={`wt-heading mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[17px] font-semibold transition-all duration-300 lg:mt-0 ${
                            isActive
                              ? 'bg-[var(--wt-mint)] text-[var(--wt-ink)] shadow-[0_12px_28px_rgba(0,207,205,0.45)]'
                              : 'bg-[rgba(20,36,37,0.06)] text-[var(--wt-muted)]'
                          }`}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0">
                          <span
                            className={`wt-h3 block transition-colors duration-300 ${
                              isActive ? 'text-[var(--wt-text)]' : 'text-[var(--wt-muted)]'
                            }`}
                          >
                            {s.title}
                          </span>
                          <span
                            className={`wt-body mt-2 block text-[15.5px] transition-opacity duration-300 ${
                              isActive ? 'opacity-100' : 'opacity-55'
                            }`}
                          >
                            {s.body}
                          </span>
                        </span>
                      </span>
                    </button>

                    {/* Escena inline — mobile / tablet */}
                    <div className="mt-6 flex justify-center pb-10 lg:hidden">
                      <StepVisual index={i} />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-2 max-w-sm text-[14px] text-[var(--wt-muted)] lg:mt-10">
              Y mientras tanto, tu menú está ahí: listo para que lo consulten y elijan qué disfrutar.
            </p>
          </div>

          {/* Escena pegada (sticky) — solo desktop */}
          <div className="relative hidden lg:block">
            <div className="sticky top-24 flex h-[calc(100vh-96px)] flex-col items-center justify-center">
              <div className="pointer-events-none absolute -top-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[rgba(0,207,205,0.12)] blur-[70px]" />
              <div className="pointer-events-none absolute -bottom-12 right-0 h-72 w-72 rounded-full bg-[rgba(255,196,225,0.4)] blur-[70px]" />

              <div className="relative mx-auto w-full max-w-[420px]">
                <div key={`label-${active}`} className="wt-step-visual-enter flex items-center gap-4">
                  <span className="wt-heading flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--wt-mint)] text-[17px] font-semibold text-[var(--wt-ink)] shadow-[0_12px_28px_rgba(0,207,205,0.45)]">
                    {String(active + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
<p className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-[var(--wt-mint-dark)]">
      Paso {String(active + 1).padStart(2, '0')}
    </p>
    <p className="wt-heading mt-0.5 text-[18px] font-semibold leading-tight text-[var(--wt-ink)]">
      {FRIENDLY[active]}
    </p>
                  </div>
                </div>

                <div key={active} className="wt-step-visual-enter mt-7 flex justify-center">
                  <StepVisual index={active} />
                </div>

                <div className="mt-7 flex justify-center gap-2">
                  {STEPS.map((s, i) => (
                    <button
                      key={`${s.title}-dot`}
                      type="button"
                      aria-label={`Ver paso ${i + 1}: ${s.title}`}
                      onClick={() => select(i)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        i === active
                          ? 'w-8 bg-[var(--wt-mint)]'
                          : 'w-2.5 bg-[rgba(20,36,37,0.18)] hover:bg-[rgba(20,36,37,0.32)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}