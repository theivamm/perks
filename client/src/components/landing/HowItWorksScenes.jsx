import { useEffect, useState } from 'react';
import { Banknote, Check, Gift, Lock, Percent, QrCode, Sparkles } from 'lucide-react';

/* 1. Creás un cupón — mini form de admin + preview del ticket resultante */
export function CouponBuilderScene() {
  return (
    <div className="wt-glass w-full max-w-[360px] rounded-[32px] p-6">
      <div className="flex items-center justify-between">
        <span className="wt-tag">Nuevo cupón</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wt-mint)]/15 text-[var(--wt-mint-dark)]">
          <Sparkles size={16} />
        </span>
      </div>

      <div className="mt-5 flex gap-1.5 rounded-full bg-[rgba(20,36,37,0.05)] p-1.5">
        {[
          { label: 'Descuento', Icon: Percent, active: false },
          { label: 'Regalo', Icon: Gift, active: true },
          { label: 'Monto', Icon: Banknote, active: false },
        ].map(({ label, Icon, active }) => (
          <span
            key={label}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-bold transition-colors ${
              active ? 'bg-[var(--wt-mint)] text-white shadow-sm' : 'text-[var(--wt-muted)]'
            }`}
          >
            <Icon size={13} /> {label}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl border border-[var(--wt-border)] px-4 py-3.5">
        <span className="text-[13.5px] font-semibold text-[var(--wt-muted)]">Meta de puntos</span>
        <span className="text-[17px] font-bold text-[var(--wt-ink)]">5 pts</span>
      </div>

      <div className="wt-coupon mt-5" style={{ background: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)' }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/55">
            <Gift size={20} className="text-[var(--wt-mint-dark)]" />
          </span>
          <div className="min-w-0 flex-1 border-l-2 border-dashed border-[rgba(8,40,44,0.16)] pl-3.5">
            <p className="wt-heading text-[16px] font-semibold leading-tight text-[var(--wt-ink)]">Café de regalo</p>
            <p className="mt-0.5 text-[12.5px] text-[var(--wt-ink)]/60">5 puntos para canjearlo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. Tus clientes lo activan — catálogo del cliente, uno pasa a "Activo" */
const CATALOG = [
  { bg: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)', icon: Gift, label: 'Café de regalo', sub: '5 puntos', locked: false },
  { bg: 'linear-gradient(120deg, #ffd3ea, #fff0f8, #ffc2e0, #ffd3ea)', icon: Percent, label: '15% descuento', sub: '8 puntos', locked: false },
  { bg: 'linear-gradient(120deg, #ffefae, #fff8dc, #f1e8ff, #ffefae)', icon: Sparkles, label: '2x1 postres', sub: '10 puntos', locked: true },
];

export function ActivateCouponScene() {
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    setActivated(false);
    const t = setTimeout(() => setActivated(true), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="wt-glass w-full max-w-[360px] rounded-[32px] p-6">
      <div className="flex items-center justify-between">
        <span className="wt-tag">Elegí tu premio</span>
        <span className="text-[11.5px] font-semibold text-[var(--wt-muted)]">Tu actividad</span>
      </div>

      <div className="mt-5 space-y-3.5">
        {CATALOG.map((c, i) => {
          const Icon = c.icon;
          const isFirst = i === 0;
          return (
            <div
              key={c.label}
              className={`wt-coupon ${c.locked ? 'opacity-60' : ''}`}
              style={{ background: c.bg }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/55">
                  <Icon size={18} className="text-[var(--wt-mint-dark)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="wt-heading truncate text-[13.5px] font-semibold leading-tight text-[var(--wt-ink)]">{c.label}</p>
                  <p className="text-[11.5px] text-[var(--wt-ink)]/60">{c.sub}</p>
                </div>
                {isFirst && (
                  <span
                    className={`flex h-7 shrink-0 items-center gap-1 rounded-full bg-[var(--wt-mint-dark)] px-2.5 text-[11px] font-bold text-white transition-all duration-500 ${
                      activated ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                    }`}
                  >
                    <Check size={12} /> Activo
                  </span>
                )}
                {c.locked && (
                  <span className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-white/55 px-2.5 text-[11px] font-bold text-[var(--wt-muted)]">
                    <Lock size={12} /> Casi
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-[var(--wt-muted)]">
        <Sparkles size={13} className="text-[var(--wt-mint-dark)]" />
        Empezá por el que más te guste
      </p>
    </div>
  );
}

/* 3. Cada visita puede sumar — escaneo de QR + puntos que avanzan */
export function ScanPointScene() {
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    setScanned(false);
    const t = setTimeout(() => setScanned(true), 700);
    return () => clearTimeout(t);
  }, []);

  const dots = [true, true, scanned, false, false];

  return (
    <div className="wt-glass w-full max-w-[360px] rounded-[32px] p-6 text-center">
      <div className="flex items-center justify-between text-left">
        <span className="wt-tag">Escanear QR</span>
        <span className="text-[11.5px] font-semibold text-[var(--wt-mint-dark)]">Panel del negocio</span>
      </div>

      <div className="relative mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-[28px] border-2 border-dashed border-[var(--wt-mint)]/50 bg-[var(--wt-mint)]/5">
        <span className="absolute left-2 top-2 h-4 w-4 rounded-tl-lg border-l-2 border-t-2 border-[var(--wt-mint-dark)]" />
        <span className="absolute right-2 top-2 h-4 w-4 rounded-tr-lg border-r-2 border-t-2 border-[var(--wt-mint-dark)]" />
        <span className="absolute bottom-2 left-2 h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-[var(--wt-mint-dark)]" />
        <span className="absolute bottom-2 right-2 h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-[var(--wt-mint-dark)]" />
        {scanned ? (
          <Check size={44} className="text-[var(--wt-mint-dark)]" />
        ) : (
          <QrCode size={48} className="text-[var(--wt-mint-dark)]" />
        )}
      </div>

      <p className="mt-5 text-[14.5px] font-semibold text-[var(--wt-ink)]">Martina L.</p>
      <div className="wt-dot-row mt-3 justify-center">
        {dots.map((filled, i) => (
          <span key={i} className={`wt-dot ${filled ? 'is-filled' : ''}`} />
        ))}
      </div>
      <p className="mt-2 text-[13px] text-[var(--wt-muted)]">{scanned ? '3 de 5 puntos' : '2 de 5 puntos'}</p>

      <div
        className={`mx-auto mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl text-[12.5px] font-bold transition-all duration-500 ${
          scanned
            ? 'bg-[var(--wt-mint)] text-[var(--wt-ink)]'
            : 'border border-[rgba(20,36,37,0.14)] bg-white/60 text-[var(--wt-muted)]'
        }`}
      >
        {scanned ? (
          <>
            <Check size={15} /> Punto sumado
          </>
        ) : (
          'Sumar punto'
        )}
      </div>
    </div>
  );
}

/* 4. Llega el premio. Y otra vuelta — ticket canjeado */
export function RedeemScene() {
  return (
    <div className="wt-glass w-full max-w-[360px] rounded-[32px] p-6 text-center">
      <div className="flex items-center justify-between text-left">
        <span className="wt-tag">Cupón listo</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wt-mint)]/15 text-[var(--wt-mint-dark)]">
          <Sparkles size={16} />
        </span>
      </div>

      <div
        className="wt-coupon relative mt-5"
        style={{ background: 'linear-gradient(120deg, #bff3ea, #eafff8, #cff6ee, #bff3ea)' }}
      >
        <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wt-mint-dark)] text-white shadow-md">
          <Check size={17} />
        </span>
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/55">
            <Gift size={22} className="text-[var(--wt-mint-dark)]" />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="wt-heading text-[17px] font-semibold leading-tight text-[var(--wt-ink)]">Café de regalo</p>
            <p className="mt-0.5 text-[12.5px] font-bold text-[var(--wt-mint-dark)]">Canjeado ✓</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[var(--wt-mint)]/10 px-4 py-3.5">
        <Sparkles size={15} className="text-[var(--wt-mint-dark)]" />
        <span className="text-[13px] font-semibold text-[var(--wt-ink)]/80">Y arranca otra vuelta</span>
      </div>
    </div>
  );
}

const SCENES = [CouponBuilderScene, ActivateCouponScene, ScanPointScene, RedeemScene];

export function StepVisual({ index }) {
  const Scene = SCENES[index] || SCENES[0];
  return <Scene />;
}