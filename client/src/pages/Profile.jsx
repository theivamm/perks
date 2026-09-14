import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  BadgePercent,
  Bell,
  Camera,
  ChevronDown,
  Coffee,
  Copy,
  Gift,
  KeyRound,
  Loader2,
  LogOut,
  Moon,
  Pencil,
  QrCode,
  Save,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { EmptyState, Modal, Spinner, toast } from '../components/ui.jsx';
import CouponCard from '../components/CouponCard.jsx';
import AdminSummary from '../components/AdminSummary.jsx';
import { formatWhen, notificationMeta } from '../lib/notifications.js';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { settings, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrImg, setQrImg] = useState('');
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const fileRef = useRef(null);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({ name: '', last_name: '', phone: '', email: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [pwdModal, setPwdModal] = useState(false);
  const [pwd, setPwd] = useState({ password: '', confirm: '' });
  const [changingPwd, setChangingPwd] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const me = data?.user;
  const isCliente = me?.role === 'cliente';

  const qrCode = useMemo(() => String(me?.qr_code || '').trim(), [me]);

  useEffect(() => {
    if (!qrCode) return;
    QRCode.toDataURL(qrCode, { margin: 1, width: 480, color: { dark: '#1f2937', light: '#ffffff' } })
      .then(setQrImg)
      .catch(() => {});
  }, [qrCode]);

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

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast('No se pudo copiar el código');
    }
  };

  const openEdit = () => {
    setForm({
      name: user?.name || me?.name || '',
      last_name: me?.last_name || '',
      phone: me?.phone || '',
      email: me?.email || '',
      image: me?.image || '',
    });
    setMenuOpen(false);
    setEditModal(true);
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
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api('/api/profile/me', { method: 'PUT', body: { ...form } });
      updateUser(res.user);
      setData((d) => ({ ...d, user: res.user }));
      setEditModal(false);
      toast('Perfil actualizado');
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

  const { coupons } = data;
  const activeCoupons = (coupons || []).filter((c) => c.status === 'activo');

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/page px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink">
            <ArrowLeft size={16} />
            Inicio
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
                      onClick={openEdit}
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

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {isCliente && (
          <section className="card p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
            <QrCode size={26} />
          </div>
          <h1 className="mt-3 text-xl font-extrabold text-ink">{fullName(me)}</h1>
          <p className="text-sm text-ink-muted">Mostrá este código al pagar para sumar tus compras y ganar premios.</p>

          <div className="mx-auto mt-5 w-fit rounded-3xl border border-line bg-white p-4 shadow-sm">
            {qrCode ? (
              qrImg ? (
                <img src={qrImg} alt={`Código QR ${qrCode}`} className="h-52 w-52" />
              ) : (
                <div className="flex h-52 w-52 items-center justify-center text-sm font-bold text-ink-muted">
                  <Loader2 className="animate-spin" size={22} />
                </div>
              )
            ) : (
              <div className="flex h-52 w-52 flex-col items-center justify-center gap-3 p-4 text-center">
                <QrCode size={26} className="text-ink-muted" />
                <p className="text-sm font-bold text-ink-muted">No se pudo generar tu código QR</p>
                <button className="btn-ghost" onClick={load}>
                  Reintentar
                </button>
              </div>
            )}
          </div>

          <button
            className="btn-ghost mx-auto mt-4 inline-flex items-center gap-2"
            onClick={copyCode}
            title="Copiar código"
          >
            <span className="font-mono text-sm font-bold tracking-wider text-ink">{qrCode}</span>
            {copied ? <CheckCircleMini /> : <Copy size={14} />}
          </button>
        </section>
        )}

        {isCliente ? (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
              <Gift size={20} className="text-primary-strong" />
              Mis cupones activos
            </h2>
            {activeCoupons.length === 0 ? (
              <EmptyState
                icon={BadgePercent}
                title="Todavía no tenés cupones"
                subtitle="Sumá compras con tu QR y vas ganando descuentos."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activeCoupons.map((c) => (
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
        ) : (
          <AdminSummary />
        )}

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
              subtitle="Las novedades de tus compras y cupones aparecerán acá."
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
      </main>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar perfil">
        <form onSubmit={save} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {form.image ? (
                <img src={form.image} alt={form.name} className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-xl font-extrabold text-primary-contrast shadow-sm">
                  {initials(form)}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-primary-strong shadow-md transition-transform hover:scale-110"
                aria-label="Cambiar foto de perfil"
              >
                <Camera size={13} />
              </button>
            </div>
            <p className="text-sm text-ink-muted">Tu foto ayuda a que te reconozcan en el local.</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={() => setEditModal(false)}>
              <X size={15} />
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Guardar cambios
            </button>
          </div>
        </form>
      </Modal>

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

function CheckCircleMini() {
  return (
    <span className="text-primary-strong">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
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