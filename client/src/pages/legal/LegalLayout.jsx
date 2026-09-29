import { useEffect } from 'react';
import '../../styles/wintuu-landing.css';
import '../../styles/wintuu-landing-v2.css';
import LandingNavbar from '../../components/landing/LandingNavbar.jsx';
import LandingFooter from '../../components/landing/LandingFooter.jsx';

// Layout compartido por las páginas legales (Privacidad, Términos): mismo
// navbar/footer y tema de la landing, pero como lectura tipográfica simple,
// sin hero ni animaciones.
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
      <LandingNavbar />
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
