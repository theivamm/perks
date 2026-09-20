import { useCallback, useEffect, useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, Loader2, Mail, Pencil, Plus, ShieldCheck, Trash2, User, X } from 'lucide-react';
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

function CredentialsForm({ tenantId, userId, onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email && !password) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenantId}/users/${userId}/credentials`, {
        method: 'PATCH',
        body: { email: email || undefined, password: password || undefined },
      });
      setOk(true);
      setTimeout(() => { setOk(false); onDone(); }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-2 grid gap-2 rounded-2xl bg-surface-alt p-3 sm:grid-cols-[1fr,1fr,auto]">
      <div className="relative">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          className="input !py-2 !pl-8 text-xs"
          type="email"
          placeholder="Nuevo email (opcional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="relative">
        <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          className="input !py-2 !pl-8 !pr-9 text-xs"
          type={showPwd ? 'text' : 'password'}
          placeholder="Nueva contraseña (opcional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
        />
        {password && (
          <button
            type="button"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            onClick={() => setShowPwd((v) => !v)}
            tabIndex={-1}
          >
            {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="btn-primary !py-2 text-xs"
          disabled={busy || (!email && !password)}
        >
          {busy ? <Loader2 className="animate-spin" size={13} /> : <Check size={13} />}
          Guardar
        </button>
        <button type="button" className="btn-ghost !py-2 text-xs" onClick={onDone}>
          <X size={13} />
        </button>
      </div>
      {error && <p className="col-span-full text-xs font-medium text-red-500">{error}</p>}
    </form>
  );
}

function AddAdminForm({ tenantId, onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenantId}/admins`, {
        method: 'POST',
        body: { email, password: password || undefined, name: name || undefined },
      });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 rounded-2xl border border-dashed border-line bg-surface-alt p-4">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-muted">Agregar administrador</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="relative">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="input !py-2 !pl-8 text-xs"
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="relative">
          <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="input !py-2 !pl-8 !pr-9 text-xs"
            type={showPwd ? 'text' : 'password'}
            placeholder="Contraseña (si es nuevo)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
          {password && (
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              onClick={() => setShowPwd((v) => !v)}
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
        </div>
        <input
          className="input !py-2 text-xs"
          placeholder="Nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-ink-muted">Si el email ya existe, se agrega directamente. Si es nuevo, necesitás poner una contraseña.</p>
      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="submit" className="btn-primary !py-2 text-xs" disabled={busy || !email}>
          {busy ? <Loader2 className="animate-spin" size={13} /> : <Plus size={13} />}
          Agregar
        </button>
        <button type="button" className="btn-ghost !py-2 text-xs" onClick={onDone}>
          <X size={13} /> Cancelar
        </button>
      </div>
    </form>
  );
}

export default function TenantUsers({ tenantId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [addingAdmin, setAddingAdmin] = useState(false);
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
    if (!confirm(`¿Quitar a "${user.name}" (${user.email}) de esta app? Su cuenta y sus accesos a otras apps se conservarán.`)) return;
    setDeletingId(user.id);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenantId}/users/${user.id}`, { method: 'DELETE' });
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const admins = users.filter((u) => u.role === 'admin');
  const clients = users.filter((u) => u.role !== 'admin');

  return (
    <div className="mt-4 rounded-2xl bg-surface-alt p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold text-ink">Usuarios {!loading && `(${users.length})`}</p>
        <button
          className="btn-ghost !py-1.5 text-xs"
          onClick={() => setAddingAdmin((v) => !v)}
        >
          {addingAdmin ? <X size={13} /> : <Plus size={13} />}
          {addingAdmin ? 'Cancelar' : 'Agregar admin'}
        </button>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}

      {addingAdmin && (
        <AddAdminForm
          tenantId={tenantId}
          onDone={() => { setAddingAdmin(false); load(); }}
        />
      )}

      <div className="mt-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-muted">
            <Loader2 className="animate-spin" size={18} />
            Cargando usuarios...
          </div>
        ) : users.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-muted">Esta app no tiene usuarios registrados.</p>
        ) : (
          <>
            {admins.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">Administradores</p>
                <div className="divide-y divide-line">
                  {admins.map((user) => (
                    <div key={user.id} className="py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
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
                          className="btn-ghost !py-1.5 text-xs"
                          onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                          disabled={deletingId !== null}
                        >
                          {editingId === user.id ? <X size={13} /> : <Pencil size={13} />}
                          {editingId === user.id ? 'Cancelar' : 'Editar'}
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
                          onClick={() => remove(user)}
                          disabled={deletingId !== null}
                        >
                          {deletingId === user.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                          Quitar
                        </button>
                      </div>
                      {editingId === user.id && (
                        <CredentialsForm
                          tenantId={tenantId}
                          userId={user.id}
                          onDone={() => { setEditingId(null); load(); }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {clients.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">Clientes ({clients.length})</p>
                <div className="divide-y divide-line">
                  {clients.map((user) => (
                    <div key={user.id} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-softer text-xs font-extrabold text-primary">
                        {initials(user.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink">{user.name}</p>
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
                        Quitar de la app
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
