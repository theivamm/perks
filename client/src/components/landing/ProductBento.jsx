import { CouponsMock, IdentityMock, MenuMock, PanelMock, PointsMock } from './ProductMockups.jsx';

const CARDS = [
  {
    cls: 'wt-card-a',
    delay: '0ms',
    title: 'Los beneficios los elegís vos.',
    body: 'Un porcentaje, un monto de descuento o un regalo. Creás el cupón y definís cuántos puntos hacen falta para conseguirlo.',
    Mock: CouponsMock,
    // El carrusel de cupones queda más bajo que la foto de la card vecina,
    // así que sobra aire abajo del párrafo; achicamos solo el padding
    // inferior de esta card (pb-* pisa la parte de abajo de p-7/sm:p-8).
    tightBottom: true,
  },
  {
    cls: 'wt-card-b',
    delay: '80ms',
    title: 'Tu negocio, con tu identidad.',
    body: 'Tu nombre, tu logo y tus colores, en un perfil con un enlace para compartir con tus clientes.',
    Mock: IdentityMock,
  },
];

export default function ProductBento() {
  return (
    <section id="producto" className="relative overflow-hidden px-4 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
      <div className="wt-bg-blob" style={{ width: 360, height: 360, background: '#ffe9a8', top: '4%', right: '-6%' }} />
      <div className="wt-bg-blob" style={{ width: 300, height: 300, background: '#c9bbff', bottom: '8%', left: '-6%' }} />

      <div className="relative mx-auto max-w-[1280px]">
        <div className="wt-reveal max-w-2xl">
          <p className="wt-eyebrow">Producto</p>
          <h2 className="wt-h2 mt-5 text-[var(--wt-text)]">Lo de tu negocio, en un mismo lugar.</h2>
          <p className="wt-body mt-5">
            Un perfil con tu identidad, beneficios que elegís vos y un panel para llevarlos al día. Del otro lado,
            tus clientes encuentran sus puntos, sus premios y tu menú.
          </p>
        </div>

        <div className="wt-product-bento mt-14">
          {CARDS.map(({ cls, delay, title, body, Mock, tightBottom }) => (
            <article
              key={cls}
              className={`wt-glass wt-card-hover wt-reveal flex flex-col ${tightBottom ? 'gap-4' : 'gap-6'} p-7 sm:p-8 ${tightBottom ? 'pb-4 sm:pb-5' : ''} ${cls}`}
              style={{ '--wt-delay': delay }}
            >
              <Mock />
              <div>
                <h3 className="wt-h3 text-[var(--wt-text)]">{title}</h3>
                <p className="wt-body mt-2.5 text-[15.5px]">{body}</p>
              </div>
            </article>
          ))}

          {/* C. Menú incluido — mockup propio con la tarjeta crema completa */}
          <article className="wt-glass wt-card-hover wt-reveal wt-card-c overflow-hidden p-0" style={{ '--wt-delay': '140ms' }}>
            <MenuMock />
            <div className="p-7 pt-4 sm:p-8 sm:pt-4">
              <p className="text-[13.5px] text-[var(--wt-muted)]">Un lugar más para mostrar lo que hacés.</p>
            </div>
          </article>

          {/* D. Panel */}
          <article className="wt-glass wt-card-hover wt-reveal wt-card-d flex flex-col gap-6 p-7 sm:p-8" style={{ '--wt-delay': '200ms' }}>
            <div>
              <h3 className="wt-h3 text-[var(--wt-text)]">Un panel para llevarlo al día.</h3>
              <p className="wt-body mt-2.5 text-[15.5px]">
                Creá y editá cupones, consultá el progreso de tus clientes y actualizá tu menú desde el mismo lugar.
              </p>
            </div>
            <PanelMock />
          </article>

          {/* E. Puntos */}
          <article className="wt-glass wt-card-hover wt-reveal wt-card-e flex flex-col gap-6 p-7 sm:p-8" style={{ '--wt-delay': '260ms' }}>
            <div>
              <h3 className="wt-h3 text-[var(--wt-text)]">Cada punto acerca un premio.</h3>
              <p className="wt-body mt-2.5 text-[15.5px]">
                Tus clientes ven cuánto llevan y cuánto les falta. Cuando completan la meta, el beneficio queda listo
                para canjear en tu negocio.
              </p>
            </div>
            <PointsMock />
          </article>
        </div>
      </div>
    </section>
  );
}
