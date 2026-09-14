import { useEffect, useRef, useState } from 'react';
import {
  ChefHat,
  ChevronDown,
  LogIn,
  LogOut,
  Moon,
  ScrollText,
  Settings as SettingsIcon,
  ShoppingCart,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationsBell from './NotificationsBell.jsx';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

export default function Navbar({ cartCount, onCartOpen }) {
  const { settings, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const go = (path) => () => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all ${
        scrolled
          ? 'border-line bg-surface/page backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-ink">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
              <ChefHat size={20} />
            </div>
            <span className="hidden sm:block">
              Fidelización <span className="text-primary-strong">App</span>
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-1.5">
          <button className="btn-icon" onClick={toggleTheme} aria-label="Cambiar tema">
            <span key={settings.theme} className="animate-pop inline-block">
              {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </span>
          </button>
          <a
            href="#menu"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink sm:inline-flex"
          >
            <ScrollText size={16} />
            Menú
          </a>

          {user && (
            <>
              <NotificationsBell />
              <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-2 rounded-full border border-line bg-surface px-2 py-1.5 transition-colors hover:bg-surface-alt"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menú de usuario"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-xs font-extrabold text-primary-contrast">
                    {initials(user.name)}
                  </div>
                )}
                <span className="hidden max-w-32 truncate text-sm font-bold text-ink sm:block">
                  {user.name}
                </span>
                <ChevronDown
                  size={14}
                  className={`hidden text-ink-muted transition-transform sm:block ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {menuOpen && (
                <div className="animate-fade-up absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-extrabold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-ink-muted">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
                      onClick={go('/perfil')}
                    >
                      <UserIcon size={15} />
                      Mi perfil
                    </button>
                    {user.role === 'admin' && (
                      <button
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
                        onClick={go('/dashboard')}
                      >
                        <SettingsIcon size={15} />
                        Configuración
                      </button>
                    )}
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={15} />
                      Salir
                    </button>
                  </div>
                </div>
              )}
              </div>
            </>
          )}

          {!user && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Link>
          )}

          <button
            className="btn-primary relative"
            onClick={onCartOpen}
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Pedido</span>
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="animate-pop absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white"
              >
                {cartCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}