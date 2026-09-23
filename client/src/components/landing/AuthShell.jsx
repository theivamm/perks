import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ScanLine } from 'lucide-react';
import '../../styles/wintuu-landing.css';
import '../../styles/wintuu-landing-v2.css';
import WintuuLogo from './WintuuLogo.jsx';

/**
 * Carcasa común para /ingresar, /checkout y /comenzar.
 * Izquierda: el formulario (children). Derecha (desktop): panel oscuro de marca con una escena animada.
 * variant: 'client' | 'admin' | 'plan' | 'business'
 */
export default function AuthShell({ children, variant = 'client', back = '/', backLabel = 'Volver', wide = false, steps, step }) {
  return (
    <div className="wintuu-landing relative min-h-screen bg-[var(--wt-bg)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="relative flex min-h-screen flex-col overflow-hidden px-5 py-6 sm:px-10">
        <div className="wt-bg-blob" style={{ width: 360, height: 360, background: '#bff3ea', top: '-10%', left: '-12%', opacity: 0.6 }} />
        <header className="wt2-rise relative flex items-center justify-between">
          <Link to={back} className="wt2-btn inline-flex items-center gap-2 rounded-full border border-[var(--wt-border)] bg-[var(--wt-surface)] px-4 py-2 text-[13.5px] font-semibold text-[var(--wt-ink)] hover:border-[var(--wt-ink)]">
            <ArrowLeft size={15} /> {backLabel}
          </Link>
          <WintuuLogo height={22} />
        </header>

        <div className={`relative mx-auto flex w-full flex-1 flex-col justify-center py-10 ${wide ? 'max-w-[640px]' : 'max-w-[440px]'}`}>
          {steps && (
            <ol className="wt2-rise mb-8 flex items-center gap-2" style={{ '--d': '60ms' }} aria-label="Pasos">
              {steps.map((label, i) => {
                const n = i + 1;
                const done = n < step;
                const on = n === step;
                return (
                  <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold transition ${
                        done ? 'bg-[var(--wt-mint)] text-[#08282c]' : on ? 'bg-[#08282c] text-white' : 'border-[1.5px] border-[var(--wt-border)] text-[var(--wt-muted)]'
                      }`}
                    >
                      {done ? <Check size={14} strokeWidth={3} /> : n}
                    </span>
                    <span className={`truncate text-[12.5px] font-bold ${on ? 'text-[var(--wt-ink)]' : 'text-[var(--wt-muted)]'}`}>{label}</span>
                    {i < steps.length - 1 && (
                      <span className="h-[2px] min-w-4 flex-1 overflow-hidden rounded-full bg-[var(--wt-border)]">
                        <span className="block h-full bg-[var(--wt-mint)] transition-[width] duration-700" style={{ width: done ? '100%' : '0%' }} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
          <div className="wt2-rise" style={{ '--d': '120ms' }}>{children}</div>
        </div>

        <p className="relative text-center text-[12px] text-[var(--wt-muted)]">© {new Date().getFullYear()} Wintuu · Con Wintuu ganamos todos.</p>
      </section>

      <Showcase variant={variant} />
    </div>
  );
}

const COPY = {
  client: ['Tus premios y negocios, siempre en un mismo lugar.', 'Consultá puntos, cupones y beneficios sin instalar ninguna aplicación.'],
  admin: ['Tu negocio, al día desde el celular.', 'Escaneás, sumás puntos y validás canjes en segundos.'],
  plan: ['Tus clientes vuelven cuando los recompensás.', 'Cupones, puntos y menú digital. Sin apps que instalar y sin comisiones por venta.'],
  business: ['En minutos, tu app está en línea.', 'Elegí el nombre y el enlace. Después cargás tu menú y tu primer cupón.'],
};

function Showcase({ variant }) {
  const [title, sub] = COPY[variant] || COPY.client;
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#08282c] p-12 text-white lg:flex lg:flex-col lg:justify-center">
      <div className="wt-bg-blob" style={{ width: 460, height: 460, background: '#00cfcd', top: '-18%', right: '-14%', opacity: 0.28 }} />
      <div className="wt-bg-blob" style={{ width: 380, height: 380, background: '#c9bbff', bottom: '-16%', left: '-10%', opacity: 0.22 }} />
      <div className="relative mx-auto flex w-full max-w-[460px] flex-col gap-10">
        <div className="relative h-[330px]">{variant === 'admin' ? <AdminScene /> : variant === 'business' ? <BusinessScene /> : <ClientScene />}</div>
        <div className="wt2-rise flex flex-col gap-3" style={{ '--d': '300ms' }}>
          <p className="wt-heading text-balance text-[clamp(30px,2.8vw,40px)] font-bold leading-[1.05]">{title}</p>
          <p className="max-w-[400px] text-[16px] leading-relaxed text-white/70">{sub}</p>
        </div>
      </div>
    </aside>
  );
}

function Stamps({ filled = 3, total = 5, base = 700 }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }, (_, i) =>
        i < filled ? (
          <span key={i} className="wt2-stamp wt2-stamp-hero flex h-9 w-9 items-center justify-center rounded-full bg-[#ffd166] text-[13px] font-extrabold text-[#2a1a14]" style={{ '--i': i, '--base': `${base}ms` }}>
            ✓
          </span>
        ) : (
          <span key={i} className="h-9 w-9 rounded-full border-2 border-dashed border-white/40" />
        )
      )}
    </div>
  );
}

function ClientScene() {
  return (
    <>
      <div className="wt2-pop-in absolute left-0 top-6 w-[340px]" style={{ '--d': '150ms' }}>
        <div className="wt2-float-a flex flex-col gap-3 rounded-[28px] bg-gradient-to-br from-[#d0643b] to-[#a8431f] p-6 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]">
          <span className="self-start rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold tracking-[0.14em]">CAFÉ LÚA · TU CUPÓN</span>
          <span className="wt-heading text-[32px] font-bold leading-none">Café gratis</span>
          <Stamps />
          <span className="text-[13px] font-bold">3 de 5 · te faltan 2</span>
        </div>
      </div>
      <div className="wt2-pop-in absolute bottom-6 right-0 w-[250px]" style={{ '--d': '1300ms' }}>
        <div className="wt2-float-b flex items-center gap-3 rounded-[22px] bg-white p-4 text-[#08282c] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]">
          <span className="wt2-ping flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffe9a8] text-[14px] font-extrabold text-[#8a5a00]">+1</span>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold">¡Sumaste un punto!</span>
            <span className="text-[12px] text-[#66787a]">Shanti-Chi · 15% OFF</span>
          </div>
        </div>
      </div>
      <div className="wt2-pop-in absolute right-6 top-0" style={{ '--d': '900ms' }}>
        <span className="wt2-float-b inline-flex items-center gap-1.5 rounded-full bg-[var(--wt-mint)] px-3.5 py-2 text-[12px] font-extrabold text-[#08282c]">🎉 Premio listo</span>
      </div>
    </>
  );
}

function AdminScene() {
  const rows = [['L', 'Lucía M.', 80, '#c9bbff'], ['T', 'Tomás G.', 40, '#ffc4e1'], ['S', 'Sofía P.', 100, '#ffe9a8']];
  return (
    <>
      <div className="wt2-pop-in absolute left-0 top-4 w-[360px]" style={{ '--d': '150ms' }}>
        <div className="wt2-float-a overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.06] backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
            <span className="text-[14px] font-bold">Clientes</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--wt-mint)] px-3 py-1.5 text-[11px] font-bold text-[#08282c]"><ScanLine size={13} /> Escanear QR</span>
          </div>
          {rows.map(([ini, name, pct, bg], i) => (
            <div key={name} className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3 last:border-0">
              <span className="wt-heading flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold text-[#08282c]" style={{ background: bg }}>{ini}</span>
              <span className="flex-1 text-[13px] font-semibold">{name}</span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[var(--wt-mint-light)] transition-[width] duration-1000" style={{ width: `${pct}%`, transitionDelay: `${500 + i * 150}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="wt2-pop-in absolute bottom-2 right-0 w-[230px]" style={{ '--d': '1200ms' }}>
        <div className="wt2-float-b flex flex-col gap-2 rounded-[22px] bg-white p-4 text-[#08282c] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]">
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#007b79]"><span className="wt2-blink h-2 w-2 rounded-full bg-[var(--wt-mint)]" />ESCANEADO</span>
          <span className="text-[14px] font-bold">Mauro R. · +1 punto</span>
          <span className="rounded-xl bg-[var(--wt-mint)] py-2 text-center text-[12px] font-bold">✓ Punto sumado</span>
        </div>
      </div>
    </>
  );
}

function BusinessScene() {
  return (
    <>
      <div className="wt2-pop-in absolute left-0 top-2 w-[330px]" style={{ '--d': '150ms' }}>
        <div className="wt2-float-a flex flex-col gap-3 rounded-[28px] bg-white p-5 text-[#08282c] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2.5">
            <span className="wt-heading flex h-10 w-10 items-center justify-center rounded-full bg-[#6b33b1] text-[14px] font-bold text-white">TN</span>
            <div className="flex flex-col">
              <span className="wt-heading text-[17px] font-bold">Tu negocio</span>
              <span className="text-[12px] text-[#66787a]">wintuu.com/tu-negocio</span>
            </div>
          </div>
          <div className="h-20 rounded-2xl bg-gradient-to-br from-[#6b33b1] to-[#512685]" />
          <div className="flex gap-2">
            {['#6b33b1', '#c2562f', '#3fb27f', '#00cfcd', '#e0457b'].map((c, i) => (
              <span key={c} className="wt2-stamp wt2-stamp-hero h-7 w-7 rounded-full ring-2 ring-white" style={{ background: c, '--i': i, '--base': '600ms' }} />
            ))}
          </div>
        </div>
      </div>
      <div className="wt2-pop-in absolute bottom-4 right-0 w-[240px]" style={{ '--d': '1200ms' }}>
        <div className="wt2-float-b flex flex-col gap-2 rounded-[22px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
          {['Nombre y enlace', 'Tu primer cupón', 'Tu menú'].map((t, i) => (
            <span key={t} className="flex items-center gap-2 text-[13px] font-semibold">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${i === 0 ? 'bg-[var(--wt-mint)] text-[#08282c]' : 'border border-white/30'}`}>{i === 0 ? '✓' : i + 1}</span>
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37.4 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

// Estilos compartidos para inputs y botones de estas pantallas.
export const inputCls =
  'w-full rounded-2xl border-[1.5px] border-[var(--wt-border)] bg-[var(--wt-surface)] py-3.5 pl-11 pr-4 text-[15px] font-medium text-[var(--wt-text)] outline-none transition placeholder:text-[var(--wt-muted)]/70 focus:border-[var(--wt-mint)] focus:ring-4 focus:ring-[var(--wt-mint)]/15';
export const primaryBtn =
  'wt2-btn wt2-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#08282c] px-6 py-4 text-[15px] font-bold text-white shadow-[0_14px_30px_-14px_rgba(8,40,44,0.7)] hover:bg-[var(--wt-mint-dark)] disabled:pointer-events-none disabled:opacity-50';
export const mintBtn =
  'wt2-btn wt2-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--wt-mint)] px-6 py-4 text-[15px] font-bold text-[#08282c] shadow-[0_14px_30px_-12px_rgba(0,160,158,0.7)] hover:bg-[var(--wt-mint-light)] disabled:pointer-events-none disabled:opacity-50';
export const googleBtn =
  'wt2-btn flex w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-[var(--wt-border)] bg-[var(--wt-surface)] px-6 py-4 text-[15px] font-bold text-[var(--wt-ink)] shadow-sm hover:border-[var(--wt-ink)] disabled:opacity-60';
