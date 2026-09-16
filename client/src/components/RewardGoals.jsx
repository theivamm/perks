import { useEffect, useState } from 'react';
import { Check, Gift, ShoppingBag, Sparkles, Trophy } from 'lucide-react';
import { formatMoney } from '../api.js';

const GRADIENTS = [
  {
    tile: 'from-primary to-primary-strong text-primary-contrast shadow-glow',
    bar: 'from-primary to-primary-strong',
    text: 'text-primary-strong',
    soft: 'bg-primary-soft',
  },
  {
    tile: 'from-amber-400 to-orange-500 text-white shadow-glow',
    bar: 'from-amber-400 to-orange-500',
    text: 'text-amber-600 dark:text-amber-300',
    soft: 'bg-amber-500/15',
  },
  {
    tile: 'from-violet-500 to-purple-600 text-white shadow-glow',
    bar: 'from-violet-500 to-purple-600',
    text: 'text-purple-600 dark:text-purple-300',
    soft: 'bg-purple-500/15',
  },
  {
    tile: 'from-emerald-400 to-teal-600 text-white shadow-glow',
    bar: 'from-emerald-400 to-teal-600',
    text: 'text-teal-600 dark:text-teal-300',
    soft: 'bg-teal-500/15',
  },
  {
    tile: 'from-rose-400 to-pink-600 text-white shadow-glow',
    bar: 'from-rose-400 to-pink-600',
    text: 'text-pink-600 dark:text-pink-300',
    soft: 'bg-rose-500/15',
  },
  {
    tile: 'from-sky-400 to-blue-600 text-white shadow-glow',
    bar: 'from-sky-400 to-blue-600',
    text: 'text-blue-600 dark:text-blue-300',
    soft: 'bg-sky-500/15',
  },
];

function useCountUp(target) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 1000;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round((target - 0) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function valueLabel(rule, currency) {
  if (rule.type === 'descuento') return `${Number(rule.value) || 0}% OFF`;
  if (rule.type === 'regalo') return 'Regalo';
  return formatMoney(rule.value, currency);
}

export default function RewardGoals({ completed = 0, rules = [], coupons = [], currency = '$' }) {
  const hero = useCountUp(completed);

  const sorted = rules
    .map((r) => ({ ...r, every: Math.max(1, Number(r.every_orders) || 1) }))
    .sort((a, b) => a.every - b.every);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
          <Gift size={20} className="text-primary-strong" />
          Tus premios y objetivos
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-bold text-ink-muted">
          <Sparkles size={13} className="text-primary-strong" />
          {completed} compra{completed !== 1 && 's'}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-primary-soft via-surface to-surface-alt p-6 dark:from-primary-softer">
        <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <Sparkles className="animate-float absolute right-8 top-6 h-5 w-5 text-primary/40" />
        <Sparkles className="animate-float absolute bottom-8 left-6 h-4 w-4 text-primary/30" style={{ animationDelay: '1.1s' }} />

        <div className="relative text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-ink-muted">Progreso de fidelización</p>
          <span className="mt-1 inline-block bg-gradient-to-r from-primary to-primary-strong bg-clip-text text-6xl font-black leading-tight text-transparent tabular-nums drop-shadow-sm">
            {hero}
          </span>
          <p className="text-lg font-extrabold text-ink">compras sumadas</p>
          <p className="mx-auto mt-1 max-w-xs text-sm font-semibold text-ink-muted">
            {completed === 1 ? 'Ya empezaste. ¡Cada compra suma!' : 'Seguí sumando y desbloqueá premios.'}
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-5 text-center text-sm text-ink-muted">
          El local todavía no configuró premios. ¡Pronto vas a poder empezar a ganar!
        </p>
      ) : (
        sorted.map((rule, i) => (
          <GoalCard key={rule.id} rule={rule} completed={completed} coupons={coupons} currency={currency} gradient={GRADIENTS[i % GRADIENTS.length]} index={i} />
        ))
      )}
    </section>
  );
}

function GoalCard({ rule, completed, coupons, currency, gradient, index }) {
  const every = rule.every;
  const reached = Math.floor(completed / every);
  const next = (reached + 1) * every;
  const falta = Math.max(0, next - completed);
  const pct = Math.min(100, Math.max(0, (completed / next) * 100));
  const wonHere = (coupons || []).filter((c) => Number(c.milestone) >= every && c.rule_id === rule.id).length;

  const [fill, setFill] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFill(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);

  const milestones = [];
  if (reached > 0) {
    const prev = Math.max(every, reached * every - every);
    if (prev > 0 && prev !== reached * every) milestones.push(prev);
    milestones.push(reached * every);
  }
  if (next !== reached * every) milestones.push(next);

  return (
    <div className="animate-fade-up card relative overflow-hidden p-5 transition-transform hover:-translate-y-0.5" style={{ animationDelay: `${index * 80}ms` }}>
      <div className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl ${gradient.soft}`} />
      <div className="relative flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient.tile}`}>
          {reached > 0 ? <Trophy size={22} /> : <Gift size={22} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-ink">{rule.name || 'Premio'}</h3>
            <span className="rounded-full bg-surface-alt px-2.5 py-0.5 text-[11px] font-bold text-ink-muted">
              cada {every} compra{every !== 1 && 's'}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">
            {rule.description || `Ganá ${valueLabel(rule, currency)} cada ${every} compras.`}
          </p>
          <p className={`mt-1 text-sm font-extrabold ${gradient.text}`}>
            Premio: {valueLabel(rule, currency)}
          </p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="h-3.5 overflow-hidden rounded-full bg-surface-alt shadow-inner">
          <div
            className={`relative h-full rounded-full bg-gradient-to-r ${gradient.bar} transition-[width] duration-1000 ease-out`}
            style={{ width: `${fill}%` }}
          >
            <div className="animate-shimmer absolute inset-0 rounded-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.55)_42%,rgba(255,255,255,0.55)_50%,transparent_58%)] bg-[length:200%_100%]" />
          </div>
        </div>

        {milestones.map((m) => {
          const done = m <= completed;
          const isNext = m === next;
          return (
            <span
              key={m}
              className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-all duration-500"
              style={{
                left: `${Math.min(100, (m / next) * 100)}%`,
                borderColor: done ? 'transparent' : 'var(--line)',
              }}
              title={`Compra ${m}`}
            >
              <span
                className={`flex h-full w-full items-center justify-center rounded-full text-[10px] font-black ${
                  done
                    ? `bg-gradient-to-br ${gradient.tile}`
                    : isNext
                    ? 'animate-pulse bg-surface text-ink-muted shadow-md'
                    : 'bg-surface text-ink-muted'
                }`}
              >
                {done ? <Check size={12} /> : m % 10 === 0 ? `10+` : m}
              </span>
            </span>
          );
        })}
      </div>

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink">
          {completed}/{next} compras
          <span className="font-semibold text-ink-muted"> ·</span>{' '}
          <span className="font-extrabold text-ink">faltan {falta}</span>
        </p>
        {wonHere > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-extrabold text-green-600 dark:text-green-400">
            <Trophy size={12} />
            {wonHere} premio{wonHere !== 1 && 's'} ganado{wonHere !== 1 && 's'}
          </span>
        )}
      </div>
    </div>
  );
}