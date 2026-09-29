import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Gift, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../api.js';
import AuthShell, { mintBtn } from '../components/landing/AuthShell.jsx';

const WHATSAPP_URL = 'https://wa.me/541124026647?text=Hola%2C%20quiero%20contratar%20WINTUU%20y%20necesito%20hablar%20con%20un%20agente%20de%20ventas.';
export const FLOW_STEPS = ['Plan', 'Cuenta', 'Pago', 'Tu negocio'];
const INCLUDED = ['App con tu marca y enlace', 'Panel de administración', 'Clientes con Google', 'Cupones y premios', 'Códigos QR', 'Menú digital', 'Soporte de Wintuu'];

const fmt = (v) => `$${Number(v || 0).toLocaleString('es-AR')}`;

export default function Checkout() {
  const [params] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(params.get('plan') === 'vitalicia' ? 'vitalicia' : 'mensual');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    api('/api/plans')
      .then((data) => setPlans(data.plans || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const plan = useMemo(() => plans.find((p) => p.id === selected), [plans, selected]);
  const monthly = Number(plans.find((p) => p.id === 'mensual')?.price) || 0;

  return (
    <AuthShell variant="plan" wide steps={FLOW_STEPS} step={1}>
      <h1 className="wt-heading text-balance text-[clamp(36px,4vw,50px)] font-bold leading-[1.02] text-[var(--wt-ink)]">Elegí tu plan.</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-[var(--wt-muted)]">
        Las mismas herramientas en los dos. Después del pago elegís el nombre y el enlace de tu app.
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-[22px] border-2 border-[var(--wt-mint)] bg-[var(--wt-mint)]/12 px-5 py-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--wt-mint)] text-[#08282c]">
          <Gift size={22} />
        </span>
        <p className="text-[14.5px] font-bold leading-snug text-[var(--wt-ink)]">
          El plan Mensual arranca con <span className="text-[var(--wt-mint-dark)]">7 días de prueba gratis</span>. No se te cobra nada hasta el día 8, y podés cancelar antes sin costo.
        </p>
      </div>

      {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

      {loading ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => <div key={i} className="h-[168px] animate-pulse rounded-[26px] bg-[var(--wt-surface-raised)]" />)}
        </div>
      ) : (
        <div className="mt-8 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Plan">
          {plans.map((item, i) => {
            const active = item.id === selected;
            const lifetime = item.id === 'vitalicia';
            const months = lifetime && monthly ? Math.round(Number(item.price) / monthly) : 0;
            return (
              <button
                key={item.id}
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(item.id)}
                className={`wt2-rise wt2-lift relative flex flex-col gap-3 rounded-[26px] border-2 p-5 text-left transition-colors ${
                  active ? 'border-[var(--wt-mint)] bg-[var(--wt-surface)] shadow-[0_18px_40px_-26px_rgba(0,160,158,0.8)]' : 'border-[var(--wt-border)] bg-[var(--wt-surface)] hover:border-[var(--wt-mint)]/50'
                }`}
                style={{ '--d': `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="wt-heading text-[19px] font-bold text-[var(--wt-ink)]">{item.name}</span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                      active ? 'border-[var(--wt-mint)] bg-[var(--wt-mint)] text-[#08282c]' : 'border-[var(--wt-border)]'
                    }`}
                  >
                    {active && <Check size={14} strokeWidth={3} />}
                  </span>
                </div>
                <p className="wt-heading text-[36px] font-bold leading-none text-[var(--wt-ink)]">
                  {fmt(item.price)}
                  <span className="font-sans text-[14px] font-medium text-[var(--wt-muted)]"> {lifetime ? 'una vez' : '/mes'}</span>
                </p>
                <p className="text-[13px] text-[var(--wt-muted)]">{item.period}</p>
                {lifetime ? (
                  <span className="self-start rounded-full bg-[var(--wt-yellow)] px-2.5 py-1 text-[11px] font-extrabold text-[#7a4f00]">
                    {months > 1 ? `Equivale a ${months} meses` : 'Pagás una vez'}
                  </span>
                ) : (
                  <span className="self-start rounded-full bg-[var(--wt-mint)] px-2.5 py-1 text-[11px] font-extrabold text-[#08282c]">
                    7 días de prueba gratis
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 rounded-[24px] bg-[var(--wt-surface-raised)] p-5">
        <p className="text-[12px] font-extrabold tracking-[0.14em] text-[var(--wt-muted)]">INCLUYE</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {INCLUDED.map((it) => (
            <span key={it} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--wt-surface)] px-3 py-1.5 text-[13px] font-semibold text-[var(--wt-text)]">
              <Check size={13} strokeWidth={3} className="text-[var(--wt-mint-dark)]" /> {it}
            </span>
          ))}
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--wt-border)] bg-[var(--wt-surface)] p-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--wt-mint-dark)]"
        />
        <span className="text-[13.5px] leading-relaxed text-[var(--wt-text)]">
          Leí y acepto los{' '}
          <Link to="/terminos" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--wt-mint-dark)] underline underline-offset-4">
            Términos del Servicio
          </Link>{' '}
          y la{' '}
          <Link to="/privacidad" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--wt-mint-dark)] underline underline-offset-4">
            Política de Privacidad
          </Link>{' '}
          de Wintuu. Entiendo que como administrador de mi app soy responsable del contenido que cargue (productos, precios, fotos) y de la relación con mis propios clientes.
        </span>
      </label>

      <div className="mt-4 flex flex-col gap-4 rounded-[26px] border border-[var(--wt-border)] bg-[var(--wt-surface)] p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-[var(--wt-muted)]">{selected === 'mensual' ? 'Después de la prueba' : 'Total'}</p>
          <p className="wt-heading text-[26px] font-bold leading-tight text-[var(--wt-ink)]">
            {plan ? fmt(plan.price) : '—'} <span className="font-sans text-[13px] font-medium text-[var(--wt-muted)]">{plan?.period}</span>
          </p>
          {selected === 'mensual' && <p className="mt-0.5 text-[12.5px] font-semibold text-[var(--wt-mint-dark)]">Hoy no se cobra nada.</p>}
        </div>
        <Link
          to={`/comenzar?plan=${selected}`}
          aria-disabled={!plan || !accepted}
          onClick={(e) => (!plan || !accepted) && e.preventDefault()}
          className={`${mintBtn} sm:!w-auto ${!accepted ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {loading ? <Loader2 className="animate-spin" size={17} /> : null}
          Continuar <ArrowRight size={17} className="wt2-arrow" />
        </Link>
      </div>
      {!accepted && (
        <p className="mt-2 text-center text-[12.5px] font-semibold text-[#9b1c4b] sm:text-right">
          Tenés que aceptar los Términos y la Política de Privacidad para continuar.
        </p>
      )}

      <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--wt-muted)]">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--wt-mint-dark)]" />
        En el próximo paso entrás con Google para asociar el pago a tu cuenta. Después pagás de forma segura con Mercado Pago.
      </p>
      <p className="mt-4 text-center text-[13.5px] text-[var(--wt-muted)]">
        ¿Preferís hablar con alguien?{' '}
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="font-bold text-[var(--wt-mint-dark)] underline underline-offset-4">
          Escribinos por WhatsApp
        </a>
      </p>
    </AuthShell>
  );
}
