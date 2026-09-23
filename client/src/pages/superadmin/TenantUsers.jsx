import { useCallback, useEffect, useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, Loader2, Mail, Plus, Trash2, X } from 'lucide-react';
import { api } from '../../api.js';
import { BTN_GHOST, BTN_INK, ConfirmDialog, EYEBROW, FIELD, initials } from './SuperAdmin.jsx';

function PasswordField({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
      <input
        className={`${FIELD} !py-2 !pl-8 !pr-9 !text-[13px]`}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={6}
        autoComplete="new-password"
      />
      {value && (
        <button type="button" tabIndex={-1} onClick={() => setShow((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--wt-muted)] hover:text-[var(--wt-ink)]">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </span>
  );
}

function EmailField({ value, onChange, placeholder, required, autoFocus }) {
  return (
    <span className="relative block">
      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
      <input
        className={`${FIELD} !py-2 !pl-8 !text-[13px]`}
        type="email"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
      />
    </span>
  );
}

function CredentialsForm({ tenantId, userId, onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setTimeout(onDone, 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-2 border-t border-[rgba(20,36,37,0.08)] pt-3">
      <EmailField value={email} onChange={setEmail} placeholder="Nuevo email (opcional)" />
      <PasswordField value={password} onChange={setPassword} placeholder="Nueva contraseña (opcional)" />
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button className={`${BTN_INK} !px-4 !py-2 !text-xs`} disabled={busy || ok || (!email && !password)}>
          {busy ? <Loader2 className="animate-spin" size={13} /> : <Check size={13} />} {ok ? 'Guardado' : 'Guardar'}
        </button>
        <button type="button" className={`${BTN_GHOST} !px-3 !py-2 !text-xs`} onClick={onDone}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function AddAdminForm({ tenantId, onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <form onSubmit={submit} className="wt2-rise flex flex-col gap-2 rounded-2xl border border-dashed border-[rgba(20,36,37,0.25)] bg-white p-4">
      <p className={EYEBROW}>NUEVO ADMINISTRADOR</p>
      <EmailField value={email} onChange={setEmail} placeholder="Email *" required autoFocus />
      <PasswordField value={password} onChange={setPassword} placeholder="Contraseña (si es nuevo)" />
      <input className={`${FIELD} !py-2 !text-[13px]`} placeholder="Nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
      <p className="text-[11.5px] text-[var(--wt-muted)]">Si el email ya existe, se agrega directamente. Si es nuevo, necesitás poner una contraseña.</p>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button className={`${BTN_INK} !px-4 !py-2 !text-xs`} disabled={busy || !email}>
          {busy ? <Loader2 className="animate-spin" size={13} /> : <Plus size={13} />} Agregar
        </button>
        <button type="button" className={`${BTN_GHOST} !px-3 !py-2 !text-xs`} onClick={onDone}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function RemoveButton({ busy, disabled, onClick, label = 'Quitar' }) {
  return (
    <button onClick={onClick} disabled={disabled} className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-[#9b1c4b] transition hover:bg-[#ffe3ef] disabled:opacity-50">
      {busy ? <Loader2 className="animate-spin" size={13} /> : <Trash2 size={13} />} {label}
    </button>
  );
}

export default function TenantUsers({ tenantId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
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
    setDeletingId(user.id);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenantId}/users/${user.id}`, { method: 'DELETE' });
      setUsers((cur) => cur.filter((u) => u.id !== user.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
      setConfirmUser(null);
    }
  };

  const admins = users.filter((u) => u.role === 'admin');
  const q = query.trim().toLowerCase();
  const clients = users.filter((u) => u.role !== 'admin' && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q)));
  const clientTotal = users.length - admins.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--wt-muted)]">
        <Loader2 className="animate-spin" size={18} /> Cargando usuarios…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {confirmUser && (
        <ConfirmDialog
          title={`¿Quitar a ${confirmUser.name}?`}
          message={`${confirmUser.email} deja de tener acceso a esta app. Su cuenta y sus accesos a otras apps se conservan.`}
          confirmLabel="Quitar"
          busy={deletingId === confirmUser.id}
          onConfirm={() => remove(confirmUser)}
          onCancel={() => setConfirmUser(null)}
        />
      )}
      {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <p className={EYEBROW}>ADMINISTRADORES</p>
        <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-[rgba(20,36,37,0.25)] px-3 py-1.5 text-[12.5px] font-bold text-[var(--wt-ink)] transition hover:bg-white">
          {adding ? <X size={13} /> : <Plus size={13} />} {adding ? 'Cancelar' : 'Agregar admin'}
        </button>
      </div>

      {adding && (
        <AddAdminForm
          tenantId={tenantId}
          onDone={() => {
            setAdding(false);
            load();
          }}
        />
      )}

      {admins.length === 0 && !adding && <p className="text-[13px] text-[var(--wt-muted)]">Esta app no tiene administradores.</p>}
      {admins.map((u) => (
        <div key={u.id} className="rounded-2xl border border-[rgba(20,36,37,0.08)] bg-white p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#bff3ea] text-xs font-extrabold text-[var(--wt-mint-dark)]">{initials(u.name)}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{u.name}</p>
              <p className="truncate text-[12.5px] text-[var(--wt-muted)]">{u.email}</p>
            </div>
            <button
              onClick={() => setEditingId(editingId === u.id ? null : u.id)}
              disabled={deletingId !== null}
              className="shrink-0 rounded-full border border-[rgba(20,36,37,0.12)] bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--wt-ink)]"
            >
              {editingId === u.id ? 'Cerrar' : 'Credenciales'}
            </button>
            <RemoveButton busy={deletingId === u.id} disabled={deletingId !== null} onClick={() => setConfirmUser(u)} />
          </div>
          {editingId === u.id && (
            <CredentialsForm
              tenantId={tenantId}
              userId={u.id}
              onDone={() => {
                setEditingId(null);
                load();
              }}
            />
          )}
        </div>
      ))}

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className={EYEBROW}>CLIENTES · {clientTotal}</p>
        {clientTotal > 6 && (
          <input className={`${FIELD} !w-44 !rounded-full !py-1.5 !text-xs`} placeholder="Buscar cliente" value={query} onChange={(e) => setQuery(e.target.value)} />
        )}
      </div>
      {clientTotal === 0 ? (
        <p className="text-[13px] text-[var(--wt-muted)]">Todavía no hay clientes registrados.</p>
      ) : clients.length === 0 ? (
        <p className="text-[13px] text-[var(--wt-muted)]">Ningún cliente coincide.</p>
      ) : (
        <div className="flex flex-col">
          {clients.map((u) => (
            <div key={u.id} className="flex items-center gap-3 border-b border-[rgba(20,36,37,0.06)] px-1 py-2 last:border-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff3e2] text-[11px] font-extrabold text-[var(--wt-ink)]">{initials(u.name)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold">{u.name}</p>
                <p className="truncate text-xs text-[var(--wt-muted)]">{u.email}</p>
              </div>
              <RemoveButton busy={deletingId === u.id} disabled={deletingId !== null} onClick={() => setConfirmUser(u)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
