import { useEffect, useState } from 'react';
import { LogIn, Moon, Search, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import NotificationsBell from './NotificationsBell.jsx';
import Logo from './Logo.jsx';
import UserMenu from './UserMenu.jsx';

// `search` es opcional: { value, onChange, placeholder }. Solo lo pasan las
// páginas que tienen algo para buscar (hoy, Home con el menú); el resto del
// navbar es igual en todas las páginas que usan este componente.
export default function Navbar({ search }) {
  const { settings, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { t, home } = useTenant();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all ${
        scrolled
          ? 'border-line bg-surface-page backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to={home()} className="flex min-w-0 shrink-0 items-center gap-3">
          <Logo variant="iso" size="lg" showText={false} fallback="initials" circle />
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate font-extrabold leading-tight text-ink">
              {settings.businessName || 'Mi negocio'}
            </span>
            {settings.tagline && (
              <span className="truncate text-xs font-medium leading-tight text-ink-muted">{settings.tagline}</span>
            )}
          </span>
        </Link>

        {search && (
          <div className="relative mx-auto hidden w-full max-w-md flex-1 lg:block">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              className="input w-full rounded-full border-transparent bg-surface-alt py-2.5 pl-11 pr-4"
              placeholder={search.placeholder || 'Buscar...'}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
            />
          </div>
        )}

        <nav className="flex shrink-0 items-center gap-1.5">
          {user && <NotificationsBell />}

          <button className="btn-icon" onClick={toggleTheme} aria-label="Cambiar tema">
            <span key={settings.theme} className="animate-pop inline-block">
              {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </span>
          </button>

          {user && <UserMenu />}

          {!user && (
            <Link
              to={t('/login')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
            >
              <LogIn size={15} />
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}