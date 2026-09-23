import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, RotateCw } from 'lucide-react';
import { api } from '../../api.js';

const PLAN_COPY = {
  mensual: {
    name: 'Mensual',
    aclaracion: 'ARS · por mes',
    suffix: ' /mes',
    description: 'Para sumar Wintuu al día a día de tu negocio, mes a mes. Cancelás la renovación cuando quieras.',
    cta: 'Continuar con el mensual',
  },
  vitalicia: {
    name: 'De por vida',
    aclaracion: 'ARS · pago único',
    suffix: '',
    description: 'Un único pago para seguir usando Wintuu sin una cuota mensual.',
    cta: 'Continuar con el de por vida',
  },
};
const PLAN_ORDER = ['mensual', 'vitalicia'];
const SHARED = [
  'Perfil con tu nombre, logo, colores y enlace',
  'Panel de administración',
  'Cupones con metas de puntos',
  'Progreso de clientes y validación de canjes',
  'Menú digital con fotos generadas por IA',
];
const WA = 'https://wa.me/541161120433?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Wintuu.';
const fmtPrice = (v) => `$${Number(v || 0).toLocaleString('es-AR')}`;

export default function PricingSection() {
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api('/api/plans')
      .then((d) => setPlans(d.plans || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const byId = (id) => plans?.find((p) => p.id === id);
  const monthly = Number(byId('mensual')?.price) || 0;
  const lifetime = Number(byId('vitalicia')?.price) || 0;
  const months = monthly > 0 && lifetime > 0 ? Math.round(lifetime / monthly) : 0;

  return (
    <section id="planes" className="px-4 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-10">
        <div className="wt-reveal flex flex-col items-center gap-4 text-center">
          <p className="text-[12px] font-extrabold tracking-[0.18em] text-[var(--wt-mint-dark)]">PLANES</p>
          <h2 className="wt-heading text-balance text-[clamp(36px,4.4vw,56px)] font-bold leading-none text-[var(--wt-ink)]">Elegí cómo acompañar a tu negocio.</h2>
          <p className="max-w-[520px] text-[17px] leading-relaxed text-[var(--wt-muted)]">
            Las mismas herramientas en los dos planes. Solo cambia cómo pagás: mes a mes o una única vez.
          </p>
        </div>

        {error ? (
          <div className="wt-reveal mx-auto flex max-w-md flex-col items-center gap-4 rounded-[28px] border border-[var(--wt-border)] bg-[var(--wt-surface)] p-8 text-center">
            <p className="text-[15px] text-[var(--wt-muted)]">No pudimos cargar los precios en este momento.</p>
            <button type="button" onClick={load} className="wt2-btn inline-flex items-center gap-2 rounded-full border border-[var(--wt-border)] px-5 py-2.5 text-sm font-semibold text-[var(--wt-ink)]">
              <RotateCw size={15} /> Reintentar
            </button>
          </div>
        ) : (
          <div className="grid gap-[18px] md:grid-cols-2">
            {PLAN_ORDER.map((id, i) => {
              const plan = byId(id);
              const copy = PLAN_COPY[id];
              const featured = id === 'vitalicia';
              const disabled = loading || !plan;
              return (
                <div
                  key={id}
                  className={`wt-reveal wt2-lift relative flex flex-col gap-5 rounded-[32px] p-7 sm:p-9 ${
                    featured
                      ? 'bg-[#08282c] text-white shadow-[0_30px_60px_-30px_rgba(8,40,44,0.7)]'
                      : 'border border-[var(--wt-border)] bg-[var(--wt-surface)] text-[var(--wt-ink)]'
                  }`}
                  style={{ '--wt-delay': `${i * 90}ms` }}
                >
                  {featured && (
                    <span className="absolute right-6 top-6 rounded-full bg-[var(--wt-yellow)] px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-[#7a4f00]">PAGÁS UNA VEZ</span>
                  )}
                  <div className="flex flex-col gap-1">
                    <p className="wt-heading text-[24px] font-bold">{plan?.name || copy.name}</p>
                    <p className={`text-[13px] ${featured ? 'text-white/60' : 'text-[var(--wt-muted)]'}`}>{copy.aclaracion}</p>
                  </div>
                  <div className="h-[56px]">
                    {loading ? (
                      <div className={`h-12 w-40 animate-pulse rounded-xl ${featured ? 'bg-white/10' : 'bg-black/[0.06]'}`} />
                    ) : (
                      <p className="wt-heading text-[52px] font-bold leading-none">
                        {plan ? fmtPrice(plan.price) : '—'}
                        {copy.suffix && <span className={`font-sans text-[16px] font-medium ${featured ? 'text-white/60' : 'text-[var(--wt-muted)]'}`}>{copy.suffix}</span>}
                      </p>
                    )}
                  </div>
                  <p className={`text-[15px] leading-relaxed ${featured ? 'text-white/75' : 'text-[var(--wt-muted)]'}`}>
                    {copy.description}
                    {featured && months > 1 && ` Equivale a ${months} meses.`}
                  </p>
                  <Link
                    to={disabled ? '#planes' : `/checkout?plan=${id}`}
                    aria-disabled={disabled}
                    onClick={(e) => disabled && e.preventDefault()}
                    className={`wt2-btn mt-auto inline-flex items-center justify-center gap-2 rounded-full py-4 text-[15px] font-bold ${
                      featured
                        ? 'wt2-shine bg-[var(--wt-mint)] text-[#08282c] hover:bg-[var(--wt-mint-light)]'
                        : 'border-[1.5px] border-[var(--wt-ink)] text-[var(--wt-ink)] hover:bg-[var(--wt-ink)] hover:text-white'
                    }`}
                  >
                    {copy.cta} <ArrowRight size={16} className="wt2-arrow" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="wt-reveal flex flex-col gap-4 rounded-[28px] bg-[var(--wt-surface-raised)] p-6 sm:p-8">
          <p className="wt-heading text-[16px] font-bold text-[var(--wt-ink)]">Incluido en los dos planes</p>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {SHARED.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-[14.5px] text-[var(--wt-text)]">
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--wt-mint)] text-[#08282c]">
                  <Check size={13} strokeWidth={3} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="wt-reveal text-center text-[14px] text-[var(--wt-muted)]">
          Pagás con Mercado Pago y configurás tu negocio en el momento.{' '}
          <a href={WA} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--wt-mint-dark)] underline underline-offset-4">
            ¿Dudas sobre los planes? Escribinos.
          </a>
        </p>
      </div>
    </section>
  );
}
