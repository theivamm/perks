import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BadgePercent,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Home,
  LogOut,
  Menu as MenuIcon,
  Moon,
  ScanLine,
  Settings as SettingsIcon,
  Sun,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import NotificationsBell from '../../components/NotificationsBell.jsx';
import Logo from '../../components/Logo.jsx';

const NAV = [
  { to: '/dashboard/menu', label: 'Menú', icon: UtensilsCrossed },
  { to: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { to: '/dashboard/cupones', label: 'Cupones', icon: BadgePercent },
];

const FAB_ITEMS = [
  { to: '/dashboard/menu', label: 'Menú', icon: UtensilsCrossed },
  { to: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { to: '/dashboard/cupones', label: 'Cupones', icon: BadgePercent },
  { to: '/dashboard/configuracion', label: 'Configuración', icon: SettingsIcon },
  { to: '/', label: 'Página pública', icon: ExternalLink },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === '1');
  const menuRef = useRef(null);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  };

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
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
          collapsed ? 'justify-center' : 'w-full'
        } ${
          isActive
            ? 'bg-gradient-to-r from-primary to-primary-strong text-primary-contrast shadow-glow'
            : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
        }`
      }
    >
      <item.icon
        size={collapsed ? 23 : 20}
        strokeWidth={2.4}
        className="shrink-0 transition-all duration-300 group-hover:animate-icon-wiggle group-hover:drop-shadow-[0_0_10px_hsl(var(--primary)/0.55)]"
      />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );

  return (
    <div className="page-aurora flex min-h-screen">
      <aside
        className={`hidden w-64 flex-col border-r border-line bg-surface p-4 transition-all duration-300 lg:sticky lg:top-0 lg:flex lg:h-screen ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-64'
        }`}
      >
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute -right-3.5 top-6 z-40 hidden h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-ink-muted shadow-md transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-contrast lg:flex"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>

        <div className={`mb-6 flex items-center justify-between ${collapsed ? 'lg:justify-center' : ''}`}>
          <Logo size={collapsed ? 'sm' : 'md'} showText={false} />
        </div>

        <nav className={`flex flex-1 flex-col gap-1.5 ${collapsed ? 'lg:items-center' : ''}`}>
          {NAV.map(link)}
        </nav>

        <div className={`mt-4 flex flex-col gap-2 border-t border-line pt-4 ${collapsed ? 'lg:items-center' : ''}`}>
          <NavLink
            to="/dashboard/configuracion"
            title={collapsed ? 'Configuración' : undefined}
            aria-label="Configuración"
            className={({ isActive }) =>
              `group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary-strong text-primary-contrast shadow-glow'
                  : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
              }`
            }
          >
            <SettingsIcon
              size={23}
              strokeWidth={2.4}
              className="shrink-0 transition-all duration-300 group-hover:animate-icon-wiggle"
            />
            {!collapsed && <span>Configuración</span>}
          </NavLink>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            title={collapsed ? 'Ver página de inicio' : undefined}
            aria-label="Ver página de inicio"
            className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-ink-muted transition-all duration-300 hover:bg-surface-alt hover:text-ink ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <ExternalLink
              size={23}
              strokeWidth={2.4}
              className="shrink-0 transition-all duration-300 group-hover:animate-icon-wiggle"
            />
            {!collapsed && <span>Ver página de inicio</span>}
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/page px-5 py-3 backdrop-blur-md">
          <Link
            to="/dashboard"
            aria-label="Ir al inicio del panel"
            className="lg:hidden"
          >
            <Logo size="sm" showText={false} />
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <NotificationsBell />
            <button className="btn-icon" onClick={toggleTheme} aria-label="Cambiar tema">
              {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
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
                      onClick={go('/')}
                    >
                      <Home size={15} />
                      Ir a página de inicio
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
                      onClick={go('/dashboard/escanear')}
                    >
                      <ScanLine size={15} />
                      Escanear QR
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

        <main className="flex-1 p-5 pb-24 lg:p-6 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <NavLink
        to="/dashboard/escanear"
        aria-label="Escanear QR"
        className="fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow transition-transform hover:scale-105 active:scale-95 lg:hidden"
      >
        <ScanLine size={26} />
      </NavLink>

      {fabOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setFabOpen(false)} />
      )}

      <div className="pointer-events-none fixed bottom-5 left-5 z-50 flex flex-col items-start lg:hidden">
        <div className={`flex flex-col-reverse items-start gap-2.5 ${fabOpen ? 'pointer-events-auto' : ''}`}>
          {FAB_ITEMS.map((item, i) => (
            <button
              key={item.to}
              className={`flex items-center gap-2.5 rounded-2xl border border-line bg-surface py-2 pl-2 pr-4 shadow-lg transition-all duration-300 ${
                fabOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
              }`}
              style={{ transitionDelay: fabOpen ? `${i * 45}ms` : '0ms' }}
              onClick={() => {
                setFabOpen(false);
                navigate(item.to);
              }}
              aria-label={item.label}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-softer text-primary-strong">
                <item.icon size={18} />
              </span>
              <span className="text-sm font-bold text-ink">{item.label}</span>
            </button>
          ))}
        </div>

        <button
          className="pointer-events-auto relative mt-2.5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow transition-transform hover:scale-105 active:scale-95"
          onClick={() => setFabOpen((v) => !v)}
          aria-label={fabOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span key={fabOpen} className="animate-pop inline-flex">
            {fabOpen ? <X size={26} /> : <MenuIcon size={26} />}
          </span>
        </button>
      </div>
    </div>
  );
}