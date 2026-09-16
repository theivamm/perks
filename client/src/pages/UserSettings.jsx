import { Link } from 'react-router-dom';
import {
  Bell,
  KeyRound,
  Moon,
  Palette,
  RotateCcw,
  Settings as SettingsIcon,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function UserSettings() {
  const { settings, toggleTheme } = useTheme();
  const dark = settings.theme === 'dark';

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
              Elegí cómo se ve la app y accedé a tus opciones de cuenta.
            </p>
          </div>
        </section>

        <section className="mt-6 space-y-5">
          <div className="tile tile-mint relative overflow-hidden p-6">
            <div className="orb -right-10 -top-14 h-36 w-36 bg-white/50" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-emerald-700 shadow-sm dark:bg-white/12 dark:text-emerald-200">
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
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-violet-700 shadow-sm dark:bg-white/12 dark:text-violet-200">
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
              <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-ink-muted dark:bg-white/10">
                La moneda la define el local en su configuración del dashboard.
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-extrabold text-ink">Mi cuenta</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <Link
                to="/perfil"
                className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-surface-alt"
              >
                <UserIcon size={16} className="text-primary-strong" />
                Mi perfil
              </Link>
              <Link
                to="/notificaciones"
                className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-surface-alt"
              >
                <Bell size={16} className="text-primary-strong" />
                Notificaciones
              </Link>
              <Link
                to="/perfil"
                className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-surface-alt"
              >
                <KeyRound size={16} className="text-primary-strong" />
                Contraseña
              </Link>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-extrabold text-ink">
                  <KeyRound size={18} className="text-primary-strong" />
                  Seguridad
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Cambiá tu contraseña o gestioná los datos de tu cuenta desde tu perfil.
                </p>
              </div>
              <Link to="/perfil" className="btn-primary text-sm">
                <RotateCcw size={15} />
                Administrar cuenta
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}