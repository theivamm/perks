import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { supabase } from '../lib/supabase.js';

export default function SignUp() {
  const { register, loginGoogle, loading } = useAuth();
  const { settings, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const go = (u) => navigate(u?.role === 'admin' ? '/dashboard' : '/');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const u = await register(form.name, form.email, form.password);
      go(u);
    } catch (err) {
      setError(err.message);
    }
  };

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
                <UserPlus size={24} />
              </div>
              <button
                className="rounded-lg bg-primary-contrast/15 p-2 hover:bg-primary-contrast/25"
                onClick={toggleTheme}
                aria-label="Cambiar tema"
              >
                {settings.theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold">Crear cuenta</h1>
            <p className="mt-1 text-sm text-primary-contrast/85">
              Sumate a la fidelización y empezá tu próxima visita.
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  className="input"
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
                    onClick={() => setShow((s) => !s)}
                    aria-label="Mostrar contraseña"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <button className="btn-primary w-full !py-2.5" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                Crear cuenta
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs font-semibold text-ink-muted">o continúa con</span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <button
              className="btn-ghost w-full !py-2.5"
              onClick={startGoogle}
              disabled={googleLoading}
            >
              {googleLoading ? <Loader2 className="animate-spin" size={16} /> : <GoogleIcon />}
              Continuar con Google
            </button>

            <div className="mt-5 text-center text-sm text-ink-muted">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="font-semibold text-primary-strong hover:underline">
                Iniciá sesión
              </Link>
            </div>
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