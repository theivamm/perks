import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PartyPopper, Plus, QrCode, Sparkles, X } from 'lucide-react';
import { api } from '../api.js';
import { couponValue } from './CouponCards.jsx';

const BURSTS = [
  { left: '18%', delay: '0ms' },
  { left: '50%', delay: '260ms' },
  { left: '82%', delay: '520ms' },
];

const CONFETTI_COLORS = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#facc15', '#f87171'];

export default function CouponPointOverlay({ note, onClose }) {
  const [coupon, setCoupon] = useState(null);
  const userCouponId = note?.data?.user_coupon_id;
  const isWon = note?.type === 'coupon_won';

  useEffect(() => {
    let alive = true;
    if (userCouponId) {
      api('/api/coupons/me')
        .then((res) => {
          if (!alive) return;
          setCoupon((res.coupons || []).find((c) => c.id === userCouponId) || null);
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [userCouponId]);

  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [onClose]);

  const points = Number(coupon?.points) || 0;
  const target = Math.max(1, Number(coupon?.target_points) || 1);
  const pct = Math.min(100, Math.round((points / target) * 100));

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="animate-fade-up relative aspect-[9/16] w-full max-w-[min(92vw,330px)] overflow-hidden rounded-3xl text-white shadow-2xl sm:aspect-auto sm:h-[min(66vh,420px)] sm:w-[min(92vw,860px)] sm:max-w-none"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-strong)) 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <button
          className="btn-icon absolute right-3 top-3 z-20 !text-white/80 hover:!bg-white/10 hover:!text-white"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        {CONFETTI_COLORS.map((color, i) => (
          <span
            key={color}
            className="animate-confetti-fall pointer-events-none absolute left-1/2 top-12 z-10 h-2.5 w-2.5 rounded-sm"
            style={{
              marginLeft: `${(i - 2.4) * 26}px`,
              background: color,
              animationDelay: `${i * 110}ms`,
            }}
          />
        ))}

        {/* Vertical en mobile (columna), horizontal tipo ticket en desktop */}
        <div className="flex h-full flex-col sm:flex-row sm:items-stretch">
          {/* Cupón */}
          <div className="relative z-10 flex min-h-0 flex-col items-center justify-center gap-3 overflow-y-auto px-6 pt-14 pb-2 text-center sm:flex-1 sm:px-10 sm:py-10">
            {isWon ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/60 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                <PartyPopper size={12} />
                ¡Cupón completado!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/60 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={12} />
                ¡Sumaste 1 punto!
              </span>
            )}

            <p className="text-6xl font-black drop-shadow-sm sm:text-7xl">
              {coupon ? couponValue(coupon) : '—'}
            </p>
            <p className="w-full truncate text-lg font-extrabold sm:text-2xl">{coupon?.title || 'Cargando cupón…'}</p>
            {coupon?.description && (
              <p className="mt-1 w-full text-sm font-semibold leading-relaxed text-white/90">{coupon.description}</p>
            )}
          </div>

          {/* Perforación central tipo ticket (solo desktop) */}
          <div className="relative z-10 hidden sm:block">
            <div className="flex h-full flex-col items-center" aria-hidden>
              <span className="absolute -top-3 h-6 w-6 rounded-full bg-black/60" />
              <div className="h-full w-0 border-l-2 border-dashed border-white/40" />
              <span className="absolute -bottom-3 h-6 w-6 rounded-full bg-black/60" />
            </div>
          </div>

          {/* Punto sumado + progreso */}
          <div className="relative z-10 flex min-h-0 flex-col items-center justify-center gap-4 overflow-y-auto px-6 pb-4 sm:flex-1 sm:px-10 sm:pb-8">
            <div className="relative mx-auto flex h-16 w-full max-w-[280px] items-center justify-center">
              {BURSTS.map((b) => (
                <span
                  key={b.left}
                  className="animate-pop point-burst absolute inline-flex items-center gap-0.5 rounded-full bg-amber-400 px-3.5 py-1.5 text-base font-black text-amber-900 shadow-lg"
                  style={{ left: b.left, animationDelay: b.delay }}
                >
                  <Plus size={16} strokeWidth={3} />
                  {isWon ? 'PUNTOS' : '1'}
                </span>
              ))}
            </div>

            <div className="h-4 w-full overflow-hidden rounded-full bg-white/20 sm:max-w-md">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width] duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-base font-extrabold sm:text-lg">{coupon ? `${points}/${target} puntos` : ''}</p>
          </div>
        </div>

        <div className="relative z-10 flex justify-center px-6 pb-6 pt-1 sm:absolute sm:inset-x-0 sm:bottom-6">
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-white/70 bg-black/20 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-black/30"
            onClick={onClose}
          >
            <QrCode size={16} />
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}