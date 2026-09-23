import friendsPhoto from '../../assets/landing/friends-cafe.jpg';

const WA = 'https://wa.me/541161120433?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Wintuu.';

export default function ContactSection() {
  return (
    <section id="contacto" className="px-4 pb-16 sm:px-8 sm:pb-24 lg:px-12">
      <div className="mx-auto grid max-w-[1280px] gap-[18px] lg:grid-cols-2">
        <div className="wt-reveal flex min-h-[360px] flex-col justify-between gap-7 rounded-[36px] bg-gradient-to-br from-[#d9f7f4] via-[#e9e3ff] to-[#ffe7f1] p-7 sm:p-12">
          <div className="flex flex-col gap-3.5">
            <h2 className="wt-heading text-balance text-[clamp(34px,3.8vw,48px)] font-bold leading-[1.02] text-[#08282c]">¿Te quedó alguna duda? Lo charlamos.</h2>
            <p className="max-w-[420px] text-[16.5px] leading-relaxed text-[#35494b]">
              Si querés saber cómo encaja Wintuu en tu negocio, escribinos. Te respondemos nosotros, no un bot.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              className="wt2-btn inline-flex items-center gap-2.5 rounded-full bg-[#08282c] px-6 py-4 text-[15px] font-bold text-white hover:bg-[var(--wt-mint-dark)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36A9.43 9.43 0 1 1 12.05 21.5m8.03-17.46A11.35 11.35 0 0 0 2.22 17.74L.6 23.5l5.9-1.55A11.35 11.35 0 0 0 20.08 4.04" />
              </svg>
              Escribinos por WhatsApp
            </a>
            <span className="text-[14px] font-semibold text-[#35494b]">+54 11 6112-0433</span>
          </div>
        </div>

        <div className="wt-reveal grid min-h-[360px] grid-rows-[minmax(220px,1fr)_auto] overflow-hidden rounded-[36px] bg-[var(--wt-surface-raised)]" style={{ '--wt-delay': '100ms' }}>
          <div className="overflow-hidden">
            <img
              src={friendsPhoto}
              alt="Dos personas compartiendo un café y riendo en una mesa"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-105"
            />
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-6 sm:px-9">
            <p className="wt-heading text-[clamp(32px,3.6vw,44px)] font-bold leading-none text-[var(--wt-ink)]">
              Nos vemos
              <br />a la vuelta.
            </p>
            <p className="max-w-[220px] text-[14px] leading-snug text-[var(--wt-muted)]">Por ese café, ese lugar y esas ganas de volver.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
