import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BadgePercent,
  CheckCircle2,
  Coffee,
  Gift,
  Loader2,
  PartyPopper,
  Pencil,
  ReceiptText,
  Save,
  ShoppingBag,
  UserCheck,
  X,
} from 'lucide-react';
import { api, formatMoney } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { EmptyState, Spinner, toast } from '../components/ui.jsx';
import CouponCard from '../components/CouponCard.jsx';
import RewardProgress from '../components/RewardProgress.jsx';
import PreferencesEditor, { prefsSummary, profileProgress } from '../components/PreferencesEditor.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { settings } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', preferences: {} });
  const [saving, setSaving] = useState(false);
  const [redeeming, setRedeeming] = useState(null);
  const [shownPct, setShownPct] = useState(0);

  const progress = data?.user ? profileProgress({ ...data.user }) : null;

  useEffect(() => {
    const target = progress?.pct || 0;
    let raf;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setShownPct(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress?.pct]);

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

  const { user: me, orders, coupons, stats, rewardProgress, suggestions } = data;
  const summary = prefsSummary(me.preferences);

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
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-2xl font-extrabold text-primary-contrast shadow-glow">
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

          <div className="animate-fade-up mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface-alt/50 p-3.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-contrast shadow-glow ${
                progress.pct === 100
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                  : 'bg-gradient-to-br from-primary to-primary-strong'
              }`}
            >
              {progress.pct === 100 ? <PartyPopper size={18} /> : <UserCheck size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-extrabold text-ink">
                  Perfil {shownPct}% <span className="font-semibold text-ink-muted">completo</span>
                </p>
                <span className="text-xs font-bold text-ink-muted">
                  {progress.done}/{progress.total}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-strong transition-[width] duration-700 ease-out"
                  style={{ width: `${shownPct}%` }}
                />
              </div>
            </div>
            {progress.pct === 100 && (
              <span className="animate-pop hidden text-xs font-extrabold text-amber-500 sm:block">
                ¡Completado!
              </span>
            )}
          </div>
          {progress.pct < 100 && (
            <p className="mt-1.5 text-xs font-semibold text-ink-muted">
              {progress.pct === 0
                ? 'Empezá por tu nombre, teléfono y preferencias para desbloquear recomendaciones.'
                : 'Completá la info para que todo llegue exactamente como te gusta.'}
            </p>
          )}

          <RewardProgress completed={rewardProgress.completed} rules={rewardProgress.rules} />
        </section>

        {editing ? (
          <form onSubmit={save} className="card space-y-6 p-6">
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
              <h3 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
                <Coffee size={20} className="text-primary-strong" />
                Preferencias de Perfil
              </h3>
              <PreferencesEditor
                value={form.preferences}
                onChange={(preferences) => setForm((f) => ({ ...f, preferences }))}
              />
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
          <>
            <div className="grid gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-xl bg-surface-alt p-4 text-center">
                <p className="text-2xl font-extrabold text-ink">{stats.totalOrders}</p>
                <p className="text-xs text-ink-muted">Pedidos realizados</p>
              </div>
              <div className="rounded-xl bg-surface-alt p-4 text-center">
                <p className="text-2xl font-extrabold text-ink">{stats.completedOrders}</p>
                <p className="text-xs text-ink-muted">Pedidos completados</p>
              </div>
              <div className="rounded-xl bg-surface-alt p-4 text-center">
                <p className="text-2xl font-extrabold text-primary-strong">
                  {formatMoney(stats.totalSpent, settings.currency)}
                </p>
                <p className="text-xs text-ink-muted">Total gastado</p>
              </div>
              <div className="rounded-xl bg-surface-alt p-4 text-center">
                <p className="text-2xl font-extrabold text-primary-strong">{coupons.length}</p>
                <p className="text-xs text-ink-muted">Cupones obtenidos</p>
              </div>
            </div>

            {summary.length > 0 && (
              <section className="card p-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-ink">
                  <BadgePercent size={16} className="text-primary-strong" />
                  Tus preferencias y filtros
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {summary.map((g, i) => {
                    const Icon = g.icon;
                    return (
                      <div
                        key={g.key}
                        className={`animate-fade-up rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${g.gradient} ${g.border}`}
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="mb-2.5 flex items-center gap-2">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${g.badge}`}>
                            <Icon size={17} />
                          </span>
                          <p className="text-sm font-extrabold leading-tight text-ink">{g.title}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(g.items || []).map((it) => {
                            const ItemIcon = it.icon;
                            return (
                              <span
                                key={it.value}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${g.tint}`}
                              >
                                <ItemIcon size={13} />
                                {it.label}
                              </span>
                            );
                          })}
                          {g.value && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${g.tint}`}>
                              {g.value}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <Gift size={20} className="text-primary-strong" />
            Mis cupones
          </h2>
          {coupons.length === 0 ? (
            <EmptyState
              icon={BadgePercent}
              title="Todavía no tenés cupones"
              subtitle="Completá pedidos y vas ganando descuentos en tu próxima compra."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {coupons.map((c) => (
                <CouponCard
                  key={c.id}
                  coupon={c}
                  currency={settings.currency}
                  onUse={markUsed}
                  using={redeeming === c.id}
                />
              ))}
            </div>
          )}
        </section>

        {suggestions.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
              <ShoppingBag size={20} className="text-primary-strong" />
              Te podría gustar
            </h2>
            <p className="mb-3 text-sm text-ink-muted">Basado en lo que más pedís, no te pierdas:</p>
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

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <ReceiptText size={20} className="text-primary-strong" />
            Historial de compras
          </h2>
          {orders.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="Aún no hiciste pedidos"
              subtitle="Cuando hagas tu primer pedido aparecerá acá, junto con tus compras y lo que llevás gastado."
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