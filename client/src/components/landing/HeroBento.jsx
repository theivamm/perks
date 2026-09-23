import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

const TRUST = ['Listo en una tarde', 'Menú digital incluido', 'Pago con Mercado Pago'];
const RUBROS = ['Cafeterías', 'Panaderías', 'Heladerías', 'Barberías', 'Estética', 'Tiendas de barrio', 'Pastelerías', 'Veterinarias'];

// Una escena por rubro: la app se "desarma y arma" mostrando otro negocio y otro
// tipo de cupón (sellos, % OFF, monto fijo, servicio a consultar).
const SCENES = [
  {
    brand: 'Café Lúa', sub: 'Tostadores · Palermo', initials: 'CL',
    grad: 'from-[#d0643b] to-[#a8431f]', chip: '#c2562f', accent: '#a8431f',
    badge: 'TU CUPÓN ACTIVO', kind: 'stamps', title: 'Café gratis',
    desc: 'Cada café suma un punto. El quinto va por la casa.', total: 5, done: 3, note: '3 de 5 · te faltan 2',
    listTitle: 'Menú', items: [['Flat White', '$3.900'], ['Medialuna de manteca', '$1.100']],
    toast: { label: '+1', title: '¡Sumaste un punto!', sub: 'Te faltan 2 para tu café gratis' },
    scan: { name: 'Mauro R.', sub: 'Café gratis · 3/5' },
  },
  {
    brand: 'Fade Barber', sub: 'Barbería · Belgrano', initials: 'FB',
    grad: 'from-[#3a4a6b] to-[#1e2740]', chip: '#3a4a6b', accent: '#2a3654',
    badge: 'TU CUPÓN ACTIVO', kind: 'percent', title: '20% OFF', pct: '20%',
    desc: 'En tu próximo corte, presentando este cupón.', note: 'Válido una vez por cliente',
    listTitle: 'Servicios', items: [['Corte + barba', '45 min'], ['Color', '1 h 10 min']],
    toast: { label: '✓', title: 'Turno confirmado', sub: 'Corte + barba · hoy 18:30' },
    scan: { name: 'Nico B.', sub: 'Cupón 20% aplicado' },
  },
  {
    brand: 'Dulce Trigo', sub: 'Pastelería · Núñez', initials: 'DT',
    grad: 'from-[#d68fb8] to-[#a8437e]', chip: '#c2618f', accent: '#a8437e',
    badge: 'TU CUPÓN ACTIVO', kind: 'fixed', title: '$5.000', amount: '$5.000',
    desc: 'De descuento en compras arriba de $20.000.', note: 'Vence en 15 días',
    listTitle: 'Catálogo', items: [['Torta Rogel', 'x 12 porciones'], ['Budín de limón', '$4.800']],
    toast: { label: '🎉', title: '¡Nuevo cupón!', sub: '$5.000 de descuento para vos' },
    scan: { name: 'Carla M.', sub: '$5.000 canjeados' },
  },
  {
    brand: 'Huellas Vet', sub: 'Veterinaria · Colegiales', initials: 'HV',
    grad: 'from-[#5a9b7a] to-[#2f6b4d]', chip: '#4d8a6c', accent: '#2f6b4d',
    badge: 'TU CUPÓN ACTIVO', kind: 'ask', title: 'Baño y corte',
    desc: 'Coordiná el turno por WhatsApp con el precio según tu mascota.', note: 'Precio a consultar',
    listTitle: 'Servicios', items: [['Baño y corte', 'A consultar'], ['Vacuna antirrábica', '45 min']],
    toast: { label: '🐾', title: 'Turno reservado', sub: 'Baño y corte · con Sol' },
    scan: { name: 'Sol G.', sub: 'Reserva por WhatsApp' },
  },
];
const SCENE_MS = 4200;

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

function CouponBody({ s }) {
  if (s.kind === 'stamps') {
    return (
      <>
        <div className="flex gap-1.5">
          {Array.from({ length: s.total }).map((_, i) => <Stamp key={i} i={i} done={i < s.done} />)}
        </div>
        <span className="text-[11px] font-bold">{s.note}</span>
      </>
    );
  }
  if (s.kind === 'percent' || s.kind === 'fixed') {
    return (
      <>
        <span className="wt-heading text-[40px] font-bold leading-none">{s.kind === 'percent' ? s.pct : s.amount}</span>
        <span className="text-[11px] font-bold opacity-90">{s.note}</span>
      </>
    );
  }
  return <span className="text-[11px] font-bold opacity-90">{s.note}</span>;
}

function PhoneMock({ s, fading }) {
  return (
    <div className="wt2-phone relative h-[610px] w-[300px] rounded-[46px] bg-[#0c1a1c] p-2.5 shadow-[0_40px_80px_-30px_rgba(8,40,44,0.55)]">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[37px] bg-[#fbf6f2]">
        <div className="flex h-9 shrink-0 items-center justify-between px-[22px] text-[12px] font-semibold text-[#16292a]">
          <span>9:41</span>
          <span className="h-[18px] w-[60px] rounded-full bg-[#0c1a1c]" />
          <span className="h-2.5 w-5 rounded-[3px] border-[1.5px] border-[#16292a]" />
        </div>
        <div className={`flex flex-1 flex-col transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-2.5 px-4 pb-3 pt-1.5">
            <span className="wt-heading flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: s.chip }}>{s.initials}</span>
            <div className="flex flex-col">
              <span className="wt-heading text-[15px] font-bold leading-tight text-[#2a1a14]">{s.brand}</span>
              <span className="text-[10px] font-medium text-[#8a7468]">{s.sub}</span>
            </div>
          </div>
          <div className={`mx-3 flex flex-col gap-2.5 rounded-[22px] bg-gradient-to-br ${s.grad} p-4 text-white`}>
            <span className="self-start rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.14em]">{s.badge}</span>
            <span className="wt-heading text-[24px] font-bold leading-none">{s.title}</span>
            <span className="text-[11px] leading-snug opacity-85">{s.desc}</span>
            <CouponBody s={s} />
            <span className="rounded-full bg-white py-2.5 text-center text-[12px] font-bold" style={{ color: s.accent }}>
              {s.kind === 'ask' ? 'Reservar por WhatsApp' : 'Mostrar mi QR'}
            </span>
          </div>
          <div className="flex items-baseline justify-between px-4 pb-1.5 pt-3.5">
            <span className="wt-heading text-[13px] font-bold text-[#2a1a14]">{s.listTitle}</span>
            <span className="text-[10px] font-semibold text-[#8a7468]">Ver todo</span>
          </div>
          <div className="flex flex-col px-4">
            {s.items.map(([n, p], i) => (
              <div key={n} className={`flex items-center gap-2.5 py-2.5 ${i === 0 ? 'border-b border-[#eee2d9]' : ''}`}>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[12px] font-semibold text-[#2a1a14]">{n}</span>
                  <span className="wt-heading text-[12px] font-bold" style={{ color: s.accent }}>{p}</span>
                </div>
                <span className="h-10 w-10 rounded-[10px] bg-[#efe3d8]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroBento() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % SCENES.length);
        setFading(false);
      }, 220);
    }, SCENE_MS);
    return () => clearInterval(timer);
  }, []);

  const s = SCENES[idx];

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
            <div
              className="wt2-backdrop absolute inset-x-[8%] bottom-0 top-10 rounded-[48px] opacity-55 transition-colors duration-500"
              style={{ backgroundImage: `linear-gradient(135deg, ${s.chip}55, #ffc4e1, #ffe9a8)` }}
            />
            <div className="wt2-pop-in relative" style={{ '--d': '200ms' }}>
              <PhoneMock s={s} fading={fading} />
            </div>

            {/* Flotantes: solo en pantallas donde no tapan el celular */}
            <div className="wt2-pop-in absolute right-[calc(50%+138px)] top-[400px] hidden sm:block" style={{ '--d': '1400ms' }}>
              <div className={`wt2-float-a flex w-[220px] items-center gap-2.5 rounded-[20px] border border-[var(--wt-border)] bg-[var(--wt-surface)] px-3.5 py-3 shadow-[0_20px_40px_-18px_rgba(8,40,44,0.35)] transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>
                <span className="wt2-ping flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--wt-yellow)] text-[13px] font-extrabold text-[#8a5a00]">{s.toast.label}</span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[var(--wt-ink)]">{s.toast.title}</span>
                  <span className="text-[11.5px] text-[var(--wt-muted)]">{s.toast.sub}</span>
                </div>
              </div>
            </div>
            <div className="wt2-pop-in absolute bottom-10 left-[calc(50%+130px)] hidden sm:block" style={{ '--d': '1700ms' }}>
              <div className={`wt2-float-b flex w-[210px] flex-col gap-2.5 rounded-[20px] bg-[#08282c] p-3.5 text-white shadow-[0_20px_40px_-18px_rgba(8,40,44,0.6)] transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.14em] text-[var(--wt-mint-light)]">PANEL · ESCANEADO</span>
                  <span className="wt2-blink h-2 w-2 rounded-full bg-[var(--wt-mint)]" />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="wt-heading flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold" style={{ background: 'var(--wt-mint-light)', color: 'var(--wt-ink)' }}>{s.scan.name[0]}</span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold">{s.scan.name}</span>
                    <span className="text-[11px] opacity-65">{s.scan.sub}</span>
                  </div>
                </div>
                <span className="rounded-xl bg-[var(--wt-mint)] py-2 text-center text-[12px] font-bold text-[var(--wt-ink)]">✓ Punto sumado</span>
              </div>
            </div>

            {/* Puntos indicadores de la escena actual */}
            <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-1.5">
              {SCENES.map((sc, i) => (
                <span key={sc.brand} className="h-1.5 w-1.5 rounded-full transition-all duration-300" style={{ background: i === idx ? 'var(--wt-ink)' : 'var(--wt-border)', width: i === idx ? 16 : 6 }} />
              ))}
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
