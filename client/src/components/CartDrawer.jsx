import { useEffect, useState } from 'react';
import { BadgePercent, CheckCircle2, Loader2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { api, formatMoney } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const EMPTY = { name: '', phone: '', email: '' };

export default function CartDrawer({ open, onClose, cart, setCart, items }) {
  const { settings } = useTheme();
  const { user } = useAuth();
  const [client, setClient] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState('');

  useEffect(() => {
    if (!open) return;
    setDone(null);
    if (user) {
      setClient({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      });
      api('/api/coupons/me')
        .then((list) => setCoupons((list || []).filter((c) => c.status === 'activo' && c.mode !== 'local')))
        .catch(() => setCoupons([]));
    } else {
      setClient(EMPTY);
      setCoupons([]);
    }
    setSelectedCoupon('');
  }, [open, user]);

  if (!open) return null;

  const lines = items.filter((it) => cart[it.id] > 0);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = lines.reduce((sum, it) => sum + it.price * cart[it.id], 0);

  const change = (id, delta) =>
    setCart((prev) => {
      const next = { ...prev };
      next[id] = Math.max(0, (next[id] || 0) + delta);
      return next;
    });

  const remove = (id) => setCart((prev) => ({ ...prev, [id]: 0 }));

  const clear = () => {
    setCart({});
    setDone(null);
    setClient(EMPTY);
    setSelectedCoupon('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const order = await api('/api/orders', {
        method: 'POST',
        body: {
          client,
          couponCode: selectedCoupon || undefined,
          items: lines.map((it) => ({
            menu_item_id: it.id,
            title: it.title,
            price: it.price,
            qty: cart[it.id],
          })),
        },
      });
      setDone(order);
      setCart({});
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const couponLabel = (c) =>
    c.type === 'descuento'
      ? `${Number(c.value) || 0}% `
      : c.type === 'regalo'
        ? 'Regalo '
        : `${formatMoney(c.value, settings.currency)} `;

  return (
    <div className="fixed inset-0 z-50">
      <div className="animate-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="animate-slide-in-right absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2 font-extrabold text-ink">
            <ShoppingBag size={20} className="animate-pop text-primary" key={count} />
            Tu pedido
            <span className="badge" key={count}>
              {count}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar carrito">
            <X size={20} />
          </button>
        </header>

        {done ? (
          <div className="animate-fade-up flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="animate-pop flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
              <CheckCircle2 size={44} />
            </div>
            <h3 className="text-xl font-extrabold text-ink">¡Pedido enviado!</h3>
            <p className="text-sm text-ink-muted">
              Gracias {done.client?.name || client.name || ''}, ya recibimos tu pedido.{' '}
              {done.discount > 0 && (
                <span className="font-bold text-green-600 dark:text-green-400">
                  Te aplicamos {formatMoney(done.discount, settings.currency)} de descuento con tu cupón.
                </span>
              )}
            </p>
            <button className="btn-primary mt-2" onClick={clear}>
              Hacer otro pedido
            </button>
          </div>
        ) : count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="animate-float flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
              <ShoppingBag size={30} />
            </div>
            <p className="font-bold text-ink">Tu carrito está vacío</p>
            <p className="text-sm text-ink-muted">Agrega productos del menú para empezar.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {lines.map((it, idx) => (
                  <li
                    key={it.id}
                    className="animate-fade-up flex items-center gap-3"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-strong">
                      {it.image ? (
                        <img src={it.image} alt={it.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary-contrast/70">
                          {it.title.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{it.title}</p>
                      <p className="text-xs text-ink-muted">
                        {formatMoney(it.price, settings.currency)} c/u
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="btn-icon !p-1" onClick={() => change(it.id, -1)}>
                        <Minus size={14} />
                      </button>
                      <span key={cart[it.id]} className="animate-pop w-6 text-center text-sm font-bold text-ink">
                        {cart[it.id]}
                      </span>
                      <button className="btn-icon !p-1" onClick={() => change(it.id, 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="w-14 text-right text-sm font-extrabold text-ink">
                      {formatMoney(it.price * cart[it.id], settings.currency)}
                    </div>
                    <button className="btn-icon !p-1 text-red-500" onClick={() => remove(it.id)}>
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line p-5">
              <div className="mb-4 flex items-center justify-between text-base font-extrabold text-ink">
                <span>Total</span>
                <span className="text-primary-strong">
                  {formatMoney(total, settings.currency)}
                </span>
              </div>
              {user && coupons.length > 0 && (
                <div className="mb-3">
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                    <BadgePercent size={13} />
                    Tenés cupones para usar
                  </label>
                  <select
                    className="input"
                    value={selectedCoupon}
                    onChange={(e) => setSelectedCoupon(e.target.value)}
                  >
                    <option value="">Sin cupón</option>
                    {coupons.map((c) => (
                      <option key={c.id} value={c.code}>
                        {couponLabel(c)} · {c.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <form onSubmit={submit} className="space-y-3">
                <input
                  className="input"
                  placeholder="Nombre*"
                  required
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="input"
                    placeholder="Teléfono"
                    value={client.phone}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Email"
                    type="email"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                  />
                </div>
                <button className="btn-primary w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  {submitting ? 'Enviando...' : 'Confirmar pedido'}
                </button>
              </form>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}