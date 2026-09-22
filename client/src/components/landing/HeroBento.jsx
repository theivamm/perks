import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const FADE_DISTANCE = 520; // px de scroll hasta que el contenido desaparece del todo
const RISE_DISTANCE = 130; // px que sube el contenido mientras se desvanece

const COUPONS = [
  {
    cls: 'wt-coupon-1',
    bg: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)',
    icon: '☕',
    title: 'Café gratis',
    sub: 'Completá 5 puntos',
    pos: '-left-2 top-[2%] xl:-left-10',
    rotate: '-6deg',
  },
  {
    cls: 'wt-coupon-2',
    bg: 'linear-gradient(120deg, #ffd3ea, #fff0f8, #ffc2e0, #ffd3ea)',
    icon: '🎁',
    title: '15% OFF',
    sub: 'Próxima compra',
    pos: '-right-2 top-[14%] xl:-right-10',
    rotate: '5deg',
  },
  {
    cls: 'wt-coupon-3',
    bg: 'linear-gradient(120deg, #ffefae, #fff8dc, #f1e8ff, #ffefae)',
    icon: '✨',
    title: '2x1 postres',
    sub: 'Fin de semana',
    pos: '-left-2 bottom-[2%] xl:-left-6',
    rotate: '-4deg',
  },
  {
    cls: 'wt-coupon-4',
    bg: 'linear-gradient(120deg, #e3dbff, #f5f0ff, #ffd3ea, #e3dbff)',
    icon: '💝',
    title: 'Regalo sorpresa',
    sub: '10 puntos',
    pos: '-right-2 bottom-[-4%] xl:-right-6',
    rotate: '4deg',
  },
];

function Coupon({ cls, bg, icon, title, sub, className = '', rotate }) {
  return (
    <div className={`wt-coupon wt-coupon-lg ${cls} ${className} inline-flex w-fit`} style={{ background: bg, rotate }}>
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/55 text-[28px]">
          {icon}
        </span>
        <div className="max-w-[200px] border-l-2 border-dashed border-[rgba(8,40,44,0.18)] pl-4 text-left">
          <p className="wt-heading text-[19px] font-semibold leading-tight text-[var(--wt-ink)]">{title}</p>
          <p className="mt-1 text-[13.5px] leading-snug text-[var(--wt-ink)]/65">{sub}</p>
        </div>
      </div>
    </div>
  );
}

export default function HeroBento() {
  const contentRef = useRef(null);

  // Al hacer scroll, el contenido del hero sube y se desvanece —
  // el fondo (blobs) queda fijo, generando profundidad tipo parallax.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let ticking = false;
    const apply = () => {
      ticking = false;
      const progress = Math.min(1, Math.max(0, window.scrollY / FADE_DISTANCE));
      el.style.transform = `translateY(${-progress * RISE_DISTANCE}px)`;
      el.style.opacity = String(1 - progress);
      el.style.pointerEvents = progress > 0.85 ? 'none' : '';
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="inicio" className="wt-hero-light px-4 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-36 xl:pt-40">
      {/* Blobs pastel de fondo — quedan fijos, no siguen el parallax */}
      <div className="wt-hero-blob wt-hero-blob-pink" />
      <div className="wt-hero-blob wt-hero-blob-mint" />
      <div className="wt-hero-blob wt-hero-blob-yellow" />
      <div className="wt-hero-blob wt-hero-blob-lilac" />

      <div ref={contentRef} className="relative mx-auto max-w-7xl" style={{ willChange: 'transform, opacity' }}>
        {/* Texto centrado */}
        <div className="wt-reveal relative z-10 mx-auto flex max-w-xl flex-col items-center text-center">
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

        {/* Cupones flotando alrededor del texto — desktop */}
        <div className="wt-reveal pointer-events-none absolute inset-0 z-0 hidden lg:block" style={{ '--wt-delay': '150ms' }}>
          {COUPONS.map((c) => (
            <div key={c.title} className={`pointer-events-auto absolute ${c.pos}`}>
              <Coupon {...c} />
            </div>
          ))}
        </div>

        {/* Cupones en fila — mobile / tablet */}
        <div className="wt-reveal relative z-10 mt-14 flex flex-wrap items-center justify-center gap-4 lg:hidden" style={{ '--wt-delay': '150ms' }}>
          {COUPONS.map((c) => (
            <Coupon key={c.title} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}
