import { Coffee, QrCode, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Navbar from '../components/Navbar.jsx';
import PublicMenu from '../components/PublicMenu.jsx';

export default function Home() {
  const { user, isAuthed } = useAuth();
  const { settings } = useTheme();

  return (
    <div className="min-h-screen bg-surface-page">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-12 pb-16">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-strong to-primary-soft p-8 text-primary-contrast shadow-glow sm:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-contrast/10" />
          <div className="absolute -bottom-14 right-24 h-40 w-40 rounded-full bg-primary-contrast/10" />
          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-contrast/15 px-3 py-1 text-xs font-bold tracking-wide uppercase">
              <Sparkles size={14} />
              Programa de fidelización
            </span>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
              Sumá compras, ganá premios
            </h1>
            <p className="mt-3 text-sm text-primary-contrast/85 sm:text-base">
              Mostrá tu código QR al pagar y cada compra te acerca a nuevos descuentos y regalos.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-3">
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
              <QrCode size={22} />
            </div>
            <h2 className="mt-3 font-extrabold text-ink">Tu código QR</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Un código único que te identifica al pagar en el local.
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
              <Coffee size={22} />
            </div>
            <h2 className="mt-3 font-extrabold text-ink">Cada compra suma</h2>
            <p className="mt-1 text-sm text-ink-muted">
              El local registra tus compras y vos acumulás progreso automáticamente.
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
              <Sparkles size={22} />
            </div>
            <h2 className="mt-3 font-extrabold text-ink">Premios al alcanzar</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Cada X compras ganás un cupón. Los premios los configura el local.
            </p>
          </div>
        </section>

        <PublicMenu />

        <section className="mt-12 text-center">
          {isAuthed ? (
            <Link
              to={user?.role === 'admin' ? '/dashboard' : '/perfil'}
              className="btn-primary text-base"
            >
              {user?.role === 'admin' ? 'Ir al panel' : <QrCode size={18} className="inline-block" />}
              {user?.role === 'admin' ? '' : ' Ver mi QR y cupones'}
            </Link>
          ) : (
            <Link to="/registro" className="btn-primary text-base">
              <QrCode size={18} />
              Creá tu cuenta y empezá a sumar
            </Link>
          )}
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-sm text-ink-muted">
        © {new Date().getFullYear()} Fidelización App · {settings.currency || '$'} moneda configurable desde el panel
      </footer>
    </div>
  );
}