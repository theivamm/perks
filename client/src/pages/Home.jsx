import { useEffect, useMemo, useState } from 'react';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import Navbar from '../components/Navbar.jsx';
import MenuCard from '../components/MenuCard.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import { Spinner, EmptyState } from '../components/ui.jsx';

export default function Home() {
  const [data, setData] = useState({ items: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('Todas');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const { settings } = useTheme();

  useEffect(() => {
    api('/api/menu')
      .then((d) => {
        setData(d);
        if (d.categories?.length && active === 'Todas') setActive('Todas');
      })
      .catch(() => setData({ items: [], categories: [] }))
      .finally(() => setLoading(false));
  }, []);

  const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

  const addToCart = (item) =>
    setCart((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));

  const categories = ['Todas', ...data.categories];
  const items = useMemo(
    () => (active === 'Todas' ? data.items : data.items.filter((i) => i.category === active)),
    [data.items, active]
  );

  return (
    <div className="min-h-screen bg-surface-page">
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-strong to-primary-soft p-8 text-primary-contrast shadow-glow sm:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-contrast/10" />
          <div className="absolute -bottom-14 right-24 h-40 w-40 rounded-full bg-primary-contrast/10" />
          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-contrast/15 px-3 py-1 text-xs font-bold tracking-wide uppercase">
              <Sparkles size={14} />
              Menú digital
            </span>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
              Delicioso, a un clic
            </h1>
            <p className="mt-3 text-sm text-primary-contrast/85 sm:text-base">
              Explora nuestro menú, arma tu pedido y disfruta. Todo se ve renovado con
              tu esencia de marca.
            </p>
          </div>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
            <UtensilsCrossed className="text-primary-strong" size={24} />
            Nuestro menú
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active === cat
                    ? 'bg-primary text-primary-contrast shadow-md'
                    : 'border border-line bg-surface text-ink-muted hover:bg-surface-alt hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Spinner label="Cargando menú..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="Aún no hay productos"
            subtitle="El administrador puede cargar el menú desde el panel de control."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-10 border-t border-line py-8 text-center text-sm text-ink-muted">
        © {new Date().getFullYear()} Fidelización App · Menú ·{' '}
        {settings.currency || '$'} moneda configurable desde el panel
      </footer>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
        items={data.items}
      />
    </div>
  );
}