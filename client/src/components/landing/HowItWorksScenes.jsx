import { useEffect, useState } from 'react';
import { Banknote, Check, Gift, Percent, QrCode, Sparkles } from 'lucide-react';

/* 1. Creás un cupón — mini form de admin + preview del ticket resultante */
export function CouponBuilderScene() {
  return (
    <div className="wt-glass w-full max-w-[300px] rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <span className="wt-tag">Nuevo cupón</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--wt-mint)]/15 text-[var(--wt-mint-dark)]">
          <Sparkles size={14} />
        </span>
      </div>

      <div className="mt-4 flex gap-1.5 rounded-full bg-[rgba(20,36,37,0.05)] p-1">
        {[
          { label: 'Descuento', Icon: Percent, active: false },
          { label: 'Regalo', Icon: Gift, active: true },
          { label: 'Monto', Icon: Banknote, active: false },
        ].map(({ label, Icon, active }) => (
          <span
            key={label}
            className={`flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-[10.5px] font-bold transition-colors ${
              active ? 'bg-[var(--wt-mint)] text-white shadow-sm' : 'text-[var(--wt-muted)]'
            }`}
          >
            <Icon size={11} /> {label}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--wt-border)] px-4 py-3">
        <span className="text-[12.5px] font-semibold text-[var(--wt-muted)]">Meta de puntos</span>
        <span className="text-[15px] font-bold text-[var(--wt-ink)]">5 pts</span>
      </div>

      <div className="wt-coupon wt-coupon-sm mt-4" style={{ background: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)' }}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/55">
            <Gift size={15} className="text-[var(--wt-mint-dark)]" />
          </span>
          <div>
            <p className="wt-heading text-[12.5px] font-semibold leading-tight text-[var(--wt-ink)]">Café de regalo</p>
            <p className="text-[10.5px] text-[var(--wt-ink)]/60">5 puntos</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. Tus clientes lo activan — catálogo del cliente, uno pasa a "Activo" */
const CATALOG = [
  { bg: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)', icon: Gift, label: 'Café de regalo', sub: '5 puntos' },
  { bg: 'linear-gradient(120deg, #ffd3ea, #fff0f8, #ffc2e0, #ffd3ea)', icon: Percent, label: '15% descuento', sub: '8 puntos' },
];

export function ActivateCouponScene() {
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    setActivated(false);
    const t = setTimeout(() => setActivated(true), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="wt-glass w-full max-w-[300px] rounded-3xl p-5">
      <span className="wt-tag">Elegí tu premio</span>
      <div className="mt-4 space-y-3">
        {CATALOG.map((c, i) => {
          const Icon = c.icon;
          const isFirst = i === 0;
          return (
            <div key={c.label} className="wt-coupon wt-coupon-sm" style={{ background: c.bg }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/55">
                  <Icon size={15} className="text-[var(--wt-mint-dark)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="wt-heading truncate text-[12.5px] font-semibold leading-tight text-[var(--wt-ink)]">{c.label}</p>
                  <p className="text-[10.5px] text-[var(--wt-ink)]/60">{c.sub}</p>
                </div>
                {isFirst && (
                  <span
                    className={`flex h-6 shrink-0 items-center gap-1 rounded-full bg-[var(--wt-mint-dark)] px-2 text-[10px] font-bold text-white transition-all duration-500 ${
                      activated ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                    }`}
                  >
                    <Check size={11} /> Activo
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 3. Cada visita puede sumar — escaneo de QR + puntos que avanzan */
export function ScanPointScene() {
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    setScanned(false);
    const t = setTimeout(() => setScanned(true), 650);
    return () => clearTimeout(t);
  }, []);

  const dots = [true, true, scanned, false, false];

  return (
    <div className="wt-glass w-full max-w-[300px] rounded-3xl p-6 text-center">
      <span className="wt-tag">Escanear QR</span>
      <div className="relative mx-auto mt-5 flex h-32 w-32 items-center justify-center rounded-3xl border-2 border-dashed border-[var(--wt-mint)]/50 bg-[var(--wt-mint)]/5">
        <span className="absolute left-2 top-2 h-4 w-4 rounded-tl-lg border-l-2 border-t-2 border-[var(--wt-mint-dark)]" />
        <span className="absolute right-2 top-2 h-4 w-4 rounded-tr-lg border-r-2 border-t-2 border-[var(--wt-mint-dark)]" />
        <span className="absolute bottom-2 left-2 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-[var(--wt-mint-dark)]" />
        <span className="absolute bottom-2 right-2 h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-[var(--wt-mint-dark)]" />
        {scanned ? (
          <Check size={34} className="text-[var(--wt-mint-dark)]" />
        ) : (
          <QrCode size={40} className="text-[var(--wt-mint-dark)]" />
        )}
      </div>
      <p className="mt-4 text-[13px] font-semibold text-[var(--wt-ink)]">Martina L.</p>
      <div className="wt-dot-row mt-3 justify-center">
        {dots.map((filled, i) => (
          <span key={i} className={`wt-dot ${filled ? 'is-filled' : ''}`} />
        ))}
      </div>
      <p className="mt-2 text-[11.5px] text-[var(--wt-muted)]">{scanned ? '3 de 5 puntos' : '2 de 5 puntos'}</p>
    </div>
  );
}

/* 4. Llega el premio. Y otra vuelta — ticket canjeado */
export function RedeemScene() {
  return (
    <div className="wt-glass w-full max-w-[300px] rounded-3xl p-5 text-center">
      <span className="wt-tag">Cupón listo</span>
      <div
        className="wt-coupon wt-coupon-lg relative mt-4"
        style={{ background: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)' }}
      >
        <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--wt-mint-dark)] text-white shadow-md">
          <Check size={16} />
        </span>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/55">
            <Gift size={18} className="text-[var(--wt-mint-dark)]" />
          </span>
          <div className="text-left">
            <p className="wt-heading text-[14px] font-semibold leading-tight text-[var(--wt-ink)]">Café de regalo</p>
            <p className="text-[11px] font-bold text-[var(--wt-mint-dark)]">Canjeado ✓</p>
          </div>
        </div>
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-[var(--wt-muted)]">
        <Sparkles size={13} className="text-[var(--wt-mint-dark)]" />
        Y arranca otra vuelta
      </p>
    </div>
  );
}

const SCENES = [CouponBuilderScene, ActivateCouponScene, ScanPointScene, RedeemScene];

export function StepVisual({ index }) {
  const Scene = SCENES[index] || SCENES[0];
  return <Scene />;
}
