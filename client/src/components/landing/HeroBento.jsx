import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const TRUST = ['Listo en una tarde', 'Menú digital incluido', 'Pago con Mercado Pago'];
const RUBROS = ['Cafeterías', 'Panaderías', 'Heladerías', 'Barberías', 'Estética', 'Tiendas de barrio', 'Pastelerías', 'Veterinarias'];

function Stamp({ done, i }) {
  return done ? (
    <span
      className="wt2-stamp wt2-stamp-hero flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#ffd166] text-[12px] font-extrabold text-[#2a1a14]"
      style={{ '--i': i, '--base': '900ms' }}
    >
      ✓
    </span>
  ) : (
    <span className="h-[30px] w-[30px] rounded-full border-2 border-dashed border-white/50" />
  );
}

function PhoneMock() {
  return (
    <div className="wt2-phone relative h-[610px] w-[300px] rounded-[46px] bg-[#0c1a1c] p-2.5 shadow-[0_40px_80px_-30px_rgba(8,40,44,0.55)]">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[37px] bg-[#fbf6f2]">
        <div className="flex h-9 shrink-0 items-center justify-between px-[22px] text-[12px] font-semibold text-[#16292a]">
          <span>9:41</span>
          <span className="h-[18px] w-[60px] rounded-full bg-[#0c1a1c]" />
          <span className="h-2.5 w-5 rounded-[3px] border-[1.5px] border-[#16292a]" />
        </div>
        <div className="flex items-center gap-2.5 px-4 pb-3 pt-1.5">
          <span className="wt-heading flex h-8 w-8 items-center justify-center rounded-full bg-[#c2562f] text-[12px] font-bold text-white">CL</span>
          <div className="flex flex-col">
            <span className="wt-heading text-[15px] font-bold leading-tight text-[#2a1a14]">Café Lúa</span>
            <span className="text-[10px] font-medium text-[#8a7468]">Tostadores · Palermo</span>
          </div>
        </div>
        <div className="mx-3 flex flex-col gap-2.5 rounded-[22px] bg-gradient-to-br from-[#d0643b] to-[#a8431f] p-4 text-white">
          <span className="self-start rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.14em]">TU CUPÓN ACTIVO</span>
          <span className="wt-heading text-[24px] font-bold leading-none">Café gratis</span>
          <span className="text-[11px] leading-snug opacity-85">Cada café suma un punto. El quinto va por la casa.</span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => <Stamp key={i} i={i} done={i < 3} />)}
          </div>
          <span className="text-[11px] font-bold">3 de 5 · te faltan 2</span>
          <span className="rounded-full bg-white py-2.5 text-center text-[12px] font-bold text-[#a8431f]">Mostrar mi QR</span>
        </div>
        <div className="flex items-baseline justify-between px-4 pb-1.5 pt-3.5">
          <span className="wt-heading text-[13px] font-bold text-[#2a1a14]">Menú</span>
          <span className="text-[10px] font-semibold text-[#8a7468]">Ver todo</span>
        </div>
        <div className="flex flex-col px-4">
          {[['Flat White', '$3.900'], ['Medialuna de manteca', '$1.100']].map(([n, p], i) => (
            <div key={n} className={`flex items-center gap-2.5 py-2.5 ${i === 0 ? 'border-b border-[#eee2d9]' : ''}`}>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[12px] font-semibold text-[#2a1a14]">{n}</span>
                <span className="wt-heading text-[12px] font-bold text-[#a8431f]">{p}</span>
              </div>
              <span className="h-10 w-10 rounded-[10px] bg-[#efe3d8]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HeroBento() {
  return (
    <>
      <section id="inicio" className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pb-20 lg:pt-20">
        <div className="wt-bg-blob" style={{ width: 520, height: 520, background: '#bff3ea', top: '-20%', right: '-10%' }} />
        <div className="wt-bg-blob" style={{ width: 420, height: 420, background: '#ffe3c2', bottom: '-25%', left: '-10%' }} />

        <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex max-w-[560px] flex-col gap-6">
            <span className="wt2-rise inline-flex items-center gap-2 self-start rounded-full border border-[var(--wt-border)] bg-[var(--wt-surface)] py-1.5 pl-2 pr-3.5 text-[13px] font-semibold text-[var(--wt-text)]" style={{ '--d': '0ms' }}>
              <span className="rounded-full bg-[var(--wt-mint)] px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-[var(--wt-ink)]">NUEVO</span>
              Cupones, puntos y menú en un solo lugar
            </span>
            <h1 className="wt-heading wt2-rise text-balance text-[clamp(46px,6.4vw,84px)] font-bold leading-[0.96] text-[var(--wt-ink)]" style={{ '--d': '80ms' }}>
              Con Wintuu <span className="text-[var(--wt-mint-dark)]">ganamos</span> todos.
            </h1>
            <p className="wt2-rise max-w-[480px] text-pretty text-[clamp(17px,1.5vw,20px)] leading-relaxed text-[var(--wt-muted)]" style={{ '--d': '160ms' }}>
              Tus clientes suman puntos en cada visita y vuelven por su premio. Vos lo manejás todo desde el celular: sin tarjetas de papel y sin que nadie descargue una app.
            </p>
            <div className="wt2-rise flex flex-wrap items-center gap-3" style={{ '--d': '240ms' }}>
              <Link
                to="/checkout"
                className="wt2-btn wt2-shine inline-flex items-center gap-2.5 rounded-full bg-[var(--wt-mint)] px-7 py-4 text-[16px] font-bold text-[var(--wt-ink)] shadow-[0_14px_30px_-12px_rgba(0,160,158,0.7)] hover:bg-[var(--wt-mint-light)]"
              >
                Crear la app de mi negocio <ArrowRight size={18} strokeWidth={2.4} className="wt2-arrow" />
              </Link>
              <a
                href="#como-funciona"
                className="wt2-btn inline-flex items-center rounded-full border-[1.5px] border-[var(--wt-border)] bg-[var(--wt-surface)] px-6 py-4 text-[16px] font-semibold text-[var(--wt-ink)] hover:border-[var(--wt-ink)]"
              >
                Ver cómo funciona
              </a>
            </div>
            <div className="wt2-rise flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-medium text-[var(--wt-muted)]" style={{ '--d': '320ms' }}>
              {TRUST.map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={16} strokeWidth={2.8} className="text-[var(--wt-mint-dark)]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center py-5">
            <div className="wt2-backdrop absolute inset-x-[8%] bottom-0 top-10 rounded-[48px] bg-gradient-to-br from-[#c9bbff] via-[#ffc4e1] to-[#ffe9a8] opacity-55" />
            <div className="wt2-pop-in relative" style={{ '--d': '200ms' }}>
              <PhoneMock />
            </div>

            {/* Flotantes: solo en pantallas donde no tapan el celular */}
            <div className="wt2-pop-in absolute right-[calc(50%+138px)] top-[400px] hidden sm:block" style={{ '--d': '1400ms' }}>
              <div className="wt2-float-a flex w-[220px] items-center gap-2.5 rounded-[20px] border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3.5 py-3 shadow-[0_20px_40px_-18px_rgba(8,40,44,0.35)]">
                <span className="wt2-ping flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--wt-yellow)] text-[13px] font-extrabold text-[#8a5a00]">+1</span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[var(--wt-ink)]">¡Sumaste un punto!</span>
                  <span className="text-[11.5px] text-[var(--wt-muted)]">Te faltan 2 para tu café gratis</span>
                </div>
              </div>
            </div>
            <div className="wt2-pop-in absolute bottom-10 left-[calc(50%+130px)] hidden sm:block" style={{ '--d': '1700ms' }}>
              <div className="wt2-float-b flex w-[210px] flex-col gap-2.5 rounded-[20px] bg-[#08282c] p-3.5 text-white shadow-[0_20px_40px_-18px_rgba(8,40,44,0.6)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.14em] text-[var(--wt-mint-light)]">PANEL · ESCANEADO</span>
                  <span className="wt2-blink h-2 w-2 rounded-full bg-[var(--wt-mint)]" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="wt-heading flex h-8 w-8 items-center justify-center rounded-full bg-[var(--wt-mint-light)] text-[13px] font-bold text-[var(--wt-ink)]">M</span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold">Mauro R.</span>
                    <span className="text-[11px] opacity-65">Café gratis · 3/5</span>
                  </div>
                </div>
                <span className="rounded-xl bg-[var(--wt-mint)] py-2 text-center text-[12px] font-bold text-[var(--wt-ink)]">✓ Punto sumado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rubros: marquesina */}
      <div className="wt2-marquee-wrap overflow-hidden border-y border-[var(--wt-border)] bg-[var(--wt-surface)] py-4">
        <div className="wt2-marquee flex w-max items-center gap-7">
          {[...RUBROS, ...RUBROS].map((r, i) => (
            <span key={i} className="flex items-center gap-7">
              <span className="wt-heading whitespace-nowrap text-[18px] font-bold text-[var(--wt-ink)]">{r}</span>
              <span className="text-[var(--wt-mint)]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
