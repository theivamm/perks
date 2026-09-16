import { useMemo, useState } from 'react';
import { BadgePercent, Check, ChevronDown, Copy, Gift, MousePointerClick, PartyPopper, Sparkles, Ticket } from 'lucide-react';
import { formatMoney } from '../api.js';

const STATUS_LABEL = { activo: 'Activo', usado: 'Usado', vencido: 'Vencido' };
const MODE_LABEL = { web: 'Web', local: 'Local', ambos: 'Web + Local' };

const CONFETTI_COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#0ea5e9', '#ec4899', '#14b8a6', '#f97316'];

function Confetti() {
  const parts = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        drift: (Math.random() - 0.5) * 160,
        rot: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360),
        delay: Math.random() * 0.9,
        dur: 2 + Math.random() * 0.9,
        size: 6 + Math.random() * 7,
        round: Math.random() > 0.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20" aria-hidden>
      {parts.map((p) => (
        <span
          key={p.id}
          className="animate-confetti-fall absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 1.6),
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--drift': `${p.drift}px`,
            '--rot': `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

export default function CouponCard({ coupon, currency = '$', onUse, using }) {
  const [open, setOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [copied, setCopied] = useState(false);

  const active = coupon.status === 'activo';
  const canLocal = active && coupon.mode !== 'web';
  const big =
    coupon.type === 'descuento'
      ? `${Number(coupon.value) || 0}%`
      : coupon.type === 'regalo'
        ? 'REGALO'
        : formatMoney(coupon.value, currency);
  const subtitle = coupon.type === 'descuento' ? 'de descuento' : coupon.type === 'regalo' ? 'para canjear' : 'de descuento';

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 3200);
      }
      return next;
    });
  };

  const copy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  const Hero = ({ mini = false }) => (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-strong px-5 pt-6 pb-7 text-center text-primary-contrast">
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <Sparkles className="animate-float absolute left-6 top-5 h-4 w-4 opacity-70" />
      <Sparkles className="animate-float absolute right-6 top-9 h-3 w-3 opacity-50" style={{ animationDelay: '1s' }} />

      <div className="relative">
        <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
          {open ? <PartyPopper size={12} /> : <Ticket size={12} />}
          {open ? 'Cupón ganado' : 'Ganaste un cupón'}
        </div>
        <p className={`mt-3 font-black leading-none drop-shadow-sm ${mini ? 'text-4xl' : 'text-6xl'}`}>
          {big}
        </p>
        <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.25em] opacity-90">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div
      className={`group relative w-full overflow-visible rounded-3xl border bg-surface shadow-sm transition-all ${
        open ? 'border-primary/40 shadow-glow' : 'border-line hover:-translate-y-0.5 hover:shadow-md'
      } ${celebrate ? 'animate-bump' : ''}`}
    >
      {celebrate && <Confetti />}

      {!open ? (
        <button className="block w-full overflow-hidden rounded-3xl text-left" onClick={toggle} aria-label="Ver cupón">
          <Hero />
          <div className="relative border-t border-dashed border-line bg-surface">
            <span className="absolute left-[-9px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-page" />
            <span className="absolute right-[-9px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-page" />
            <span className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold text-ink-muted">
              <MousePointerClick size={14} className="text-primary-strong" />
              Tocá para ver tu cupón
              <ChevronDown size={14} className="animate-pulse" />
            </span>
          </div>
        </button>
      ) : (
        <div className="overflow-hidden rounded-3xl">
          <Hero mini />
          <div className="relative border-t border-dashed border-line bg-surface px-5 pb-5 pt-4">
            <span className="absolute left-[-9px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-page" />
            <span className="absolute right-[-9px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-page" />

            <div className="animate-fade-up space-y-3">
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                <BadgePercent size={16} className="text-primary-strong" />
                {coupon.description || `Premio por tus ${coupon.milestone ?? ''} compras`}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted">
                {coupon.milestone && (
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 font-bold text-primary-strong">
                    Compra #{coupon.milestone}
                  </span>
                )}
                <span className="rounded-full bg-surface-alt px-2 py-0.5 font-bold">
                  {MODE_LABEL[coupon.mode] || coupon.mode}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-bold ${
                    active ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-surface-alt text-ink-muted'
                  }`}
                >
                  {STATUS_LABEL[coupon.status] || coupon.status}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface-alt px-4 py-3">
                <p className="flex-1 select-all font-mono text-lg font-extrabold tracking-widest text-ink">
                  {coupon.code}
                </p>
                <button className="btn-icon !h-8 !w-8" onClick={copy} aria-label="Copiar código">
                  {copied ? <Check size={15} className="text-green-600 dark:text-green-400" /> : <Copy size={15} />}
                </button>
              </div>

              <p className="text-center text-[11px] font-semibold text-ink-muted">
                Mostrá este código al pagar para usarlo.
              </p>

              {canLocal && (
                <button
                  className={`btn-primary w-full ${using ? 'pointer-events-none opacity-60' : ''}`}
                  onClick={() => onUse?.(coupon)}
                  disabled={using}
                >
                  {using ? <Check size={16} className="animate-pulse" /> : <Check size={16} />}
                  {using ? 'Registrando...' : 'Lo usé en el local'}
                </button>
              )}

              {active && !canLocal && (
                <p className="text-center text-xs font-semibold text-ink-muted">
                  Tu premio se aplica solo en la web del local.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}