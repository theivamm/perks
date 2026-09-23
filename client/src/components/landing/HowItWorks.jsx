const STEPS = [
  { tag: 'Vos', title: 'Creás un cupón.', body: 'Elegís el premio y los puntos para conseguirlo: un descuento o ese regalo que representa a tu negocio.', filled: 0 },
  { tag: 'Tu cliente', title: 'Lo activa.', body: 'Entra al perfil de tu negocio con Google y elige el cupón que quiere empezar a completar.', filled: 1 },
  { tag: 'Cada visita', title: 'Suma un punto.', body: 'Escaneás su QR desde el panel y el punto se registra. El cliente ve cómo avanza al instante.', filled: 3 },
  { tag: 'El premio', title: 'Y otra vuelta.', body: 'Al completar la meta, valida el canje en tu local y puede activar otro cupón para volver a empezar.', filled: 5 },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="px-3 sm:px-6">
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[32px] bg-[#08282c] px-5 py-16 text-white sm:rounded-[48px] sm:px-10 sm:py-24 lg:px-16">
        <div className="wt-bg-blob" style={{ width: 480, height: 480, background: '#00cfcd', top: '-40%', right: '-10%', opacity: 0.25 }} />
        <div className="relative flex flex-col gap-14">
          <div className="wt-reveal flex max-w-[640px] flex-col gap-4">
            <p className="text-[12px] font-extrabold tracking-[0.18em] text-[var(--wt-mint-light)]">CÓMO FUNCIONA</p>
            <h2 className="wt-heading text-balance text-[clamp(36px,4.4vw,56px)] font-bold leading-none">De una visita a las ganas de volver.</h2>
            <p className="text-[17px] leading-relaxed text-white/70">Vos marcás las reglas, tus clientes se suman al juego y cada visita suma un puntito.</p>
          </div>

          <ol className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="wt-reveal wt2-lift flex flex-col gap-3.5 rounded-[28px] border border-white/10 bg-white/[0.05] p-6 hover:border-[var(--wt-mint)]/40"
                style={{ '--wt-delay': `${i * 110}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="wt-heading flex h-12 w-12 items-center justify-center rounded-full bg-[var(--wt-mint)] text-[20px] font-bold text-[#08282c]">{i + 1}</span>
                  <span className="text-[12px] font-semibold text-[var(--wt-mint-light)]">{s.tag}</span>
                </div>
                <h3 className="wt-heading text-[22px] font-bold leading-tight">{s.title}</h3>
                <p className="text-[14.5px] leading-relaxed text-white/70">{s.body}</p>
                <div className="mt-auto flex gap-1.5 pt-2" aria-label={`${s.filled} de 5 puntos`}>
                  {[0, 1, 2, 3, 4].map((d) =>
                    d < s.filled ? (
                      <span key={d} className="wt2-stamp h-[22px] w-[22px] rounded-full bg-[var(--wt-mint-light)]" style={{ '--i': d, '--base': `${400 + i * 110}ms` }} />
                    ) : (
                      <span key={d} className="h-[22px] w-[22px] rounded-full border-2 border-dashed border-white/30" />
                    )
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
