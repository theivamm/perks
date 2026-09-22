import { Coffee, Gift, Sparkles, Ticket } from 'lucide-react';

const FLOATERS = [
  { Icon: Coffee, cls: '-top-8 left-[6%]', tilt: '-8deg', delay: '0s' },
  { Icon: Sparkles, cls: '-top-10 right-[8%]', tilt: '6deg', delay: '0.9s' },
  { Icon: Ticket, cls: '-bottom-8 left-[10%]', tilt: '7deg', delay: '1.5s' },
  { Icon: Gift, cls: '-bottom-12 right-[10%]', tilt: '-5deg', delay: '0.4s' },
];

export default function MenuCta() {
  return (
    <section id="tu-menu" className="px-4 pb-20 sm:px-8 sm:pb-28 lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        <div className="wt-reveal wt-glass relative px-6 py-20 text-center sm:px-12 sm:py-24">
          {/* Halos pastel */}
          <div className="pointer-events-none absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[rgba(0,207,205,0.12)] blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[rgba(255,196,225,0.4)] blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-10 left-0 h-56 w-56 rounded-full bg-[rgba(201,187,255,0.3)] blur-[80px]" />

          {/* Microanimaciones flotando alrededor, sobresaliendo del contenedor */}
          {FLOATERS.map(({ Icon, cls, tilt, delay }, i) => (
            <span
              key={i}
              className={`wt-float-chip pointer-events-none absolute hidden h-16 w-16 items-center justify-center rounded-3xl border border-[var(--wt-border)] bg-white/90 shadow-lg sm:flex ${cls}`}
              style={{ '--wt-tilt': tilt, animationDelay: delay }}
            >
              <Icon size={26} className="text-[var(--wt-mint-dark)]" />
            </span>
          ))}

          <div
            className="wt-float-chip pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 xl:block"
            style={{ '--wt-tilt': '4deg', animationDelay: '0.6s' }}
          >
            <div
              className="wt-coupon wt-coupon-sm w-[230px]"
              style={{ background: 'linear-gradient(120deg, #ffd3ea, #fff0f8, #ffc2e0, #ffd3ea)' }}
            >
              <p className="wt-heading text-[13.5px] font-semibold leading-tight text-[var(--wt-ink)]">Tu menú, siempre a mano</p>
              <p className="mt-1 text-[11px] text-[var(--wt-ink)]/60">Consultalo, elegí y disfrutá</p>
            </div>
          </div>

          <div
            className="wt-float-chip pointer-events-none absolute -left-4 top-1/2 hidden -translate-y-1/2 xl:block"
            style={{ '--wt-tilt': '-4deg', animationDelay: '1.2s' }}
          >
            <div
              className="wt-coupon wt-coupon-sm w-[190px]"
              style={{ background: 'linear-gradient(120deg, #ffefae, #fff8dc, #f1e8ff, #ffefae)' }}
            >
              <p className="wt-heading text-[13.5px] font-semibold leading-tight text-[var(--wt-ink)]">Del café a otro más</p>
              <p className="mt-1 text-[11px] text-[var(--wt-ink)]/60">En una sola visita</p>
            </div>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <p className="wt-h1 text-[var(--wt-text)]">
              Y mientras tanto, <span className="wt-candy-text">tu menú está ahí</span>
            </p>
            <p className="wt-body mx-auto mt-6 max-w-2xl text-[clamp(17px,1.4vw,21px)] text-[var(--wt-text)]/75">
              listo para que lo consulten y elijan qué disfrutar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}