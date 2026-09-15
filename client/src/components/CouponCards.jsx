import { useEffect, useState } from 'react';
import { BadgePercent, Check, Copy, Gift, PartyPopper, Ticket, Trophy } from 'lucide-react';
import { formatMoney } from '../api.js';

export function couponValue(c, currency = '$') {
  if (c?.type === 'descuento') return `${Number(c.value) || 0}% OFF`;
  if (c?.type === 'regalo') return 'Regalo';
  return formatMoney(c?.value, currency);
}

export function useProgressBar(pct) {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFill(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);
  return fill;
}

export function ActiveCouponCard({ coupon, currency = '$', compact = false }) {
  const points = Number(coupon.points) || 0;
  const target = Math.max(1, Number(coupon.target_points) || 1);
  const pct = Math.min(100, Math.round((points / target) * 100));
  const fill = useProgressBar(pct);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-primary via-primary to-primary-strong p-5 text-primary-contrast shadow-glow">
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
            <Ticket size={20} />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Tu cupón activo</p>
            <p className={`font-black leading-tight drop-shadow-sm ${compact ? 'text-2xl' : 'text-3xl'}`}>
              {couponValue(coupon, currency)}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{pct}%</span>
      </div>

      <p className="relative mt-3 text-sm font-extrabold">{coupon.title}</p>
      {!compact && coupon.description && (
        <p className="relative mt-0.5 text-xs text-primary-contrast/80">{coupon.description}</p>
      )}

      <div className="relative mt-4">
        <div className="h-3.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width] duration-1000 ease-out"
            style={{ width: `${fill}%` }}
          >
            <div className="animate-shimmer absolute inset-0 rounded-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.55)_42%,rgba(255,255,255,0.55)_50%,transparent_58%)] bg-[length:200%_100%]" />
          </div>
        </div>
        <p className="relative mt-2 text-center text-sm font-extrabold">
          {points}/{target} puntos
          <span className="font-semibold opacity-80"> · te faltan {Math.max(0, target - points)}</span>
        </p>
      </div>
    </div>
  );
}

export function ReadyCouponCard({ coupon, currency = '$' }) {
  const [copied, setCopied] = useState(false);

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
    <div className="relative overflow-hidden rounded-3xl border border-emerald-400/50 bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-white">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]">
          <PartyPopper size={15} />
          Listo para canjear
        </p>
        <Trophy size={17} className="opacity-90" />
      </div>

      <div className="relative border-t border-dashed border-line bg-surface px-5 pb-5 pt-4">
        <span className="absolute left-[-9px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-page" />
        <span className="absolute right-[-9px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-page" />

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
            <Gift size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-xl font-black text-ink">{couponValue(coupon, currency)}</p>
            <p className="truncate text-sm font-bold text-ink">{coupon.title}</p>
          </div>
        </div>

        {coupon.description && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-muted">
            <BadgePercent size={14} className="mt-0.5 shrink-0 text-primary-strong" />
            {coupon.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface-alt px-4 py-3">
          <p className="flex-1 select-all font-mono text-lg font-extrabold tracking-widest text-ink">{coupon.code}</p>
          <button className="btn-icon !h-8 !w-8" onClick={copy} aria-label="Copiar código">
            {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
          </button>
        </div>

        <p className="mt-2 text-center text-[11px] font-semibold text-ink-muted">
          Mostrá este código al pagar en el local para canjearlo.
        </p>
      </div>
    </div>
  );
}