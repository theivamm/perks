import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  ScanLine,
  Settings as SettingsIcon,
  Ticket,
  User as UserIcon,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function avatarInitials(u = {}) {
  const parts = [u?.name, u?.last_name].filter((x) => x && String(x).trim());
  const s = parts.map((p) => String(p).trim()[0]).join('').slice(0, 2).toUpperCase();
  return s || '?';
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (to) => () => {
    setOpen(false);
    navigate(to);
  };

  const onProfile = location.pathname === '/perfil';

  const items =
    user?.role === 'admin'
      ? [
          { label: 'Ir a página de inicio', to: '/', icon: Home },
          { label: 'Ir a dashboard', to: '/dashboard', icon: LayoutDashboard },
          { label: 'Escanear QR', to: '/dashboard/escanear', icon: ScanLine },
          { label: 'Configuración', to: '/dashboard/configuracion', icon: SettingsIcon },
        ]
      : [
          onProfile
            ? { label: 'Ver menú', to: '/', icon: UtensilsCrossed }
            : { label: 'Ver mi perfil', to: '/perfil', icon: UserIcon },
          { label: 'Ver cupones', to: '/cupones', icon: Ticket },
          { label: 'Configuración', to: '/configuracion', icon: SettingsIcon },
        ];

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 rounded-full border border-line bg-surface px-2 py-1.5 transition-colors hover:bg-surface-alt"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menú de usuario"
      >
        {user.image ? (
          <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-xs font-extrabold text-primary-contrast">
            {avatarInitials(user)}
          </div>
        )}
        <span className="hidden max-w-32 truncate text-sm font-bold text-ink sm:block">{user.name}</span>
        <ChevronDown
          size={14}
          className={`hidden text-ink-muted transition-transform sm:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="animate-fade-up absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-extrabold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
          <div className="p-1.5">
            {items.map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
                onClick={go(item.to)}
              >
                <item.icon size={15} className="shrink-0 text-ink-muted" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
            <button
              className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-line px-3 py-2 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
              onClick={async () => {
                setOpen(false);
                await logout();
                navigate('/');
              }}
            >
              <LogOut size={15} />
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function UserLinksRow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onProfile = location.pathname === '/perfil';
  if (user?.role === 'admin') return null;
  const links = [
    onProfile ? { label: 'Ver menú', to: '/', icon: UtensilsCrossed } : { label: 'Ver mi perfil', to: '/perfil', icon: UserIcon },
    { label: 'Ver cupones', to: '/cupones', icon: Ticket },
    { label: 'Configuración', to: '/configuracion', icon: SettingsIcon },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <button
          key={l.label}
          onClick={() => navigate(l.to)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:bg-surface-alt"
        >
          <l.icon size={15} className="text-primary-strong" />
          {l.label}
        </button>
      ))}
    </div>
  );
}