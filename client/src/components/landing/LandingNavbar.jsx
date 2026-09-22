import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import WintuuLogo from './WintuuLogo.jsx';

const NAV_ITEMS = [
  ['#producto', 'Producto'],
  ['#como-funciona', 'Cómo funciona'],
  ['#planes', 'Planes'],
  ['#faqs', 'FAQs'],
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const menuBtnRef = useRef(null);

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
          <Link to="/ingresar" className="wt-nav-link">
            Ingresar
          </Link>
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
            <Link
              to="/ingresar"
              onClick={close}
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-[var(--wt-text)]/80 transition hover:bg-black/[0.03]"
            >
              Ingresar
            </Link>
            <Link to="/checkout" onClick={close} className="wt-btn-mint-sm mt-2 justify-center">
              Quiero mi app
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
