import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

// Franja tipo "pill" debajo de la navbar, con un botón de acción y un cierre.
// El cierre es solo para esta vista: no se guarda en el navegador, así que
// vuelve a aparecer al recargar o en la próxima visita.
export default function TrialAnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const close = () => setDismissed(true);

  return (
    <div className="flex justify-center px-4 sm:px-8 lg:px-12">
      <div
        className="flex w-full max-w-[860px] items-center gap-3 rounded-full border border-[var(--wt-mint)]/25 py-2.5 pl-5 pr-2.5 shadow-[0_10px_30px_-18px_rgba(0,207,205,0.55)] sm:gap-4"
        style={{ background: 'linear-gradient(135deg, #e3fbf9, #eef8fc)' }}
      >
        <p className="min-w-0 flex-1 text-[12.5px] font-semibold leading-snug text-[var(--wt-ink)] sm:text-[14px]">
          <span className="mr-1.5">🎁</span>
          Probá Wintuu <strong>7 días gratis</strong> en el plan Mensual. No se cobra nada hasta el día 8.
        </p>
        <Link
          to="/checkout"
          className="wt2-btn hidden shrink-0 items-center rounded-full bg-[#08282c] px-4 py-2 text-[13px] font-bold text-white hover:bg-[var(--wt-mint-dark)] sm:inline-flex"
        >
          Empezar
        </Link>
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar aviso"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--wt-muted)] transition hover:bg-black/[0.06] hover:text-[var(--wt-ink)]"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
