import { useEffect, useMemo, useState } from 'react';
import {
  BadgePercent,
  Check,
  Copy,
  Gift,
  PartyPopper,
  Sparkles,
  Ticket,
  Trophy,
  Wand2,
} from 'lucide-react';
import { formatMoney } from '../api.js';

export function couponValue(c, currency = '$') {
  if (c?.type === 'descuento') return `${Number(c.value) || 0}% OFF`;
  if (c?.type === 'regalo') return 'Regalo';
  return formatMoney(c?.value, currency);
}

export function useProgressBar(pct) {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFill(pct), 160);
    return () => clearTimeout(t);
  }, [pct]);
  return fill;
}

const TYPE_META = {
  monto: { icon: Ticket, label: 'Recompensa' },
  descuento: { icon: BadgePercent, label: 'Descuento' },
  regalo: { icon: Gift, label: 'Regalo' },
};

// Paletas rotativas para que cada cupón del inicio tenga su propio color
const CATALOG_PALETTES = [
  ['#f59e0b', '#b45309'],
  ['#8b5cf6', '#6d28d9'],
  ['#f43f5e', '#be123c'],
  ['#0ea5e9', '#0369a1'],
  ['#10b981', '#047857'],
  ['#f97316', '#c2410c'],
  ['#ec4899', '#9d174d'],
  ['#14b8a6', '#0f766e'],
];

function typeLabel(c) {
  return TYPE_META[c?.type]?.label || TYPE_META.monto.label;
}

function paddedIcon(c, size = 30) {
  const Icon = TYPE_META[c?.type]?.icon || Ticket;
  return (
    <span
      className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-inner"
      style={{ background: 'rgba(255,255,255,0.22)' }}
    >
      <Icon size={size} className="animate-bump" />
    </span>
  );
}

function TicketShell({ from, to, children, className = '', hover = true }) {
  return (
    <div
      className={`ticket ticket-glow-card relative overflow-hidden rounded-[1.8rem] shadow-2xl ${hover ? '' : 'ticket-glow-card'} ${className}`}
      style={{
        background: `linear-gradient(130deg, ${from} 0%, ${to} 100%)`,
        color: '#fff',
      }}
    >
      <div
        className="ticket-halo"
        style={{
          background:
            'radial-gradient(circle at 28% 18%, rgba(255,255,255,0.4), transparent 52%), radial-gradient(circle at 82% 86%, rgba(255,255,255,0.26), transparent 46%)',
        }}
      />
      <div className="ticket-dots" />
      <div className="ticket-stripe" />
      <div className="ticket-shine" />
      {children}
      <span className="ticket-notch ticket-notch-left" />
      <span className="ticket-notch ticket-notch-right" />
    </div>
  );
}

function Sparks() {
  return (
    <>
      <Sparkles size={22} className="ticket-spark" style={{ top: '12%', left: '8%' }} />
      <Sparkles size={14} className="ticket-spark" style={{ bottom: '18%', left: '22%', animationDelay: '1.2s' }} />
      <Sparkles size={18} className="ticket-spark" style={{ top: '18%', right: '12%', animationDelay: '0.6s' }} />
      <Sparkles size={12} className="ticket-spark" style={{ bottom: '24%', right: '30%', animationDelay: '2s' }} />
    </>
  );
}

export function ActiveCouponCard({ coupon, currency = '$' }) {
  const points = Number(coupon.points) || 0;
  const target = Math.max(1, Number(coupon.target_points) || 1);
  const pct = Math.min(100, Math.round((points / target) * 100));
  const fill = useProgressBar(pct);
  const pal = CATALOG_PALETTES[coupon.type === 'descuento' ? 1 : coupon.type === 'regalo' ? 2 : 0];

  return (
    <TicketShell from={pal[0]} to={pal[1]}>
      <Sparks />
      <div className="relative z-10 flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:gap-8 sm:px-10 sm:py-9">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="ticket-chip">
            <PartyPopper size={13} />
            Tu cupón activo
          </span>
          <div className="flex items-center gap-4">
            {paddedIcon(coupon, 32)}
            <div className="min-w-0">
              <p className="text-5xl font-black leading-none drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)] sm:text-6xl">
                {couponValue(coupon, currency)}
              </p>
              <p className="mt-2 truncate text-lg font-extrabold text-white/95 drop-shadow">{coupon.title}</p>
            </div>
          </div>
          {coupon.description && (
            <p className="text-sm leading-relaxed font-semibold text-white/85 sm:max-w-md">{coupon.description}</p>
          )}
        </div>

        <div className="hidden w-px self-stretch border-l-2 border-dashed border-white/45 sm:block" />

        <div className="flex w-full flex-col gap-3 sm:w-72">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-black text-white">{pct}%</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-black">
              <Trophy size={16} />
              Listo al 100%
            </span>
          </div>
          <div className="h-5 overflow-hidden rounded-full bg-black/25 p-1 shadow-inner">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 transition-[width] duration-1000 ease-out"
              style={{ width: `${fill}%` }}
            >
              <div className="animate-shimmer absolute inset-0 rounded-full bg-[linear-gradient(100deg,transparent,rgba(120,60,0,0.35)_42%,rgba(120,60,0,0.35)_50%,transparent_58%)] bg-[length:200%_100%]" />
            </div>
          </div>
          <p className="text-center text-lg font-black">
            {points}<span className="opacity-75">/{target}</span> puntos
            <span className="ml-1.5 text-sm font-bold text-white/80">· te faltan {Math.max(0, target - points)}</span>
          </p>
        </div>
      </div>
    </TicketShell>
  );
}

export function ReadyCouponCard({ coupon, currency = '$' }) {
  const [copied, setCopied] = useState(false);
  const pal = useMemo(() => CATALOG_PALETTES[0], []);

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

  return (
    <TicketShell from={pal[0]} to={pal[1]}>
      <div className="relative z-10 flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:gap-8 sm:px-10 sm:py-9">
        <div className="min-w-0 flex-1">
          <span className="ticket-chip">
            <PartyPopper size={13} />
            Listo para canjear
          </span>
          <div className="mt-3 flex items-center gap-4">
            {paddedIcon(coupon, 32)}
            <div className="min-w-0">
              <p className="text-5xl font-black leading-none drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)] sm:text-6xl">
                {couponValue(coupon, currency)}
              </p>
              <p className="mt-2 truncate text-lg font-extrabold text-white/95">{coupon.title}</p>
            </div>
          </div>
          {coupon.description && <p className="mt-2 text-sm font-semibold text-white/85">{coupon.description}</p>}
        </div>

        <div className="hidden w-px self-stretch border-l-2 border-dashed border-white/45 sm:block" />

        <div className="flex w-full flex-col gap-2 sm:w-80">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Código de canje</p>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-white/70 bg-black/25 px-4 py-3 backdrop-blur-sm">
            <p className="flex-1 select-all font-mono text-2xl font-black tracking-widest text-white">
              {coupon.code}
            </p>
            <button
              onClick={copy}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white transition hover:scale-105 hover:bg-white/25"
              aria-label="Copiar código"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-center text-xs font-bold text-white/80">
            Mostrá este código al pagar en el local para canjearlo.
          </p>
        </div>
      </div>
    </TicketShell>
  );
}

export function CatalogCouponCard({ c, currency = '$', index = 0, state }) {
  const pal = CATALOG_PALETTES[index % CATALOG_PALETTES.length];
  const { isAuthed, isActiveCoupon, disabled, activating, onActivate } = state || {};

  return (
    <div className="animate-fade-up" style={{ animationDelay: `${(index % 8) * 70}ms` }}>
      <TicketShell from={pal[0]} to={pal[1]}>
        <Sparks />
        <div className="relative z-10 flex flex-col px-6 pb-5 pt-6">
          <div className="flex items-center justify-between gap-2">
            <span className="ticket-chip">
              <Wand2 size={13} />
              {typeLabel(c)}
            </span>
            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-black">
              <Ticket size={12} className="mr-1 inline" />
              {Number(c.target_points)} pts
            </span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            {paddedIcon(c, 30)}
            <p className="text-5xl font-black leading-none drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)] sm:text-6xl">
              {couponValue(c, currency)}
            </p>
          </div>

          <h3 className="mt-3 text-xl font-black drop-shadow">{c.title}</h3>
          {c.description && <p className="mt-1 text-sm font-semibold text-white/85">{c.description}</p>}

          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-black/25">
            <div className="h-full w-full rounded-full bg-white/50 animate-pulse" />
          </div>
          <p className="mt-1.5 text-center text-xs font-black uppercase tracking-widest text-white/75">
            llegá a los {Number(c.target_points)} puntos
          </p>

          <div className="mt-5">
            {isActiveCoupon ? (
              <span className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/70 bg-black/20 px-4 py-3.5 text-sm font-black">
                <Check size={18} />
                Tu cupón activo
              </span>
            ) : !isAuthed ? (
              <a href="/#/registro" className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-black shadow-lg" style={{ color: pal[1] }}>
                <Sparkles size={16} />
                Creá tu cuenta y activá
              </a>
            ) : disabled ? (
              <span className="flex items-center justify-center gap-2 rounded-2xl bg-black/25 px-4 py-3.5 text-sm font-black text-white/80">
                Completá tu cupón activo
              </span>
            ) : (
              <button
                onClick={() => onActivate?.()}
                disabled={activating}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-black shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: pal[1] }}
              >
                {activating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Activando…
                  </>
                ) : (
                  <>
                    <Ticket size={16} />
                    Activar este cupón
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </TicketShell>
    </div>
  );
}