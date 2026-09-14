import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  BadgePercent,
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  Coffee,
  Gift,
  KeyRound,
  Loader2,
  LogOut,
  Moon,
  PartyPopper,
  Pencil,
  ReceiptText,
  Save,
  ShoppingBag,
  Sun,
  User as UserIcon,
  UserCheck,
  X,
} from 'lucide-react';
import { api, formatMoney } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { EmptyState, Modal, Spinner, toast } from '../components/ui.jsx';
import CouponCard from '../components/CouponCard.jsx';
import RewardProgress from '../components/RewardProgress.jsx';
import { formatWhen, notificationMeta } from '../lib/notifications.js';
import PreferencesEditor, {
  normalizeEmptyPreferences,
  prefsSummary,
  profileProgress,
} from '../components/PreferencesEditor.jsx';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { settings, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', last_name: '', phone: '', email: '', image: '', preferences: {} });
  const [saving, setSaving] = useState(false);
  const [redeeming, setRedeeming] = useState(null);
  const [shownPct, setShownPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const fileRef = useRef(null);
  const [pwdModal, setPwdModal] = useState(false);
  const [pwd, setPwd] = useState({ password: '', confirm: '' });
  const [changingPwd, setChangingPwd] = useState(false);
  const [notifications, setNotifications] = useState([]);

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

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const load = () =>
    api('/api/profile/me')
      .then(setData)
      .catch((e) => toast(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    api('/api/notifications')
      .then((res) => setNotifications(res.items || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const archiveNotification = async (n) => {
    try {
      await api(`/api/notifications/${n.id}/archive`, { method: 'POST' });
      setNotifications((list) => list.filter((x) => x.id !== n.id));
    } catch (err) {
      toast(err.message);
    }
  };

  const startEdit = () => {
    setForm({
      name: user?.name || data?.user?.name || '',
      last_name: data?.user?.last_name || '',
      phone: data?.user?.phone || '',
      email: data?.user?.email || '',
      image: data?.user?.image || '',
      preferences: data?.user?.preferences || {},
    });
    setMenuOpen(false);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api('/api/profile/me', {
        method: 'PUT',
        body: { ...form, preferences: normalizeEmptyPreferences(form.preferences) },
      });
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

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await api('/api/profile/upload-image', { method: 'POST', body: fd });
      setForm((f) => ({ ...f, image: res.url }));
      toast('Foto subida. Guardá los cambios para aplicarla.');
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.password.length < 6) return toast('La contraseña debe tener al menos 6 caracteres');
    if (pwd.password !== pwd.confirm) return toast('Las contraseñas no coinciden');
    setChangingPwd(true);
    try {
      await api('/api/profile/change-password', { method: 'POST', body: { password: pwd.password } });
      toast('Contraseña actualizada');
      setPwd({ password: '', confirm: '' });
      setPwdModal(false);
    } catch (err) {
      toast(err.message);
    } finally {
      setChangingPwd(false);
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
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
          <div className="flex items-center gap-1.5">
            <button className="btn-icon" onClick={toggleTheme} aria-label="Cambiar tema">
              <span key={settings.theme} className="animate-pop inline-block">
                {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </span>
            </button>
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-1.5 transition-colors hover:bg-surface-alt"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menú de usuario"
              >
                {me.image ? (
                  <img src={me.image} alt={fullName(me)} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-xs font-extrabold text-primary-contrast">
                    {initials(me)}
                  </div>
                )}
                <ChevronDown
                  size={14}
                  className={`hidden text-ink-muted transition-transform sm:block ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {menuOpen && (
                <div className="animate-fade-up absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-extrabold text-ink">{fullName(me)}</p>
                    <p className="truncate text-xs text-ink-muted">{me.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
                      onClick={startEdit}
                    >
                      <UserIcon size={15} className="text-ink-muted" />
                      Editar perfil
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
                      onClick={() => {
                        setMenuOpen(false);
                        setPwdModal(true);
                      }}
                    >
                      <KeyRound size={15} className="text-ink-muted" />
                      Cambiar contraseña
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-surface-alt"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      Salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {me.image ? (
                <img src={me.image} alt={fullName(me)} className="h-16 w-16 rounded-2xl object-cover shadow-glow" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-2xl font-extrabold text-primary-contrast shadow-glow">
                  {initials(me)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-extrabold text-ink">{fullName(me)}</h1>
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
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-ink-muted">Falta:</span>
              {progress.missing.map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-bold text-ink-muted"
                >
                  {m}
                </span>
              ))}
            </div>
          )}

          <RewardProgress completed={rewardProgress.completed} rules={rewardProgress.rules} />
        </section>

        {editing ? (
          <form onSubmit={save} className="card space-y-6 p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {form.image ? (
                  <img src={form.image} alt={form.name} className="h-20 w-20 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-2xl font-extrabold text-primary-contrast shadow-sm">
                    {initials(form)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-primary-strong shadow-md transition-transform hover:scale-110"
                  aria-label="Cambiar foto de perfil"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div className="text-sm text-ink-muted">
                <p className="font-bold text-ink">Foto de perfil</p>
                <p>Subí una foto para que te reconozcan. Se guarda cuando actualizás tu perfil.</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Nombre</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Apellido</label>
                <input
                  className="input"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Ej: +54 9 11..."
                />
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

            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setPwdModal(true)}>
                <KeyRound size={15} />
                Cambiar contraseña
              </button>
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

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
              <Bell size={20} className="text-primary-strong" />
              Notificaciones
            </h2>
            <Link
              to="/notificaciones"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary-strong hover:underline"
            >
              Ver historial
            </Link>
          </div>
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No tenés notificaciones"
              subtitle="Las novedades de tus pedidos y cupones aparecerán acá."
            />
          ) : (
            <ul className="space-y-3">
              {notifications.slice(0, 6).map((n) => {
                const meta = notificationMeta(n.type);
                const Icon = meta.icon;
                return (
                  <li key={n.id} className="card flex items-start gap-3 p-4">
                    <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.style}`}>
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-extrabold text-ink">{n.title}</p>
                        {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-strong" />}
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{n.body}</p>
                      <p className="mt-1 text-[11px] font-semibold text-ink-muted/70">{formatWhen(n.created_at)}</p>
                    </div>
                    <button
                      className="btn-ghost !px-2.5 !py-1.5 text-xs"
                      onClick={() => archiveNotification(n)}
                      title="Archivar"
                    >
                      <Archive size={14} />
                      Archivar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {notifications.length > 6 && (
            <p className="mt-3 text-center text-xs font-semibold text-ink-muted">
              <Link to="/notificaciones" className="text-primary-strong hover:underline">
                Ver todas las notificaciones
              </Link>
            </p>
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

      <Modal open={pwdModal} onClose={() => setPwdModal(false)} title="Cambiar contraseña">
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">Nueva contraseña</label>
            <input
              className="input"
              type="password"
              value={pwd.password}
              onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label">Confirmar contraseña</label>
            <input
              className="input"
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              placeholder="Repetí la contraseña"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={() => setPwdModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={changingPwd}>
              {changingPwd ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={15} />}
              Actualizar contraseña
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function initials(u) {
  const parts = [u?.name, u?.last_name].filter((x) => x && String(x).trim());
  const s = parts.length > 0 ? parts.map((p) => String(p).trim()[0]).join('').slice(0, 2).toUpperCase() : '?';
  return s;
}

function fullName(u) {
  return [u?.name, u?.last_name].filter(Boolean).join(' ').trim() || 'Usuario';
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') : value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}