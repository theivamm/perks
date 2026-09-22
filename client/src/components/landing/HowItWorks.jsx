import { useState } from 'react';
import { Gift, QrCode, ScanLine, Sparkles } from 'lucide-react';
import PhoneFrame from './PhoneFrame.jsx';

const STEPS = [
  {
    title: 'Creás un cupón.',
    body: 'Elegís el premio y la cantidad de puntos para conseguirlo. Puede ser un descuento o ese pequeño regalo que representa a tu negocio.',
    Icon: Gift,
    scene: {
      label: 'Nuevo cupón',
      lines: [
        ['Nombre', 'Café de regalo'],
        ['Tipo', 'Regalo'],
        ['Meta', '5 puntos'],
      ],
    },
  },
  {
    title: 'Tus clientes lo activan.',
    body: 'Entran al perfil de tu negocio, acceden con Google y eligen el cupón que quieren empezar a completar.',
    Icon: Sparkles,
    scene: {
      label: 'Cupón activado',
      lines: [
        ['Cliente', 'Martina L.'],
        ['Cupón', 'Café de regalo'],
        ['Estado', 'Activado'],
      ],
    },
  },
  {
    title: 'Cada visita puede sumar.',
    body: 'Cuando corresponde sumar un punto, escaneás el QR de su cupón y lo registrás desde el panel. El cliente puede ver cómo avanza.',
    Icon: QrCode,
    scene: {
      label: 'Registrar punto',
      lines: [
        ['Cliente', 'Martina L.'],
        ['Puntos', '3 de 5'],
        ['Acción', 'Sumar 1 punto'],
      ],
    },
  },
  {
    title: 'Llega el premio. Y otra vuelta.',
    body: 'Al completar la meta, el cupón queda listo para canjear. Lo validás en tu negocio y el cliente puede activar otro para volver a empezar.',
    Icon: ScanLine,
    scene: {
      label: 'Canje validado',
      lines: [
        ['Cliente', 'Martina L.'],
        ['Cupón', 'Café de regalo'],
        ['Estado', 'Canjeado ✓'],
      ],
    },
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section id="como-funciona" className="relative overflow-hidden px-4 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
      <div className="wt-bg-blob" style={{ width: 340, height: 340, background: '#ffc4e1', top: '-4%', left: '-6%' }} />

      <div className="relative mx-auto max-w-[1280px]">
        <div className="wt-reveal max-w-2xl">
          <p className="wt-eyebrow">Cómo funciona</p>
          <h2 className="wt-h2 mt-5 text-[var(--wt-text)]">De una visita a las ganas de volver.</h2>
          <p className="wt-body mt-5">
            Vos definís el beneficio. Tus clientes van sumando. Cada uno puede seguir su progreso desde el celular.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Pasos */}
          <div className="wt-reveal flex flex-col gap-2" style={{ '--wt-delay': '80ms' }} role="tablist" aria-label="Pasos de Wintuu">
            {STEPS.map((s, i) => {
              const isActive = i === active;
              return (
                <button
                  key={s.title}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className="flex items-start gap-4 rounded-2xl p-4 text-left transition-colors sm:p-5"
                  style={{
                    background: isActive ? 'rgba(0,207,205,0.1)' : 'transparent',
                    border: `1.5px solid ${isActive ? 'rgba(0,207,205,0.3)' : 'transparent'}`,
                  }}
                >
                  <span
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold transition-colors"
                    style={{
                      background: isActive ? 'var(--wt-mint)' : 'rgba(20,36,37,0.06)',
                      color: isActive ? 'var(--wt-ink)' : 'var(--wt-muted)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="wt-heading block text-[17px] font-semibold text-[var(--wt-text)]">{s.title}</span>
                    <span className="wt-body mt-1.5 block text-[15px]">{s.body}</span>
                  </span>
                </button>
              );
            })}

            <p className="mt-2 px-4 text-[14px] text-[var(--wt-muted)] sm:px-5">
              Y mientras tanto, tu menú está ahí: listo para que lo consulten y elijan qué disfrutar.
            </p>
          </div>

          {/* Escena dentro del teléfono */}
          <div className="wt-reveal flex items-center justify-center" style={{ '--wt-delay': '140ms' }}>
            <PhoneFrame width={260} className="wt-scene" key={active}>
              <span className="wt-tag self-center">Vista de ejemplo</span>

              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--wt-mint)]/15">
                  <step.Icon size={18} className="text-[var(--wt-mint-dark)]" />
                </span>
                <p className="wt-heading text-[15px] font-semibold text-[var(--wt-ink)]">{step.scene.label}</p>
              </div>

              <div className="mt-6 flex-1 space-y-3.5">
                {step.scene.lines.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-[var(--wt-border)] pb-3 text-[13.5px] last:border-0">
                    <span className="text-[var(--wt-muted)]">{k}</span>
                    <span className="font-semibold text-[var(--wt-ink)]">{v}</span>
                  </div>
                ))}
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
