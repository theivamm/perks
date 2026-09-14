import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const NAV = [
  { to: '/dashboard/menu', label: 'Menú', icon: UtensilsCrossed },
  { to: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { to: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/dashboard/configuracion', label: 'Configuración', icon: SettingsIcon },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { settings, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = () => {
    logout();
    navigate('/login');
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

        <div className="border-t border-line pt-3">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary-strong">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold text-ink">{user?.name}</p>
              <p className="truncate text-xs text-ink-muted">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1 !py-2" onClick={toggleTheme}>
              {settings.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              {settings.theme === 'dark' ? 'Claro' : 'Oscuro'}
            </button>
            <button className="btn-danger flex-1 !py-2" onClick={doLogout}>
              <LogOut size={15} />
              Salir
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface/page px-5 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button className="btn-icon lg:hidden" onClick={() => setOpen(true)}>
              <MenuIcon size={20} />
            </button>
            <ChevronLeft size={16} className="hidden text-ink-muted lg:block" />
            <span className="text-sm font-semibold text-ink-muted">
              Panel de administración
            </span>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}