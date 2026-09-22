import { Link } from 'react-router-dom';
import logoUrl from '../../assets/logo.svg';
import friendsPhoto from '../../assets/landing/friends-cafe.jpg';

const LINKS = [
  ['#producto', 'Producto'],
  ['#como-funciona', 'Cómo funciona'],
  ['#planes', 'Planes'],
  ['#faqs', 'FAQs'],
];

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden px-4 pb-10 pt-20 sm:px-8 sm:pt-24 lg:px-12">
      <div className="wt-bg-blob" style={{ width: 340, height: 340, background: '#ffd3ea', top: '2%', left: '-4%', opacity: 0.35 }} />
      <div
        className="wt-halo pointer-events-none absolute bottom-[-120px] left-1/2 h-[360px] w-[640px] -translate-x-1/2"
        style={{ opacity: 0.5 }}
      />

      <div className="relative mx-auto max-w-[1280px]">
        <div className="wt-reveal grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
          <div>
            <p
              className="wt-heading font-semibold leading-[1.02] text-[var(--wt-text)]"
              style={{ fontSize: 'clamp(46px, 8.4vw, 116px)', letterSpacing: '-0.015em' }}
            >
              Nos vemos
              <br />a la vuelta.
            </p>
            <p className="wt-body mt-6 max-w-sm text-[17px]">Por ese café, ese lugar y esas ganas de volver.</p>
          </div>

          <div className="hidden h-[170px] w-[230px] shrink-0 overflow-hidden rounded-[28px] border border-[var(--wt-border)] lg:block">
            <img
              src={friendsPhoto}
              alt="Dos personas compartiendo un café y riendo en una mesa"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Logo grande */}
        <div className="wt-reveal mt-20 flex justify-center sm:mt-24" style={{ '--wt-delay': '100ms' }}>
          <img src={logoUrl} alt="Wintuu" className="h-auto w-[72%] max-w-[760px] sm:w-[80%]" />
        </div>

        {/* Franja final */}
        <div className="wt-reveal mt-16 border-t border-[var(--wt-border)] pt-8 sm:mt-20" style={{ '--wt-delay': '160ms' }}>
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-[14px] font-semibold text-[var(--wt-mint-dark)]">Con Wintuu ganamos todos.</p>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer">
              {LINKS.map(([href, label]) => (
                <a key={href} href={href} className="wt-nav-link text-[14px]">
                  {label}
                </a>
              ))}
              <Link to="/ingresar" className="wt-nav-link text-[14px]">
                Ingresar
              </Link>
            </nav>

            <a href="#inicio" className="wt-nav-link text-[14px]">
              Volver arriba ↑
            </a>
          </div>

          <p className="mt-8 text-center text-[12.5px] text-[var(--wt-muted)] sm:text-left">© {year} Wintuu.</p>
        </div>
      </div>
    </footer>
  );
}
