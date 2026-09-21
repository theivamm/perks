import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, KeyRound, Loader2, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=85';

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
    <div className="relative min-h-screen bg-cover bg-center lg:grid lg:grid-cols-2" style={{ backgroundImage: `url(${LOGIN_IMAGE})` }}>
      <div className="absolute inset-0 bg-[#0A0A0C]/75 backdrop-blur-[2px] lg:hidden" />
      <section className="relative flex min-h-screen items-center justify-center px-5 py-10 lg:bg-[#F5F1E8] lg:text-[#151515]">
        <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-white/95 p-6 text-[#151515] shadow-2xl backdrop-blur sm:p-8 lg:border-black/10 lg:shadow-xl">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-black/55 hover:text-black"><ArrowLeft size={16} /> Volver</Link>
            <span className="inline-flex items-center gap-2 font-black"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400"><Sparkles size={16} /></span> WINTUU</span>
          </div>

          <h1 className="mt-8 text-3xl font-black tracking-tight">Ingresá a tus beneficios.</h1>
          <p className="mt-2 text-sm leading-relaxed text-black/55">Clientes ingresan con Google. Administradores pueden usar email y contraseña o Google.</p>

          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

          {!user ? (
            <div className="mt-7">
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-black/[0.06] p-1 mb-6">
                <RoleButton active={loginMode === 'cliente'} icon={UserRound} label="Clientes" onClick={() => { setLoginMode('cliente'); setError(''); }} />
                <RoleButton active={loginMode === 'admin'} icon={ShieldCheck} label="Administradores" onClick={() => { setLoginMode('admin'); setError(''); }} />
              </div>

              {loginMode === 'cliente' ? (
                <>
                  <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/15 bg-white px-5 py-3.5 font-extrabold transition hover:bg-black/5" onClick={startGoogle} disabled={googleLoading}>
                    {googleLoading ? <Loader2 className="animate-spin" size={19} /> : <GoogleIcon />}
                    Continuar con Google
                  </button>
                  <p className="mt-4 text-center text-xs text-black/40">Usá el mismo email con el que te registraste en cada negocio.</p>
                </>
              ) : (
                <>
                  <form onSubmit={submitAdminEmail} className="space-y-3">
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35" />
                      <input
                        className="w-full rounded-2xl border border-black/15 bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/10"
                        type="email"
                        placeholder="admin@tulocal.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35" />
                      <input
                        className="w-full rounded-2xl border border-black/15 bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none placeholder:text-black/30 focus:border-black/30 focus:ring-2 focus:ring-black/10"
                        type="password"
                        placeholder="Contraseña"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#151515] px-5 py-3.5 font-extrabold text-white transition hover:bg-black/80 disabled:opacity-50"
                      disabled={emailBusy || !adminEmail || !adminPassword}
                    >
                      {emailBusy ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                      Ingresar como administrador
                    </button>
                  </form>
                  <div className="my-5 flex items-center gap-3 text-xs font-bold text-black/30">
                    <span className="h-px flex-1 bg-black/10" />o también<span className="h-px flex-1 bg-black/10" />
                  </div>
                  <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/15 bg-white px-5 py-3.5 font-extrabold transition hover:bg-black/5" onClick={() => startGoogle()} disabled={googleLoading}>
                    {googleLoading ? <Loader2 className="animate-spin" size={19} /> : <GoogleIcon />}
                    Continuar con Google
                  </button>
                </>
              )}
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16 text-black/40"><Loader2 className="animate-spin" size={24} /></div>
          ) : apps.length === 0 ? (
            <div className="mt-7 rounded-2xl bg-black/[0.04] p-5 text-center">
              <p className="font-bold">Esta cuenta todavía no pertenece a ninguna app.</p>
              <Link to="/checkout" className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 font-extrabold">Quiero mi app <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <div className="mt-7">
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-black/[0.06] p-1">
                <RoleButton active={role === 'cliente'} icon={UserRound} label={`Cliente (${roles.cliente.length})`} onClick={() => setRole('cliente')} />
                <RoleButton active={role === 'admin'} icon={ShieldCheck} label={`Administrador (${roles.admin.length})`} onClick={() => setRole('admin')} />
              </div>

              <div className="mt-4 space-y-2">
                {visibleApps.length === 0 ? (
                  <p className="rounded-2xl bg-black/[0.04] px-4 py-8 text-center text-sm text-black/45">No tenés apps con este rol.</p>
                ) : visibleApps.map((app) => (
                  <button key={app.id} onClick={() => enter(app)} disabled={Boolean(switching)} className="group flex w-full items-center gap-3 rounded-2xl border border-black/10 p-4 text-left transition hover:border-amber-400 hover:bg-amber-50">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/[0.05]"><Building2 size={19} /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-extrabold">{app.business_name}</span><span className="block truncate text-xs text-black/45">/{app.slug} · {app.status}</span></span>
                    {switching === app.slug ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight className="text-black/30 transition group-hover:translate-x-1 group-hover:text-black" size={18} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden bg-cover bg-center lg:block" style={{ backgroundImage: `url(${LOGIN_IMAGE})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 max-w-xl p-12 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Cada visita cuenta</p>
          <p className="mt-3 text-4xl font-black leading-tight">Tus premios y negocios, siempre en un mismo lugar.</p>
          <p className="mt-4 text-white/70">Consultá puntos, cupones y beneficios sin instalar ninguna aplicación.</p>
        </div>
      </aside>
    </div>
  );
}

function RoleButton({ active, icon: Icon, label, onClick }) {
  return <button onClick={onClick} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold transition ${active ? 'bg-white shadow-sm' : 'text-black/45 hover:text-black'}`}><Icon size={15} /> {label}</button>;
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
