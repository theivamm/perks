import { useState } from 'react';
import { LayoutDashboard, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SuperAdmin() {
  const { user, isAuthed, loginSuperAdmin, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await loginSuperAdmin(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const isSuper = isAuthed && user?.role === 'superadmin';

  return (
    <div className="page-aurora flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-glow">
              <LayoutDashboard size={26} />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-ink">Panel de control PERKS</h1>
            <p className="mt-2 text-sm text-ink-muted">Gestión de todas las plataformas del SaaS.</p>
          </div>

          {isSuper ? (
            <div className="mt-6 space-y-4 text-center">
              <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Sesión activa como <strong>{user.email}</strong>. El panel completo llega en la próxima fase.
              </p>
              <button className="btn-ghost w-full justify-center" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Contraseña</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn-primary w-full justify-center" disabled={busy}>
                {busy ? <Loader2 className="animate-spin" size={17} /> : <LogIn size={17} />}
                Ingresar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}