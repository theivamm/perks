import { useEffect, useState } from 'react';
import {
  ChefHat,
  LogIn,
  LogOut,
  Moon,
  ScrollText,
  ShoppingCart,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ cartCount, onCartOpen }) {
  const { settings, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
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
          ? 'border-line bg-surface/page backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-ink">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
            <ChefHat size={20} />
          </div>
          <span className="hidden sm:block">
            Fidelización <span className="text-primary-strong">App</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <a
            href="#menu"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink sm:inline-flex"
          >
            <ScrollText size={16} />
            Menú
          </a>
          <button className="btn-icon" onClick={toggleTheme} aria-label="Cambiar tema">
            {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user && (
            <Link
              to={user.role === 'admin' ? '/dashboard' : '/perfil'}
              className="inline-flex max-w-40 items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary-strong transition-colors hover:bg-primary-soft/70"
            >
              <UserIcon size={14} />
              <span className="truncate">{user.name}</span>
            </Link>
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
          {user && (
            <button
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
              onClick={logout}
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
          <button
            className="btn-primary relative"
            onClick={onCartOpen}
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Pedido</span>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}