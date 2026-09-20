import { useCallback, useEffect, useState } from 'react';
import { Loader2, Mail, ShieldCheck, Trash2, User } from 'lucide-react';
import { api } from '../../api.js';

function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');
}

function RoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <ShieldCheck size={11} />
        Administrador
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-ink-muted">
      <User size={11} />
      Cliente
    </span>
  );
}

export default function TenantUsers({ tenantId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api(`/api/superadmin/tenants/${tenantId}/users`);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (user) => {
    if (!confirm(`¿Eliminar la cuenta de "${user.name}" (${user.email})? Esta acción no se puede deshacer.`)) return;
    setDeletingId(user.id);
    setError('');
    try {
      await api(`/api/superadmin/users/${user.id}`, { method: 'DELETE' });
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-4 rounded-2xl bg-surface-alt p-4">
      <p className="text-sm font-extrabold text-ink">Usuarios {!loading && `(${users.length})`}</p>
      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}

      <div className="mt-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
            <Loader2 className="animate-spin" size={18} />
            Cargando usuarios...
          </div>
        ) : users.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-muted">Esta app no tiene usuarios registrados.</p>
        ) : (
          <div className="divide-y divide-line">
            {users.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-softer text-xs font-extrabold text-primary">
                  {initials(user.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-ink">{user.name}</p>
                    <RoleBadge role={user.role} />
                  </div>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-muted">
                    <Mail size={11} />
                    {user.email}
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                  onClick={() => remove(user)}
                  disabled={deletingId !== null}
                >
                  {deletingId === user.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
