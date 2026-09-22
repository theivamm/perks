import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import WintuuLogo from './WintuuLogo.jsx';

const NAV_ITEMS = [
  ['#producto', 'Producto'],
  ['#como-funciona', 'Cómo funciona'],
  ['#planes', 'Planes'],
  ['#faqs', 'FAQs'],
];

function initials(name = '') {
  return String(name).trim().charAt(0).toUpperCase() || '?';
}

function AccountMenu({ user }) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const doLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-[var(--wt-border)] bg-white px-3 py-1.5 text-sm font-bold text-[var(--wt-text)] transition hover:bg-black/[0.03]"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menú de cuenta"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--wt-mint)] text-xs font-extrabold text-[var(--wt-ink)]">
          {initials(user.name)}
        </span>
        <span className="max-w-32 truncate">{user.name}</span>
        <ChevronDown size={14} className={`text-[var(--wt-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="wt-glass absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden !rounded-2xl p-1.5">
          <div className="border-b border-[var(--wt-border)] px-3 py-2.5">
            <p className="truncate text-sm font-extrabold text-[var(--wt-text)]">{user.name}</p>
            <p className="truncate text-xs text-[var(--wt-muted)]">{user.email}</p>
          </div>
          <Link
            to="/ingresar"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--wt-text)] transition-colors hover:bg-black/[0.04]"
          >
            <User size={15} className="shrink-0 text-[var(--wt-muted)]" />
            Mis apps
          </Link>
          <button
            type="button"
            onClick={doLogout}
            className="mt-0.5 flex w-full items-center gap-2 rounded-xl border-t border-[var(--wt-border)] px-3 py-2 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
          >
            <LogOut size={15} />
            Salir
          </button>
        </div>
      )}
    </div>
  );
}

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const menuBtnRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="wt-navbar">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:h-[72px] sm:px-8 lg:px-12">
        <a href="#inicio" className="flex shrink-0 items-center" aria-label="Wintuu, inicio">
          <WintuuLogo height={22} />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
          {NAV_ITEMS.map(([href, label]) => (
            <a key={href} href={href} className="wt-nav-link">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {user ? (
            <AccountMenu user={user} />
          ) : (
            <Link to="/ingresar" className="wt-nav-link">
              Ingresar
            </Link>
          )}
          <Link to="/checkout" className="wt-btn-mint-sm">
            Quiero mi app
          </Link>
        </div>

        <button
          ref={menuBtnRef}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--wt-ink)] lg:hidden"
          aria-expanded={open}
          aria-controls="wt-mobile-menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div id="wt-mobile-menu" className="border-t border-[var(--wt-border)] bg-[var(--wt-bg)] px-4 py-5 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={close}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--wt-text)]/80 transition hover:bg-black/[0.03]"
              >
                {label}
              </a>
            ))}
            <div className="my-1 h-px bg-[var(--wt-border)]" />
            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--wt-mint)] text-xs font-extrabold text-[var(--wt-ink)]">
                    {initials(user.name)}
                  </span>
                  <span className="truncate text-[15px] font-semibold text-[var(--wt-text)]">{user.name}</span>
                </div>
                <Link
                  to="/ingresar"
                  onClick={close}
                  className="rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--wt-text)]/80 transition hover:bg-black/[0.03]"
                >
                  Mis apps
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    close();
                    await logout();
                  }}
                  className="rounded-xl px-3 py-3 text-left text-[15px] font-medium text-red-500 transition hover:bg-red-500/10"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/ingresar"
                onClick={close}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--wt-text)]/80 transition hover:bg-black/[0.03]"
              >
                Ingresar
              </Link>
            )}
            <Link to="/checkout" onClick={close} className="wt-btn-mint-sm mt-2 justify-center">
              Quiero mi app
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
