import { MessageCircle } from 'lucide-react';
import menuPhoto from '../../assets/landing/menu-pastry.jpg';

const WHATSAPP_URL =
  'https://wa.me/541161120433?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Wintuu.';

export default function ContactSection() {
  return (
    <section id="contacto" className="px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        <div
          className="wt-reveal wt-glass relative grid overflow-hidden sm:grid-cols-[1fr_auto]"
          style={{
            background:
              'linear-gradient(120deg, rgba(0,207,205,0.16), rgba(255,196,225,0.1) 60%), linear-gradient(135deg, rgba(255,255,255,.9), rgba(255,255,255,.68))',
          }}
        >
          <div className="p-8 sm:p-12">
            <h2 className="wt-h2 text-[36px] text-[var(--wt-text)] sm:text-[44px]">
              ¿Te quedó alguna duda? Lo charlamos.
            </h2>
            <p className="wt-body mt-4 max-w-md text-[16px]">
              Si querés saber cómo encaja Wintuu en tu negocio, escribinos. Podemos empezar por ahí.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="wt-btn-mint">
                <MessageCircle size={17} /> Escribir por WhatsApp
              </a>
              <span className="text-[14.5px] font-semibold text-[var(--wt-text)]/70">11 6112-0433</span>
            </div>
          </div>

          <div className="relative hidden min-h-[220px] w-[260px] sm:block">
            <img
              src={menuPhoto}
              alt="Café y pastelería servidos con luz cálida"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div
              className="wt-coupon wt-coupon-sm wt-coupon-3 absolute -left-6 bottom-6 w-[150px]"
              style={{ background: 'linear-gradient(120deg, #ffefae, #fff8dc, #f1e8ff, #ffefae)' }}
            >
              <p className="wt-heading text-[12px] font-semibold text-[var(--wt-ink)]">¡Te esperamos!</p>
              <p className="text-[10px] text-[var(--wt-ink)]/60">Charlemos por WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
