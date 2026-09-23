import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Loader2, Search, SearchX, Star, UtensilsCrossed, X } from 'lucide-react';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { EmptyState } from './ui.jsx';

const normalize = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// $3.900 en lugar de $3900.00 (sin decimales si el precio es entero)
const money = (v, symbol = '$') => {
  const n = Number(v || 0);
  return `${symbol}${n.toLocaleString('es-AR', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
};

const NO_SCROLLBAR = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

function Thumb({ item, className = '' }) {
  return (
    <div className={`overflow-hidden bg-primary-softer ${className}`}>
      {item.image ? (
        <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-primary/35">
          <UtensilsCrossed size={20} />
        </div>
      )}
    </div>
  );
}

// Si Home le pasa `query` + `onQueryChange`, el buscador vive en el Navbar
// (controlado desde afuera); si no, PublicMenu usa su propio buscador.
const finalPrice = (item) => (Number(item.discount) > 0 ? (Number(item.price) * (100 - Number(item.discount))) / 100 : Number(item.price));

function OfferBadge({ item, big = false }) {
  const disc = Number(item.discount) > 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 font-black text-white shadow ${big ? 'px-3 py-1.5 text-[13px]' : 'px-2.5 py-1 text-[11px]'}`}>
      <Star size={big ? 12 : 11} className="fill-white" />
      {disc ? `−${Number(item.discount)}% OFF` : 'Oferta'}
    </span>
  );
}

// Ofertas destacadas: 1 = tarjeta ancha; 2+ = carrusel de tarjetas verticales (2–3 visibles en desktop).
function Featured({ items, currency, ring }) {
  const track = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(() => {
    onScroll();
    window.addEventListener('resize', onScroll);
    return () => window.removeEventListener('resize', onScroll);
  }, [items.length]);

  const scrollBy = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const header = (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <Flame size={16} />
        </span>
        <h3 className="font-heading text-[19px] font-bold text-ink lg:text-[22px]">Ofertas de hoy</h3>
        {items.length > 1 && <span className="text-xs font-semibold text-ink-muted">{items.length}</span>}
      </div>
      {items.length > 1 && (
        <div className="hidden gap-1.5 sm:flex">
          {[[-1, ChevronLeft, edge.start, 'Anterior'], [1, ChevronRight, edge.end, 'Siguiente']].map(([dir, Icon, off, label]) => (
            <button
              key={label}
              onClick={() => scrollBy(dir)}
              disabled={off}
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-primary/40 hover:bg-primary-softer disabled:pointer-events-none disabled:opacity-35"
            >
              <Icon size={17} />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (items.length === 1) {
    const item = items[0];
    const disc = Number(item.discount) > 0;
    return (
      <section className="min-w-0 space-y-3">
        {header}
        <article
          id={`menu-item-${item.id}`}
          className={`group grid overflow-hidden rounded-3xl border border-amber-300/60 bg-surface shadow-[0_10px_30px_-14px_rgba(242,138,30,0.45)] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] ${ring(item.id)}`}
        >
          <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[220px]">
            <Thumb item={item} className="absolute inset-0 h-full w-full" />
            <span className="absolute left-3 top-3"><OfferBadge item={item} big /></span>
          </div>
          <div className="flex min-w-0 flex-col justify-center gap-1.5 p-5 sm:p-7">
            {item.featured_label && <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">{item.featured_label}</p>}
            <h4 className="font-heading text-2xl font-bold leading-tight text-ink sm:text-[30px]">{item.title}</h4>
            {item.description && <p className="max-w-md text-sm leading-relaxed text-ink-muted">{item.description}</p>}
            <p className="mt-1.5 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold text-primary-strong">{money(finalPrice(item), currency)}</span>
              {disc && <span className="text-base font-semibold text-ink-muted line-through">{money(item.price, currency)}</span>}
            </p>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-3">
      {header}
      <div className="relative -mx-4 sm:mx-0">
        <div
          ref={track}
          onScroll={onScroll}
          className={`flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-0 sm:px-0 lg:gap-4 ${NO_SCROLLBAR}`}
        >
          {items.map((item) => {
            const disc = Number(item.discount) > 0;
            return (
              <article
                key={item.id}
                id={`menu-item-${item.id}`}
                className={`group flex w-[74%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-amber-300/60 bg-surface shadow-[0_10px_30px_-16px_rgba(242,138,30,0.5)] transition-transform hover:-translate-y-0.5 sm:w-[calc((100%-12px)/2)] lg:w-[calc((100%-32px)/3)] ${ring(item.id)}`}
              >
                <div className="relative aspect-[4/3]">
                  <Thumb item={item} className="absolute inset-0 h-full w-full" />
                  <span className="absolute left-3 top-3"><OfferBadge item={item} /></span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1 p-4 lg:p-5">
                  {item.featured_label && (
                    <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">{item.featured_label}</p>
                  )}
                  <h4 className="font-heading text-lg font-bold leading-tight text-ink lg:text-xl">{item.title}</h4>
                  {item.description && <p className="line-clamp-2 text-[13px] leading-snug text-ink-muted">{item.description}</p>}
                  <p className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="font-heading text-2xl font-bold text-primary-strong">{money(finalPrice(item), currency)}</span>
                    {disc && <span className="text-sm font-semibold text-ink-muted line-through">{money(item.price, currency)}</span>}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
        {!edge.end && <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-surface-page to-transparent sm:block" />}
      </div>
    </section>
  );
}

export default function PublicMenu({ query: extQuery, onQueryChange }) {
  const controlled = typeof onQueryChange === 'function';
  const { settings } = useTheme();
  const currency = settings.currency || '$';
  const [data, setData] = useState({ items: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [ownQuery, setOwnQuery] = useState('');
  const query = controlled ? extQuery || '' : ownQuery;
  const setQuery = controlled ? onQueryChange : setOwnQuery;
  const [catFilter, setCatFilter] = useState('Todas');
  const [highlightId, setHighlightId] = useState(null);
  const highlightTimer = useRef(null);

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
    const counts = new Map();
    for (const it of visible) if (it.category) counts.set(it.category, (counts.get(it.category) || 0) + 1);
    return [...counts.entries()].map(([name, count]) => ({ name, count }));
  }, [visible]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return visible.filter((it) => {
      const okCat = catFilter === 'Todas' || it.category === catFilter;
      const okSearch =
        !q || normalize(it.title).includes(q) || normalize(it.description).includes(q) || normalize(it.category).includes(q);
      return okCat && okSearch;
    });
  }, [visible, catFilter, query]);

  const featured = useMemo(() => filtered.filter((it) => it.featured), [filtered]);

  const grouped = useMemo(() => {
    const map = {};
    for (const it of filtered) if (!it.featured) (map[it.category || 'General'] ||= []).push(it);
    return map;
  }, [filtered]);

  useEffect(() => {
    if (controlled) highlightMatch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSearch = (value) => {
    setQuery(value);
    highlightMatch(value);
  };

  const highlightMatch = (value) => {
    const q = normalize(value.trim());
    if (!q) return;
    const match = visible.find((it) => {
      const okCat = catFilter === 'Todas' || it.category === catFilter;
      if (!okCat) return false;
      return normalize(it.title).includes(q) || normalize(it.description).includes(q) || normalize(it.category).includes(q);
    });
    if (!match) return;
    setHighlightId(match.id);
    clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightId((h) => (h === match.id ? null : h)), 2200);
  };

  const pickCat = (cat) => {
    setCatFilter(cat);
    const el = document.getElementById('menu-top');
    if (el && el.getBoundingClientRect().top < 0) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 72, behavior: 'smooth' });
  };

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
        <EmptyState icon={UtensilsCrossed} title="El menú se viene pronto" subtitle="Muy pronto vas a poder ver todos los productos del local acá." />
      </section>
    );
  }

  const tabs = [{ name: 'Todas', label: 'Todo el menú', count: visible.length }, ...categories.map((c) => ({ ...c, label: c.name }))];
  const ring = (id) => (highlightId === id ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-page' : '');

  return (
    <div id="menu-top" className="min-w-0 mt-6 lg:mt-8 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-9">
      {/* Escritorio: categorías fijas a la izquierda */}
      <aside className="hidden lg:sticky lg:top-24 lg:block">
        {controlled && query && (
          <p className="mb-3 rounded-xl bg-primary-softer px-3 py-2 text-xs font-semibold text-primary-strong">
            {filtered.length} resultado{filtered.length === 1 ? '' : 's'} para “{query}”
          </p>
        )}
        <p className="px-3 pb-2.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-muted">Categorías</p>
        <div className="space-y-0.5">
          {tabs.map((t) => {
            const on = catFilter === t.name;
            return (
              <button
                key={t.name}
                onClick={() => pickCat(t.name)}
                aria-current={on ? 'true' : undefined}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  on ? 'bg-primary text-primary-contrast shadow-sm' : 'text-ink hover:bg-surface-alt'
                }`}
              >
                <span className="leading-snug">{t.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${on ? 'bg-white/20' : 'bg-primary-softer text-ink-muted'}`}>{t.count}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="min-w-0 space-y-8">
        {/* Buscador (+ chips en mobile). Queda fijo bajo el Navbar en mobile. */}
        <div className={`sticky z-30 -mx-4 space-y-2.5 bg-surface-page/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none ${
          controlled ? 'top-[128px] lg:hidden' : 'top-[72px] lg:static'
        }`}>
          {controlled && query && (
            <p className="text-xs font-semibold text-ink-muted lg:hidden">
              {filtered.length} resultado{filtered.length === 1 ? '' : 's'} para “{query}”
            </p>
          )}
          <div className={`relative ${controlled ? 'hidden' : ''}`}>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="menu-search"
              className="input w-full rounded-2xl py-3 pl-11 pr-10"
              placeholder="Buscar plato, bebida, postre..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {query && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
                <X size={16} />
              </button>
            )}
          </div>
          <div className={`-mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden ${NO_SCROLLBAR}`}>
            {tabs.map((t) => {
              const on = catFilter === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => pickCat(t.name)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                    on ? 'border-primary bg-primary text-primary-contrast' : 'border-line bg-surface text-ink'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="Sin resultados" subtitle="Probá con otra búsqueda o elegí otra categoría." />
        ) : (
          <>
            {featured.length > 0 && <Featured items={featured} currency={currency} ring={ring} />}

            <div className="space-y-8 lg:space-y-10">
              {Object.entries(grouped).map(([category, list]) => (
                <section key={category}>
                  <div className="mb-1 flex items-center gap-3 lg:mb-3.5">
                    <h3 className="font-heading text-[17px] font-bold text-ink lg:text-[21px]">{category}</h3>
                    <span className="hidden text-xs font-semibold text-ink-muted lg:inline">{list.length}</span>
                    <div className="hidden h-px flex-1 bg-line lg:block" />
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-2 lg:gap-3 2xl:grid-cols-3">
                    {list.map((item) => (
                      <article
                        key={item.id}
                        id={`menu-item-${item.id}`}
                        className={`group flex min-w-0 items-center gap-3 border-b border-line py-3 lg:gap-3.5 lg:rounded-[18px] lg:border lg:bg-surface lg:p-3 lg:transition lg:hover:border-primary/40 ${ring(item.id)}`}
                      >
                        <Thumb item={item} className="order-last h-16 w-16 shrink-0 rounded-xl lg:order-first lg:h-[76px] lg:w-[76px] lg:rounded-2xl" />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <h4 className="text-sm font-semibold text-ink lg:text-[15px]">{item.title}</h4>
                          {item.description && <p className="line-clamp-2 text-xs leading-snug text-ink-muted lg:text-[13px]">{item.description}</p>}
                          <p className="mt-1 font-heading text-[15px] font-bold text-primary-strong lg:hidden">{money(item.price, currency)}</p>
                        </div>
                        <p className="hidden shrink-0 pr-1.5 font-heading text-[17px] font-bold text-primary-strong lg:block">{money(item.price, currency)}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
