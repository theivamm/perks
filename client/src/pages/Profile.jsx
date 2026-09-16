import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  BadgePercent,
  Bell,
  Camera,
  Coffee,
  Copy,
  Gift,
  Loader2,
  Moon,
  Pencil,
  QrCode,
  Save,
  Sun,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { EmptyState, Modal, Spinner, toast } from '../components/ui.jsx';
import ImageCropper from '../components/ImageCropper.jsx';
import { ActiveCouponCard, ReadyCouponCard } from '../components/CouponCards.jsx';
import NotificationsBell from '../components/NotificationsBell.jsx';
import UserMenu from '../components/UserMenu.jsx';
import PhoneInput from '../components/PhoneInput.jsx';
import AdminSummary from '../components/AdminSummary.jsx';
import { formatWhen, notificationMeta } from '../lib/notifications.js';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { settings, toggleTheme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrImg, setQrImg] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({ name: '', last_name: '', phone: '', email: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const me = data?.user;
  const isCliente = me?.role === 'cliente';

  const qrCode = useMemo(() => String(data?.activeCoupon?.qr_code || '').trim(), [data]);

  useEffect(() => {
    if (!qrCode) return;
    QRCode.toDataURL(qrCode, { margin: 1, width: 480, color: { dark: '#1f2937', light: '#ffffff' } })
      .then(setQrImg)
      .catch(() => {});
  }, [qrCode]);

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
    setEditModal(true);
  };

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
  };

  const uploadCropped = async (file) => {
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
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
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

  if (loading && !data) return <Spinner label="Cargando perfil..." />;
  if (!data) return <EmptyState icon={Coffee} title="No se pudo cargar el perfil" />;

  const activeCoupon = data.activeCoupon || null;
  const readyCoupons = data.readyCoupons || [];

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
            <NotificationsBell />
            <button className="btn-icon" onClick={toggleTheme} aria-label="Cambiar tema">
              <span key={settings.theme} className="animate-pop inline-block">
                {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </span>
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {isCliente && (
          <section className="card p-6 text-center">
          {me.image ? (
            <img src={me.image} alt={fullName(me)} className="mx-auto h-28 w-28 rounded-3xl object-cover shadow-md" />
          ) : (
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary-strong text-4xl font-extrabold text-primary-contrast shadow-md">
              {initials(me)}
            </div>
          )}
          <h1 className="mt-4 text-xl font-extrabold text-ink">{fullName(me)}</h1>
          <button className="btn-ghost mx-auto mt-2 inline-flex items-center gap-1.5 text-xs" onClick={openEdit}>
            <Pencil size={13} />
            Editar perfil
          </button>
          {qrCode ? (
            <>
              <p className="text-sm text-ink-muted">
                Mostrá este código al pagar para que el local sume puntos a tu cupón activo.
              </p>

              <div className="mx-auto mt-5 w-fit rounded-3xl border border-line bg-white p-4 shadow-sm dark:bg-surface">
                {qrImg ? (
                  <img src={qrImg} alt={`Código QR ${qrCode}`} className="h-52 w-52" />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center text-sm font-bold text-ink-muted">
                    <Loader2 className="animate-spin" size={22} />
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
            </>
          ) : (
            <>
              <p className="text-sm text-ink-muted">
                Activá un cupón para obtener tu código QR y que el local te sume puntos.
              </p>
              <div className="mx-auto mt-5 flex h-52 w-52 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line bg-surface-alt/40 p-4 text-center">
                <QrCode size={26} className="text-ink-muted" />
                <p className="text-sm font-bold text-ink-muted">Sin cupón activo</p>
                <Link to="/cupones" className="btn-primary text-sm">
                  Ver cupones y activar
                </Link>
              </div>
            </>
          )}
        </section>
        )}

        {isCliente ? (
          <>
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
                <QrCode size={20} className="text-primary-strong" />
                Cupones activos
              </h2>
              {activeCoupon ? (
                <ActiveCouponCard coupon={activeCoupon} currency={settings.currency} />
              ) : (
                <>
                  <EmptyState
                    icon={BadgePercent}
                    title="No tenés cupones activos"
                    subtitle="Elegí un premio y empezá a sumar puntos con tu QR."
                  />
                  <div className="-mt-8 mb-6 text-center">
                    <Link to="/" className="btn-primary text-sm">Ver cupones y activar</Link>
                  </div>
                </>
              )}
            </section>

            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
                <Gift size={20} className="text-primary-strong" />
                Cupones listos para canjear
              </h2>
              {readyCoupons.length === 0 ? (
                <EmptyState
                  icon={BadgePercent}
                  title="Todavía no tenés cupones listos"
                  subtitle="Cuando completes un cupón vas a recibir tu código de canje acá."
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {readyCoupons.map((c) => (
                    <ReadyCouponCard key={c.id} coupon={c} currency={settings.currency} />
                  ))}
                </div>
              )}
            </section>
          </>
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
                      <p className="mt-1 text-[11px] font-semibold text-ink-muted/70 dark:text-ink-muted">{formatWhen(n.created_at)}</p>
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
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
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
            <PhoneInput value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
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

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={1}
          cropShape="round"
          onSave={uploadCropped}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
        />
      )}
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