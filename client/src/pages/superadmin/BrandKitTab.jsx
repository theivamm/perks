import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { CARD, EYEBROW } from './SuperAdmin.jsx';
import WintuuLogo from '../../components/landing/WintuuLogo.jsx';
import logoUrl from '../../assets/logo.svg';

/* ── Fuente única de verdad: tokens reales usados en wintuu-landing.css ── */
const PALETTE = [
  { group: 'Base', name: 'Fondo', token: '--wt-bg', value: '#fffbf5' },
  { group: 'Base', name: 'Superficie', token: '--wt-surface', value: '#ffffff' },
  { group: 'Base', name: 'Superficie elevada', token: '--wt-surface-raised', value: '#fff4e6' },
  { group: 'Marca', name: 'Menta', token: '--wt-mint', value: '#00cfcd' },
  { group: 'Marca', name: 'Menta claro', token: '--wt-mint-light', value: '#5fe4da' },
  { group: 'Marca', name: 'Menta oscuro', token: '--wt-mint-dark', value: '#007b79' },
  { group: 'Acento', name: 'Crema', token: '--wt-cream', value: '#fff3e2' },
  { group: 'Acento', name: 'Lila', token: '--wt-lilac', value: '#c9bbff' },
  { group: 'Acento', name: 'Rosa', token: '--wt-pink', value: '#ffc4e1' },
  { group: 'Acento', name: 'Amarillo', token: '--wt-yellow', value: '#ffe9a8' },
  { group: 'Texto', name: 'Texto principal', token: '--wt-text', value: '#16292a' },
  { group: 'Texto', name: 'Texto secundario', token: '--wt-muted', value: '#66787a' },
  { group: 'Texto', name: 'Tinta / fondo oscuro', token: '--wt-ink', value: '#08282c' },
];

const TYPE = [
  { use: 'Títulos (H1, H2, tarjetas)', family: 'Fredoka', weights: '500–700', note: 'Clase .wt-heading. Cargada desde Google Fonts.' },
  { use: 'Cuerpo, UI, botones', family: 'Inter', weights: '400–800', note: 'Tipografía por defecto de toda la app.' },
];

const LOGO_USAGE = [
  'Dejar siempre un margen libre alrededor de al menos el ancho de la "W" del isotipo.',
  'Sobre fondos oscuros (#08282c) usar la versión clara del logo.',
  'No estirar, rotar ni cambiarle el color fuera de esta guía.',
  'No pegarlo sobre fotos sin un respaldo oscuro detrás que lo mantenga legible.',
];

function useCopy() {
  const [copied, setCopied] = useState('');
  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied((c) => (c === value ? '' : c)), 1400);
    } catch {
      /* clipboard no disponible: se ignora */
    }
  };
  return [copied, copy];
}

function SwatchCard({ item, copied, onCopy }) {
  const isCopied = copied === item.value;
  return (
    <button
      type="button"
      onClick={() => onCopy(item.value)}
      className="group flex flex-col overflow-hidden rounded-[18px] border border-[rgba(20,36,37,0.08)] bg-white text-left transition hover:shadow-[0_10px_30px_-18px_rgba(8,40,44,.4)]"
    >
      <span className="block h-16 w-full" style={{ background: item.value }} />
      <span className="flex flex-col gap-0.5 px-3.5 py-3">
        <span className="text-[13px] font-bold text-[var(--wt-ink)]">{item.name}</span>
        <span className="flex items-center gap-1.5 font-mono text-[12px] text-[var(--wt-muted)]">
          {item.value}
          {isCopied ? <Check size={12} className="text-[var(--wt-mint-dark)]" /> : <Copy size={12} className="opacity-0 transition group-hover:opacity-100" />}
        </span>
        <span className="font-mono text-[11px] text-[var(--wt-muted)]/70">{item.token}</span>
      </span>
    </button>
  );
}

export default function BrandKitTab() {
  const [copied, copy] = useCopy();
  const groups = [...new Set(PALETTE.map((p) => p.group))];

  return (
    <div className="flex flex-col gap-6">
      {/* Logo */}
      <div className={`${CARD} p-5`}>
        <p className={EYEBROW}>LOGO</p>
        <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col items-center justify-center gap-4 rounded-[18px] bg-white p-8">
            <WintuuLogo height={32} />
            <span className="text-[12px] font-semibold text-[var(--wt-muted)]">Sobre fondo claro</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 rounded-[18px] bg-[#08282c] p-8">
            <WintuuLogo height={32} light />
            <span className="text-[12px] font-semibold text-white/60">Sobre fondo oscuro</span>
          </div>
        </div>
        <a
          href={logoUrl}
          download="wintuu-logo.svg"
          className="wt2-btn mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#08282c] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[var(--wt-mint-dark)]"
        >
          <Download size={15} /> Descargar SVG
        </a>
        <ul className="mt-4 flex flex-col gap-1.5">
          {LOGO_USAGE.map((line) => (
            <li key={line} className="flex gap-2 text-[13px] leading-relaxed text-[var(--wt-muted)]">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--wt-mint-dark)]" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* Paleta */}
      <div className={`${CARD} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={EYEBROW}>PALETA</p>
          <p className="text-[12.5px] text-[var(--wt-muted)]">Click en un color para copiar el hex</p>
        </div>
        <div className="mt-3.5 flex flex-col gap-4">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-2 text-[12.5px] font-bold text-[var(--wt-ink)]">{g}</p>
              <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
                {PALETTE.filter((p) => p.group === g).map((item) => (
                  <SwatchCard key={item.token} item={item} copied={copied} onCopy={copy} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tipografía */}
      <div className={`${CARD} p-5`}>
        <p className={EYEBROW}>TIPOGRAFÍA</p>
        <div className="mt-3.5 flex flex-col divide-y divide-[rgba(20,36,37,0.08)]">
          {TYPE.map((t) => (
            <div key={t.family} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-[24px] font-semibold text-[var(--wt-ink)]" style={{ fontFamily: `'${t.family}', 'Inter', sans-serif` }}>
                  {t.family}
                </p>
                <p className="mt-0.5 text-[13px] text-[var(--wt-muted)]">{t.use}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-bold text-[var(--wt-ink)]">Pesos {t.weights}</p>
                <p className="text-[12px] text-[var(--wt-muted)]">{t.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tono de voz */}
      <div className={`${CARD} p-5`}>
        <p className={EYEBROW}>TONO DE VOZ</p>
        <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[var(--wt-ink)]">Usar</p>
            <p className="text-[13.5px] leading-relaxed text-[var(--wt-muted)]">
              "tu negocio", "tus clientes", "creás", "elegís", "sumás", "podés". Frases breves, calmas y concretas. Voseo argentino.
            </p>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-bold text-[var(--wt-ink)]">Evitar</p>
            <p className="text-[13.5px] leading-relaxed text-[var(--wt-muted)]">
              "dispará tus ventas", "la solución definitiva", urgencias artificiales, testimonios o métricas inventadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
