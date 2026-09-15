import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, SearchX, Star, UtensilsCrossed } from 'lucide-react';
import { api, formatMoney } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { EmptyState } from './ui.jsx';

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function PublicMenu() {
  const { settings } = useTheme();
  const [data, setData] = useState({ items: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');

  useEffect(() => {
    let alive = true;
    api('/api/menu')
      .then((d) => alive && setData(d))
      .catch(() => alive && setData({ items: [], categories: [] }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(() => (data.items || []).filter((it) => it.available), [data.items]);

  const categories = useMemo(() => {
    const set = new Set(visible.map((it) => it.category).filter(Boolean));
    return [...set];
  }, [visible]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return visible.filter((it) => {
      const okCat = catFilter === 'Todas' || it.category === catFilter;
      const okSearch =
        !q ||
        normalize(it.title).includes(q) ||
        normalize(it.description).includes(q) ||
        normalize(it.category).includes(q);
      return okCat && okSearch;
    });
  }, [visible, catFilter, query]);

  const featured = useMemo(() => filtered.filter((it) => it.featured), [filtered]);

  const grouped = useMemo(() => {
    const map = {};
    for (const it of filtered) if (!it.featured) (map[it.category || 'General'] ||= []).push(it);
    return map;
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary-strong" size={26} />
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <section className="mt-10">
        <EmptyState
          icon={UtensilsCrossed}
          title="El menú se viene pronto"
          subtitle="Muy pronto vas a poder ver todos los productos del local acá."
        />
      </section>
    );
  }

  return (
    <div className="mt-12 space-y-8">
      <div className="space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="input w-full rounded-2xl py-3 pl-11 pr-10"
            placeholder="Buscar plato, bebida, postre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
              onClick={() => setQuery('')}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {['Todas', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                catFilter === cat
                  ? 'bg-primary text-primary-contrast shadow'
                  : 'border border-line bg-surface text-ink-muted hover:bg-surface-alt'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Sin resultados"
          subtitle="Probá con otra búsqueda o elegí otra categoría."
        />
      ) : (
        <div className="space-y-12">
          {featured.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-glow">
              <Star size={18} className="fill-white" />
            </span>
            <h2 className="text-2xl font-extrabold text-ink">Ofertas especiales</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item, i) => (
              <article
                key={item.id}
                className="animate-fade-up group relative overflow-hidden rounded-3xl border border-amber-300/50 bg-surface shadow-glow transition-transform hover:-translate-y-1"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary to-primary-strong">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-extrabold text-primary-contrast/60">
                      {item.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-sm font-black text-white shadow-glow">
                    <Star size={14} className="fill-white" />
                    {item.featured_label || 'Oferta'}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{item.category}</p>
                  <h3 className="mt-1 text-lg font-extrabold text-ink">{item.title}</h3>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{item.description}</p>
                  )}
                  <p className="mt-4 text-3xl font-black text-primary-strong drop-shadow-sm">
                    {formatMoney(item.price, settings.currency)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-ink">Nuestro menú</h2>
        {Object.keys(grouped).length === 0 && featured.length > 0 ? (
          <p className="text-sm text-ink-muted">Todos los productos del menú están en oferta.</p>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, list]) => (
              <div key={category}>
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-lg font-extrabold text-ink">{category}</h3>
                  <div className="h-px flex-1 bg-line" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((item) => (
                    <article key={item.id} className="card group overflow-hidden transition-transform hover:-translate-y-0.5">
                      <div className="relative aspect-square bg-gradient-to-br from-primary to-primary-strong">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-primary-contrast/60">
                            {item.title.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-ink">{item.title}</h4>
                        {item.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{item.description}</p>
                        )}
                        <p className="mt-3 text-2xl font-black text-primary-strong">
                          {formatMoney(item.price, settings.currency)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
        </div>
      )}
    </div>
  );
}