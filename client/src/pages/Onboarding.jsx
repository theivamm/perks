import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgePercent,
  Check,
  CreditCard,
  Gift,
  Infinity,
  Link2,
  Loader2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

const BG = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=85';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function formatPrice(value) {
  return `$ ${Number(value || 0).toLocaleString('es-AR')}`;
}

const STEPS = [
  { n: 1, label: 'Tu cuenta' },
  { n: 2, label: 'El pago' },
  { n: 3, label: 'Tu negocio' },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step.n} className="flex items-center">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                step.n < current
                  ? 'bg-amber-400 text-[#151515]'
                  : step.n === current
                  ? 'bg-[#151515] text-white ring-2 ring-[#151515] ring-offset-2'
                  : 'bg-black/[0.07] text-black/35'
              }`}
            >
              {step.n < current ? <Check size={13} strokeWidth={3} /> : step.n}
            </span>
            <span
              className={`text-xs font-bold ${
                step.n === current ? 'text-[#151515]' : step.n < current ? 'text-black/55' : 'text-black/30'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span className={`mx-3 h-px w-8 transition-all ${step.n < current ? 'bg-amber-400' : 'bg-black/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Onboarding() {
  const { isAuthed, user, loginGoogle, adoptSession } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const desiredPlan = params.get('plan') === 'vitalicia' ? 'vitalicia' : 'mensual';

  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');

  const [activePlanId, setActivePlanId] = useState(desiredPlan);
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugInfo, setSlugInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === activePlanId) || null,
    [plans, activePlanId]
  );

  const monthlyPlan = useMemo(() => plans.find((p) => p.id === 'mensual') || null, [plans]);
  const lifetimePlan = useMemo(() => plans.find((p) => p.id === 'vitalicia') || null, [plans]);

  useEffect(() => {
    api('/api/plans')
      .then((d) => setPlans(d.plans || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const isReturn =
      new URLSearchParams(window.location.search).has('code') ||
      window.location.hash.includes('access_token');
    if (!isReturn) return;
    (async () => {
      setOauthLoading(true);
      try {
        let session = null;
        const { data, error: sErr } = await supabase.auth.getSession();
        if (sErr) throw sErr;
        session = data.session;
        if (!session) {
          const code = new URLSearchParams(window.location.search).get('code');
          if (code) {
            const res = await supabase.auth.exchangeCodeForSession(code);
            if (res.error) throw res.error;
            session = res.data.session;
            const url = new URL(window.location.href);
            url.searchParams.delete('code');
            window.history.replaceState({}, document.title, url.pathname + url.search);
          }
        }
        if (session) await loginGoogle(session.access_token, { global: true });
      } catch (e) {
        setError(e.message);
      } finally {
        setOauthLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginGoogle]);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await api('/api/onboarding/status'));
    } catch (err) {
      setStatus({ hasTenant: false, canStart: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }, [isAuthed, user?.id]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const paymentId = params.get('payment_id') || params.get('collection_id');
    if (!isAuthed || !paymentId || params.get('payment') !== 'success') return;
    let active = true;
    setPaymentLoading(true);
    api('/api/payments/mercadopago/confirm', { method: 'POST', body: { paymentId } })
      .then(async (result) => {
        if (!active) return;
        if (!result.approved) setError('El pago todavía está pendiente de aprobación.');
        await loadStatus();
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setPaymentLoading(false); });
    return () => { active = false; };
  }, [isAuthed, loadStatus, params]);

  useEffect(() => {
    if (!isAuthed || params.get('subscription') !== 'success') return;
    let active = true;
    setPaymentLoading(true);
    api('/api/payments/mercadopago/subscription/confirm', { method: 'POST' })
      .then(async (result) => {
        if (!active) return;
        if (!result.approved) setError('La suscripción todavía está pendiente de autorización.');
        await loadStatus();
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setPaymentLoading(false); });
    return () => { active = false; };
  }, [isAuthed, loadStatus, params]);

  useEffect(() => {
    if (status?.hasTenant && status.slug) navigate(`/${status.slug}/dashboard`, { replace: true });
  }, [status, navigate]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(businessName));
  }, [businessName, slugTouched]);

  useEffect(() => {
    if (!slug) { setSlugInfo(null); return; }
    const id = setTimeout(() => {
      api(`/api/onboarding/slug?value=${encodeURIComponent(slug)}`)
        .then(setSlugInfo)
        .catch(() => setSlugInfo(null));
    }, 400);
    return () => clearTimeout(id);
  }, [slug]);

  const startGoogle = async () => {
    setError('');
    setOauthLoading(true);
    try {
      const { error: gErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/comenzar?plan=${desiredPlan}` },
      });
      if (gErr) throw gErr;
    } catch (e) {
      setError(e.message);
      setOauthLoading(false);
    }
  };

  const startPayment = async () => {
    setPaymentLoading(true);
    setError('');
    try {
      const data = await api('/api/payments/mercadopago/preference', {
        method: 'POST',
        body: { plan: activePlanId },
      });
      if (data.approved) { await loadStatus(); setPaymentLoading(false); return; }
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setError(err.message);
      setPaymentLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (slugInfo && !slugInfo.available) { setError(slugInfo.reason || 'Ese link no está disponible'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await api('/api/onboarding/create', {
        method: 'POST',
        body: { businessName, slug, plan: activePlanId },
      });
      if (res.token) adoptSession(res, res.slug);
      navigate(`/${res.slug}/primeros-pasos`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const slugOk = slugInfo?.available;

  // Determinar paso actual
  const currentStep = !isAuthed ? 1 : !status?.canStart ? 2 : 3;

  return (
    <div className="relative min-h-screen bg-cover bg-center lg:grid lg:grid-cols-2" style={{ backgroundImage: `url(${BG})` }}>
      <div className="absolute inset-0 bg-[#0A0A0C]/75 backdrop-blur-[2px] lg:hidden" />

      {/* Panel izquierdo — formulario */}
      <section className="relative flex min-h-screen items-center justify-center px-5 py-10 lg:bg-[#F5F1E8] lg:text-[#151515]">
        <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-white/95 p-6 text-[#151515] shadow-2xl backdrop-blur sm:p-8 lg:border-black/10 lg:shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-black/55 hover:text-black">
              <ArrowLeft size={16} /> Volver
            </Link>
            <span className="inline-flex items-center gap-2 font-black">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400">
                <Sparkles size={16} className="text-[#0A0A0C]" />
              </span>
              WINTUU
            </span>
          </div>

          <h1 className="mt-7 text-3xl font-black tracking-tight">Creá tu app de fidelización.</h1>
          <p className="mt-2 text-sm leading-relaxed text-black/55">
            {selectedPlan
              ? `Plan ${selectedPlan.name} · ${formatPrice(selectedPlan.price)} ${selectedPlan.period} · Sin comisiones.`
              : 'Fidelizá a tus clientes con cupones, puntos y premios. Sin comisiones.'}
          </p>

          {/* Pasos */}
          <div className="mt-6 mb-7">
            <StepIndicator current={currentStep} />
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {loading || paymentLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-black/40">
              <Loader2 className="animate-spin" size={26} />
              <p className="text-sm font-semibold">
                {paymentLoading ? 'Confirmando tu pago...' : 'Cargando...'}
              </p>
            </div>
          ) : !isAuthed ? (
            /* PASO 1 — Google */
            <div className="space-y-4">
              <div className="rounded-2xl bg-black/[0.04] p-4">
                <p className="text-sm font-bold text-[#151515]">Entrá con tu cuenta de Google</p>
                <p className="mt-1 text-sm text-black/55">
                  La misma cuenta que vas a usar para administrar tu app.
                  Si no tenés cuenta de Google, podés crear una gratis.
                </p>
              </div>
              <button
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/15 bg-white px-5 py-3.5 font-extrabold transition hover:bg-black/5 disabled:opacity-50"
                onClick={startGoogle}
                disabled={oauthLoading}
              >
                {oauthLoading ? <Loader2 className="animate-spin" size={19} /> : <GoogleIcon />}
                Continuar con Google
              </button>
              <p className="text-center text-xs text-black/35">
                Al continuar aceptás los términos de uso de WINTUU.
              </p>
            </div>
          ) : !status?.canStart ? (
            /* PASO 2 — Pago */
            <div className="space-y-4">

              {/* Nudge contextual según plan elegido */}
              {desiredPlan === 'mensual' ? (
                <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                  <Zap size={18} className="mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-extrabold text-[#151515]">Tip: el plan de por vida conviene más</p>
                    <p className="mt-0.5 text-xs text-black/55">
                      Con 10 meses de plan mensual ya igualás el precio único. A partir del mes 11, todo es ganancia.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                  <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-extrabold text-[#151515]">Excelente elección</p>
                    <p className="mt-0.5 text-xs text-black/55">
                      Pagás una sola vez y tu app funciona para siempre. Sin renovaciones, sin sorpresas.
                    </p>
                  </div>
                </div>
              )}

              {/* Cards de planes */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Plan Mensual */}
                <button
                  type="button"
                  onClick={() => setActivePlanId('mensual')}
                  className={`relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition ${
                    activePlanId === 'mensual'
                      ? 'border-[#151515] bg-white shadow-md'
                      : 'border-black/10 bg-white/60 hover:border-black/25'
                  }`}
                >
                  {activePlanId === 'mensual' && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#151515]">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/[0.06]">
                    <TrendingDown size={16} className="text-black/50" />
                  </span>
                  <p className="mt-2.5 font-extrabold text-[#151515]">Mensual</p>
                  {monthlyPlan && (
                    <p className="mt-0.5 text-xl font-black text-[#151515]">{formatPrice(monthlyPlan.price)}<span className="text-xs font-bold text-black/40">/mes</span></p>
                  )}
                  <p className="mt-2 text-[11px] leading-relaxed text-black/45">Renovación automática. Cancelás cuando querés.</p>
                </button>

                {/* Plan Vitalicio — destacado */}
                <button
                  type="button"
                  onClick={() => setActivePlanId('vitalicia')}
                  className={`relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition ${
                    activePlanId === 'vitalicia'
                      ? 'border-amber-400 bg-amber-50 shadow-md'
                      : 'border-amber-300/60 bg-amber-50/40 hover:border-amber-400/80'
                  }`}
                >
                  <span className="absolute -top-2.5 left-3 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#0A0A0C]">
                    Recomendado
                  </span>
                  {activePlanId === 'vitalicia' && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400">
                      <Check size={11} className="text-[#0A0A0C]" strokeWidth={3} />
                    </span>
                  )}
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20">
                    <Infinity size={16} className="text-amber-600" />
                  </span>
                  <p className="mt-2.5 font-extrabold text-[#151515]">De por vida</p>
                  {lifetimePlan && (
                    <p className="mt-0.5 text-xl font-black text-[#151515]">{formatPrice(lifetimePlan.price)}<span className="text-xs font-bold text-black/40"> único</span></p>
                  )}
                  {monthlyPlan && lifetimePlan && (
                    <p className="mt-1 text-[11px] font-bold text-amber-600">
                      = {Math.round(lifetimePlan.price / monthlyPlan.price)} meses — después $0/mes para siempre
                    </p>
                  )}
                  <ul className="mt-2 space-y-0.5 text-[11px] text-black/50">
                    <li className="flex items-center gap-1"><Check size={10} className="text-amber-500" /> Sin renovaciones automáticas</li>
                    <li className="flex items-center gap-1"><Check size={10} className="text-amber-500" /> Funciona para siempre</li>
                  </ul>
                </button>
              </div>

              {/* Botón de pago */}
              <button
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#151515] px-5 py-3.5 font-extrabold text-white transition hover:bg-black/80 disabled:opacity-50"
                onClick={startPayment}
                disabled={paymentLoading || !selectedPlan}
              >
                {paymentLoading ? <Loader2 className="animate-spin" size={19} /> : <CreditCard size={19} />}
                {selectedPlan ? `Pagar ${formatPrice(selectedPlan.price)} con Mercado Pago` : 'Pagar con Mercado Pago'}
              </button>
              <p className="text-center text-xs text-black/35">
                Pago 100% seguro. Volvés acá automáticamente al confirmarse.
              </p>
              <button className="flex w-full items-center justify-center gap-2 text-xs font-bold text-black/40 hover:text-black/60" onClick={startGoogle}>
                Cambiar de cuenta Google
              </button>
            </div>
          ) : (
            /* PASO 3 — Crear app */
            <form onSubmit={submit} className="space-y-4">
              <div className="rounded-2xl bg-black/[0.04] p-4">
                <p className="text-sm font-bold text-[#151515]">¡Pago confirmado! Último paso.</p>
                <p className="mt-1 text-sm text-black/55">
                  Ponele nombre a tu negocio y elegí el link con el que tus clientes van a encontrarte.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-black/45">
                  Nombre del negocio
                </label>
                <div className="relative">
                  <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
                  <input
                    className="w-full rounded-2xl border border-black/15 bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none placeholder:text-black/25 focus:border-black/30 focus:ring-2 focus:ring-black/10"
                    placeholder="Ej: Cafetería Central"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    maxLength={60}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-black/45">
                  Link de tu app
                </label>
                <div className="relative">
                  <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30" />
                  <input
                    className="w-full rounded-2xl border border-black/15 bg-white py-3 pl-10 pr-4 font-mono text-sm font-semibold outline-none placeholder:text-black/25 focus:border-black/30 focus:ring-2 focus:ring-black/10"
                    placeholder="mi-negocio"
                    value={slug}
                    onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                    required
                  />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs">
                  {slug && slugOk && (
                    <>
                      <Check size={13} className="text-emerald-500" />
                      <span className="text-black/55">
                        Tu app en <strong className="text-[#151515]">wintuu.com/{slugInfo?.slug || slug}</strong>
                      </span>
                    </>
                  )}
                  {slug && slugInfo && !slugInfo.available && (
                    <span className="text-red-500">{slugInfo.reason}</span>
                  )}
                  {!slug && <span className="text-black/35">Elegí el link para compartir tu app.</span>}
                </p>
              </div>

              <button
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-400 px-5 py-3.5 font-extrabold text-[#0A0A0C] transition hover:bg-amber-300 disabled:opacity-50"
                disabled={submitting || !businessName || !slugOk}
              >
                {submitting ? <Loader2 className="animate-spin" size={19} /> : <Rocket size={19} />}
                Crear mi app ahora
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Panel derecho — imagen + beneficios */}
      <aside className="relative hidden min-h-screen overflow-hidden bg-cover bg-center lg:block" style={{ backgroundImage: `url(${BG})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">Para negocios como el tuyo</p>
          <p className="mt-3 text-4xl font-black leading-tight">
            Tus clientes vuelven cuando los recompensás.
          </p>
          <p className="mt-4 text-white/65">
            Creá tu programa de fidelización en minutos. Sin apps que instalar, sin comisiones por venta.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: BadgePercent, title: 'Cupones con puntos', desc: 'Cada compra suma un punto. Al completar el cupón, el cliente gana su premio.' },
              { icon: Gift, title: 'Premios que elegís vos', desc: 'Descuentos, productos gratis o lo que quieras ofrecer a tus clientes fieles.' },
              { icon: Users, title: 'Clientes que vuelven', desc: 'El programa incentiva visitas repetidas. Fidelizá sin esfuerzo extra.' },
              { icon: Star, title: 'Tu marca, tu estilo', desc: 'Logo, colores y menú propios. Tu app refleja la identidad de tu negocio.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <Icon size={18} className="text-amber-400" />
                <p className="mt-2 text-sm font-extrabold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37.4 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}
