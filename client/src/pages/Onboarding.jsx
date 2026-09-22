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
  Star,
  Store,
  TrendingDown,
  Users,
  Zap,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import '../styles/wintuu-landing.css';
import WintuuLogo from '../components/landing/WintuuLogo.jsx';

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
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all"
              style={
                step.n < current
                  ? { background: 'var(--wt-mint)', color: 'var(--wt-ink)' }
                  : step.n === current
                  ? { background: 'var(--wt-text)', color: '#fff' }
                  : { background: 'rgba(20,36,37,0.07)', color: 'rgba(20,36,37,0.35)' }
              }
            >
              {step.n < current ? <Check size={13} strokeWidth={3} /> : step.n}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: step.n === current ? 'var(--wt-text)' : step.n < current ? 'var(--wt-muted)' : 'rgba(20,36,37,0.3)' }}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span
              className="mx-3 h-px w-8 transition-all"
              style={{ background: step.n < current ? 'var(--wt-mint)' : 'var(--wt-border)' }}
            />
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
    <div className="wintuu-landing relative min-h-screen lg:grid lg:grid-cols-2">
      {/* Panel izquierdo — formulario */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
        <div className="wt-bg-blob" style={{ width: 320, height: 320, background: '#bff3ea', top: '-6%', left: '-8%' }} />
        <div className="wt-bg-blob" style={{ width: 280, height: 280, background: '#ffd3ea', bottom: '-4%', right: '-6%' }} />

        <div className="wt-glass relative w-full max-w-lg p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="wt-nav-link inline-flex items-center gap-2 text-[14px] font-semibold">
              <ArrowLeft size={16} /> Volver
            </Link>
            <WintuuLogo height={20} />
          </div>

          <h1 className="wt-h2 mt-7 text-[30px] text-[var(--wt-text)]">Creá tu app de fidelización.</h1>
          <p className="wt-body mt-2 text-[14.5px]">
            {selectedPlan
              ? `Plan ${selectedPlan.name} · ${formatPrice(selectedPlan.price)} ${selectedPlan.period} · Sin comisiones.`
              : 'Fidelizá a tus clientes con cupones, puntos y premios. Sin comisiones.'}
          </p>

          {/* Pasos */}
          <div className="mt-6 mb-7">
            <StepIndicator current={currentStep} />
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {loading || paymentLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-[var(--wt-muted)]">
              <Loader2 className="animate-spin" size={26} />
              <p className="text-sm font-semibold">
                {paymentLoading ? 'Confirmando tu pago...' : 'Cargando...'}
              </p>
            </div>
          ) : !isAuthed ? (
            /* PASO 1 — Google */
            <div className="space-y-4">
              <div className="rounded-2xl bg-[rgba(20,36,37,0.04)] p-4">
                <p className="text-sm font-bold text-[var(--wt-text)]">Entrá con tu cuenta de Google</p>
                <p className="mt-1 text-sm text-[var(--wt-muted)]">
                  La misma cuenta que vas a usar para administrar tu app.
                  Si no tenés cuenta de Google, podés crear una gratis.
                </p>
              </div>
              <button
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--wt-border)] bg-white px-5 py-3.5 font-bold text-[var(--wt-text)] transition hover:bg-black/[0.03] disabled:opacity-50"
                onClick={startGoogle}
                disabled={oauthLoading}
              >
                {oauthLoading ? <Loader2 className="animate-spin" size={19} /> : <GoogleIcon />}
                Continuar con Google
              </button>
              <p className="text-center text-xs text-[var(--wt-muted)]">
                Al continuar aceptás los términos de uso de Wintuu.
              </p>
            </div>
          ) : !status?.canStart ? (
            /* PASO 2 — Pago */
            <div className="space-y-4">
              {/* Nudge contextual según plan elegido */}
              {desiredPlan === 'mensual' ? (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <Zap size={18} className="mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-extrabold text-[var(--wt-text)]">Tip: el plan de por vida conviene más</p>
                    <p className="mt-0.5 text-xs text-[var(--wt-muted)]">
                      Con 10 meses de plan mensual ya igualás el precio único. A partir del mes 11, todo es ganancia.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <Check size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-extrabold text-[var(--wt-text)]">Excelente elección</p>
                    <p className="mt-0.5 text-xs text-[var(--wt-muted)]">
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
                  className="relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition"
                  style={
                    activePlanId === 'mensual'
                      ? { borderColor: 'var(--wt-mint)', background: 'rgba(0,207,205,0.06)' }
                      : { borderColor: 'var(--wt-border)', background: 'rgba(255,255,255,0.6)' }
                  }
                >
                  {activePlanId === 'mensual' && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: 'var(--wt-mint)' }}>
                      <Check size={11} className="text-[var(--wt-ink)]" strokeWidth={3} />
                    </span>
                  )}
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(20,36,37,0.06)]">
                    <TrendingDown size={16} className="text-[var(--wt-muted)]" />
                  </span>
                  <p className="wt-heading mt-2.5 font-semibold text-[var(--wt-text)]">Mensual</p>
                  {monthlyPlan && (
                    <p className="wt-heading mt-0.5 text-xl font-semibold text-[var(--wt-text)]">
                      {formatPrice(monthlyPlan.price)}<span className="text-xs font-bold text-[var(--wt-muted)]">/mes</span>
                    </p>
                  )}
                  <p className="mt-2 text-[11px] leading-relaxed text-[var(--wt-muted)]">Renovación automática. Cancelás cuando querés.</p>
                </button>

                {/* Plan Vitalicio — destacado */}
                <button
                  type="button"
                  onClick={() => setActivePlanId('vitalicia')}
                  className="relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition"
                  style={
                    activePlanId === 'vitalicia'
                      ? { borderColor: 'var(--wt-lilac)', background: 'rgba(201,187,255,0.14)' }
                      : { borderColor: 'rgba(201,187,255,0.45)', background: 'rgba(201,187,255,0.06)' }
                  }
                >
                  <span className="absolute -top-2.5 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white" style={{ background: 'var(--wt-lilac)' }}>
                    Recomendado
                  </span>
                  {activePlanId === 'vitalicia' && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: 'var(--wt-lilac)' }}>
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'rgba(201,187,255,0.25)' }}>
                    <Infinity size={16} style={{ color: '#7a63e0' }} />
                  </span>
                  <p className="wt-heading mt-2.5 font-semibold text-[var(--wt-text)]">De por vida</p>
                  {lifetimePlan && (
                    <p className="wt-heading mt-0.5 text-xl font-semibold text-[var(--wt-text)]">
                      {formatPrice(lifetimePlan.price)}<span className="text-xs font-bold text-[var(--wt-muted)]"> único</span>
                    </p>
                  )}
                  {monthlyPlan && lifetimePlan && (
                    <p className="mt-1 text-[11px] font-bold" style={{ color: '#7a63e0' }}>
                      = {Math.round(lifetimePlan.price / monthlyPlan.price)} meses — después $0/mes para siempre
                    </p>
                  )}
                  <ul className="mt-2 space-y-0.5 text-[11px] text-[var(--wt-muted)]">
                    <li className="flex items-center gap-1"><Check size={10} style={{ color: '#7a63e0' }} /> Sin renovaciones automáticas</li>
                    <li className="flex items-center gap-1"><Check size={10} style={{ color: '#7a63e0' }} /> Funciona para siempre</li>
                  </ul>
                </button>
              </div>

              {/* Botón de pago */}
              <button className="wt-btn-mint w-full" onClick={startPayment} disabled={paymentLoading || !selectedPlan}>
                {paymentLoading ? <Loader2 className="animate-spin" size={19} /> : <CreditCard size={19} />}
                {selectedPlan ? `Pagar ${formatPrice(selectedPlan.price)} con Mercado Pago` : 'Pagar con Mercado Pago'}
              </button>
              <p className="text-center text-xs text-[var(--wt-muted)]">
                Pago 100% seguro. Volvés acá automáticamente al confirmarse.
              </p>
              <button className="flex w-full items-center justify-center gap-2 text-xs font-bold text-[var(--wt-muted)] hover:text-[var(--wt-text)]" onClick={startGoogle}>
                Cambiar de cuenta Google
              </button>
            </div>
          ) : (
            /* PASO 3 — Crear app */
            <form onSubmit={submit} className="space-y-4">
              <div className="rounded-2xl bg-[rgba(20,36,37,0.04)] p-4">
                <p className="text-sm font-bold text-[var(--wt-text)]">¡Pago confirmado! Último paso.</p>
                <p className="mt-1 text-sm text-[var(--wt-muted)]">
                  Ponele nombre a tu negocio y elegí el link con el que tus clientes van a encontrarte.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--wt-muted)]">
                  Nombre del negocio
                </label>
                <div className="relative">
                  <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
                  <input
                    className="w-full rounded-2xl border border-[var(--wt-border)] bg-white py-3 pl-10 pr-4 text-sm font-semibold text-[var(--wt-text)] outline-none placeholder:text-[var(--wt-muted)]/60 focus:border-[var(--wt-mint)] focus:ring-2 focus:ring-[var(--wt-mint)]/15"
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
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--wt-muted)]">
                  Link de tu app
                </label>
                <div className="relative">
                  <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
                  <input
                    className="w-full rounded-2xl border border-[var(--wt-border)] bg-white py-3 pl-10 pr-4 font-mono text-sm font-semibold text-[var(--wt-text)] outline-none placeholder:text-[var(--wt-muted)]/60 focus:border-[var(--wt-mint)] focus:ring-2 focus:ring-[var(--wt-mint)]/15"
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
                      <span className="text-[var(--wt-muted)]">
                        Tu app en <strong className="text-[var(--wt-text)]">wintuu.com/{slugInfo?.slug || slug}</strong>
                      </span>
                    </>
                  )}
                  {slug && slugInfo && !slugInfo.available && (
                    <span className="text-red-500">{slugInfo.reason}</span>
                  )}
                  {!slug && <span className="text-[var(--wt-muted)]/70">Elegí el link para compartir tu app.</span>}
                </p>
              </div>

              <button className="wt-btn-mint w-full" disabled={submitting || !businessName || !slugOk}>
                {submitting ? <Loader2 className="animate-spin" size={19} /> : <Rocket size={19} />}
                Crear mi app ahora
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Panel derecho — beneficios */}
      <aside className="relative hidden min-h-screen items-center overflow-hidden lg:flex" style={{ background: 'linear-gradient(165deg, #fff7ef 0%, #fff1e2 100%)' }}>
        <div className="wt-bg-blob" style={{ width: 380, height: 380, background: '#ffefae', top: '-8%', right: '-8%' }} />
        <div className="wt-bg-blob" style={{ width: 320, height: 320, background: '#e3dbff', bottom: '-4%', left: '-6%' }} />

        <div className="relative p-12">
          <p className="wt-eyebrow-light">Para negocios como el tuyo</p>
          <p className="wt-heading mt-4 text-[36px] font-semibold leading-tight text-[var(--wt-text)]">
            Tus clientes vuelven cuando los recompensás.
          </p>
          <p className="wt-body mt-4 max-w-md">
            Creá tu programa de fidelización en minutos. Sin apps que instalar, sin comisiones por venta.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: BadgePercent, title: 'Cupones con puntos', desc: 'Cada compra suma un punto. Al completar el cupón, el cliente gana su premio.' },
              { icon: Gift, title: 'Premios que elegís vos', desc: 'Descuentos, productos gratis o lo que quieras ofrecer a tus clientes fieles.' },
              { icon: Users, title: 'Clientes que vuelven', desc: 'El programa incentiva visitas repetidas. Fidelizá sin esfuerzo extra.' },
              { icon: Star, title: 'Tu marca, tu estilo', desc: 'Logo, colores y menú propios. Tu app refleja la identidad de tu negocio.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="wt-glass p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(0,207,205,0.14)]">
                  <Icon size={17} className="text-[var(--wt-mint-dark)]" />
                </span>
                <p className="wt-heading mt-2.5 text-sm font-semibold text-[var(--wt-text)]">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--wt-muted)]">{desc}</p>
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
