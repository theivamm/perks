import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import '../../styles/wintuu-landing.css';
import '../../styles/wintuu-landing-v2.css';
import WintuuLogo from '../../components/landing/WintuuLogo.jsx';
import LandingFooter from '../../components/landing/LandingFooter.jsx';

// Header propio para las páginas legales: la navbar de la landing tiene
// anclas (#producto, #planes...) que solo existen en el home, así que acá
// no sirve. Este es un header minimal: sin navegación de secciones, con el
// logo centrado (lleva a "/") y los tres accesos que sí tienen sentido acá.
function LegalHeader() {
  return (
    <header className="wt2-rise border-b border-[var(--wt-border)] px-4 py-5 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="wt2-btn inline-flex items-center gap-2 rounded-full border border-[var(--wt-border)] bg-[var(--wt-surface)] px-4 py-2 text-[13.5px] font-semibold text-[var(--wt-ink)] hover:border-[var(--wt-ink)]"
        >
          <ArrowLeft size={15} /> Volver a inicio
        </Link>

        <Link to="/" aria-label="Wintuu, inicio" className="order-first flex w-full justify-center sm:order-none sm:w-auto">
          <WintuuLogo height={24} />
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            to="/ingresar"
            className="wt2-btn inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--wt-border)] bg-[var(--wt-surface)] px-4 py-2 text-[13.5px] font-bold text-[var(--wt-ink)] hover:border-[var(--wt-ink)]"
          >
            <LogIn size={15} strokeWidth={2.4} /> Mi cuenta
          </Link>
          <Link
            to="/checkout"
            className="wt2-btn wt2-shine inline-flex items-center rounded-full bg-[#08282c] px-4 py-2 text-[13.5px] font-bold text-white hover:bg-[var(--wt-mint-dark)]"
          >
            Quiero mi app
          </Link>
        </div>
      </div>
    </header>
  );
}

// Layout compartido por las páginas legales (Privacidad, Términos): header
// propio (sin anclas de la landing) + footer de siempre, como lectura
// tipográfica simple, sin hero ni animaciones.
export default function LegalLayout({ title, description, updated, children }) {
  useEffect(() => {
    document.title = `${title} · Wintuu`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
    // React Router no resetea el scroll al navegar entre rutas: sin esto, la
    // página arranca en la posición de scroll que traías de la landing.
    window.scrollTo(0, 0);
  }, [title, description]);

  return (
    <div className="wintuu-landing min-h-screen">
      <LegalHeader />
      <main className="px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
        <article className="mx-auto max-w-[760px]">
          <p className="text-[12px] font-extrabold tracking-[0.14em] text-[var(--wt-mint-dark)]">WINTUU</p>
          <h1 className="wt-heading mt-2 text-[clamp(32px,4.4vw,48px)] font-bold leading-tight text-[var(--wt-ink)]">{title}</h1>
          <p className="mt-3 text-[14px] text-[var(--wt-muted)]">Última actualización: {updated}</p>

          <div className="wt-legal mt-10 flex flex-col gap-10 text-[15.5px] leading-relaxed text-[var(--wt-text)]">
            {children}
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}

export function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="wt-heading text-[22px] font-bold text-[var(--wt-ink)]">{title}</h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}
