import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const COUPONS = [
  {
    bg: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)',
    icon: '☕',
    title: 'Café gratis',
    sub: 'Completá 5 puntos y disfrutá tu próximo café.',
  },
  {
    bg: 'linear-gradient(120deg, #ffd3ea, #fff0f8, #ffc2e0, #ffd3ea)',
    icon: '🎁',
    title: '15% OFF',
    sub: 'En tu próxima compra, sin vueltas.',
  },
  {
    bg: 'linear-gradient(120deg, #ffefae, #fff8dc, #f1e8ff, #ffefae)',
    icon: '✨',
    title: '2x1 postres',
    sub: 'Válido todos los fines de semana.',
  },
  {
    bg: 'linear-gradient(120deg, #e3dbff, #f5f0ff, #ffd3ea, #e3dbff)',
    icon: '💝',
    title: 'Regalo sorpresa',
    sub: 'Al llegar a los 10 puntos acumulados.',
  },
];

function CouponCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const t = setInterval(() => setIndex((i) => (i + 1) % COUPONS.length), 3200);
    return () => clearInterval(t);
  }, [paused]);

  const c = COUPONS[index];

  return (
    <div
      className="mx-auto w-full max-w-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        key={index}
        className="wt-coupon wt-coupon-lg wt-coupon-enter mx-auto w-full"
        style={{ background: c.bg }}
      >
        <div className="flex items-center gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/55 text-[26px] sm:h-16 sm:w-16 sm:text-[30px]">
            {c.icon}
          </span>
          <div className="min-w-0 border-l-2 border-dashed border-[rgba(8,40,44,0.16)] pl-5">
            <p className="wt-heading text-[22px] font-semibold leading-tight text-[var(--wt-ink)] sm:text-[26px]">
              {c.title}
            </p>
            <p className="mt-1 text-[13.5px] leading-snug text-[var(--wt-ink)]/65 sm:text-[14.5px]">{c.sub}</p>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="mt-6 flex items-center justify-center gap-2.5">
        {COUPONS.map((cp, i) => (
          <button
            key={cp.title}
            type="button"
            aria-label={`Ver cupón: ${cp.title}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span className={`wt-coupon-dot ${i === index ? 'is-active' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HeroBento() {
  return (
    <section id="inicio" className="wt-hero-light px-4 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-40">
      {/* Blobs pastel de fondo */}
      <div className="wt-hero-blob wt-hero-blob-pink" />
      <div className="wt-hero-blob wt-hero-blob-mint" />
      <div className="wt-hero-blob wt-hero-blob-yellow" />
      <div className="wt-hero-blob wt-hero-blob-lilac" />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Texto centrado */}
        <div className="wt-reveal flex flex-col items-center">
          <p className="wt-eyebrow-light">Tu negocio. Tus clientes. Más cerca.</p>

          <h1 className="wt-h1 mt-6 text-[var(--wt-ink)]">
            Con Wintuu
            <br />
            <span className="wt-candy-text">ganamos todos</span>
          </h1>

          <p className="wt-body mt-6 max-w-md text-[var(--wt-ink)]/65">
            La forma más simple de conectar tu negocio con tus clientes y ofrecerles beneficios.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a href="#producto" className="wt-btn-mint-lg">
              Conocer Wintuu <ArrowRight size={16} />
            </a>
            <a href="#como-funciona" className="wt-btn-ghost-light">
              Ver cómo funciona
            </a>
          </div>

          <p className="mt-7 text-[13.5px] text-[var(--wt-ink)]/50">
            Cupones, puntos y tu menú digital, en un mismo lugar.
          </p>
        </div>

        {/* Carrusel de cupones */}
        <div className="wt-reveal mt-16 sm:mt-20" style={{ '--wt-delay': '150ms' }}>
          <CouponCarousel />
        </div>
      </div>
    </section>
  );
}
