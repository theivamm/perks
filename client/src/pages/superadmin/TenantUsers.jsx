import { useState } from 'react';
import {
  Check,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  ShieldCheck,
  Trash2,
  User,
  UserMinus,
  UserPlus,
  X,
} from 'lucide-react';
import { api } from '../../api.js';

function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

function RoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <ShieldCheck size={11} />
        Admin
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

function formatJoined(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' });
}

export default function TenantUsers({ tenantId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api(`/api/superadmin/tenants/${tenantId}/users`);
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl bg-surface-alt p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-ink">Usuarios {users.length > 0 && `(${users.length})`}</p>
        <button className="btn-ghost !py-1.5" onClick={() => setCreating((v) => !v)}>
          {creating ? <X size={15} /> : <UserPlus size={15} />}
          {creating ? 'Cancelar' : 'Agregar usuario'}
        </button>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}

      {creating && (
        <AddForm
          tenantId={tenantId}
          onDone={() => {
            setCreating(false);
            load();
          }}
        />
      )}

      <div className="mt-3">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-ink-muted">
            <Loader2 className="animate-spin" size={18} />
          </div>
        ) : users.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-muted">Esta app no tiene usuarios todavía.</p>
        ) : (
          <div className="divide-y divide-line">
            {users.map((u) => (
              <UserRow key={u.id} user={u} onSaved={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddForm({ tenantId, onDone }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('cliente');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenantId}/users`, {
        method: 'POST',
        body: { name, email, role, password: password || undefined },
      });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3 rounded-2xl bg-surface p-4 sm:grid-cols-2">
      <div>
        <label className="label">Nombre</label>
        <input className="input !py-2" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input !py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="label">Rol</label>
        <select className="input !py-2" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <div>
        <label className="label">Contraseña inicial (opcional)</label>
        <input
          className="input !py-2"
          type="text"
          placeholder="Si no se genera una automática"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
        />
      </div>
      {error && <p className="sm:col-span-2 text-xs font-medium text-red-500">{error}</p>}
      <div className="sm:col-span-2">
        <button className="btn-primary !py-2" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
          Crear usuario
        </button>
      </div>
    </form>
  );
}

function UserRow({ user, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [resetting, setResetting] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/users/${user.id}`, { method: 'PATCH', body: { name, role } });
      setEditing(false);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/users/${user.id}/reset-password`, { method: 'POST', body: { password } });
      setResetting(false);
      setPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const unlink = async () => {
    if (!confirm(`¿Desvincular a "${user.name}" de esta app? La cuenta se conserva pero deja de pertenecer a la app.`)) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/users/${user.id}`, { method: 'PATCH', body: { tenant_id: null } });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`¿Eliminar la cuenta de "${user.name}" (${user.email}) y todos sus datos? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/users/${user.id}`, { method: 'DELETE' });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-softer text-xs font-extrabold text-primary">
          {initials(user.name)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold text-ink">{user.name}</p>
            <RoleBadge role={user.role} />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Mail size={11} />
              {user.email}
            </span>
            {user.phone && <span>· {user.phone}</span>}
            <span>· desde {formatJoined(user.created_at)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button className="btn-ghost !px-2.5 !py-1.5" onClick={() => setResetting((v) => !v)} disabled={busy} title="Reestablecer contraseña">
            <KeyRound size={14} />
            Contraseña
          </button>
          <button className="btn-ghost !px-2.5 !py-1.5" onClick={() => setEditing((v) => !v)} disabled={busy} title="Editar">
            {editing ? <X size={14} /> : <Pencil size={14} />}
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 !py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-500/10 disabled:opacity-50 dark:text-amber-400"
            onClick={unlink}
            disabled={busy}
            title="Desvincular de la app"
          >
            <UserMinus size={14} />
            Desvincular
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 !py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
            onClick={remove}
            disabled={busy}
            title="Eliminar cuenta"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}

      {editing && (
        <div className="mt-3 grid gap-3 rounded-2xl bg-surface p-4 sm:grid-cols-3">
          <div>
            <label className="label">Nombre</label>
            <input className="input !py-2" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Rol</label>
            <select className="input !py-2" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn-primary !py-2" disabled={busy} onClick={save}>
              {busy ? <Loader2 className="animate-spin" size={15} /> : <Check size={15} />}
              Guardar
            </button>
          </div>
        </div>
      )}

      {resetting && (
        <form onSubmit={resetPassword} className="mt-3 flex flex-wrap items-end gap-3 rounded-2xl bg-surface p-4">
          <div className="min-w-[220px] flex-1">
            <label className="label">Nueva contraseña (mín. 6 caracteres)</label>
            <input
              className="input !py-2"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              autoFocus
              autoComplete="off"
            />
          </div>
          <button className="btn-primary !py-2" disabled={busy || password.length < 6}>
            {busy ? <Loader2 className="animate-spin" size={15} /> : <Check size={15} />}
            Guardar contraseña
          </button>
        </form>
      )}
    </div>
  );
}