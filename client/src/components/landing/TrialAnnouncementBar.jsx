import { Gift } from 'lucide-react';

// Franja promocional arriba de la navbar. No es sticky a propósito: se lee
// apenas se entra a la página y se va con el scroll, sin competir con la
// navbar (que sí queda fija) ni con el hero.
export default function TrialAnnouncementBar() {
  return (
    <a
      href="#planes"
      className="wt2-shine flex w-full items-center justify-center gap-2 bg-[var(--wt-mint)] px-4 py-2.5 text-center text-[13px] font-bold text-[#08282c] transition hover:bg-[var(--wt-mint-light)] sm:text-[14px]"
    >
      <Gift size={16} className="shrink-0" />
      Probá Wintuu 7 días gratis en el plan mensual. Sin cargo hasta el día 8.
    </a>
  );
}
