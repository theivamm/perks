import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Grip, LayoutGrid, LogOut, X, LogIn } from 'lucide-react';
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

// Se porta al contenedor .wintuu-landing (no a document.body) con posición
// fixed calculada desde el botón: así nunca queda recortado por overflow o
// stacking-context de secciones de la landing (blobs, parallax del hero...),
// pero sigue teniendo acceso a las variables CSS del tema (--wt-mint, etc.),
// que solo están definidas dentro de .wintuu-landing.
function AccountDropdown({ user, anchorRect, onClose }) {
  const { logout } = useAuth();
  const panelRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const doLogout = async () => {
    onClose();
    await logout();
  };

  const style = {
    position: 'fixed',
    top: anchorRect.bottom + 10,
    right: Math.max(16, window.innerWidth - anchorRect.right),
    zIndex: 999,
  };

  return createPortal(
    <div ref={panelRef} style={style} className="wt-glass wt-glass-strong w-64 overflow-hidden !rounded-3xl">
      <div className="flex items-center gap-3 bg-gradient-to-br from-[var(--wt-mint)]/20 via-transparent to-transparent px-4 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--wt-mint)] to-[var(--wt-mint-dark)] text-base font-extrabold text-white shadow-sm">
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-extrabold text-[var(--wt-text)]">{user.name}</p>
          <p className="truncate text-xs text-[var(--wt-muted)]">{user.email}</p>
        </div>
      </div>
      <div className="p-1.5">
        <Link
          to="/ingresar"
          onClick={onClose}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--wt-text)] transition-colors hover:bg-black/[0.04]"
        >
          <LayoutGrid size={16} className="shrink-0 text-[var(--wt-mint-dark)]" />
          Mis apps
        </Link>
        <button
          type="button"
          onClick={doLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </div>,
    document.querySelector('.wintuu-landing') || document.body
  );
}

function AccountMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const btnRef = useRef(null);

  const toggle = () => {
    if (!open) setAnchorRect(btnRef.current?.getBoundingClientRect() || null);
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return undefined;
    const reposition = () => setAnchorRect(btnRef.current?.getBoundingClientRect() || null);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        className="flex items-center gap-2 rounded-full border border-[var(--wt-border)] bg-white px-2.5 py-1.5 text-sm font-bold text-[var(--wt-text)] transition hover:border-[var(--wt-mint)] hover:bg-black/[0.02]"
        onClick={toggle}
        aria-label="Menú de cuenta"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--wt-mint)] to-[var(--wt-mint-dark)] text-xs font-extrabold text-white">
          {initials(user.name)}
        </span>
        <span className="max-w-28 truncate">{user.name}</span>
        <ChevronDown size={14} className={`text-[var(--wt-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && anchorRect && (
        <AccountDropdown user={user} anchorRect={anchorRect} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const menuBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const { user, logout } = useAuth();

  // Bloqueo de scroll síncrono (mismo evento, no en un effect): el primer
  // frame del menú ya nace sin scrollbar, así el texto no reflow a 2 líneas.
  const setMenuOpen = (next) => {
    document.body.style.overflow = next ? 'hidden' : '';
    setOpen(next);
  };
  const close = () => setMenuOpen(false);
  const toggle = () => setMenuOpen(!open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Si crece a desktop con el menú abierto, se cierra solo
  useEffect(() => {
    if (!open) return undefined;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => {
      if (e.matches) close();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [open]);

  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  return (
    <>
      <header className="wt-navbar wt2-rise" style={{ '--d': '0ms' }}>
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

          <div className="hidden items-center gap-2.5 lg:flex">
            {user ? (
              <AccountMenu user={user} />
            ) : (
              <Link
                to="/ingresar"
                className="wt2-btn inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--wt-border)] bg-[var(--wt-surface)] px-5 py-2.5 text-[14px] font-bold text-[var(--wt-ink)] hover:border-[var(--wt-ink)]"
              >
                <LogIn size={16} strokeWidth={2.4} />
                Ingresar
              </Link>
            )}
            <Link
              to="/checkout"
              className="wt2-btn wt2-shine inline-flex items-center rounded-full bg-[#08282c] px-5 py-2.5 text-[14px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(8,40,44,0.6)] hover:bg-[var(--wt-mint-dark)]"
            >
              Crear mi app
            </Link>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <Link
              to="/checkout"
              onClick={close}
              className="wt-btn-glow wt-btn-mint-sm shrink-0"
              aria-label="Crear mi app"
            >
              Crear mi app
            </Link>
            <button
              ref={menuBtnRef}
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--wt-ink)]"
              aria-expanded={open}
              aria-controls="wt-mobile-menu"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              onClick={toggle}
            >
              {open ? <X size={24} /> : <Grip size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/*
        El menú se porta a la raíz .wintuu-landing (como el dropdown de cuenta):
        dentro del navbar (con backdrop-filter) un fixed quedaría confinado a la
        altura de la barra y no cubriría la pantalla.
      */}
      {open &&
        createPortal(
          <div
            id="wt-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="wt-menu-overlay fixed inset-0 z-[70] flex flex-col overflow-hidden lg:hidden"
            style={{
              backgroundColor: '#fff6ec',
              background:
                'radial-gradient(80% 55% at 88% 8%, rgba(255,196,225,0.4), transparent 60%), radial-gradient(75% 50% at 8% 95%, rgba(0,207,205,0.16), transparent 55%), linear-gradient(165deg, #ffffff, #fff6ec)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="wt-bg-blob" style={{ width: 280, height: 280, background: '#ffd3ea', top: '6%', right: '-18%', opacity: 0.45 }} />
              <div className="wt-bg-blob" style={{ width: 320, height: 320, background: '#bff3ea', bottom: '4%', left: '-20%', opacity: 0.45 }} />
              <div className="wt-bg-blob" style={{ width: 200, height: 200, background: '#e3dbff', top: '45%', left: '55%', opacity: 0.3 }} />
            </div>

            <div className="relative flex h-16 shrink-0 items-center justify-between px-4 sm:h-[72px] sm:px-8">
              <a href="#inicio" onClick={close} aria-label="Wintuu, inicio">
                <WintuuLogo height={22} />
              </a>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={close}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--wt-ink)]"
                aria-label="Cerrar menú"
              >
                <X size={26} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <nav className="mt-4 flex flex-1 flex-col justify-center gap-8 px-6 sm:px-10" aria-label="Principal">
                {NAV_ITEMS.map(([href, label], i) => (
                  <a
                    key={href}
                    href={href}
                    onClick={close}
                    className="wt-menu-item group flex items-center gap-3 sm:gap-5"
                    style={{ '--wt-delay': `${120 + i * 80}ms` }}
                  >
                    <span className="wt-heading shrink-0 text-[clamp(19px,5.4vw,26px)] font-semibold text-[var(--wt-mint-dark)] transition-colors duration-300 group-hover:text-[var(--wt-mint)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="wt-heading whitespace-nowrap text-[clamp(34px,9.6vw,56px)] font-semibold leading-none text-[var(--wt-ink)] transition-all duration-300 group-hover:translate-x-2 group-hover:text-[var(--wt-mint-dark)]">
                      {label}
                    </span>
                    <ArrowRight
                      size={22}
                      className="ml-auto shrink-0 -translate-x-2 text-[var(--wt-mint-dark)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </a>
                ))}
              </nav>

              <div className="wt-menu-item px-6 pb-8 pt-8 sm:px-10" style={{ '--wt-delay': '520ms' }}>
                <div className="mx-auto flex max-w-md flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-2xl border border-[var(--wt-border)] bg-white/75 px-4 py-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--wt-mint)] to-[var(--wt-mint-dark)] text-sm font-extrabold text-white">
                        {initials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-[var(--wt-text)]">{user.name}</p>
                        <p className="truncate text-xs text-[var(--wt-muted)]">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link to="/ingresar" onClick={close} className="wt-btn-ghost flex-1 justify-center">
                        Mis apps
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          close();
                          await logout();
                        }}
                        className="wt-btn-ghost flex-1 justify-center text-red-500"
                      >
                        Salir
                      </button>
                    </div>
                  </>
                ) : (
                  <Link to="/ingresar" onClick={close} className="wt-btn-ghost w-full justify-center">
                    Ingresar
                  </Link>
                )}
                <Link to="/checkout" onClick={close} className="wt-btn-mint w-full">
                  Quiero mi app <ArrowRight size={16} />
                </Link>
                  <p className="mt-1 text-center text-[13px] text-[var(--wt-muted)]">Cupones, puntos y tu menú en un mismo lugar.</p>
                </div>
              </div>
            </div>
          </div>,
          document.querySelector('.wintuu-landing') || document.body
        )}
    </>
  );
}
