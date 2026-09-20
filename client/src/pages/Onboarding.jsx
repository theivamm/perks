import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Link2,
  Loader2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function formatPrice(value) {
  return `$ ${Number(value || 0).toLocaleString('es-AR')}`;
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

  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugInfo, setSlugInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === desiredPlan) || null,
    [plans, desiredPlan]
  );

  useEffect(() => {
    api('/api/plans')
      .then((d) => setPlans(d.plans || []))
      .catch(() => {});
  }, []);

  // Vuelta del login con Google
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
        if (session) await loginGoogle(session.access_token);
      } catch (e) {
        setError(e.message);
      } finally {
        setOauthLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginGoogle]);

  // Estado del onboarding
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api('/api/onboarding/status')
      .then((s) => {
        if (alive) setStatus(s);
      })
      .catch((e) => {
        if (alive) setStatus({ hasTenant: false, canStart: false, error: e.message });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isAuthed, user?.id]);

  useEffect(() => {
    if (status?.hasTenant && status.slug) navigate(`/${status.slug}/dashboard`, { replace: true });
  }, [status, navigate]);

  // Slug automático a partir del nombre
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(businessName));
  }, [businessName, slugTouched]);

  useEffect(() => {
    if (!slug) {
      setSlugInfo(null);
      return;
    }
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

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (slugInfo && !slugInfo.available) {
      setError(slugInfo.reason || 'Ese link no está disponible');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api('/api/onboarding/create', {
        method: 'POST',
        body: { businessName, slug, plan: desiredPlan },
      });
      if (res.token) adoptSession(res, res.slug);
      navigate(`/${res.slug}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const slugOk = slugInfo?.available;

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-page px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} />
          Volver a PERKS
        </Link>

        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary-strong p-6 text-primary-contrast">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-contrast/15">
              <Rocket size={24} />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold">Creá tu app de fidelización</h1>
            <p className="mt-1 text-sm text-primary-contrast/85">
              {selectedPlan
                ? `Plan ${selectedPlan.name} · ${formatPrice(selectedPlan.price)} ${selectedPlan.period}`
                : 'En unos segundos tenés tu propio perfil listo para tus clientes.'}
            </p>
          </div>

          <div className="space-y-5 p-6">
            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-10 text-ink-muted">
                <Loader2 className="animate-spin" size={22} />
              </div>
            ) : !isAuthed ? (
              <>
                <div className="flex items-start gap-3 rounded-2xl bg-surface-alt p-4">
                  <ShieldCheck size={18} className="mt-0.5 text-primary" />
                  <p className="text-sm text-ink-muted">
                    Entrá con tu cuenta de Google para crear el perfil de tu negocio.
                    Es la misma cuenta que vas a usar para administrarlo.
                  </p>
                </div>
                <button className="btn-ghost w-full !py-3 text-base" onClick={startGoogle} disabled={oauthLoading}>
                  {oauthLoading ? <Loader2 className="animate-spin" size={18} /> : <GoogleIcon />}
                  Continuar con Google
                </button>
              </>
            ) : status?.canStart ? (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Nombre del negocio
                  </label>
                  <div className="relative">
                    <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      className="input !pl-9"
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
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Link de tu app
                  </label>
                  <div className="relative">
                    <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      className="input !pl-9 font-mono text-sm"
                      placeholder="mi-negocio"
                      value={slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setSlug(slugify(e.target.value));
                      }}
                      required
                    />
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
                    {slug && slugOk && (
                      <>
                        <Check size={13} className="text-green-500" />
                        <span>
                          Tu app va a estar en{' '}
                          <strong className="text-ink">perks.com/{slugInfo?.slug || slug}</strong>
                        </span>
                      </>
                    )}
                    {slug && slugInfo && !slugInfo.available && (
                      <span className="text-red-500">{slugInfo.reason}</span>
                    )}
                    {!slug && <span>Elegí el link con el que vas a compartir tu app.</span>}
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-surface-alt p-4">
                  <Sparkles size={18} className="mt-0.5 text-primary" />
                  <p className="text-sm text-ink-muted">
                    Tu app arranca vacía: después cargás tus productos, cupones y logo desde el panel.
                  </p>
                </div>

                <button className="btn-primary w-full justify-center !py-3" disabled={submitting || !businessName || !slugOk}>
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
                  Crear mi app
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-2xl bg-surface-alt p-4">
                  <ShieldCheck size={18} className="mt-0.5 text-primary" />
                  <div className="text-sm text-ink-muted">
                    <p className="font-semibold text-ink">Todavía no registramos tu pago</p>
                    <p className="mt-1">
                      Si ya pagaste, esperá unos minutos: MercadoPago nos avisa automáticamente.
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  {plans.map((p) => (
                    <a
                      key={p.id}
                      href={p.link || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`card flex items-center justify-between p-4 ${
                        p.link ? 'hover:border-primary' : 'cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-ink">Plan {p.name}</p>
                        <p className="text-xs text-ink-muted">{p.period}</p>
                      </div>
                      <p className="text-lg font-extrabold text-primary">{formatPrice(p.price)}</p>
                    </a>
                  ))}
                </div>
                <button className="btn-ghost w-full justify-center" onClick={startGoogle}>
                  Cambiar de cuenta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37.4 39.4 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}
