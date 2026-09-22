import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, KeyRound, Loader2, Mail, Sparkles, ShieldCheck, UserRound } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import '../styles/wintuu-landing.css';
import WintuuLogo from '../components/landing/WintuuLogo.jsx';

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

  return (
    <div className="wintuu-landing relative min-h-screen lg:grid lg:grid-cols-2">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
        <div className="wt-bg-blob" style={{ width: 320, height: 320, background: '#bff3ea', top: '-6%', left: '-8%' }} />
        <div className="wt-bg-blob" style={{ width: 280, height: 280, background: '#ffd3ea', bottom: '-4%', right: '-6%' }} />

        <div className="wt-glass relative w-full max-w-lg p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="wt-nav-link inline-flex items-center gap-2 text-[14px] font-semibold"><ArrowLeft size={16} /> Volver</Link>
            <WintuuLogo height={20} />
          </div>

          <h1 className="wt-h2 mt-8 text-[32px] text-[var(--wt-text)]">Ingresá a tus beneficios.</h1>
          <p className="wt-body mt-2 text-[14.5px]">Clientes ingresan con Google. Administradores pueden usar email y contraseña o Google.</p>

          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

          {!user ? (
            <div className="mt-7">
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[rgba(20,36,37,0.05)] p-1 mb-6">
                <RoleButton active={loginMode === 'cliente'} icon={UserRound} label="Clientes" onClick={() => { setLoginMode('cliente'); setError(''); }} />
                <RoleButton active={loginMode === 'admin'} icon={ShieldCheck} label="Administradores" onClick={() => { setLoginMode('admin'); setError(''); }} />
              </div>

              {loginMode === 'cliente' ? (
                <>
                  <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--wt-border)] bg-white px-5 py-3.5 font-bold text-[var(--wt-text)] transition hover:bg-black/[0.03]" onClick={startGoogle} disabled={googleLoading}>
                    {googleLoading ? <Loader2 className="animate-spin" size={19} /> : <GoogleIcon />}
                    Continuar con Google
                  </button>
                  <p className="mt-4 text-center text-[12px] text-[var(--wt-muted)]">Usá el mismo email con el que te registraste en cada negocio.</p>
                </>
              ) : (
                <>
                  <form onSubmit={submitAdminEmail} className="space-y-3">
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
                      <input
                        className="w-full rounded-2xl border border-[var(--wt-border)] bg-white py-3 pl-10 pr-4 text-sm font-semibold text-[var(--wt-text)] outline-none placeholder:text-[var(--wt-muted)]/70 focus:border-[var(--wt-mint)] focus:ring-2 focus:ring-[var(--wt-mint)]/15"
                        type="email"
                        placeholder="admin@tulocal.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
                      <input
                        className="w-full rounded-2xl border border-[var(--wt-border)] bg-white py-3 pl-10 pr-4 text-sm font-semibold text-[var(--wt-text)] outline-none placeholder:text-[var(--wt-muted)]/70 focus:border-[var(--wt-mint)] focus:ring-2 focus:ring-[var(--wt-mint)]/15"
                        type="password"
                        placeholder="Contraseña"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="wt-btn-mint w-full" disabled={emailBusy || !adminEmail || !adminPassword}>
                      {emailBusy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                      Ingresar como administrador
                    </button>
                  </form>
                  <div className="my-5 flex items-center gap-3 text-xs font-bold text-[var(--wt-muted)]">
                    <span className="h-px flex-1 bg-[var(--wt-border)]" />o también<span className="h-px flex-1 bg-[var(--wt-border)]" />
                  </div>
                  <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--wt-border)] bg-white px-5 py-3.5 font-bold text-[var(--wt-text)] transition hover:bg-black/[0.03]" onClick={() => startGoogle()} disabled={googleLoading}>
                    {googleLoading ? <Loader2 className="animate-spin" size={19} /> : <GoogleIcon />}
                    Continuar con Google
                  </button>
                </>
              )}
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16 text-[var(--wt-muted)]"><Loader2 className="animate-spin" size={24} /></div>
          ) : apps.length === 0 ? (
            <div className="mt-7 rounded-2xl bg-[rgba(20,36,37,0.04)] p-5 text-center">
              <p className="font-bold text-[var(--wt-text)]">Esta cuenta todavía no pertenece a ninguna app.</p>
              <Link to="/checkout" className="wt-btn-mint mt-4 inline-flex">Quiero mi app <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <div className="mt-7">
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[rgba(20,36,37,0.05)] p-1">
                <RoleButton active={role === 'cliente'} icon={UserRound} label={`Cliente (${roles.cliente.length})`} onClick={() => setRole('cliente')} />
                <RoleButton active={role === 'admin'} icon={ShieldCheck} label={`Administrador (${roles.admin.length})`} onClick={() => setRole('admin')} />
              </div>

              <div className="mt-4 space-y-2">
                {visibleApps.length === 0 && role === 'admin' ? (
                  <div
                    className="relative overflow-hidden rounded-3xl border border-[var(--wt-border)] p-6 text-center"
                    style={{ background: 'linear-gradient(150deg, #eafff8 0%, #fff7ef 55%, #fff0f8 100%)' }}
                  >
                    <div className="wt-bg-blob" style={{ width: 160, height: 160, background: '#bff3ea', top: '-30%', left: '-10%' }} />
                    <div className="wt-bg-blob" style={{ width: 140, height: 140, background: '#ffd3ea', bottom: '-25%', right: '-8%' }} />
                    <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--wt-mint)] to-[var(--wt-mint-dark)] text-white shadow-lg">
                      <Sparkles size={24} />
                    </span>
                    <p className="relative mt-4 text-[17px] font-extrabold text-[var(--wt-text)]">¿Tenés un negocio propio?</p>
                    <p className="relative mx-auto mt-1.5 max-w-xs text-sm text-[var(--wt-muted)]">
                      Todavía no administrás ninguna app. Creá la tuya y empezá a fidelizar clientes con cupones y puntos.
                    </p>
                    <Link to="/checkout" className="wt-btn-mint relative mt-5 inline-flex">
                      Quiero mi app
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : visibleApps.length === 0 ? (
                  <p className="rounded-2xl bg-[rgba(20,36,37,0.04)] px-4 py-8 text-center text-sm text-[var(--wt-muted)]">No tenés apps con este rol.</p>
                ) : visibleApps.map((app) => (
                  <button key={app.id} onClick={() => enter(app)} disabled={Boolean(switching)} className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--wt-border)] p-4 text-left transition hover:border-[var(--wt-mint)] hover:bg-[rgba(0,207,205,0.06)]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(20,36,37,0.05)]"><Building2 size={19} className="text-[var(--wt-text)]" /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-bold text-[var(--wt-text)]">{app.business_name}</span><span className="block truncate text-xs text-[var(--wt-muted)]">/{app.slug} · {app.status}</span></span>
                    {switching === app.slug ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight className="text-[var(--wt-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--wt-text)]" size={18} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="relative hidden min-h-screen items-center justify-center overflow-hidden lg:flex" style={{ background: 'linear-gradient(165deg, #fff7ef 0%, #fff1e2 100%)' }}>
        <div className="wt-bg-blob" style={{ width: 380, height: 380, background: '#ffefae', top: '-8%', right: '-8%' }} />
        <div className="wt-bg-blob" style={{ width: 340, height: 340, background: '#e3dbff', bottom: '-6%', left: '-4%' }} />

        <div className="relative max-w-sm px-10 text-center">
          <div className="wt-coupon wt-coupon-lg wt-coupon-2 mx-auto w-full" style={{ background: 'linear-gradient(120deg, #ffd3ea, #fff0f8, #ffc2e0, #ffd3ea)' }}>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/55 text-[22px]">🎉</span>
              <div className="min-w-0 border-l-2 border-dashed border-[rgba(8,40,44,0.16)] pl-4 text-left">
                <p className="wt-heading text-[16px] font-semibold text-[var(--wt-ink)]">Premio activado</p>
                <p className="mt-0.5 text-[12.5px] text-[var(--wt-ink)]/65">Cupón de 15% off</p>
              </div>
            </div>
          </div>

          <p className="wt-heading mt-10 text-[28px] font-semibold leading-snug text-[var(--wt-text)]">
            Tus premios y negocios, siempre en un mismo lugar.
          </p>
          <p className="wt-body mt-3">Consultá puntos, cupones y beneficios sin instalar ninguna aplicación.</p>
        </div>
      </aside>
    </div>
  );
}

function RoleButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition"
      style={{ background: active ? '#fff' : 'transparent', color: active ? 'var(--wt-text)' : 'var(--wt-muted)', boxShadow: active ? '0 2px 8px rgba(60,40,20,0.1)' : 'none' }}
    >
      <Icon size={15} /> {label}
    </button>
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
