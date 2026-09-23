import { useEffect, useState } from 'react';
import { LogIn, Moon, Search, Sun, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import NotificationsBell from './NotificationsBell.jsx';
import Logo from './Logo.jsx';
import UserMenu from './UserMenu.jsx';

// `search` es opcional: { value, onChange, placeholder }. Solo lo pasan las
// páginas que tienen algo para buscar (hoy, Home con el menú). En escritorio va
// centrado en la barra; en mobile, en una segunda fila fija debajo.
function SearchField({ search, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
      <input
        id="menu-search"
        type="search"
        className="input w-full rounded-full bg-surface-page py-2.5 pl-11 pr-10"
        placeholder={search.placeholder || 'Buscar...'}
        value={search.value}
        onChange={(e) => search.onChange(e.target.value)}
      />
      {search.value && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-muted hover:bg-surface-alt hover:text-ink"
          onClick={() => search.onChange('')}
          aria-label="Limpiar búsqueda"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

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
      className={`sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md transition-shadow ${
        scrolled ? 'shadow-[0_8px_24px_-18px_hsl(var(--ink)/0.35)]' : ''
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={home()} className="flex min-w-0 shrink-0 items-center gap-3">
          <Logo variant="iso" size="md" showText={false} fallback="initials" circle />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-heading text-lg font-bold leading-tight text-ink">
              {settings.businessName || 'Mi negocio'}
            </span>
            {settings.tagline && (
              <span className="truncate text-xs font-medium leading-tight text-ink-muted">{settings.tagline}</span>
            )}
          </span>
        </Link>

        {search && <SearchField search={search} className="mx-auto hidden w-full max-w-md flex-1 lg:block" />}

        <nav className="flex shrink-0 items-center gap-2">
          {user && (
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface [&_.btn-icon]:p-2">
              <NotificationsBell />
            </span>
          )}

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-surface-alt"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            <span key={settings.theme} className="animate-pop inline-flex">
              {settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </span>
          </button>

          {user && <UserMenu />}

          {!user && (
            <Link
              to={t('/login')}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-primary-contrast shadow-glow transition hover:-translate-y-0.5 hover:bg-primary-strong"
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">Iniciar sesión</span>
              <span className="sm:hidden">Ingresar</span>
            </Link>
          )}
        </nav>
      </div>

      {search && (
        <div className="px-4 pb-3 sm:px-6 lg:hidden">
          <SearchField search={search} />
        </div>
      )}
    </header>
  );
}
