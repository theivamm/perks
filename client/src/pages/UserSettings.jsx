import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Building2, Camera, Check, ChevronRight, Coins, Loader2, LogOut, Moon, Sun, Trash2, User as UserIcon } from 'lucide-react';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import { Modal, toast } from '../components/ui.jsx';
import ImageCropper from '../components/ImageCropper.jsx';
import { avatarInitials } from '../components/UserMenu.jsx';
import Navbar from '../components/Navbar.jsx';

function Group({ title, children, danger = false }) {
  return (
    <section className="space-y-2">
      <h2 className={`px-1 font-sans text-[11px] font-extrabold uppercase tracking-[0.16em] ${danger ? 'text-red-500' : 'text-ink-muted'}`}>{title}</h2>
      <div className={`card divide-y divide-line overflow-hidden ${danger ? '!border-red-200 dark:!border-red-400/30' : ''}`}>{children}</div>
    </section>
  );
}

function Row({ icon: Icon, title, subtitle, children, to, onClick, tone = 'default' }) {
  const iconCls =
    tone === 'danger'
      ? 'bg-red-500/10 text-red-500'
      : 'bg-primary-softer text-primary-strong';
  const inner = (
    <>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconCls}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${tone === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-ink'}`}>{title}</p>
        {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{subtitle}</p>}
      </div>
      {children}
      {(to || onClick) && !children && <ChevronRight size={17} className="shrink-0 text-ink-muted" />}
    </>
  );
  const cls = 'flex w-full items-center gap-3.5 px-4 py-4 text-left sm:px-5';
  if (to) return <Link to={to} className={`${cls} transition-colors hover:bg-surface-alt`}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className={`${cls} transition-colors hover:bg-surface-alt`}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

export default function UserSettings() {
  const { settings, toggleTheme } = useTheme();
  const { user, updateUser, switchApp, logout } = useAuth();
  const { t, slug } = useTenant();
  const navigate = useNavigate();
  const dark = settings.theme === 'dark';

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [clientApps, setClientApps] = useState([]);
  const [switchingApp, setSwitchingApp] = useState('');

  useEffect(() => {
    api('/api/auth/apps')
      .then((data) => setClientApps((data.apps || []).filter((app) => app.role === 'cliente')))
      .catch(() => setClientApps([]));
  }, []);

  const changeApp = async (nextSlug) => {
    if (!nextSlug || nextSlug === slug) return;
    setSwitchingApp(nextSlug);
    try {
      await switchApp(nextSlug);
      navigate(`/${nextSlug}/configuracion`);
    } catch (err) {
      toast(err.message);
      setSwitchingApp('');
    }
  };

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
  };

  const uploadCropped = async (file) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await api('/api/profile/upload-image', { method: 'POST', body: fd });
      updateUser({ ...user, image: res.url });
      toast('Foto de perfil actualizada');
    } catch (err) {
      toast(err.message);
    } finally {
      setUploading(false);
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    if (String(deleteConfirm || '').trim().toUpperCase() !== 'ELIMINAR') {
      return toast('Escribí ELIMINAR para confirmar');
    }
    setDeleting(true);
    try {
      await api('/api/profile/delete-account', { method: 'POST', body: { confirm: deleteConfirm } });
      await logout();
      navigate(t('/'));
      toast('Tu cuenta fue eliminada.');
    } catch (err) {
      toast(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const doLogout = async () => {
    await logout();
    navigate(t('/'));
  };

  const setTheme = (wantDark) => {
    if (wantDark !== dark) toggleTheme();
  };

  return (
    <div className="page-aurora min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-2xl space-y-7 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">Configuración</h1>
          <p className="mt-1 text-sm text-ink-muted">Tu foto, tu tema y la gestión de tu cuenta.</p>
        </div>

        {/* Tarjeta de identidad con foto */}
        <section className="card flex flex-wrap items-center gap-4 p-5">
          <div className="relative">
            {user?.image ? (
              <img src={user.image} alt={user.name || 'Foto de perfil'} className="h-16 w-16 rounded-full object-cover ring-4 ring-primary-softer" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong font-heading text-xl font-bold text-primary-contrast ring-4 ring-primary-softer">
                {avatarInitials(user)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-primary-strong shadow-md transition-transform hover:scale-110"
              aria-label="Cambiar foto de perfil"
            >
              {uploading ? <Loader2 className="animate-spin" size={13} /> : <Camera size={13} />}
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-lg font-bold text-ink">{[user?.name, user?.last_name].filter(Boolean).join(' ') || 'Tu cuenta'}</p>
            {user?.email && <p className="truncate text-xs text-ink-muted">{user.email}</p>}
          </div>
          <button className="btn-ghost !py-2 text-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Subiendo…' : 'Cambiar foto'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
        </section>

        <Group title="Preferencias">
          <Row icon={dark ? Moon : Sun} title="Tema" subtitle="Cómo ves la app en este dispositivo.">
            <div className="flex shrink-0 gap-1 rounded-xl bg-surface-alt p-1">
              {[
                [false, 'Claro', Sun],
                [true, 'Oscuro', Moon],
              ].map(([d, label, Icon]) => (
                <button
                  key={label}
                  onClick={() => setTheme(d)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    dark === d ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </Row>
          <Row icon={Coins} title="Moneda" subtitle="La define el local; los precios y premios se muestran así.">
            <span className="shrink-0 rounded-lg bg-surface-alt px-3 py-1.5 font-mono text-sm font-bold text-ink">{settings.currency || '$'}</span>
          </Row>
        </Group>

        <Group title="Tu cuenta">
          <Row icon={UserIcon} title="Mi perfil" subtitle="Tus datos, tu QR y tus cupones." to={t('/perfil')} />
          <Row icon={Bell} title="Notificaciones" subtitle="Historial de puntos, cupones y novedades." to={t('/notificaciones')} />
          <Row icon={LogOut} title="Cerrar sesión" onClick={doLogout} />
        </Group>

        {clientApps.length > 1 && (
          <Group title="Tus negocios">
            {clientApps.map((app) => (
              <Row
                key={app.id}
                icon={Building2}
                title={app.business_name}
                subtitle={`/${app.slug}`}
                onClick={app.slug === slug || switchingApp ? undefined : () => changeApp(app.slug)}
              >
                {switchingApp === app.slug ? (
                  <Loader2 className="animate-spin text-ink-muted" size={16} />
                ) : app.slug === slug ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-softer px-2.5 py-1 text-xs font-bold text-primary-strong">
                    <Check size={12} /> Actual
                  </span>
                ) : (
                  <ChevronRight size={17} className="shrink-0 text-ink-muted" />
                )}
              </Row>
            ))}
          </Group>
        )}

        <Group title="Zona de peligro" danger>
          <Row
            icon={Trash2}
            tone="danger"
            title="Eliminar mi cuenta"
            subtitle="Se borran tu perfil, cupones, puntos, compras e historial, y tu cuenta se desvincula de Google. No se puede deshacer."
          >
            <button
              className="shrink-0 rounded-full border border-red-300 px-3.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500/10 dark:border-red-400/40 dark:text-red-400"
              onClick={() => {
                setDeleteConfirm('');
                setDeleteModal(true);
              }}
            >
              Eliminar
            </button>
          </Row>
        </Group>
      </main>

      <Modal open={deleteModal} onClose={() => { if (!deleting) setDeleteModal(false); }} title="Eliminar cuenta">
        <form onSubmit={deleteAccount} className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-muted">
            Esta acción <strong className="text-red-500">borra todo</strong>: tu perfil, cupones, puntos, compras e historial, y{' '}
            <strong className="text-red-500">desvincula tu cuenta de Google</strong>. No se puede deshacer.
          </p>
          <div>
            <label className="label" htmlFor="delete-account-confirm">Escribí ELIMINAR para confirmar</label>
            <input
              id="delete-account-confirm"
              className="input"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="ELIMINAR"
              required
              autoFocus
              disabled={deleting}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={() => setDeleteModal(false)} disabled={deleting}>
              Cancelar
            </button>
            <button type="submit" className="btn-danger" disabled={deleting}>
              {deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={15} />}
              {deleting ? 'Eliminando...' : 'Eliminar mi cuenta'}
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
