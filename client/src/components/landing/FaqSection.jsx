import { Link } from 'react-router-dom';
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
    <section id="faqs" className="px-4 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
          <div className="wt-reveal lg:sticky lg:top-28 lg:self-start">
            <p className="wt-eyebrow">FAQs</p>
            <h2 className="wt-h2 mt-5 text-[var(--wt-text)]">Algunas dudas, resueltas.</h2>
            <p className="wt-body mt-5">Y si te queda alguna más, estamos a un mensaje.</p>
          </div>

          <div className="wt-reveal divide-y divide-[var(--wt-border)] border-t border-[var(--wt-border)]" style={{ '--wt-delay': '100ms' }}>
            {FAQS.map(({ q, a }) => (
              <details key={q} className="wt-faq-item group py-5 sm:py-6">
                <summary className="flex items-center justify-between gap-4">
                  <span className="wt-heading text-[16.5px] font-semibold text-[var(--wt-text)] sm:text-[18px]">{q}</span>
                  <Plus size={18} className="wt-faq-icon shrink-0 text-[var(--wt-mint-dark)]" />
                </summary>
                <p className="wt-body mt-3.5 max-w-2xl text-[15px]">{a}</p>
              </details>
            ))}

            <details className="wt-faq-item group py-5 sm:py-6">
              <summary className="flex items-center justify-between gap-4">
                <span className="wt-heading text-[16.5px] font-semibold text-[var(--wt-text)] sm:text-[18px]">
                  ¿Ya tengo una cuenta: por dónde ingreso?
                </span>
                <Plus size={18} className="wt-faq-icon shrink-0 text-[var(--wt-mint-dark)]" />
              </summary>
              <p className="wt-body mt-3.5 max-w-2xl text-[15px]">
                Desde{' '}
                <Link to="/ingresar" className="font-semibold text-[var(--wt-mint-dark)] underline underline-offset-4">
                  Ingresar
                </Link>
                , arriba de esta página. El portal te permite elegir el negocio al que querés entrar y acceder como
                cliente o administrador, según corresponda a tu cuenta.
              </p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
