import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, RotateCw } from 'lucide-react';
import { api } from '../../api.js';

const PLAN_COPY = {
  mensual: {
    description: 'Para sumar Wintuu al día a día de tu negocio, mes a mes.',
    aclaracion: 'ARS · por mes',
    cta: 'Continuar con el mensual',
    micro: 'Suscripción mensual con renovación automática.',
  },
  vitalicia: {
    description: 'Un único pago para seguir usando Wintuu sin una cuota mensual.',
    aclaracion: 'ARS · pago único',
    cta: 'Continuar con el de por vida',
    micro: 'Acceso de por vida, con un pago único.',
  },
};

const PLAN_ORDER = ['mensual', 'vitalicia'];

const SHARED = [
  'Perfil con tu nombre, logo, colores y enlace',
  'Panel de administración',
  'Cupones con metas de puntos',
  'Progreso de clientes y validación de canjes',
  'Menú digital incluido',
];

function fmtPrice(value) {
  return `$${Number(value || 0).toLocaleString('es-AR')}`;
}

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

  useEffect(() => {
    load();
  }, [load]);

  const byId = (id) => plans?.find((p) => p.id === id);

  return (
    <section id="planes" className="relative overflow-hidden px-4 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
      <div className="wt-bg-blob" style={{ width: 380, height: 380, background: '#bff3ea', top: '-6%', right: '-8%' }} />

      <div className="relative mx-auto max-w-[1280px]">
        <div className="wt-reveal mx-auto max-w-2xl text-center">
          <p className="wt-eyebrow justify-center">Planes</p>
          <h2 className="wt-h2 mt-5 text-[var(--wt-text)]">Elegí cómo acompañar a tu negocio.</h2>
          <p className="wt-body mx-auto mt-5">
            Las mismas herramientas, con dos formas de usar Wintuu: mes a mes o con un único pago.
          </p>
        </div>

        {error && (
          <div className="wt-reveal wt-glass mx-auto mt-10 flex max-w-md flex-col items-center gap-4 p-8 text-center">
            <p className="text-[15px] text-[var(--wt-muted)]">No pudimos cargar los precios en este momento.</p>
            <button type="button" onClick={load} className="wt-btn-ghost">
              <RotateCw size={15} /> Reintentar
            </button>
          </div>
        )}

        {!error && (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {PLAN_ORDER.map((id, i) => {
              const plan = byId(id);
              const copy = PLAN_COPY[id];
              const featured = id === 'vitalicia';
              return (
                <div
                  key={id}
                  className="wt-glass wt-reveal flex flex-col p-8 sm:p-9"
                  style={{
                    '--wt-delay': `${i * 80}ms`,
                    borderColor: featured ? 'rgba(0,207,205,0.38)' : undefined,
                  }}
                >
                  <p className="wt-h3 text-[var(--wt-text)]">{plan?.name || (id === 'mensual' ? 'Mensual' : 'De por vida')}</p>
                  <p className="mt-1 text-[13px] text-[var(--wt-muted)]">{copy.aclaracion}</p>

                  <div className="mt-6 h-[56px]">
                    {loading ? (
                      <div className="h-10 w-32 animate-pulse rounded-lg bg-[rgba(20,36,37,0.08)]" />
                    ) : (
                      <p className="wt-heading text-[42px] font-semibold text-[var(--wt-text)]">
                        {plan ? fmtPrice(plan.price) : '—'}
                      </p>
                    )}
                  </div>

                  <p className="wt-body mt-3 text-[15px]">{copy.description}</p>

                  <Link
                    to={loading || !plan ? '#planes' : `/checkout?plan=${id}`}
                    aria-disabled={loading || !plan}
                    className="wt-btn-mint mt-7 w-full"
                    onClick={(e) => {
                      if (loading || !plan) e.preventDefault();
                    }}
                  >
                    {copy.cta}
                  </Link>
                  <p className="mt-3 text-center text-[12.5px] text-[var(--wt-muted)]">{copy.micro}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="wt-reveal wt-glass mx-auto mt-8 max-w-3xl p-8 sm:p-9">
          <p className="wt-heading text-[15px] font-semibold text-[var(--wt-text)]">Incluido en los dos planes</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SHARED.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-[14px] text-[var(--wt-text)]/85">
                <Check size={15} className="mt-0.5 shrink-0 text-[var(--wt-mint-dark)]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="wt-reveal mt-6 text-center text-[13.5px] text-[var(--wt-muted)]">
          El pago se realiza a través de Mercado Pago. Después, configurás el perfil de tu negocio.
        </p>
        <p className="wt-reveal mt-2 text-center text-[14px]">
          <a
            href="https://wa.me/541161120433?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Wintuu."
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--wt-mint-dark)] underline underline-offset-4"
          >
            ¿Tenés una duda sobre los planes? Escribinos.
          </a>
        </p>
      </div>
    </section>
  );
}
