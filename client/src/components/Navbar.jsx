import { useEffect, useState } from 'react';
import { LogIn, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationsBell from './NotificationsBell.jsx';
import Logo from './Logo.jsx';
import UserMenu from './UserMenu.jsx';

export default function Navbar() {
  const { settings, toggleTheme } = useTheme();
  const { user } = useAuth();
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
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-ink">
            <Logo />
          </Link>
        </div>

        <nav className="flex items-center gap-1.5">
          {user && <NotificationsBell />}

          <button className="btn-icon" onClick={toggleTheme} aria-label="Cambiar tema">
            <span key={settings.theme} className="animate-pop inline-block">
              {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </span>
          </button>

          {user && <UserMenu />}

          {!user && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}