import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, ArrowRight, Bell, Camera, Check, Coffee, Copy, Loader2, Mail, Pencil, Phone, QrCode, Save, Ticket, X } from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import { EmptyState, Modal, Spinner, toast } from '../components/ui.jsx';
import ImageCropper from '../components/ImageCropper.jsx';
import { ReadyCouponCard, couponValue } from '../components/CouponCards.jsx';
import Navbar from '../components/Navbar.jsx';
import Stamps from '../components/Stamps.jsx';
import PhoneInput from '../components/PhoneInput.jsx';
import AdminSummary from '../components/AdminSummary.jsx';
import { formatWhen, notificationMeta } from '../lib/notifications.js';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { settings } = useTheme();
  const { t } = useTenant();
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
  const currency = settings.currency || '$';

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

  if (loading && !data) {
    return (
      <div className="page-aurora min-h-screen">
        <Navbar />
        <Spinner label="Cargando perfil..." />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="page-aurora min-h-screen">
        <Navbar />
        <EmptyState icon={Coffee} title="No se pudo cargar el perfil" />
      </div>
    );
  }

  const activeCoupon = data.activeCoupon || null;
  const readyCoupons = data.readyCoupons || [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="page-aurora min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-ink sm:text-4xl">Mi perfil</h1>

        <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Columna izquierda: identidad + QR */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="card p-5">
              <div className="flex items-center gap-4">
                {me.image ? (
                  <img src={me.image} alt={fullName(me)} className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-primary-softer" />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong font-heading text-2xl font-bold text-primary-contrast ring-4 ring-primary-softer">
                    {initials(me)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-heading text-xl font-bold text-ink">{fullName(me)}</p>
                  {me.email && <p className="flex items-center gap-1.5 truncate text-xs text-ink-muted"><Mail size={12} className="shrink-0" />{me.email}</p>}
                  {me.phone && <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-muted"><Phone size={12} className="shrink-0" />{me.phone}</p>}
                </div>
              </div>
              <button className="btn-ghost mt-4 w-full !py-2 text-sm" onClick={openEdit}>
                <Pencil size={14} />
                Editar perfil
              </button>
            </section>

            {isCliente && (
              <section className="card p-5 text-center">
                <p className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-muted">
                  <QrCode size={13} /> Tu QR
                </p>
                {qrCode ? (
                  <>
                    <div className="mx-auto mt-3 w-fit rounded-3xl border border-line bg-white p-3">
                      {qrImg ? (
                        <img src={qrImg} alt={`Código QR ${qrCode}`} className="h-48 w-48" />
                      ) : (
                        <div className="flex h-48 w-48 items-center justify-center text-ink-muted"><Loader2 className="animate-spin" size={22} /></div>
                      )}
                    </div>
                    <button className="btn-ghost mx-auto mt-3 !py-1.5" onClick={copyCode} title="Copiar código" aria-label="Copiar código QR">
                      <span className="font-mono text-sm font-bold tracking-wider text-ink">{qrCode}</span>
                      {copied ? <Check size={14} className="text-primary-strong" /> : <Copy size={14} />}
                    </button>
                    <p className="mt-2 text-xs text-ink-muted">Mostralo al pagar para sumar puntos.</p>
                  </>
                ) : (
                  <div className="mt-3 flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line px-4 py-8">
                    <p className="text-sm font-semibold text-ink">Activá un cupón para tener tu QR</p>
                    <Link to={t('/cupones')} className="btn-primary !py-2 text-sm">
                      Elegir cupón
                    </Link>
                  </div>
                )}
              </section>
            )}
          </aside>

          {/* Columna derecha */}
          <div className="min-w-0 space-y-6">
            {isCliente ? (
              <>
                {activeCoupon ? (
                  <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary to-primary-strong p-6 text-primary-contrast shadow-glow sm:p-7">
                    <div className="orb -right-16 -top-16 h-56 w-56 bg-primary-contrast/10" />
                    <div className="relative flex flex-wrap items-start justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                        <Ticket size={13} /> Tu cupón activo
                      </span>
                      <Link to={t('/cupones')} className="inline-flex items-center gap-1 text-sm font-semibold opacity-90 hover:opacity-100">
                        Mis cupones <ArrowRight size={14} />
                      </Link>
                    </div>
                    <h2 className="relative mt-3 font-heading text-3xl font-bold leading-tight">
                      {activeCoupon.type === 'regalo' ? activeCoupon.title : couponValue(activeCoupon, currency)}
                    </h2>
                    {activeCoupon.description && <p className="relative mt-1 max-w-xl text-sm opacity-85">{activeCoupon.description}</p>}
                    <div className="relative mt-4">
                      <Stamps points={activeCoupon.points} target={activeCoupon.target_points} />
                    </div>
                    <p className="relative mt-3 text-sm font-bold">
                      {Number(activeCoupon.points) || 0} de {Number(activeCoupon.target_points) || 0} puntos
                      <span className="font-medium opacity-80">
                        {' '}· te faltan {Math.max(0, (Number(activeCoupon.target_points) || 0) - (Number(activeCoupon.points) || 0))}
                      </span>
                    </p>
                  </section>
                ) : (
                  <section className="card flex flex-wrap items-center justify-between gap-4 border-2 border-dashed p-6">
                    <div>
                      <p className="font-heading text-xl font-bold text-ink">No tenés un cupón activo</p>
                      <p className="mt-1 text-sm text-ink-muted">Elegí un premio y empezá a sumar puntos con tu QR.</p>
                    </div>
                    <Link to={t('/cupones')} className="btn-primary">
                      Ver cupones <ArrowRight size={15} />
                    </Link>
                  </section>
                )}

                {readyCoupons.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold text-ink">Listos para canjear</h2>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        {readyCoupons.length}
                      </span>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {readyCoupons.map((c) => (
                        <ReadyCouponCard key={c.id} coupon={c} currency={currency} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <AdminSummary />
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2.5 text-xl font-bold text-ink">
                  Notificaciones
                  {unread > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 font-sans text-xs font-bold text-primary-contrast">{unread} nuevas</span>
                  )}
                </h2>
                <Link to={t('/notificaciones')} className="text-sm font-semibold text-primary-strong hover:underline">
                  Ver historial
                </Link>
              </div>
              {notifications.length === 0 ? (
                <div className="card">
                  <EmptyState icon={Bell} title="No tenés notificaciones" subtitle="Las novedades de tus compras y cupones aparecerán acá." />
                </div>
              ) : (
                <ul className="card divide-y divide-line overflow-hidden">
                  {notifications.slice(0, 6).map((n) => {
                    const meta = notificationMeta(n.type);
                    const Icon = meta.icon;
                    return (
                      <li key={n.id} className={`group flex items-start gap-3 px-4 py-3.5 sm:px-5 ${!n.read ? 'bg-primary-softer/60' : ''}`}>
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.style}`}>
                          <Icon size={17} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary"><span className="sr-only">Sin leer</span></span>}
                              {n.title}
                            </p>
                            <p className="shrink-0 text-[11px] font-semibold text-ink-muted">{formatWhen(n.created_at)}</p>
                          </div>
                          <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{n.body}</p>
                        </div>
                        <button
                          className="btn-icon shrink-0 opacity-70 transition group-hover:opacity-100"
                          onClick={() => archiveNotification(n)}
                          title="Archivar"
                          aria-label="Archivar notificación"
                        >
                          <Archive size={15} />
                        </button>
                      </li>
                    );
                  })}
                  {notifications.length > 6 && (
                    <li className="px-5 py-3 text-center">
                      <Link to={t('/notificaciones')} className="text-xs font-bold text-primary-strong hover:underline">
                        Ver todas las notificaciones ({notifications.length})
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar perfil">
        <form onSubmit={save} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {form.image ? (
                <img src={form.image} alt={form.name} className="h-16 w-16 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-xl font-extrabold text-primary-contrast shadow-sm">
                  {initials(form)}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-primary-strong shadow-md transition-transform hover:scale-110"
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
              <label className="label" htmlFor="profile-name">Nombre</label>
              <input id="profile-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="profile-last-name">Apellido</label>
              <input id="profile-last-name" className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="profile-email">Email</label>
            <input id="profile-email" className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="profile-phone">Teléfono</label>
            <PhoneInput id="profile-phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
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

function initials(u) {
  const parts = [u?.name, u?.last_name].filter((x) => x && String(x).trim());
  return parts.length > 0 ? parts.map((p) => String(p).trim()[0]).join('').slice(0, 2).toUpperCase() : '?';
}

function fullName(u) {
  return [u?.name, u?.last_name].filter(Boolean).join(' ').trim() || 'Usuario';
}
