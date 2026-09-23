import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Loader2, LogIn, Mail, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import { supabase } from '../lib/supabase.js';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const { loginAdminEmail, loginOtp, loginGoogle } = useAuth();
  const { settings, toggleTheme } = useTheme();
  const { t } = useTenant();
  const navigate = useNavigate();

  const [mode, setMode] = useState('client');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const go = (u) => navigate(t(u?.role === 'admin' ? '/dashboard' : '/'));

  useEffect(() => {
    const handleOAuthReturn = async () => {
      const search = new URLSearchParams(window.location.search);
      const isOAuthReturn = search.has('code') || window.location.hash.includes('access_token');
      if (!isOAuthReturn) return;
      const adminIntent = search.get('admin') === '1';
      setGoogleLoading(true);
      try {
        let session = null;
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        session = data.session;

        if (!session) {
          const code = new URLSearchParams(window.location.search).get('code');
          if (code) {
            const res = await supabase.auth.exchangeCodeForSession(code);
            if (res.error) throw res.error;
            session = res.data.session;
            window.history.replaceState({}, document.title, t('/login'));
          }
        }

        if (session) {
          const u = await loginGoogle(session.access_token);
          if (adminIntent && u?.role !== 'admin') {
            setMode('admin');
            setError('Esta cuenta de Google no administra este negocio. Entrá con la cuenta con la que creaste la app.');
            setGoogleLoading(false);
            return;
          }
          go(u);
        }
      } catch (e) {
        setError(e.message);
        setGoogleLoading(false);
      }
    };
    handleOAuthReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginGoogle]);

  const startGoogle = async (admin = false) => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${t('/login')}${admin ? '?admin=1' : ''}`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  const submitAdmin = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const res = await loginAdminEmail(email, password);
      if (res?.step === 'otp') {
        setLoginToken(res.login_token);
        setOtpCode('');
        setPassword('');
      } else {
        go(res);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    if (busy || otpCode.length !== 6) return;
    setError('');
    setBusy(true);
    try {
      const u = await loginOtp(loginToken, otpCode);
      go(u);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const cancelOtp = () => {
    setLoginToken('');
    setOtpCode('');
    setPassword('');
    setError('');
  };

  const subtitle =
    mode === 'client'
      ? 'Entrá con Google para activar cupones, sumar puntos y canjear premios.'
      : loginToken
      ? 'Ingresá el código de 6 dígitos de tu app de autenticación.'
      : 'Ingresá con tu email y contraseña de administrador.';

  const benefits = [
    ['Activá un cupón', 'Elegí el premio que querés ganar.'],
    ['Mostrá tu QR al pagar', 'El local suma tus puntos en segundos.'],
    ['Canjeá tu premio', 'Al completarlo recibís tu código.'],
  ];

  return (
    <div className="grid min-h-screen bg-surface-page lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-primary-strong p-12 text-primary-contrast lg:flex lg:flex-col lg:justify-between">
        <div className="orb -right-24 -top-24 h-96 w-96 bg-primary-contrast/15" />
        <div className="orb -bottom-32 -left-20 h-80 w-80 bg-primary-contrast/10" />
        <Link to={t('/')} className="relative flex items-center gap-3">
          <Logo variant="iso" size="lg" showText={false} fallback="initials" circle />
          <span className="flex flex-col">
            <span className="font-heading text-xl font-bold leading-tight">{settings.businessName || 'Mi negocio'}</span>
            {settings.tagline && <span className="text-sm opacity-80">{settings.tagline}</span>}
          </span>
        </Link>
        <div className="relative max-w-md">
          <h2 className="font-heading text-5xl font-bold leading-[1.02]">Sumá compras,<br />ganá premios.</h2>
          <ul className="mt-8 space-y-3">
            {benefits.map(([title, sub], i) => (
              <li key={title} className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold text-primary-strong">{i + 1}</span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm opacity-80">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm opacity-70">Con Wintuu ganamos todos.</p>
      </aside>

      <div className="relative flex flex-col px-5 py-5 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to={t('/')} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink">
            <ArrowLeft size={16} />
            Volver al menú
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-surface-alt"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            {settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo variant="iso" size="md" showText={false} fallback="initials" circle />
            <span className="font-heading text-lg font-bold text-ink">{settings.businessName || 'Mi negocio'}</span>
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight text-ink">
            {mode === 'client' ? 'Ingresá' : loginToken ? 'Verificación' : 'Panel del local'}
          </h1>
          <p className="mt-2 text-[15px] text-ink-muted">{subtitle}</p>

          <div className="mt-7">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-surface-alt p-1">
              <button
                aria-pressed={mode === 'client'}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                  mode === 'client'
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
                onClick={() => {
                  setMode('client');
                  setError('');
                  cancelOtp();
                }}
              >
                <UserRound size={15} />
                Clientes
              </button>
              <button
                aria-pressed={mode === 'admin'}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                  mode === 'admin'
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
                onClick={() => {
                  setMode('admin');
                  setError('');
                }}
              >
                <ShieldCheck size={15} />
                Administración
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            {mode === 'client' ? (
              <>
                <button
                  className="btn-ghost w-full !py-3.5 text-base shadow-sm hover:border-primary/40"
                  onClick={() => startGoogle()}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <GoogleIcon />
                  )}
                  Continuar con Google
                </button>

                <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">
                  Al ingresar se crea tu cuenta de fidelización automáticamente.
                  <br />
                  Podés eliminar tu cuenta cuando quieras desde Configuración.
                </p>
              </>
            ) : loginToken ? (
              <form onSubmit={submitOtp} className="space-y-4">
                <div>
                  <label htmlFor="login-otp-code" className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Código de 6 dígitos
                  </label>
                  <input
                    id="login-otp-code"
                    className="input text-center font-mono text-xl tracking-[0.4em]"
                    placeholder="••••••"
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    inputMode="numeric"
                    autoFocus
                    required
                  />
                </div>
                <button className="btn-primary w-full justify-center" disabled={busy || otpCode.length !== 6}>
                  {busy ? <Loader2 className="animate-spin" size={17} /> : <ShieldCheck size={17} />}
                  Verificar código
                </button>
                <button
                  type="button"
                  className="btn-ghost w-full justify-center"
                  onClick={cancelOtp}
                  disabled={busy}
                >
                  Volver al email y contraseña
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={submitAdmin} className="space-y-4">
                  <div>
                    <label htmlFor="login-admin-email" className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                      <input
                        id="login-admin-email"
                        className="input !pl-9"
                        type="email"
                        placeholder="admin@tulocal.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="login-admin-password" className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Contraseña
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                      <input
                        id="login-admin-password"
                        className="input !pl-9"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button className="btn-primary w-full justify-center" disabled={busy || !email || !password}>
                    {busy ? <Loader2 className="animate-spin" size={17} /> : <LogIn size={17} />}
                    Iniciar sesión
                  </button>
                </form>

                <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                  <span className="h-px flex-1 bg-line" />
                  o
                  <span className="h-px flex-1 bg-line" />
                </div>

                <button
                  className="btn-ghost w-full !py-3 text-base"
                  onClick={() => startGoogle(true)}
                  disabled={googleLoading}
                >
                  {googleLoading ? <Loader2 className="animate-spin" size={18} /> : <GoogleIcon />}
                  Ingresar con Google
                </button>
                <p className="mt-2 text-center text-xs leading-relaxed text-ink-muted">
                  Si creaste tu app con Google, entrá con esa misma cuenta.
                </p>
              </>
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