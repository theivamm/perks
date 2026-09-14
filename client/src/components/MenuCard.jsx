import { useEffect, useRef, useState } from 'react';
import { Check, Image as ImageIcon, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatMoney } from '../api.js';

export default function MenuCard({ item, onAdd }) {
  const { settings } = useTheme();
  const disabled = !item.available;
  const [added, setAdded] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleAdd = () => {
    onAdd(item);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1000);
  };

  return (
    <div className="card group flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary to-primary-strong">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary-contrast/70">
            <ImageIcon size={48} />
          </div>
        )}
        {!disabled && (
          <div className="absolute right-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-bold text-primary-strong shadow">
            {formatMoney(item.price, settings.currency)}
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-ink">{item.title}</h3>
        {item.description && (
          <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted line-clamp-3">
            {item.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          {disabled ? (
            <span className="text-sm font-semibold text-ink-muted">
              {formatMoney(item.price, settings.currency)}
            </span>
          ) : (
            <span className="text-lg font-extrabold text-primary-strong">
              {formatMoney(item.price, settings.currency)}
            </span>
          )}
          <button
            className={`btn-primary relative !px-3 !py-2 ${added ? 'animate-bump' : ''}`}
            onClick={handleAdd}
            disabled={disabled}
            aria-label={`Agregar ${item.title}`}
          >
            {added ? (
              <>
                <Check size={16} className="animate-pop" />
                <span className="animate-pop">¡Listo!</span>
                <span className="animate-float-up pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-lg font-black text-primary-contrast">
                  +1
                </span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}