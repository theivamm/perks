import { Plus } from 'lucide-react';

const FAQS = [
  {
    q: '¿Qué es Wintuu?',
    a: 'Wintuu es un espacio digital para tu negocio y sus clientes. Desde tu panel creás cupones, definís premios y seguís el progreso de quienes participan. Tus clientes encuentran sus beneficios y tu menú en el perfil de tu negocio.',
  },
  {
    q: '¿Sirve solo para cafeterías?',
    a: 'No. Podés usarlo en comercios y negocios de servicios que quieran reconocer las visitas de sus clientes. Vos elegís el beneficio y cuántos puntos hacen falta para conseguirlo.',
  },
  {
    q: '¿Mis clientes tienen que descargar una app?',
    a: 'No. Entran al perfil de tu negocio desde el navegador del celular. Para activar cupones y ver su progreso, acceden con su cuenta de Google. El menú se puede consultar sin iniciar sesión.',
  },
  {
    q: '¿Cómo se suman los puntos?',
    a: 'El cliente activa un cupón. Cuando corresponde sumar un punto, escaneás su QR o buscás su perfil desde el panel y registrás el punto. Al completar la meta que definiste, el cupón queda listo para canjear.',
  },
  {
    q: '¿Qué tipo de premios puedo crear?',
    a: 'Podés crear un porcentaje de descuento, un monto de descuento o un regalo. También definís el nombre del cupón, su descripción y los puntos necesarios para conseguirlo.',
  },
  {
    q: '¿El menú digital está incluido?',
    a: 'Sí, viene incluido en ambos planes. Lo completás con tus productos, fotos, precios y categorías, y después podés actualizarlo desde el panel cuando lo necesites.',
  },
  {
    q: '¿Puedo usar el nombre y los colores de mi negocio?',
    a: 'Sí. Tu perfil puede llevar el nombre, el logo y los colores de tu negocio. También tiene un enlace dentro de Wintuu para compartir con tus clientes.',
  },
  {
    q: '¿Qué cambia entre el plan mensual y el de por vida?',
    a: 'La modalidad de pago. El mensual se renueva cada mes. El de por vida se abona una sola vez. Ambos incluyen el perfil del negocio, el panel, los cupones, el seguimiento de puntos y el menú digital.',
  },
  {
    q: '¿Cómo empiezo?',
    a: 'Elegís un plan y continuás al checkout. Luego accedés con Google y completás el pago en Mercado Pago. Cuando se confirma, configurás el nombre y el enlace de tu negocio y seguís los primeros pasos para cargar tu contenido.',
  },
  {
    q: '¿Puedo cancelar la renovación del plan mensual?',
    a: 'Sí. Podés cancelar la renovación automática desde la configuración de tu panel. El acceso continúa hasta el final del período abonado.',
  },
];

export default function FaqSection() {
  return (
    <section id="faqs" className="px-4 pb-20 sm:px-8 sm:pb-28 lg:px-12 lg:pb-32">
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16">
        <div className="wt-reveal flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <p className="text-[12px] font-extrabold tracking-[0.18em] text-[var(--wt-mint-dark)]">FAQS</p>
          <h2 className="wt-heading text-[clamp(36px,4.4vw,56px)] font-bold leading-none text-[var(--wt-ink)]">Algunas dudas, resueltas.</h2>
          <p className="text-[17px] leading-relaxed text-[var(--wt-muted)]">Y si te queda alguna más, estamos a un mensaje.</p>
          <a
            href="https://wa.me/541161120433?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Wintuu."
            target="_blank"
            rel="noopener noreferrer"
            className="wt2-btn mt-2 inline-flex items-center gap-2 self-start rounded-full border-[1.5px] border-[var(--wt-border)] bg-[var(--wt-surface)] px-5 py-3 text-[14px] font-bold text-[var(--wt-ink)] hover:border-[var(--wt-ink)]"
          >
            Preguntanos por WhatsApp
          </a>
        </div>

        <div className="flex flex-col gap-2.5">
          {FAQS.map(({ q, a }, i) => (
            <details
              key={q}
              className="wt-reveal wt2-faq rounded-[22px] border border-[var(--wt-border)] transition-[background-color,box-shadow] duration-300"
              style={{ '--wt-delay': `${Math.min(i, 5) * 50}ms` }}
              open={i === 0}
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-5 text-left text-[16.5px] font-semibold leading-snug text-[var(--wt-ink)] sm:px-6">
                {q}
                <span className="wt2-faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--wt-surface-raised)] text-[var(--wt-ink)]">
                  <Plus size={18} />
                </span>
              </summary>
              <p className="wt2-faq-body max-w-[680px] px-5 pb-6 text-[15px] leading-relaxed text-[var(--wt-muted)] sm:px-6">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
