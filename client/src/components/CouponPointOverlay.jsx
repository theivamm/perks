import { useEffect, useState } from 'react';
import { PartyPopper, Plus, Sparkles, X } from 'lucide-react';
import { api } from '../api.js';
import { couponValue } from './CouponCards.jsx';

const BURSTS = [
  { left: '20%', delay: '0ms' },
  { left: '50%', delay: '260ms' },
  { left: '80%', delay: '520ms' },
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
    const t = setTimeout(onClose, 3600);
    return () => clearTimeout(t);
  }, [onClose]);

  const points = Number(coupon?.points) || 0;
  const target = Math.max(1, Number(coupon?.target_points) || 1);
  const pct = Math.min(100, Math.round((points / target) * 100));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl text-white shadow-2xl"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-strong)) 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

        <button
          className="btn-icon absolute right-2 top-2 z-20 !text-white/80 hover:!bg-white/10 hover:!text-white"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {CONFETTI_COLORS.map((color, i) => (
          <span
            key={color}
            className="animate-confetti-fall pointer-events-none absolute left-1/2 top-10 h-2.5 w-2.5 rounded-sm"
            style={{
              marginLeft: `${(i - 2.4) * 24}px`,
              background: color,
              animationDelay: `${i * 110}ms`,
            }}
          />
        ))}

        <div className="relative px-6 pb-6 pt-11 text-center">
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

          <p className="mt-4 text-5xl font-black drop-shadow-sm">{coupon ? couponValue(coupon) : '—'}</p>
          <p className="mt-1 truncate text-lg font-extrabold">{coupon?.title || 'Cargando cupón…'}</p>

          <div className="relative mx-auto mt-5 flex h-14 items-center justify-center">
            {BURSTS.map((b) => (
              <span
                key={b.left}
                className="animate-pop point-burst absolute inline-flex items-center gap-0.5 rounded-full bg-amber-400 px-3 py-1 text-sm font-black text-amber-900 shadow-lg"
                style={{ left: b.left, animationDelay: b.delay }}
              >
                <Plus size={14} strokeWidth={3} />
                {isWon ? 'PUNTOS' : '1'}
              </span>
            ))}
          </div>

          <div className="mt-4 h-3.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width] duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-sm font-extrabold">
            {coupon ? `${points}/${target} puntos` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}