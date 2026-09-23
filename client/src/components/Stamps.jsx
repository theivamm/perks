import { Check, Gift } from 'lucide-react';
import { useProgressBar } from './CouponCards.jsx';

// Progreso del cupón en sellos (hasta 12 puntos) o barra (más de 12).
// `tone="light"` para usar sobre fondos de color de marca.
export default function Stamps({ points = 0, target = 1, size = 'md' }) {
  const t = Math.max(1, Number(target) || 1);
  const p = Math.min(t, Number(points) || 0);
  const fill = useProgressBar(Math.round((p / t) * 100));
  if (t > 12) {
    return (
      <div className="h-3.5 max-w-md overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width] duration-1000 ease-out" style={{ width: `${fill}%` }} />
      </div>
    );
  }
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm sm:h-11 sm:w-11';
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: t }, (_, i) => {
        const done = i < p;
        return (
          <span
            key={i}
            className={`flex items-center justify-center rounded-full font-extrabold ${dim} ${
              done ? 'animate-pop bg-amber-400 text-ink shadow-sm' : 'border-2 border-dashed border-white/45 text-primary-contrast/80'
            }`}
            style={done ? { animationDelay: `${i * 60}ms` } : undefined}
          >
            {done ? <Check size={size === 'sm' ? 14 : 17} strokeWidth={3} /> : i === t - 1 ? <Gift size={size === 'sm' ? 13 : 16} /> : i + 1}
          </span>
        );
      })}
    </div>
  );
}
