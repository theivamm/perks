import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { api } from '../api.js';
import '../styles/wintuu-landing.css';
import WintuuLogo from '../components/landing/WintuuLogo.jsx';

const WHATSAPP_URL = 'https://wa.me/541161120433?text=Hola%2C%20quiero%20contratar%20WINTUU%20y%20necesito%20hablar%20con%20un%20agente%20de%20ventas.';

function formatPrice(value) {
  return `$ ${Number(value || 0).toLocaleString('es-AR')}`;
}

export default function Checkout() {
  const [params] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(params.get('plan') === 'vitalicia' ? 'vitalicia' : 'mensual');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/plans')
      .then((data) => setPlans(data.plans || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const plan = useMemo(() => plans.find((item) => item.id === selected), [plans, selected]);

  return (
    <div className="wintuu-landing relative min-h-screen overflow-hidden px-5 py-8">
      <div className="wt-bg-blob" style={{ width: 380, height: 380, background: '#bff3ea', top: '-8%', right: '-6%' }} />
      <div className="wt-bg-blob" style={{ width: 320, height: 320, background: '#ffd3ea', bottom: '-4%', left: '-6%' }} />

      <div className="relative mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="wt-nav-link inline-flex items-center gap-2 text-[14px] font-semibold">
            <ArrowLeft size={16} /> Volver
          </Link>
          <WintuuLogo height={22} />
        </div>

        <div className="mt-12 text-center">
          <p className="wt-eyebrow-light justify-center">Contratá tu app</p>
          <h1 className="wt-h1 mt-5 text-[36px] text-[var(--wt-text)] sm:text-[54px]">Elegí tu plan y activá Wintuu</h1>
          <p className="wt-body mx-auto mt-4 max-w-2xl">
            Después del pago creás el nombre y el enlace de tu app, y entrás directamente a la bienvenida para configurarla.
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-24 text-[var(--wt-muted)]"><Loader2 className="animate-spin" size={26} /></div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr,380px]">
            <div className="space-y-4">
              {plans.map((item) => {
                const active = item.id === selected;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className="wt-glass flex w-full items-center justify-between gap-5 p-6 text-left transition"
                    style={{ borderColor: active ? 'rgba(0,207,205,0.4)' : undefined, background: active ? 'rgba(0,207,205,0.06)' : undefined }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded-full border-2"
                          style={{ borderColor: active ? 'var(--wt-mint)' : 'rgba(20,36,37,0.2)', background: active ? 'var(--wt-mint)' : 'transparent', color: 'var(--wt-ink)' }}
                        >
                          {active && <Check size={13} />}
                        </span>
                        <p className="wt-heading text-[18px] font-semibold text-[var(--wt-text)]">Plan {item.name}</p>
                      </div>
                      <p className="ml-7 mt-1 text-[13.5px] text-[var(--wt-muted)]">{item.period}</p>
                    </div>
                    <p className="wt-heading text-[24px] font-semibold text-[var(--wt-mint-dark)]">{formatPrice(item.price)}</p>
                  </button>
                );
              })}

              <div className="wt-glass p-6">
                <p className="wt-heading font-semibold text-[var(--wt-text)]">Todos los planes incluyen</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {['App con tu marca y enlace', 'Panel de administración', 'Clientes mediante Google', 'Cupones y recompensas', 'Códigos QR', 'Soporte de Wintuu'].map((item) => (
                    <span key={item} className="flex items-center gap-2 text-[14px] text-[var(--wt-text)]/75">
                      <Check size={15} className="text-[var(--wt-mint-dark)]" /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <aside className="wt-glass h-fit p-6 lg:sticky lg:top-8">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--wt-muted)]">Resumen</p>
              <div className="mt-4 flex items-end justify-between gap-3 border-b border-[var(--wt-border)] pb-5">
                <div>
                  <p className="wt-heading font-semibold text-[var(--wt-text)]">Wintuu {plan?.name || ''}</p>
                  <p className="text-[13.5px] text-[var(--wt-muted)]">{plan?.period}</p>
                </div>
                <p className="wt-heading text-[22px] font-semibold text-[var(--wt-text)]">{formatPrice(plan?.price)}</p>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[rgba(0,207,205,0.07)] p-4">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[var(--wt-mint-dark)]" />
                <p className="text-[12.5px] leading-relaxed text-[var(--wt-text)]/70">
                  El próximo paso solicita Google para asociar el pago con el administrador. Luego pagás de forma segura en Mercado Pago.
                </p>
              </div>

              <Link to={`/comenzar?plan=${selected}`} className="wt-btn-mint mt-5 w-full">
                Continuar al pago <ArrowRight size={17} />
              </Link>

              <div className="my-5 flex items-center gap-3 text-[12px] text-[var(--wt-muted)]">
                <span className="h-px flex-1 bg-[var(--wt-border)]" /> o <span className="h-px flex-1 bg-[var(--wt-border)]" />
              </div>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#25D366]/40 px-5 py-3 font-bold text-[#0f8a4c] transition hover:bg-[#25D366]/10"
              >
                <MessageCircle size={17} /> Hablar con ventas
              </a>
              <p className="mt-3 text-center text-[12px] text-[var(--wt-muted)]">WhatsApp: +54 11 6112-0433</p>
            </aside>
          </div>
        )}

        <div className="mt-12 grid gap-3 text-center text-[13.5px] text-[var(--wt-muted)] sm:grid-cols-3">
          <p>1. Elegís el plan</p><p>2. Pagás con Mercado Pago</p><p>3. Configurás y activás tu app</p>
        </div>
      </div>
    </div>
  );
}
