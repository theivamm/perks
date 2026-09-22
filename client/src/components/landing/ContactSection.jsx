import { MessageCircle } from 'lucide-react';

const WHATSAPP_URL =
  'https://wa.me/541161120433?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Wintuu.';

export default function ContactSection() {
  return (
    <section id="contacto" className="px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        <div
          className="wt-reveal relative flex flex-col items-center overflow-hidden rounded-[36px] px-6 py-14 text-center sm:px-12 sm:py-20"
          style={{
            background:
              'linear-gradient(120deg, rgba(0,207,205,0.14), rgba(255,196,225,0.12) 45%, rgba(201,187,255,0.14) 100%), linear-gradient(135deg, rgba(255,255,255,.92), rgba(255,255,255,.7))',
          }}
        >
          {/* Halos pastel suaves */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[var(--wt-mint)]/10 blur-[70px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-[rgba(255,196,225,0.35)] blur-[80px]" />

          {/* Línea que bordea el módulo y gira */}
          <div className="wt-ring" aria-hidden />

          <div className="relative">
            <h2 className="wt-h2 mx-auto max-w-3xl text-[36px] text-[var(--wt-text)] sm:text-[44px]">
              ¿Te quedó alguna duda? Lo charlamos.
            </h2>
            <p className="wt-body mx-auto mt-4 max-w-xl text-[16px]">
              Si querés saber cómo encaja Wintuu en tu negocio, escribinos. Podemos empezar por ahí.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="wt-btn-mint">
                <MessageCircle size={17} /> Escribir por WhatsApp
              </a>
              <span className="text-[14.5px] font-semibold text-[var(--wt-text)]/70">11 6112-0433</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
