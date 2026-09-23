import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound, Loader2, Mail, Sparkles, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import AuthShell, { GoogleIcon, googleBtn, inputCls, mintBtn, primaryBtn } from '../components/landing/AuthShell.jsx';

export default function AccessPortal() {
  const { user, loginGoogle, loginEmailGlobal, switchApp } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [role, setRole] = useState('cliente');
  const [loginMode, setLoginMode] = useState('cliente');
  const [loading, setLoading] = useState(Boolean(user));
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [switching, setSwitching] = useState('');
  const [error, setError] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const loadApps = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/auth/apps');
      const list = data.apps || [];
      setApps(list);
      if (!list.some((app) => app.role === role)) setRole(list.some((app) => app.role === 'admin') ? 'admin' : 'cliente');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isReturn = new URLSearchParams(window.location.search).has('code') || window.location.hash.includes('access_token');
    if (!isReturn) return;
    (async () => {
      setGoogleLoading(true);
      try {
        let { data } = await supabase.auth.getSession();
        let session = data.session;
        if (!session) {
          const code = new URLSearchParams(window.location.search).get('code');
          if (code) {
            const result = await supabase.auth.exchangeCodeForSession(code);
            if (result.error) throw result.error;
            session = result.data.session;
          }
        }
        if (session) {
          await loginGoogle(session.access_token, { global: true });
          window.history.replaceState({}, document.title, '/ingresar');
          await loadApps();
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setGoogleLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const startGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/ingresar` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  const submitAdminEmail = async (e) => {
    e.preventDefault();
    setError('');
    setEmailBusy(true);
    try {
      await loginEmailGlobal(adminEmail, adminPassword);
      await loadApps();
    } catch (err) {
      setError(err.message);
    } finally {
      setEmailBusy(false);
    }
  };

  const enter = async (app) => {
    setSwitching(app.slug);
    setError('');
    try {
      const selectedUser = await switchApp(app.slug);
      navigate(`/${app.slug}${selectedUser.role === 'admin' ? '/dashboard' : ''}`);
    } catch (err) {
      setError(err.message);
      setSwitching('');
    }
  };

  const roles = useMemo(() => ({
    cliente: apps.filter((app) => app.role === 'cliente'),
    admin: apps.filter((app) => app.role === 'admin'),
  }), [apps]);
  const visibleApps = roles[role];

  const signedIn = Boolean(user);
  const variant = (signedIn ? role : loginMode) === 'admin' ? 'admin' : 'client';

  return (
    <AuthShell variant={variant}>
      <h1 className="wt-heading text-balance text-[clamp(36px,4vw,48px)] font-bold leading-[1.02] text-[var(--wt-ink)]">
        {signedIn ? `Hola, ${String(user.name || '').split(' ')[0] || 'de nuevo'}.` : 'Ingresá a Wintuu.'}
      </h1>
      <p className="mt-3 text-[16px] leading-relaxed text-[var(--wt-muted)]">
        {signedIn ? 'Elegí a qué app querés entrar.' : loginMode === 'admin' ? 'Entrá al panel de tu negocio.' : 'Tus puntos y cupones en todos los negocios, con tu cuenta de Google.'}
      </p>

      {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

      {!signedIn ? (
        <div className="mt-8">
          <RoleTabs
            value={loginMode}
            onChange={(v) => { setLoginMode(v); setError(''); }}
            options={[['cliente', UserRound, 'Soy cliente'], ['admin', ShieldCheck, 'Tengo un negocio']]}
          />

          {loginMode === 'cliente' ? (
            <div key="cli" className="wt2-rise mt-6 space-y-4">
              <button className={googleBtn} onClick={startGoogle} disabled={googleLoading}>
                {googleLoading ? <Loader2 className="animate-spin" size={19} /> : <GoogleIcon />}
                Continuar con Google
              </button>
              <p className="text-center text-[12.5px] text-[var(--wt-muted)]">Usá el mismo email con el que te registraste en cada negocio.</p>
            </div>
          ) : (
            <div key="adm" className="wt2-rise mt-6">
              <form onSubmit={submitAdminEmail} className="space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-[var(--wt-ink)]">Email</span>
                  <span className="relative block">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
                    <input className={inputCls} type="email" placeholder="admin@tulocal.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required autoFocus />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-[var(--wt-ink)]">Contraseña</span>
                  <span className="relative block">
                    <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
                    <input className={`${inputCls} !pr-20`} type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[12px] font-bold text-[var(--wt-mint-dark)] hover:bg-[var(--wt-surface-raised)]">
                      {showPwd ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </span>
                </label>
                <button type="submit" className={`${primaryBtn} !mt-5`} disabled={emailBusy || !adminEmail || !adminPassword}>
                  {emailBusy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Entrar al panel
                </button>
              </form>
              <div className="my-5 flex items-center gap-3 text-[12px] font-bold text-[var(--wt-muted)]">
                <span className="h-px flex-1 bg-[var(--wt-border)]" />o<span className="h-px flex-1 bg-[var(--wt-border)]" />
              </div>
              <button className={googleBtn} onClick={() => startGoogle()} disabled={googleLoading}>
                {googleLoading ? <Loader2 className="animate-spin" size={19} /> : <GoogleIcon />}
                Continuar con Google
              </button>
              <p className="mt-6 text-center text-[13.5px] text-[var(--wt-muted)]">
                ¿Todavía no tenés tu app?{' '}
                <Link to="/checkout" className="font-bold text-[var(--wt-mint-dark)] underline underline-offset-4">Creala acá</Link>
              </p>
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="mt-8 space-y-2.5">
          {[0, 1, 2].map((i) => <div key={i} className="h-[76px] animate-pulse rounded-[22px] bg-[var(--wt-surface-raised)]" />)}
        </div>
      ) : apps.length === 0 ? (
        <NoAppCard />
      ) : (
        <div className="mt-8">
          <RoleTabs
            value={role}
            onChange={setRole}
            options={[['cliente', UserRound, `Cliente · ${roles.cliente.length}`], ['admin', ShieldCheck, `Administrador · ${roles.admin.length}`]]}
          />
          <div className="mt-4 space-y-2.5">
            {visibleApps.length === 0 && role === 'admin' ? (
              <NoAppCard />
            ) : visibleApps.length === 0 ? (
              <p className="rounded-[22px] border-2 border-dashed border-[var(--wt-border)] px-4 py-8 text-center text-sm text-[var(--wt-muted)]">No tenés apps con este rol.</p>
            ) : (
              visibleApps.map((app, i) => (
                <button
                  key={app.id}
                  onClick={() => enter(app)}
                  disabled={Boolean(switching)}
                  className="wt2-rise wt2-lift group flex w-full items-center gap-3.5 rounded-[22px] border border-[var(--wt-border)] bg-[var(--wt-surface)] p-4 text-left hover:border-[var(--wt-mint)]"
                  style={{ '--d': `${i * 60}ms` }}
                >
                  <span className="wt-heading flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--wt-mint)] to-[var(--wt-mint-dark)] text-[16px] font-bold text-white">
                    {String(app.business_name || '?').trim().slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-[var(--wt-ink)]">{app.business_name}</span>
                    <span className="flex items-center gap-2 truncate text-[12.5px] text-[var(--wt-muted)]">
                      wintuu.com/{app.slug}
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${app.status === 'active' || app.status === 'activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--wt-surface-raised)] text-[var(--wt-muted)]'}`}>{app.status}</span>
                    </span>
                  </span>
                  {switching === app.slug ? (
                    <Loader2 className="animate-spin text-[var(--wt-mint-dark)]" size={18} />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wt-surface-raised)] text-[var(--wt-ink)] transition group-hover:translate-x-1 group-hover:bg-[var(--wt-mint)]">
                      <ArrowRight size={17} />
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </AuthShell>
  );
}

function NoAppCard() {
  return (
    <div className="wt2-pop-in relative mt-6 overflow-hidden rounded-[28px] bg-[#08282c] p-7 text-center text-white">
      <div className="wt-bg-blob" style={{ width: 200, height: 200, background: '#00cfcd', top: '-40%', right: '-20%', opacity: 0.35 }} />
      <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--wt-mint)] text-[#08282c]">
        <Sparkles size={24} />
      </span>
      <p className="wt-heading relative mt-4 text-[22px] font-bold">¿Tenés un negocio propio?</p>
      <p className="relative mx-auto mt-1.5 max-w-xs text-[14px] text-white/70">Todavía no administrás ninguna app. Creá la tuya y empezá a fidelizar clientes con cupones y puntos.</p>
      <Link to="/checkout" className={`${mintBtn} relative mt-5 !w-auto`}>
        Crear mi app <ArrowRight size={16} className="wt2-arrow" />
      </Link>
    </div>
  );
}

function RoleTabs({ value, onChange, options }) {
  return (
    <div className="relative grid grid-cols-2 gap-1 rounded-full bg-[var(--wt-surface-raised)] p-1.5">
      <span
        className="absolute bottom-1.5 top-1.5 w-[calc(50%-8px)] rounded-full bg-[var(--wt-surface)] shadow-[0_4px_14px_-6px_rgba(8,40,44,0.35)] transition-transform duration-300 ease-out"
        style={{ left: 6, transform: value === options[1][0] ? 'translateX(calc(100% + 4px))' : 'none' }}
      />
      {options.map(([v, Icon, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-[13.5px] font-bold transition-colors ${value === v ? 'text-[var(--wt-ink)]' : 'text-[var(--wt-muted)] hover:text-[var(--wt-ink)]'}`}
        >
          <Icon size={15} /> {label}
        </button>
      ))}
    </div>
  );
}
