import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BadgePercent,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Moon,
  ScanLine,
  Settings as SettingsIcon,
  Sun,
  User as UserIcon,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import NotificationsBell from '../../components/NotificationsBell.jsx';

const NAV = [
  { to: '/dashboard/menu', label: 'Menú', icon: UtensilsCrossed },
  { to: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { to: '/dashboard/escanear', label: 'Escanear QR', icon: ScanLine },
  { to: '/dashboard/cupones', label: 'Cupones', icon: BadgePercent },
  { to: '/dashboard/configuracion', label: 'Configuración', icon: SettingsIcon },
];

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { settings, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const doLogout = () => {
    logout();
    navigate('/login');
  };

  const go = (path) => () => {
    setMenuOpen(false);
    navigate(path);
  };

  const link = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
          isActive
            ? 'bg-primary text-primary-contrast shadow-md'
            : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
        }`
      }
    >
      <item.icon size={18} />
      {item.label}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-surface-page">
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface p-4 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast">
              <LayoutDashboard size={18} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold text-ink">Dashboard</p>
              <p className="text-xs text-ink-muted">Fidelización App</p>
            </div>
          </div>
          <button className="btn-icon lg:hidden" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {NAV.map(link)}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
          >
            <ExternalLink size={18} />
            Ver página pública
          </a>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/page px-5 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button className="btn-icon lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
              <MenuIcon size={20} />
            </button>
            <button className="btn-icon" onClick={toggleTheme} aria-label="Cambiar tema">
              {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <ChevronLeft size={16} className="hidden text-ink-muted lg:block" />
            <span className="hidden text-sm font-semibold text-ink-muted sm:block">
              Panel de administración
            </span>
          </div>

          <div className="flex items-center gap-1.5">
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
              <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
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
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
                    onClick={go('/dashboard/configuracion')}
                  >
                    <SettingsIcon size={15} />
                    Configuración
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                    onClick={doLogout}
                  >
                    <LogOut size={15} />
                    Salir
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}