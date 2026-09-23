import { Link } from 'react-router-dom';
import logoUrl from '../../assets/logo.svg';

const LINKS = [
  ['#producto', 'Producto'],
  ['#como-funciona', 'Cómo funciona'],
  ['#planes', 'Planes'],
  ['#faqs', 'FAQs'],
];

export default function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--wt-border)] px-4 pb-8 pt-12 sm:px-8 sm:pt-16 lg:px-12">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
        <div className="wt-reveal flex justify-center">
          <img src={logoUrl} alt="Wintuu" className="wt2-wordmark h-auto w-full max-w-[760px]" />
        </div>
        <div className="flex flex-col items-center gap-5 border-t border-[var(--wt-border)] pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-[14px] font-semibold text-[var(--wt-mint-dark)]">Con Wintuu ganamos todos.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} className="wt-nav-link text-[14px]">{label}</a>
            ))}
            <Link to="/ingresar" className="wt-nav-link text-[14px]">Ingresar</Link>
          </nav>
          <div className="flex items-center gap-5 text-[13px] text-[var(--wt-muted)]">
            <span>© {year} Wintuu</span>
            <a href="#inicio" className="wt-nav-link text-[13px]">Volver arriba ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
