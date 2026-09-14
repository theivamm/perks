import { Trophy } from 'lucide-react';

function valueLabel(rule) {
  if (rule.type === 'descuento') return `${Number(rule.value) || 0}% OFF`;
  if (rule.type === 'regalo') return 'Regalo';
  return `${Number(rule.value) || 0}`;
}

export default function RewardProgress({ completed = 0, rules = [] }) {
  const sorted = rules
    .map((r) => ({ ...r, every: Math.max(1, Number(r.every_orders) || 1) }))
    .sort((a, b) => a.every - b.every);
  if (sorted.length === 0) return null;

  const max = sorted[sorted.length - 1].every;
  const fill = Math.min(completed / max, 1) * 100;
  const next = sorted.find((r) => completed < r.every);

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-strong">
            <Trophy size={20} />
          </div>
          <div>
            <p className="font-extrabold text-ink">
              Llevás {completed} {completed === 1 ? 'compra' : 'compras'}
            </p>
            <p className="text-xs text-ink-muted">
              {completed === 0
                ? 'Hacé tu primer pedido y empezá a sumar.'
                : next
                  ? `Te faltan ${next.every - completed} ${next.every - completed === 1 ? 'compra' : 'compras'} para tu ${valueLabel(next)}.`
                  : '¡Desbloqueaste todos los premios actuales!'}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-strong">
          Próximo premio: {next ? valueLabel(next) : '—'}
        </div>
      </div>

      <div className="relative mt-6">
        <div className="h-3.5 rounded-full bg-surface-alt">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-strong transition-all"
            style={{ width: `${fill}%` }}
          />
        </div>
        {sorted.map((r) => (
          <span
            key={r.id}
            className="absolute top-[-5px] flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-colors"
            style={{
              left: `${(r.every / max) * 100}%`,
              borderColor: completed >= r.every ? 'currentColor' : undefined,
            }}
            title={`COMPRA ${r.every}`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${
                completed >= r.every
                  ? 'bg-gradient-to-br from-primary to-primary-strong text-primary-contrast'
                  : 'bg-surface-alt text-ink-muted'
              }`}
            >
              {r.every}
            </span>
          </span>
        ))}
      </div>

      <div className="relative mt-3 h-10">
        {sorted.map((r) => (
          <div
            key={r.id}
            className="absolute flex -translate-x-1/2 flex-col items-center text-center"
            style={{ left: `${(r.every / max) * 100}%` }}
          >
            <p className="text-[10px] font-black uppercase tracking-wide text-ink">COMPRA {r.every}</p>
            <p className={`text-[10px] font-bold ${completed >= r.every ? 'text-primary-strong' : 'text-ink-muted'}`}>
              {valueLabel(r)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}