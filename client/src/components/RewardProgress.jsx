import { useEffect, useState } from 'react';
import { Gift, ShoppingBag, Sparkles, Trophy } from 'lucide-react';

function valueLabel(rule) {
  if (rule.type === 'descuento') return `${Number(rule.value) || 0}% OFF`;
  if (rule.type === 'regalo') return 'Regalo';
  return `${Number(rule.value) || 0}`;
}

function useCountUp(target) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const duration = 1000;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

export default function RewardProgress({ completed = 0, rules = [] }) {
  const sorted = rules
    .map((r) => ({ ...r, every: Math.max(1, Number(r.every_orders) || 1) }))
    .sort((a, b) => a.every - b.every);
  if (sorted.length === 0) return null;

  const max = sorted[sorted.length - 1].every;
  const next = sorted.find((r) => completed < r.every) || null;
  const isAll = !next;
  const reached = sorted.filter((r) => completed >= r.every).length;

  const hero = useCountUp(completed);
  const [fillPct, setFillPct] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFillPct((completed / max) * 100), 120);
    const t2 = setTimeout(() => setReady(true), 260);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [completed, max]);

  const gap = next ? next.every - completed : 0;

  return (
    <div className="relative mt-4 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-primary-soft via-surface to-surface-alt p-6 dark:from-primary-softer dark:via-surface dark:to-surface-alt">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <Sparkles className="animate-float absolute right-10 top-8 h-5 w-5 text-primary/40" />
      <Sparkles className="animate-float absolute bottom-10 left-8 h-4 w-4 text-primary/30" style={{ animationDelay: '1.2s' }} />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-glow ${
              isAll
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                : 'bg-gradient-to-br from-primary to-primary-strong text-primary-contrast'
            }`}
          >
            {isAll ? <Trophy size={24} /> : <ShoppingBag size={24} />}
            {isAll && <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-amber-500" />}
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-ink-muted">Tu progreso</p>
            <h3 className="text-lg font-extrabold leading-tight text-ink">Fidelización</h3>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs font-extrabold text-primary-strong">
          <Sparkles size={13} />
          {reached}/{sorted.length} premios
        </span>
      </div>

      <div className="relative mt-6 text-center">
        <span className="bg-gradient-to-r from-primary to-primary-strong bg-clip-text text-7xl font-black leading-none text-transparent tabular-nums drop-shadow-sm">
          {hero}
        </span>
        <p className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
          {completed === 1 ? 'compra llevada' : 'compras llevadas'}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-ink-muted">
          {isAll
            ? '¡Sos de nuestra familia! Desbloqueaste todos los premios actuales. 🎉'
            : `Te faltan ${gap} ${gap === 1 ? 'compra' : 'compras'} para tu próximo premio.`}
        </p>

        {isAll ? (
          <div className="animate-pop mx-auto mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-base font-extrabold text-white shadow-glow">
            <Trophy size={20} />
            ¡Todos los premios desbloqueados!
          </div>
        ) : (
          <button
            type="button"
            className="animate-pop mx-auto mt-5 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-primary-strong px-6 py-3 text-xl font-extrabold text-primary-contrast shadow-glow transition-transform hover:-translate-y-0.5 hover:scale-[1.03]"
          >
            <Gift size={22} />
            Tu premio: {valueLabel(next)}
            <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-black uppercase tracking-wide">
              Compra {next.every}
            </span>
          </button>
        )}
      </div>

      <div className="relative mt-8">
        <div className="h-5 overflow-hidden rounded-full bg-surface-alt shadow-inner">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-primary to-primary-strong transition-[width] duration-1000 ease-out"
            style={{ width: `${fillPct}%` }}
          >
            <div className="animate-shimmer absolute inset-0 rounded-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.55)_42%,rgba(255,255,255,0.55)_50%,transparent_58%)] bg-[length:200%_100%]" />
          </div>
        </div>

        {sorted.map((r, i) => {
          const done = completed >= r.every;
          return (
            <span
              key={r.id}
              className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-all duration-500"
              style={{
                left: `${(r.every / max) * 100}%`,
                opacity: ready ? 1 : 0,
                transitionDelay: `${250 + i * 150}ms`,
                borderColor: done ? 'transparent' : 'var(--line)',
              }}
              title={`COMPRA ${r.every}`}
            >
              <span
                className={`animate-pop flex h-full w-full items-center justify-center rounded-full text-xs font-black ${
                  done
                    ? 'bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow'
                    : 'bg-surface text-ink-muted'
                }`}
              >
                {done ? <Trophy size={14} /> : r.every}
              </span>
            </span>
          );
        })}
      </div>

      <div className="relative mt-3 h-16">
        {sorted.map((r) => {
          const done = completed >= r.every;
          return (
            <div
              key={r.id}
              className="absolute flex -translate-x-1/2 flex-col items-center text-center"
              style={{ left: `${(r.every / max) * 100}%` }}
            >
              <p className={`text-xs font-black uppercase tracking-wide ${done ? 'text-primary-strong' : 'text-ink'}`}>
                Compra {r.every}
              </p>
              <p
                className={`text-lg font-black leading-tight ${done ? 'text-ink' : 'text-ink-muted'}`}
              >
                {valueLabel(r)}
              </p>
              <span className={`mt-0.5 flex h-5 w-5 items-center justify-center ${done ? 'text-ink' : 'text-ink-muted/40 dark:text-ink-muted/80'}`}>
                {done ? <Sparkles size={15} /> : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}