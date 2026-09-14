import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BadgePercent,
  Check,
  Coffee,
  Gift,
  Leaf,
  Loader2,
  Pencil,
  ReceiptText,
  Save,
  ShoppingBag,
  Sparkles,
  Wheat,
  X,
} from 'lucide-react';
import { api, formatMoney } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { EmptyState, Spinner, toast } from '../components/ui.jsx';

const STATUS_LABEL = { activo: 'Activo', usado: 'Usado', vencido: 'Vencido' };
const STATUS_STYLE = {
  activo: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  usado: 'bg-surface-alt text-ink-muted',
  vencido: 'bg-surface-alt text-ink-muted',
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { settings } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', preferences: {} });
  const [saving, setSaving] = useState(false);
  const [redeeming, setRedeeming] = useState(null);

  const load = () =>
    api('/api/profile/me')
      .then(setData)
      .catch((e) => toast(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = () => {
    setForm({
      name: user?.name || data?.user?.name || '',
      phone: data?.user?.phone || '',
      preferences: data?.user?.preferences || {},
    });
    setEditing(true);
  };

  const togglePref = (key) =>
    setForm((f) => ({ ...f, preferences: { ...f.preferences, [key]: !f.preferences[key] } }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api('/api/profile/me', { method: 'PUT', body: form });
      updateUser(res.user);
      setData((d) => ({ ...d, user: res.user }));
      setEditing(false);
      toast('Perfil actualizado');
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const markUsed = async (coupon) => {
    setRedeeming(coupon.id);
    try {
      await api(`/api/coupons/${coupon.id}/mark-used`, { method: 'POST' });
      toast('Cupón marcado como usado');
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setRedeeming(null);
    }
  };

  if (loading && !data) return <Spinner label="Cargando perfil..." />;
  if (!data) return <EmptyState icon={Coffee} title="No se pudo cargar el perfil" />;

  const { user: me, orders, coupons, stats, suggestions } = data;

  const couponLabel = (c) =>
    c.type === 'descuento'
      ? `${Number(c.value) || 0}% de descuento`
      : c.type === 'regalo'
        ? 'Regalo'
        : `${formatMoney(c.value, settings.currency)} ${c.mode === 'web' ? 'de descuento web' : 'para tu próximo pedido'}`;

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/page px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
            <ArrowLeft size={16} />
            Volver al menú
          </Link>
          <span className="text-sm font-bold text-ink">Mi perfil</span>
          <span className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {/* Datos */}
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-xl font-extrabold text-primary-contrast">
                {(me.name || '?').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-ink">{me.name}</h1>
                <p className="text-sm text-ink-muted">{me.email}</p>
              </div>
            </div>
            {!editing && (
              <button className="btn-ghost" onClick={startEdit}>
                <Pencil size={15} />
                Editar perfil
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={save} className="mt-6 space-y-4 border-t border-line pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Nombre</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Teléfono</label>
                  <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Ej: +54 9 11..." />
                </div>
              </div>

              <div>
                <label className="label">Preferencias alimentarias</label>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { key: 'vegetarian', label: 'Vegetariano/a', icon: Leaf },
                    { key: 'glutenFree', label: 'Celiaco/a (sin TACC)', icon: Wheat },
                    { key: 'vegan', label: 'Vegano/a', icon: Sparkles },
                  ].map(({ key, label, icon: Icon }) => (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all ${
                        form.preferences[key]
                          ? 'border-primary bg-primary-soft text-primary-strong'
                          : 'border-line bg-surface text-ink-muted hover:bg-surface-alt'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={Boolean(form.preferences[key])}
                        onChange={() => togglePref(key)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
                  <X size={15} />
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Guardar cambios
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-surface-alt p-4 text-center">
                <p className="text-2xl font-extrabold text-ink">{stats.totalOrders}</p>
                <p className="text-xs text-ink-muted">Pedidos realizados</p>
              </div>
              <div className="rounded-xl bg-surface-alt p-4 text-center">
                <p className="text-2xl font-extrabold text-ink">{stats.completedOrders}</p>
                <p className="text-xs text-ink-muted">Pedidos completados</p>
              </div>
              <div className="rounded-xl bg-surface-alt p-4 text-center">
                <p className="text-2xl font-extrabold text-primary-strong">{coupons.length}</p>
                <p className="text-xs text-ink-muted">Cupones obtenidos</p>
              </div>
            </div>
          )}
        </section>

        {/* Cupones */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <Gift size={20} className="text-primary-strong" />
            Mis cupones
          </h2>
          {coupons.length === 0 ? (
            <EmptyState
              icon={BadgePercent}
              title="Todavía no tenés cupones"
              subtitle="Completá tus pedidos para ganar premios cada tantas compras."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <div key={c.id} className="card flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary-strong">
                      <BadgePercent size={20} />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[c.status]}`}>
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-ink">{couponLabel(c)}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {c.description || 'Premio por tus pedidos'}
                      {c.milestone ? ` · Pedido #${c.milestone}` : ''}
                    </p>
                  </div>
                  {c.status === 'activo' && (
                    <div className="mt-auto rounded-xl border border-dashed border-line bg-surface-alt px-3 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-wide text-ink-muted">Código</p>
                      <p className="select-all font-mono text-base font-extrabold text-ink">{c.code}</p>
                    </div>
                  )}
                  {c.status === 'activo' && c.mode !== 'web' && (
                    <button
                      className="btn-ghost w-full !py-1.5 !text-xs"
                      onClick={() => markUsed(c)}
                      disabled={redeeming === c.id}
                    >
                      {redeeming === c.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                      Lo usé en el local
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sugerencias */}
        {suggestions.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
              <ShoppingBag size={20} className="text-primary-strong" />
              Te podría gustar
            </h2>
            <p className="mb-3 text-sm text-ink-muted">
              Basado en lo que más pedís, no te pierdas:
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {suggestions.map((s) => (
                <div key={`${s.menu_item_id || s.title}`} className="card overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-primary to-primary-strong">
                    {s.image ? (
                      <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-extrabold text-primary-contrast/60">
                        {s.title.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-bold text-ink">{s.title}</p>
                    <p className="text-xs text-primary-strong">{formatMoney(s.price, settings.currency)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Historial */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <ReceiptText size={20} className="text-primary-strong" />
            Historial de pedidos
          </h2>
          {orders.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="Aún no hiciste pedidos"
              subtitle="Cuando hagas tu primer pedido aparecerá acá."
            />
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-ink">Pedido {formatDate(o.created_at)}</p>
                      <p className="text-xs text-ink-muted">
                        {o.items.reduce((a, it) => a + Number(it.qty), 0)} artículo(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-primary-strong">
                        {formatMoney(o.total, settings.currency)}
                      </p>
                      <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs font-bold capitalize text-ink-muted">
                        {o.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-ink-muted">
                    {o.items.map((it) => `${it.qty}× ${it.title}`).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') : value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}