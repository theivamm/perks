import { useEffect, useRef, useState } from 'react';
import { Gift, Percent, Sparkles, Menu as MenuIcon, Users, Ticket, Check } from 'lucide-react';
import counterPhoto from '../../assets/landing/counter-owner.jpg';
import menuPhoto from '../../assets/landing/menu-pastry.jpg';
import PhoneFrame from './PhoneFrame.jsx';

/* ── A. Cupones ──────────────────────────────────────────── */
const MINI_COUPONS = [
  { cls: 'wt-coupon-1', bg: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)', icon: Gift, label: 'Café de regalo', sub: '5 puntos', rotate: '-7deg', pos: 'left-2 top-3' },
  { cls: 'wt-coupon-2', bg: 'linear-gradient(120deg, #ffd3ea, #fff0f8, #ffc2e0, #ffd3ea)', icon: Percent, label: '15% descuento', sub: '8 puntos', rotate: '4deg', pos: 'right-1 top-0' },
  { cls: 'wt-coupon-4', bg: 'linear-gradient(120deg, #ffefae, #fff8dc, #f1e8ff, #ffefae)', icon: Sparkles, label: '2x1 postres', sub: '10 puntos', rotate: '-3deg', pos: 'left-8 bottom-0' },
];

export function CouponsMock() {
  return (
    <div className="relative flex h-full min-h-[210px] items-center justify-center py-6">
      {MINI_COUPONS.map(({ cls, bg, icon: Icon, label, sub, rotate, pos }) => (
        <div
          key={label}
          className={`wt-coupon wt-coupon-sm absolute ${pos} ${cls} w-[72%] max-w-[220px]`}
          style={{ background: bg, rotate }}
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/55">
              <Icon size={15} className="text-[var(--wt-mint-dark)]" />
            </span>
            <div>
              <p className="wt-heading text-[12.5px] font-semibold leading-tight text-[var(--wt-ink)]">{label}</p>
              <p className="text-[10.5px] text-[var(--wt-ink)]/60">{sub}</p>
            </div>
          </div>
        </div>
      ))}
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
      <div className="wt-glass wt-glass-strong absolute bottom-4 left-4 right-4 px-4 py-3 sm:right-auto sm:max-w-[220px]">
        <p className="wt-heading text-[13px] font-semibold text-[var(--wt-ink)]">Café Nube</p>
        <p className="text-[11px] text-[var(--wt-muted)]">Perfil de ejemplo · /cafe-nube</p>
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
];

export function MenuMock() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--wt-border)]" style={{ background: 'var(--wt-cream)' }}>
      <div className="p-5 pb-3">
        <span className="wt-tag">Incluido en ambos planes</span>
        <p className="wt-heading mt-3 text-[18px] font-semibold" style={{ color: 'var(--wt-ink)' }}>
          Y tu menú, también.
        </p>
      </div>

      <div className="relative mt-auto overflow-hidden">
        <img
          src={menuPhoto}
          alt="Café y croissant sobre una mesa de madera con luz cálida"
          className="h-28 w-full object-cover sm:h-32"
          loading="lazy"
        />
      </div>
      <div className="bg-white/70 p-4">
        <div className="flex gap-2 text-[11px] font-semibold text-[var(--wt-muted)]">
          <span className="rounded-full bg-[var(--wt-mint)]/15 px-2.5 py-1 text-[var(--wt-mint-dark)]">Cafés</span>
          <span className="rounded-full px-2.5 py-1">Algo rico</span>
          <span className="rounded-full px-2.5 py-1">Bebidas</span>
        </div>
        <div className="mt-3 space-y-2">
          {MENU_ITEMS.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[12.5px]">
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

/* ── E. Puntos — dentro de un teléfono ──────────────────────── */
export function PointsMock() {
  const ref = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDone(true);
      return undefined;
    }

    let timer;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timer = setTimeout(() => setDone(true), 500);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const dots = [true, true, true, true, done];

  return (
    <div ref={ref} className="flex h-full min-h-[210px] items-center justify-center">
      <PhoneFrame width={190}>
        <span className="wt-tag self-center">Vista de ejemplo</span>
        <div className="mt-4 flex flex-1 flex-col items-center justify-center text-center">
          <div className="wt-dot-row">
            {dots.map((filled, i) => (
              <span key={i} className={`wt-dot ${filled ? 'is-filled' : ''}`} />
            ))}
          </div>
          <p className="wt-heading mt-4 text-[14px] font-semibold text-[var(--wt-ink)]">
            {done ? '5 de 5 · ¡Listo!' : '4 de 5 puntos'}
          </p>
          <p className="mt-1 text-[11px] text-[var(--wt-muted)]">
            {done ? 'El beneficio te espera.' : 'Te falta 1 punto.'}
          </p>
        </div>
      </PhoneFrame>
    </div>
  );
}
