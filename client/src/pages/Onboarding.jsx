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
import AuthShell, { GoogleIcon, googleBtn, inputCls, mintBtn, primaryBtn } from '../components/landing/AuthShell.jsx';
import { FLOW_STEPS } from './Checkout.jsx';

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

  const shellStep = currentStep + 1; // 1 = Plan (checkout), 2 = Cuenta, 3 = Pago, 4 = Tu negocio
  const variant = currentStep === 3 ? 'business' : 'plan';
  const titles = {
    1: ['Creá tu cuenta.', 'Entrá con la cuenta de Google que vas a usar para administrar tu app.'],
    2: ['Confirmá y pagá.', 'Pagás de forma segura con Mercado Pago y volvés acá automáticamente.'],
    3: ['¡Pago confirmado! Último paso.', 'Ponele nombre a tu negocio y elegí el link con el que tus clientes te van a encontrar.'],
  };
  const [title, subtitle] = titles[currentStep];

  return (
    <AuthShell variant={variant} back="/checkout" backLabel="Planes" steps={FLOW_STEPS} step={shellStep} wide={currentStep === 2}>
      <h1 className="wt-heading text-balance text-[clamp(34px,3.8vw,46px)] font-bold leading-[1.04] text-[var(--wt-ink)]">{title}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-[var(--wt-muted)]">{subtitle}</p>
      {selectedPlan && currentStep < 3 && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--wt-surface-raised)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--wt-ink)]">
          <span className="h-2 w-2 rounded-full bg-[var(--wt-mint)]" />
          Plan {selectedPlan.name} · {formatPrice(selectedPlan.price)} {selectedPlan.period}
        </p>
      )}

      {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

      <div className="mt-8">
        {loading || paymentLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-[var(--wt-border)] bg-[var(--wt-surface)] py-12 text-[var(--wt-muted)]">
            <Loader2 className="animate-spin text-[var(--wt-mint-dark)]" size={28} />
            <p className="text-sm font-semibold">{paymentLoading ? 'Confirmando tu pago…' : 'Cargando…'}</p>
          </div>
        ) : !isAuthed ? (
          <div key="s1" className="wt2-rise space-y-4">
            <button className={googleBtn} onClick={startGoogle} disabled={oauthLoading}>
              {oauthLoading ? <Loader2 className="animate-spin" size={19} /> : <GoogleIcon />}
              Continuar con Google
            </button>
            <p className="text-center text-[12.5px] text-[var(--wt-muted)]">
              ¿No tenés cuenta de Google? Podés crear una gratis. Al continuar aceptás los términos de uso de Wintuu.
            </p>
          </div>
        ) : !status?.canStart ? (
          <div key="s2" className="wt2-rise space-y-4">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Plan">
              {[
                ['mensual', monthlyPlan, 'Mensual', '/mes', 'Renovación automática. Cancelás cuando quieras.'],
                ['vitalicia', lifetimePlan, 'De por vida', ' único', monthlyPlan && lifetimePlan ? `Equivale a ${Math.round(lifetimePlan.price / monthlyPlan.price)} meses. Después, $0 para siempre.` : 'Sin renovaciones.'],
              ].map(([id, pl, name, suffix, note]) => {
                const on = activePlanId === id;
                const life = id === 'vitalicia';
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setActivePlanId(id)}
                    className={`wt2-lift relative flex flex-col items-start gap-2 rounded-[24px] border-2 p-5 text-left transition-colors ${
                      on ? 'border-[var(--wt-mint)] bg-[var(--wt-surface)]' : 'border-[var(--wt-border)] bg-[var(--wt-surface)] hover:border-[var(--wt-mint)]/50'
                    }`}
                  >
                    {life && <span className="absolute -top-2.5 left-4 rounded-full bg-[var(--wt-yellow)] px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-[#7a4f00]">Recomendado</span>}
                    <span className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${on ? 'border-[var(--wt-mint)] bg-[var(--wt-mint)] text-[#08282c]' : 'border-[var(--wt-border)]'}`}>
                      {on && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span className="wt-heading text-[18px] font-bold text-[var(--wt-ink)]">{name}</span>
                    {pl && (
                      <span className="wt-heading text-[30px] font-bold leading-none text-[var(--wt-ink)]">
                        {formatPrice(pl.price)}<span className="font-sans text-[13px] font-medium text-[var(--wt-muted)]">{suffix}</span>
                      </span>
                    )}
                    <span className="text-[12.5px] leading-snug text-[var(--wt-muted)]">{note}</span>
                  </button>
                );
              })}
            </div>

            {desiredPlan === 'mensual' && activePlanId === 'mensual' && (
              <p className="flex items-start gap-2.5 rounded-2xl bg-[var(--wt-yellow)]/50 px-4 py-3 text-[13px] leading-relaxed text-[#5c3d00]">
                <Zap size={16} className="mt-0.5 shrink-0" />
                Con 10 meses de plan mensual ya igualás el precio único. A partir del mes 11, todo es ganancia.
              </p>
            )}

            <button className={mintBtn} onClick={startPayment} disabled={paymentLoading || !selectedPlan}>
              {paymentLoading ? <Loader2 className="animate-spin" size={19} /> : <CreditCard size={19} />}
              {selectedPlan ? `Pagar ${formatPrice(selectedPlan.price)} con Mercado Pago` : 'Pagar con Mercado Pago'}
            </button>
            <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-[var(--wt-muted)]">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-[var(--wt-mint-dark)]" /> Pago 100% seguro</span>
              <button className="font-bold text-[var(--wt-mint-dark)] hover:underline" onClick={startGoogle}>Cambiar de cuenta Google</button>
            </div>
          </div>
        ) : (
          <form key="s3" onSubmit={submit} className="wt2-rise space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[var(--wt-ink)]">Nombre del negocio</span>
              <span className="relative block">
                <Store size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
                <input className={inputCls} placeholder="Ej: Cafetería Central" value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={60} autoFocus required />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[var(--wt-ink)]">Link de tu app</span>
              <span className={`flex items-stretch overflow-hidden rounded-2xl border-[1.5px] bg-[var(--wt-surface)] transition focus-within:ring-4 focus-within:ring-[var(--wt-mint)]/15 ${
                slug && slugInfo && !slugInfo.available ? 'border-red-300' : slug && slugOk ? 'border-[var(--wt-mint)]' : 'border-[var(--wt-border)] focus-within:border-[var(--wt-mint)]'
              }`}>
                <span className="flex items-center bg-[var(--wt-surface-raised)] px-3.5 text-[14px] font-semibold text-[var(--wt-muted)]">wintuu.com/</span>
                <input
                  className="min-w-0 flex-1 bg-transparent px-3 py-3.5 font-mono text-[15px] font-semibold text-[var(--wt-text)] outline-none placeholder:text-[var(--wt-muted)]/60"
                  placeholder="mi-negocio"
                  value={slug}
                  onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                  required
                />
                <span className="flex w-10 items-center justify-center">
                  {slug && slugOk ? <Check size={17} className="text-emerald-500" /> : null}
                </span>
              </span>
              <span className="mt-1.5 block text-[12.5px]">
                {slug && slugInfo && !slugInfo.available ? (
                  <span className="text-red-500">{slugInfo.reason}</span>
                ) : slug && slugOk ? (
                  <span className="text-emerald-600">¡Disponible! Así lo vas a compartir.</span>
                ) : (
                  <span className="text-[var(--wt-muted)]">Solo letras, números y guiones.</span>
                )}
              </span>
            </label>

            <div className="flex items-center gap-3 rounded-[22px] border border-dashed border-[var(--wt-border)] bg-[var(--wt-surface)] p-4">
              <span className="wt-heading flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--wt-mint)] to-[var(--wt-mint-dark)] text-[15px] font-bold text-white">
                {(businessName.trim() || 'TN').slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="wt-heading truncate text-[17px] font-bold text-[var(--wt-ink)]">{businessName.trim() || 'Tu negocio'}</p>
                <p className="truncate text-[12.5px] text-[var(--wt-muted)]">wintuu.com/{slugInfo?.slug || slug || 'tu-negocio'}</p>
              </div>
              <span className="ml-auto shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--wt-muted)]">Vista previa</span>
            </div>

            <button className={primaryBtn} disabled={submitting || !businessName || !slugOk}>
              {submitting ? <Loader2 className="animate-spin" size={19} /> : <Rocket size={19} />}
              Crear mi app
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
