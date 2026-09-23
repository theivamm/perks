import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgePercent,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Home,
  LifeBuoy,
  LogOut,
  Moon,
  MoreHorizontal,
  Rocket,
  ScanLine,
  Settings as SettingsIcon,
  Sun,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import NotificationsBell from '../../components/NotificationsBell.jsx';
import Logo from '../../components/Logo.jsx';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

const TITLES = [
  ['/dashboard/menu', 'Menú'],
  ['/dashboard/clientes', 'Clientes'],
  ['/dashboard/cliente', 'Clientes'],
  ['/dashboard/cupones', 'Cupones'],
  ['/dashboard/soporte', 'Soporte'],
  ['/dashboard/configuracion', 'Configuración'],
  ['/dashboard/escanear', 'Escanear QR'],
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { settings, toggleTheme } = useTheme();
  const { t, home } = useTenant();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === '1');
  const menuRef = useRef(null);

  const NAV = [
    { to: t('/dashboard/menu'), label: 'Menú', icon: UtensilsCrossed },
    { to: t('/dashboard/clientes'), label: 'Clientes', icon: Users },
    { to: t('/dashboard/cupones'), label: 'Cupones', icon: BadgePercent },
    { to: t('/dashboard/soporte'), label: 'Soporte', icon: LifeBuoy },
  ];

  const MORE_ITEMS = [
    { to: t('/dashboard/soporte'), label: 'Soporte', icon: LifeBuoy },
    { to: t('/dashboard/configuracion'), label: 'Configuración', icon: SettingsIcon },
    { to: home(), label: 'Ver página de inicio', icon: ExternalLink, external: true },
  ];

  const pageTitle = TITLES.find(([p]) => pathname.includes(p))?.[1] || 'Panel';

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

  useEffect(() => setMoreOpen(false), [pathname]);

  const doLogout = () => {
    logout();
    navigate(t('/login'));
  };

  const go = (path) => () => {
    setMenuOpen(false);
    navigate(path);
  };

  const itemClass = (isActive) =>
    `group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
      collapsed ? 'justify-center' : 'w-full'
    } ${
      isActive
        ? 'bg-gradient-to-r from-primary to-primary-strong text-primary-contrast shadow-glow'
        : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
    }`;

  const link = (item) => (
    <NavLink key={item.to} to={item.to} title={collapsed ? item.label : undefined} className={({ isActive }) => itemClass(isActive)}>
      <item.icon
        size={collapsed ? 22 : 20}
        strokeWidth={2.4}
        className="shrink-0 transition-all duration-300 group-hover:animate-icon-wiggle"
      />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );

  return (
    <div className="page-aurora flex min-h-screen">
      {/* Sidebar escritorio */}
      <aside
        className={`hidden flex-col border-r border-line bg-surface p-4 transition-all duration-300 lg:sticky lg:top-0 lg:flex lg:h-screen ${
          collapsed ? 'lg:w-[78px]' : 'lg:w-[248px]'
        }`}
      >
        <div className={`mb-6 ${collapsed ? 'flex items-center justify-center' : ''}`}>
          <Logo
            size={collapsed ? 'sm' : 'md'}
            variant={collapsed ? 'iso' : 'logo'}
            fullWidth={!collapsed}
            className={collapsed ? '' : 'w-full justify-center'}
            showText={false}
          />
        </div>

        <nav className={`flex flex-1 flex-col gap-1 ${collapsed ? 'lg:items-center' : ''}`}>{NAV.map(link)}</nav>

        <div className={`mt-4 flex flex-col gap-1 border-t border-line pt-3 ${collapsed ? 'lg:items-center' : ''}`}>
          {link({ to: t('/dashboard/configuracion'), label: 'Configuración', icon: SettingsIcon })}
          <a
            href={home()}
            target="_blank"
            rel="noreferrer"
            title={collapsed ? 'Ver página de inicio' : undefined}
            aria-label="Ver página de inicio"
            className={itemClass(false)}
          >
            <ExternalLink size={collapsed ? 22 : 20} strokeWidth={2.4} className="shrink-0" />
            {!collapsed && <span>Ver página de inicio</span>}
          </a>
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={itemClass(false)}
          >
            {collapsed ? (
              <ChevronsRight size={22} strokeWidth={2.4} className="shrink-0" />
            ) : (
              <ChevronsLeft size={20} strokeWidth={2.4} className="shrink-0" />
            )}
            {!collapsed && <span>Colapsar menú</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur-md sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={t('/dashboard')} aria-label="Ir al inicio del panel" className="lg:hidden">
              <Logo size="sm" variant="iso" showText={false} />
            </Link>
            <p className="hidden truncate text-sm text-ink-muted sm:block">
              {settings.businessName || 'Mi negocio'}
              <span className="mx-2">/</span>
              <span className="font-bold text-ink">{pageTitle}</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <NavLink
              to={t('/dashboard/escanear')}
              className="mr-1 hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-contrast shadow-glow transition hover:-translate-y-0.5 hover:bg-primary-strong lg:inline-flex"
            >
              <ScanLine size={16} />
              Escanear QR
            </NavLink>
            <NotificationsBell />
            <button className="btn-icon" onClick={toggleTheme} aria-label="Cambiar tema">
              {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-2 rounded-full border border-line bg-surface px-1.5 py-1.5 transition-colors hover:bg-surface-alt sm:pr-3"
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
                <span className="hidden max-w-32 truncate text-sm font-bold text-ink sm:block">{user.name}</span>
                <ChevronDown size={14} className={`hidden text-ink-muted transition-transform sm:block ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-extrabold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-ink-muted">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt" onClick={go(t('/'))}>
                      <Home size={15} />
                      Ir a página de inicio
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt" onClick={go(t('/dashboard/escanear'))}>
                      <ScanLine size={15} />
                      Escanear QR
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-alt" onClick={go(t('/dashboard/configuracion'))}>
                      <SettingsIcon size={15} />
                      Configuración
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10" onClick={doLogout}>
                      <LogOut size={15} />
                      Salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 sm:px-7 lg:pb-10 lg:pt-7">
          {settings.setupCompleted !== 'true' && (
            <Link
              to={t('/primeros-pasos')}
              className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary-softer px-4 py-3 transition-colors hover:border-primary/60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast">
                <Rocket size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-ink">Terminá de configurar tu app</span>
                <span className="block text-xs text-ink-muted">Completá los primeros pasos para dejar tu negocio listo.</span>
              </span>
              <span className="badge">Continuar</span>
            </Link>
          )}
          <Outlet />
        </main>
      </div>

      {/* Mobile: barra inferior (reemplaza los 2 botones flotantes) */}
      {moreOpen && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMoreOpen(false)} />}
      <div
        className={`fixed inset-x-3 bottom-[92px] z-50 space-y-1 rounded-3xl border border-line bg-surface p-2 shadow-2xl transition-all duration-300 lg:hidden ${
          moreOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        {MORE_ITEMS.map((item) =>
          item.external ? (
            <a key={item.label} href={item.to} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-ink hover:bg-surface-alt">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-softer text-primary-strong"><item.icon size={18} /></span>
              {item.label}
            </a>
          ) : (
            <NavLink key={item.label} to={item.to} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-ink hover:bg-surface-alt">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-softer text-primary-strong"><item.icon size={18} /></span>
              {item.label}
            </NavLink>
          )
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 items-end border-t border-line bg-surface/95 px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 backdrop-blur-md lg:hidden">
        {[NAV[0], NAV[1]].map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-1 py-1 text-[11px] font-bold ${isActive ? 'text-primary-strong' : 'text-ink-muted'}`}>
            <item.icon size={21} strokeWidth={2.3} />
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to={t('/dashboard/escanear')}
          aria-label="Escanear QR"
          className="mx-auto -mt-7 flex h-16 w-16 items-center justify-center rounded-full border-4 border-surface-page bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow transition-transform active:scale-95"
        >
          <ScanLine size={26} />
        </NavLink>
        <NavLink to={NAV[2].to} className={({ isActive }) => `flex flex-col items-center gap-1 py-1 text-[11px] font-bold ${isActive ? 'text-primary-strong' : 'text-ink-muted'}`}>
          <BadgePercent size={21} strokeWidth={2.3} />
          Cupones
        </NavLink>
        <button onClick={() => setMoreOpen((v) => !v)} className={`flex flex-col items-center gap-1 py-1 text-[11px] font-bold ${moreOpen ? 'text-primary-strong' : 'text-ink-muted'}`} aria-label={moreOpen ? 'Cerrar' : 'Más opciones'}>
          {moreOpen ? <X size={21} /> : <MoreHorizontal size={21} />}
          Más
        </button>
      </nav>
    </div>
  );
}
