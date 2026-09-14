import { useState } from 'react';
import { BadgePercent, Check, Copy, Gift } from 'lucide-react';
import { formatMoney } from '../api.js';

const STATUS_LABEL = { activo: 'Activo', usado: 'Usado', vencido: 'Vencido' };
const MODE_LABEL = { web: 'Web', local: 'Local', ambos: 'Web + Local' };

export default function CouponCard({ coupon, currency = '$', onUse, using }) {
  const [copied, setCopied] = useState(false);

  const isDiscount = coupon.type === 'descuento';
  const big = isDiscount
    ? `${Number(coupon.value) || 0}%`
    : coupon.type === 'regalo'
      ? 'REGALO'
      : formatMoney(coupon.value, currency);
  const suffix = isDiscount ? 'OFF' : coupon.type === 'monto' ? 'DE DESCUENTO' : '';
  const active = coupon.status === 'activo';
  const canLocal = active && coupon.mode !== 'web';

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
    <div className="group relative flex overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex w-28 shrink-0 flex-col items-center justify-center gap-0.5 px-3 py-6 text-center ${
          active
            ? 'bg-gradient-to-br from-primary to-primary-strong text-primary-contrast'
            : 'bg-surface-alt text-ink-muted'
        }`}
      >
        {isDiscount ? (
          <BadgePercent size={22} className="mb-1 opacity-90" />
        ) : (
          <Gift size={22} className="mb-1 opacity-90" />
        )}
        <p className="text-2xl font-black leading-none">{big}</p>
        {suffix && <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-90">{suffix}</p>}
      </div>

      <span className="absolute left-[7rem] top-[-9px] h-5 w-5 rounded-full bg-surface-page" />
      <span className="absolute bottom-[-9px] left-[7rem] h-5 w-5 rounded-full bg-surface-page" />

      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-ink">{coupon.description || 'Premio por tus pedidos'}</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              {coupon.milestone ? `Pedido #${coupon.milestone} alcanzado` : 'Premio de fidelización'}
              <span className="mx-1">·</span>
              {MODE_LABEL[coupon.mode] || coupon.mode}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              active
                ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                : coupon.status === 'usado'
                  ? 'bg-surface-alt text-ink-muted'
                  : 'bg-surface-alt text-ink-muted'
            }`}
          >
            {STATUS_LABEL[coupon.status] || coupon.status}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-dashed border-line bg-surface-alt px-3 py-2">
            <p className="select-all truncate font-mono text-sm font-extrabold tracking-wider text-ink">
              {coupon.code}
            </p>
            <button className="btn-icon !h-7 !w-7 !p-0" onClick={copy} aria-label="Copiar código">
              {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            </button>
          </div>
          {canLocal && (
            <button
              className={`btn-ghost !py-2 !text-xs ${using ? 'pointer-events-none opacity-60' : ''}`}
              onClick={() => onUse?.(coupon)}
              disabled={using}
            >
              {using ? <Check size={14} className="animate-pulse" /> : <Check size={14} />}
              Lo usé en el local
            </button>
          )}
        </div>
      </div>
    </div>
  );
}