import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  Camera,
  Check,
  Loader2,
  Moon,
  Palette,
  Settings as SettingsIcon,
  Sun,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import { Modal, toast } from '../components/ui.jsx';
import ImageCropper from '../components/ImageCropper.jsx';
import { avatarInitials } from '../components/UserMenu.jsx';
import Navbar from '../components/Navbar.jsx';

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

  return (
    <div className="page-aurora min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 pt-10 pb-16">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-strong to-primary-soft p-8 text-primary-contrast shadow-glow sm:p-10">
          <div className="orb -right-16 -top-16 h-64 w-64 bg-primary-contrast/15" />
          <div className="orb -bottom-24 right-40 h-52 w-52 bg-primary-contrast/12" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-contrast/15 px-3 py-1 text-xs font-bold tracking-wide uppercase">
              <SettingsIcon size={14} />
              Configuración
            </span>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Personalizá tu experiencia</h1>
            <p className="mt-2 max-w-lg text-sm text-primary-contrast/85 sm:text-base">
              Tu foto, tu tema y la gestión de tu cuenta, todo en un solo lugar.
            </p>
          </div>
        </section>

        <section className="mt-6 space-y-5">
          {clientApps.length > 1 && (
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-softer text-primary-strong"><Building2 size={22} /></span>
                <div>
                  <h2 className="font-extrabold text-ink">Cambiar de negocio</h2>
                  <p className="text-sm text-ink-muted">Elegí en qué app querés consultar tus puntos y beneficios.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {clientApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => changeApp(app.slug)}
                    disabled={Boolean(switchingApp)}
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${app.slug === slug ? 'border-primary bg-primary-softer' : 'border-line bg-surface hover:border-primary/50'}`}
                  >
                    <span><span className="block font-bold text-ink">{app.business_name}</span><span className="block text-xs text-ink-muted">/{app.slug}</span></span>
                    {switchingApp === app.slug ? <Loader2 className="animate-spin" size={16} /> : app.slug === slug ? <Check size={16} className="text-primary" /> : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="tile tile-sky relative overflow-hidden p-6">
            <div className="orb -right-10 -top-14 h-36 w-36 bg-white/50" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || 'Foto de perfil'} className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-xl font-extrabold text-primary-contrast shadow-sm">
                      {avatarInitials(user)}
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
                <div>
                  <h2 className="font-extrabold text-ink">Foto de perfil</h2>
                  <p className="text-sm text-ink-muted">Subí o cambiá tu foto para que te reconozcan en el local.</p>
                </div>
              </div>
              <button className="btn-ghost text-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin" size={15} /> : <Camera size={15} />}
                {uploading ? 'Subiendo...' : 'Cambiar foto'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            </div>
          </div>

          <div className="tile tile-mint relative overflow-hidden p-6">
            <div className="orb -right-10 -top-14 h-36 w-36 bg-white/50" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-emerald-700 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-300">
                  {dark ? <Moon size={22} /> : <Sun size={22} />}
                </span>
                <div>
                  <h2 className="font-extrabold text-ink">Tema</h2>
                  <p className="text-sm text-ink-muted">
                    Modo {dark ? 'oscuro' : 'claro'} activado.
                  </p>
                </div>
              </div>
              <button
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  dark ? 'bg-primary-strong' : 'bg-surface-alt'
                }`}
                onClick={toggleTheme}
                aria-label="Alternar tema"
              >
                <span
                  className={`relative inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    dark ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="tile tile-lilac relative overflow-hidden p-6">
            <div className="orb -right-10 -top-14 h-36 w-36 bg-white/50" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-violet-700 shadow-sm dark:bg-violet-500/15 dark:text-violet-300">
                  <Palette size={22} />
                </span>
                <div>
                  <h2 className="font-extrabold text-ink">Moneda del local</h2>
                  <p className="text-sm text-ink-muted">
                    Los premios se muestran en{' '}
                    <span className="font-black text-ink">{settings.currency || '$'}</span>.
                  </p>
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-ink-muted dark:bg-violet-500/15 dark:text-violet-200">
                La moneda la define el local en su configuración del dashboard.
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-extrabold text-ink">Accesos rápidos</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                to={t('/perfil')}
                className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-surface-alt"
              >
                <UserIcon size={16} className="text-primary-strong" />
                Mi perfil
              </Link>
              <Link
                to={t('/notificaciones')}
                className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-surface-alt"
              >
                <Bell size={16} className="text-primary-strong" />
                Notificaciones
              </Link>
            </div>
          </div>

          <div className="tile tile-rose relative overflow-hidden p-6">
            <div className="orb -right-10 -top-14 h-36 w-36 bg-white/50" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-extrabold text-rose-700 dark:text-rose-200">
                  <Trash2 size={18} />
                  Eliminar mi cuenta
                </h2>
                <p className="mt-1 max-w-md text-sm text-ink-muted">
                  Se borran tu perfil, cupones, puntos, compras e historial, y tu cuenta se desvincula de Google. No se puede deshacer.
                </p>
              </div>
              <button className="btn-danger text-sm" onClick={() => { setDeleteConfirm(''); setDeleteModal(true); }}>
                <Trash2 size={15} />
                Eliminar cuenta
              </button>
            </div>
          </div>
        </section>
      </main>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Eliminar cuenta">
        <form onSubmit={deleteAccount} className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-muted">
            Esta acción <strong className="text-red-500">borra todo</strong>: tu perfil, cupones, puntos, compras e
            historial, y <strong className="text-red-500">desvincula tu cuenta de Google</strong>. No se puede deshacer.
          </p>
          <div>
            <label className="label">Escribí ELIMINAR para confirmar</label>
            <input
              className="input"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="ELIMINAR"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-ghost" onClick={() => setDeleteModal(false)}>
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
