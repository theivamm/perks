import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../api.js';

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
    <div className="min-h-screen bg-[#0A0A0C] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white">
            <ArrowLeft size={16} /> Volver
          </Link>
          <span className="inline-flex items-center gap-2 font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-[#0A0A0C]"><Sparkles size={16} /></span>
            WINTUU
          </span>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Contratá tu app</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Elegí tu plan y activá WINTUU</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/60">
            Después del pago creás el nombre y el enlace de tu app, y entrás directamente a la bienvenida para configurarla.
          </p>
        </div>

        {error && <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-24 text-white/50"><Loader2 className="animate-spin" size={26} /></div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr,380px]">
            <div className="space-y-4">
              {plans.map((item) => {
                const active = item.id === selected;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className={`flex w-full items-center justify-between gap-5 rounded-3xl border p-6 text-left transition ${active ? 'border-amber-400 bg-amber-400/[0.08]' : 'border-white/10 bg-white/[0.03] hover:border-white/30'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-amber-400 bg-amber-400 text-[#0A0A0C]' : 'border-white/30'}`}>
                          {active && <Check size={13} />}
                        </span>
                        <p className="text-lg font-extrabold">Plan {item.name}</p>
                      </div>
                      <p className="ml-7 mt-1 text-sm text-white/50">{item.period}</p>
                    </div>
                    <p className="text-2xl font-extrabold text-amber-300">{formatPrice(item.price)}</p>
                  </button>
                );
              })}

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <p className="font-extrabold">Todos los planes incluyen</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {['App con tu marca y enlace', 'Panel de administración', 'Clientes mediante Google', 'Cupones y recompensas', 'Códigos QR', 'Soporte de WINTUU'].map((item) => (
                    <span key={item} className="flex items-center gap-2 text-sm text-white/65"><Check size={15} className="text-amber-300" /> {item}</span>
                  ))}
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-amber-400/30 bg-[#111114] p-6 shadow-2xl lg:sticky lg:top-8">
              <p className="text-xs font-bold uppercase tracking-wider text-white/45">Resumen</p>
              <div className="mt-4 flex items-end justify-between gap-3 border-b border-white/10 pb-5">
                <div>
                  <p className="font-extrabold">WINTUU {plan?.name || ''}</p>
                  <p className="text-sm text-white/50">{plan?.period}</p>
                </div>
                <p className="text-2xl font-extrabold">{formatPrice(plan?.price)}</p>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/[0.04] p-4">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-amber-300" />
                <p className="text-xs leading-relaxed text-white/55">El próximo paso solicita Google para asociar el pago con el administrador. Luego pagás de forma segura en Mercado Pago.</p>
              </div>

              <Link
                to={`/comenzar?plan=${selected}`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 font-extrabold text-[#0A0A0C] transition hover:bg-amber-300"
              >
                Continuar al pago <ArrowRight size={17} />
              </Link>

              <div className="my-5 flex items-center gap-3 text-xs text-white/30"><span className="h-px flex-1 bg-white/10" /> o <span className="h-px flex-1 bg-white/10" /></div>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-400/40 px-5 py-3 font-bold text-emerald-300 transition hover:bg-emerald-400/10"
              >
                <MessageCircle size={17} /> Hablar con ventas
              </a>
              <p className="mt-3 text-center text-xs text-white/35">WhatsApp: +54 11 6112-0433</p>
            </aside>
          </div>
        )}

        <div className="mt-12 grid gap-3 text-center text-sm text-white/45 sm:grid-cols-3">
          <p>1. Elegís el plan</p><p>2. Pagás con Mercado Pago</p><p>3. Configurás y activás tu app</p>
        </div>
      </div>
    </div>
  );
}
