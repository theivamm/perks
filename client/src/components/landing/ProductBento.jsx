const COUPONS = [
  ['15% OFF', '5 puntos', 'bg-[#e3f1fb] text-[#1d5a80]'],
  ['Café gratis', '8 puntos', 'bg-[#ffe9a8] text-[#7a4f00]'],
  ['$5.000', '10 puntos', 'bg-[#ffd9ea] text-[#9b1d5f]'],
];
const BRANDS = [
  ['Shanti-Chi', 'shanti-chi', '#6b33b1', 'from-[#6b33b1] to-[#512685]', false],
  ['Café Lúa', 'cafe-lua', '#c2562f', 'from-[#d0643b] to-[#a8431f]', false],
  ['Norte', 'norte', '#3fb27f', 'from-[#3fb27f] to-[#1f7a53]', true],
];
const CLIENTS = [
  ['L', 'Lucía M.', 80, '4/5', '#c9bbff'],
  ['T', 'Tomás G.', 40, '2/5', '#ffc4e1'],
];
const MENU = [['Flat White', '$3.900'], ['Cold Brew', '$3.900'], ['Cheesecake', '$4.200'], ['Tostado de campo', '$3.800']];

function Tile({ children, className = '', delay = 0 }) {
  return (
    <div className={`wt-reveal wt2-lift flex flex-col gap-6 rounded-[32px] p-6 sm:p-8 ${className}`} style={{ '--wt-delay': `${delay}ms` }}>
      {children}
    </div>
  );
}

function TileHead({ title, body, dark = false }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className={`wt-heading text-[24px] font-bold ${dark ? 'text-white' : 'text-[var(--wt-ink)]'}`}>{title}</h3>
      <p className={`text-[15px] leading-relaxed ${dark ? 'text-white/70' : 'text-[var(--wt-muted)]'}`}>{body}</p>
    </div>
  );
}

export default function ProductBento() {
  return (
    <section id="producto" className="px-4 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12">
        <div className="wt-reveal flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-[620px] flex-col gap-4">
            <p className="text-[12px] font-extrabold tracking-[0.18em] text-[var(--wt-mint-dark)]">PRODUCTO</p>
            <h2 className="wt-heading text-balance text-[clamp(36px,4.4vw,56px)] font-bold leading-none text-[var(--wt-ink)]">
              Cuidar a los que vienen siempre, de forma simple.
            </h2>
          </div>
          <p className="max-w-[400px] text-pretty text-[17px] leading-relaxed text-[var(--wt-muted)]">
            Un perfil con tu identidad, beneficios que elegís vos y un panel para llevarlos al día. Del otro lado, tus clientes encuentran sus puntos, sus premios y tu menú.
          </p>
        </div>

        <div className="grid gap-[18px] lg:grid-cols-2">
          <Tile className="border border-[var(--wt-border)] bg-[var(--wt-surface)]">
            <TileHead title="Los beneficios los elegís vos." body="Un porcentaje, un monto de descuento o un regalo. Vos definís cuántos puntos hacen falta." />
            <div className="grid grid-cols-3 gap-2.5">
              {COUPONS.map(([v, pts, cls], i) => (
                <div key={v} className="wt2-tilt overflow-hidden rounded-[20px] border border-[var(--wt-border)] bg-[var(--wt-surface)]" style={{ transitionDelay: `${i * 30}ms` }}>
                  <div className={`wt-heading px-3.5 py-3.5 text-[clamp(17px,1.8vw,22px)] font-bold leading-none ${cls}`}>{v}</div>
                  <div className="px-3.5 py-2.5 text-[12px] font-semibold text-[var(--wt-muted)]">{pts}</div>
                </div>
              ))}
            </div>
          </Tile>

          <Tile className="bg-[var(--wt-surface-raised)]" delay={80}>
            <TileHead title="Tu negocio, con tu identidad." body="Tu nombre, tu logo y tus colores, con modo claro y oscuro. Y un enlace propio para compartir." />
            <div className="grid grid-cols-3 gap-2.5">
              {BRANDS.map(([name, slug, dot, grad, dark]) => (
                <div
                  key={slug}
                  className={`wt2-tilt flex flex-col gap-2.5 rounded-[20px] p-3 shadow-[0_10px_24px_-18px_rgba(8,40,44,0.4)] ${dark ? 'bg-[#15201b]' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="h-[22px] w-[22px] shrink-0 rounded-full" style={{ background: dot }} />
                    <span className={`wt-heading truncate text-[12px] font-bold ${dark ? 'text-[#e8f3ee]' : 'text-[#221729]'}`}>{name}</span>
                  </div>
                  <div className={`h-[46px] rounded-xl bg-gradient-to-br ${grad}`} />
                  <span className={`truncate text-[10px] ${dark ? 'text-[#8fa79c]' : 'text-[var(--wt-muted)]'}`}>wintuu.com/{slug}</span>
                </div>
              ))}
            </div>
          </Tile>

          <Tile className="bg-[#08282c]" delay={0}>
            <TileHead dark title="Un panel para llevarlo al día." body="Escaneás el QR del cliente y el punto se suma al instante. Ves quién está por llegar a su premio." />
            <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06] text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="text-[13px] font-bold">Clientes</span>
                <span className="rounded-full bg-[var(--wt-mint)] px-3 py-1.5 text-[11px] font-bold text-[#08282c]">Escanear QR</span>
              </div>
              {CLIENTS.map(([ini, name, pct, lbl, bg]) => (
                <div key={name} className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
                  <span className="wt-heading flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-[#08282c]" style={{ background: bg }}>{ini}</span>
                  <span className="flex-1 text-[13px] font-semibold">{name}</span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                    <div className="wt2-bar h-full rounded-full bg-[var(--wt-mint-light)]" style={{ '--w': `${pct}%` }} />
                  </div>
                  <span className="w-7 text-right text-[11px] font-semibold opacity-70">{lbl}</span>
                </div>
              ))}
              <div className="flex items-center gap-2.5 px-4 py-3">
                <span className="wt-heading flex h-7 w-7 items-center justify-center rounded-full bg-[#ffe9a8] text-[11px] font-bold text-[#08282c]">S</span>
                <span className="flex-1 text-[13px] font-semibold">Sofía P.</span>
                <span className="wt2-blink rounded-full bg-[rgba(95,228,218,0.18)] px-2.5 py-1 text-[11px] font-bold text-[var(--wt-mint-light)]">Listo para canjear</span>
              </div>
            </div>
          </Tile>

          <Tile className="border border-[var(--wt-border)] bg-[var(--wt-surface)]" delay={80}>
            <TileHead title="Y tu menú, también." body="Productos, fotos, precios y ofertas del día. Si falta una foto, la generás con IA en un toque." />
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-3">
              <div className="wt2-tilt flex flex-col overflow-hidden rounded-[20px] border border-[#f5d38a]">
                <div className="relative h-24 bg-[#f3eadf]">
                  <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-[#f5b33a] to-[#f07a2a] px-2 py-0.5 text-[10px] font-extrabold text-white">−30% OFF</span>
                </div>
                <div className="flex flex-col gap-0.5 px-3 py-2.5">
                  <span className="wt-heading text-[14px] font-bold text-[var(--wt-ink)]">Caramel Latté</span>
                  <span className="wt-heading text-[14px] font-bold text-[var(--wt-mint-dark)]">
                    $2.590 <span className="font-sans text-[11px] font-medium text-[var(--wt-muted)] line-through">$3.700</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                {MENU.map(([n, p], i) => (
                  <div key={n} className={`flex justify-between py-2.5 ${i < MENU.length - 1 ? 'border-b border-[var(--wt-border)]' : ''}`}>
                    <span className="text-[13px] font-semibold text-[var(--wt-text)]">{n}</span>
                    <span className="wt-heading text-[13px] font-bold text-[var(--wt-mint-dark)]">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
