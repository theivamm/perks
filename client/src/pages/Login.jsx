import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Loader2, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { supabase } from '../lib/supabase.js';

export default function Login() {
  const { login, loginOtp, loginGoogle } = useAuth();
  const { settings, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [mode, setMode] = useState('client');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const go = (u) => navigate(u?.role === 'admin' ? '/dashboard' : '/');

  useEffect(() => {
    const handleOAuthReturn = async () => {
      const isOAuthReturn =
        new URLSearchParams(window.location.search).has('code') ||
        window.location.hash.includes('access_token');
      if (!isOAuthReturn) return;
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
            window.history.replaceState({}, document.title, '/login');
          }
        }

        if (session) {
          const u = await loginGoogle(session.access_token);
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

  const startGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
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
      const res = await login(username.trim(), password);
      if (res?.step === 'otp') {
        setLoginToken(res.login_token);
        setOtpCode('');
        setPassword('');
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
    setError('');
  };

  const subtitle =
    mode === 'client'
      ? 'Entrá con Google para activar cupones, sumar puntos y canjear premios.'
      : loginToken
      ? 'Ingresá el código de 6 dígitos de tu app de autenticación.'
      : 'Acceso exclusivo para la administración del local.';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-page px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} />
          Volver al menú
        </Link>

        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary-strong p-6 text-primary-contrast">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-contrast/15">
                <LogIn size={24} />
              </div>
              <button
                className="rounded-lg bg-primary-contrast/15 p-2 hover:bg-primary-contrast/25"
                onClick={toggleTheme}
                aria-label="Cambiar tema"
              >
                {settings.theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold">Ingresá</h1>
            <p className="mt-1 text-sm text-primary-contrast/85">{subtitle}</p>
          </div>

          <div className="p-6">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-2xl bg-surface-alt p-1">
              <button
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
                  className="btn-ghost w-full !py-3 text-base"
                  onClick={startGoogle}
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
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Código de 6 dígitos
                  </label>
                  <input
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
                  Volver al usuario y contraseña
                </button>
              </form>
            ) : (
              <form onSubmit={submitAdmin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Usuario
                  </label>
                  <div className="relative">
                    <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      className="input !pl-9"
                      placeholder="administracion"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Contraseña
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      className="input !pl-9"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button className="btn-primary w-full justify-center" disabled={busy || !username || !password}>
                  {busy ? <Loader2 className="animate-spin" size={17} /> : <LogIn size={17} />}
                  Iniciar sesión
                </button>
              </form>
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