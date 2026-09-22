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

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef([]);

  // Scrollytelling: cada paso ocupa ~78vh en desktop (ver lg:min-h-[78vh] más
  // abajo), así que mientras esa franja alta scrollea, el panel de la derecha
  // queda "pegado" (sticky) y este observer va marcando qué paso está
  // cruzando el centro de la pantalla para actualizar su animación.
  useEffect(() => {
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

        <div className="mt-14 lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Pasos */}
          <div className="flex flex-col">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                ref={(el) => (stepRefs.current[i] = el)}
                data-step-index={i}
                className="wt-reveal flex flex-col justify-center gap-5 py-7 first:pt-0 lg:min-h-[78vh] lg:py-0"
                style={{ '--wt-delay': `${i * 60}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold transition-colors duration-300"
                    style={{
                      background: active === i ? 'var(--wt-mint)' : 'rgba(20,36,37,0.06)',
                      color: active === i ? 'var(--wt-ink)' : 'var(--wt-muted)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="wt-heading text-[19px] font-semibold text-[var(--wt-text)] sm:text-[21px]">{s.title}</p>
                    <p className="wt-body mt-2 text-[15.5px]">{s.body}</p>
                  </div>
                </div>

                {/* En mobile no hay sticky: la animación de cada paso va inline */}
                <div className="pl-14 lg:hidden">
                  <StepVisual index={i} />
                </div>
              </div>
            ))}

            <p className="mt-2 max-w-sm text-[14px] text-[var(--wt-muted)] lg:mt-8">
              Y mientras tanto, tu menú está ahí: listo para que lo consulten y elijan qué disfrutar.
            </p>
          </div>

          {/* Panel pegado (sticky) con la animación del paso activo — solo desktop */}
          <div className="relative hidden lg:block">
            <div className="sticky top-28 flex items-center justify-center">
              <div key={active} className="wt-step-visual-enter">
                <StepVisual index={active} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
