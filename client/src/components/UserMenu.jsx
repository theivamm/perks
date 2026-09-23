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
import { useTenant } from '../context/TenantContext.jsx';

export function avatarInitials(u = {}) {
  const parts = [u?.name, u?.last_name].filter((x) => x && String(x).trim());
  const s = parts.map((p) => String(p).trim()[0]).join('').slice(0, 2).toUpperCase();
  return s || '?';
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { t, home } = useTenant();
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

  const onProfile = location.pathname.endsWith('/perfil');
  const isHome = location.pathname === home();

  const items =
    user?.role === 'admin'
      ? [
          ...(!isHome ? [{ label: 'Ir a página de inicio', to: t('/'), icon: Home }] : []),
          { label: 'Ir a dashboard', to: t('/dashboard'), icon: LayoutDashboard },
          { label: 'Escanear QR', to: t('/dashboard/escanear'), icon: ScanLine },
          { label: 'Configuración', to: t('/dashboard/configuracion'), icon: SettingsIcon },
        ]
      : [
          onProfile
            ? { label: 'Ver menú', to: t('/'), icon: UtensilsCrossed }
            : { label: 'Ver mi perfil', to: t('/perfil'), icon: UserIcon },
          { label: 'Ver cupones', to: t('/cupones'), icon: Ticket },
          { label: 'Configuración', to: t('/configuracion'), icon: SettingsIcon },
        ];

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-1 transition-colors hover:bg-surface-alt sm:pr-3"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menú de usuario"
        aria-expanded={open}
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
        <div className="animate-fade-up absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center gap-3 px-4 pb-3 pt-4">
            {user.image ? (
              <img src={user.image} alt={user.name} className="h-11 w-11 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong font-heading text-sm font-bold text-primary-contrast">
                {avatarInitials(user)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-bold text-ink">{[user.name, user.last_name].filter(Boolean).join(' ')}</p>
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
            </div>
          </div>
          {user?.role === 'admin' && (
            <p className="mx-4 mb-2 inline-flex rounded-full bg-primary-softer px-2.5 py-0.5 text-[11px] font-bold text-primary-strong">Administrador</p>
          )}
          <div className="border-t border-line p-2">
            {items.map((item) => (
              <button
                key={item.label}
                className="group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-alt"
                onClick={go(item.to)}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-alt text-ink-muted transition-colors group-hover:bg-primary-softer group-hover:text-primary-strong">
                  <item.icon size={15} />
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-line p-2">
            <button
              className="flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
              onClick={async () => {
                setOpen(false);
                await logout();
                navigate(home());
              }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <LogOut size={15} />
              </span>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function UserLinksRow() {
  const { user } = useAuth();
  const { t } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  const onProfile = location.pathname.endsWith('/perfil');
  if (user?.role === 'admin') return null;
  const links = [
    onProfile ? { label: 'Ver menú', to: t('/'), icon: UtensilsCrossed } : { label: 'Ver mi perfil', to: t('/perfil'), icon: UserIcon },
    { label: 'Ver cupones', to: t('/cupones'), icon: Ticket },
    { label: 'Configuración', to: t('/configuracion'), icon: SettingsIcon },
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