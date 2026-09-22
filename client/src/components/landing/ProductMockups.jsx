import { useEffect, useRef, useState } from 'react';
import { Coffee, Gift, Percent, Sparkles, Menu as MenuIcon, Trophy, Users, Ticket, Truck, Check } from 'lucide-react';
import counterPhoto from '../../assets/landing/counter-owner.jpg';
import menuPhoto from '../../assets/landing/menu-pastry.jpg';

/* ── A. Cupones ──────────────────────────────────────────── */
// Distintos a los de la carta de cupones del hero (Café gratis, 15% OFF,
// 2x1 postres, Regalo sorpresa), para no repetir ejemplos en la misma página.
const MINI_COUPONS = [
  { bg: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)', icon: Gift, label: 'Postre de regalo', desc: 'Sumá puntos y llevate un dulce', sub: '6 puntos' },
  { bg: 'linear-gradient(120deg, #ffd3ea, #fff0f8, #ffc2e0, #ffd3ea)', icon: Percent, label: '20% de descuento', desc: 'Válido en toda la carta', sub: '8 puntos' },
  { bg: 'linear-gradient(120deg, #ffefae, #fff8dc, #f1e8ff, #ffefae)', icon: Sparkles, label: '3x2 en bebidas', desc: 'Llevate 3 y pagá 2', sub: '10 puntos' },
  { bg: 'linear-gradient(120deg, #bfe3ff, #eaf6ff, #cfe9ff, #bfe3ff)', icon: Truck, label: 'Envío gratis', desc: 'Sin cargo en tu próximo pedido', sub: '5 puntos' },
  { bg: 'linear-gradient(120deg, #e3dbff, #f5f0ff, #d9cbff, #e3dbff)', icon: Ticket, label: 'Combo 2x1', desc: 'Dos productos al precio de uno', sub: '12 puntos' },
  { bg: 'linear-gradient(120deg, #ffd9c2, #fff1e6, #ffcdae, #ffd9c2)', icon: Coffee, label: 'Bebida de cortesía', desc: 'Invitación de la casa', sub: '4 puntos' },
];

// El track se duplica una vez y anima -50% de su propio alto: como las dos
// mitades son idénticas, el loop queda perfectamente continuo.
export function CouponsMock() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <div className="relative h-[300px] overflow-hidden">
      <div className={`flex flex-col gap-3 ${reduced ? '' : 'wt-coupon-marquee-track'}`}>
        {[...MINI_COUPONS, ...MINI_COUPONS].map(({ bg, icon: Icon, label, desc, sub }, i) => (
          <div
            key={i}
            className="wt-coupon wt-coupon-sm flex w-full shrink-0 items-center justify-between gap-4"
            style={{ background: bg }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/55">
                <Icon size={18} className="text-[var(--wt-mint-dark)]" />
              </span>
              <div className="min-w-0">
                <p className="wt-heading truncate text-[14px] font-semibold leading-tight text-[var(--wt-ink)]">{label}</p>
                <p className="truncate text-[11.5px] text-[var(--wt-ink)]/65">{desc}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/55 px-3.5 py-1.5 text-[12.5px] font-bold text-[var(--wt-ink)]">
              {sub}
            </span>
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-8"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0), var(--wt-surface))' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0), var(--wt-surface))' }}
      />
    </div>
  );
}

/* ── B. Identidad ────────────────────────────────────────── */
export function IdentityMock() {
  return (
    <div className="relative h-full min-h-[200px] overflow-hidden rounded-[24px] border border-[var(--wt-border)]">
      <img
        src={counterPhoto}
        alt="Persona detrás del mostrador de su negocio usando una tablet"
        className="h-full w-full object-cover"
        style={{ objectPosition: '60% 40%' }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
      {/* .wt-glass fija position:relative con más especificidad que la
          utilidad .absolute de Tailwind (dos clases vs. una): sin el style
          inline, "absolute" queda pisado y la pill se corre fuera del
          recorte del contenedor (overflow:hidden), casi invisible. */}
      <div
        style={{ position: 'absolute' }}
        className="wt-glass wt-glass-strong bottom-4 left-4 right-4 px-4 py-3 sm:right-auto sm:max-w-[220px]"
      >
        <p className="wt-heading text-[13px] font-semibold text-[var(--wt-ink)]">Fidelizá tus clientes</p>
        <p className="text-[11px] text-[var(--wt-muted)]">Cupones, puntos y tu menú en un solo link.</p>
      </div>
      <div
        className="wt-float-chip absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-lg"
        style={{ '--wt-tilt': '-4deg' }}
      >
        <Check size={12} className="text-[var(--wt-mint-dark)]" />
        <span className="text-[10.5px] font-bold text-[var(--wt-ink)]">Perfil listo</span>
      </div>
    </div>
  );
}

/* ── C. Menú incluido ────────────────────────────────────── */
const MENU_ITEMS = [
  { name: 'Flat white', price: '$4.500' },
  { name: 'Croissant', price: '$3.800' },
  { name: 'Capuchino', price: '$4.200' },
  { name: 'Medialuna', price: '$1.800' },
];

// La card ocupa dos filas del bento (ver .wt-card-c), así que queda bien
// alta; la foto es el fondo de toda esa zona (flex-1) y la pill + el título
// van superpuestos con un degradado oscuro detrás para que se puedan leer.
export function MenuMock() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--wt-border)]">
      <div className="relative min-h-[260px] flex-1 overflow-hidden">
        <img
          src={menuPhoto}
          alt="Café y croissant sobre una mesa de madera con luz cálida"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/5 to-transparent" />
        <div className="relative p-5 pb-3">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11.5px] font-semibold text-[var(--wt-ink)] shadow-sm">
            Incluido en ambos planes
          </span>
          <p className="wt-h3 mt-3 text-white drop-shadow-md">Y tu menú, también.</p>
        </div>
      </div>
      <div className="bg-white/70 p-5">
        <div className="flex gap-2 text-[11px] font-semibold text-[var(--wt-muted)]">
          <span className="rounded-full bg-[var(--wt-mint)]/15 px-2.5 py-1 text-[var(--wt-mint-dark)]">Cafés</span>
          <span className="rounded-full px-2.5 py-1">Algo rico</span>
          <span className="rounded-full px-2.5 py-1">Bebidas</span>
        </div>
        <div className="mt-3 space-y-2.5">
          {MENU_ITEMS.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[13px]">
              <span className="text-[var(--wt-ink)]/80">{item.name}</span>
              <span className="font-semibold text-[var(--wt-mint-dark)]">{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── D. Panel ────────────────────────────────────────────── */
const PANEL_ROWS = [
  { name: 'Martina L.', state: 'En progreso' },
  { name: 'Federico R.', state: 'Listo para canjear' },
];

export function PanelMock() {
  return (
    <div className="wt-glass wt-glass-strong h-full min-h-[190px] rounded-[24px] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2 text-[12px] font-semibold">
          <span className="flex items-center gap-1.5 rounded-full bg-[var(--wt-mint)]/15 px-2.5 py-1 text-[var(--wt-mint-dark)]">
            <MenuIcon size={13} /> Menú
          </span>
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[var(--wt-muted)]">
            <Users size={13} /> Clientes
          </span>
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[var(--wt-muted)]">
            <Ticket size={13} /> Cupones
          </span>
        </div>
        <span className="wt-tag">Vista del negocio</span>
      </div>

      <div className="mt-4 space-y-2">
        {PANEL_ROWS.map((row) => (
          <div key={row.name} className="flex items-center justify-between rounded-xl border border-[var(--wt-border)] bg-white/70 px-3.5 py-2.5">
            <span className="text-[13px] text-[var(--wt-ink)]/85">{row.name}</span>
            <span
              className="text-[11px] font-semibold"
              style={{ color: row.state === 'Listo para canjear' ? 'var(--wt-mint-dark)' : 'var(--wt-muted)' }}
            >
              {row.state}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── E. Puntos — timeline horizontal que se va completando ──── */
const TOTAL_STEPS = 5;
const STEP_MS = 550;
const PAUSE_MS = 1700;
const CONFETTI_COLORS = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#facc15', '#f87171'];

export function PointsMock() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const [burst, setBurst] = useState(0);
  const wasDone = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(TOTAL_STEPS);
      return undefined;
    }

    let timer;
    let running = false;

    const loop = (step) => {
      setActive(step);
      if (step >= TOTAL_STEPS) {
        timer = setTimeout(() => loop(0), PAUSE_MS);
        return;
      }
      timer = setTimeout(() => loop(step + 1), STEP_MS);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !running) {
            running = true;
            timer = setTimeout(() => loop(1), 400);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const done = active >= TOTAL_STEPS;

  useEffect(() => {
    if (done && !wasDone.current) setBurst((b) => b + 1);
    wasDone.current = done;
  }, [done]);

  return (
    <div ref={ref} className="relative flex h-full min-h-[220px] flex-col items-center justify-center gap-7 overflow-hidden px-2">
      <div className="wt-bg-blob" style={{ width: 220, height: 220, background: '#bff3ea', top: '-16%', left: '-10%' }} />
      <div className="wt-bg-blob" style={{ width: 190, height: 190, background: '#ffd3ea', bottom: '-16%', right: '-8%' }} />

      {burst > 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {CONFETTI_COLORS.map((color, i) => (
            <span
              key={`${burst}-${color}`}
              className="animate-confetti-fall absolute left-1/2 top-0 h-2 w-2 rounded-sm"
              style={{ marginLeft: `${(i - 2.5) * 24}px`, background: color, animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      )}

      <div className="relative flex w-full max-w-md items-center">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const stepDone = i < active;
          const isLast = i === TOTAL_STEPS - 1;
          return (
            <div key={i} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
              <span
                className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold transition-all duration-500 ${
                  stepDone
                    ? 'border-[var(--wt-mint)] bg-[var(--wt-mint)] text-white shadow-[0_0_18px_rgba(0,207,205,0.55)]'
                    : 'border-[var(--wt-border)] bg-white text-[var(--wt-muted)]'
                }`}
              >
                {isLast && stepDone ? <Trophy size={17} /> : stepDone ? <Check size={16} /> : i + 1}
              </span>
              {!isLast && (
                <span className="relative mx-1 h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--wt-border)]">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--wt-mint)] transition-all ease-out"
                    style={{ width: stepDone ? '100%' : '0%', transitionDuration: `${STEP_MS}ms` }}
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative text-center">
        <p className="wt-heading text-[22px] font-semibold text-[var(--wt-ink)]">
          {done ? '5 de 5 · ¡Listo!' : `${active} de 5 puntos`}
        </p>
        <p className="mt-1.5 text-[15px] text-[var(--wt-muted)]">
          {done ? 'El beneficio te espera.' : `Te falta${TOTAL_STEPS - active === 1 ? '' : 'n'} ${TOTAL_STEPS - active} punto${TOTAL_STEPS - active === 1 ? '' : 's'}.`}
        </p>
      </div>
    </div>
  );
}
