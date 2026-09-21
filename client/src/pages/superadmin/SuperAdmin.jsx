import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  Check,
  DollarSign,
  ExternalLink,
  KeyRound,
  LifeBuoy,
  Loader2,
  LogIn,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { api } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import TenantUsers from './TenantUsers.jsx';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function money(value) {
  return `$ ${Number(value || 0).toLocaleString('es-AR')}`;
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' });
}

function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function SuperAdmin() {
  const { user, isAuthed, loginSuperAdmin, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isSuper = isAuthed && user?.role === 'superadmin';

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

  const BG = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80';

  if (!isSuper) {
    return (
      <div className="relative min-h-screen bg-cover bg-center lg:grid lg:grid-cols-2" style={{ backgroundImage: `url(${BG})` }}>
        <div className="absolute inset-0 bg-[#0A0A0C]/80 backdrop-blur-[2px] lg:hidden" />

        <section className="relative flex min-h-screen items-center justify-center px-5 py-10 lg:bg-[#0D0D10] lg:text-white">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0D0D10]/95 p-6 text-white shadow-2xl backdrop-blur sm:p-8">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-white/40">Zona restringida</span>
              <span className="inline-flex items-center gap-2 font-black">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400">
                  <Sparkles size={16} className="text-[#0A0A0C]" />
                </span>
                <span className="text-white">WINTUU</span>
              </span>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400">
                <ShieldAlert size={22} />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Superadmin</h1>
                <p className="text-sm text-white/45">Acceso exclusivo al panel de control de WINTUU.</p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/15"
                  type="email"
                  placeholder="superadmin@wintuu.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/15"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3.5 font-extrabold text-[#0A0A0C] transition hover:bg-amber-300 disabled:opacity-50"
                disabled={busy || !email || !password}
              >
                {busy ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
                Ingresar al panel
              </button>
            </form>
          </div>
        </section>

        <aside className="relative hidden min-h-screen overflow-hidden bg-cover bg-center lg:block" style={{ backgroundImage: `url(${BG})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 max-w-xl p-12 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">Solo acceso autorizado</p>
            <p className="mt-3 text-4xl font-black leading-tight">Panel de control de todas las apps WINTUU.</p>
            <p className="mt-4 text-white/55">Gestión de negocios, usuarios, pagos y soporte desde un único lugar.</p>
          </div>
        </aside>
      </div>
    );
  }

  return <Panel email={user?.email} onLogout={logout} />;
}

function Panel({ email, onLogout }) {
  const [tab, setTab] = useState('apps');
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [t, s, p] = await Promise.all([
        api('/api/superadmin/tenants'),
        api('/api/superadmin/stats'),
        api('/api/superadmin/payments'),
      ]);
      setTenants(t.tenants || []);
      setStats(s);
      setPayments(p.payments || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = useMemo(
    () => [
      ['Apps', stats?.tenants ?? '—', Store],
      ['Usuarios', stats?.users ?? '—', Users],
      ['Pedidos', stats?.orders ?? '—', ShoppingBag],
      ['Ingresos', stats ? money(stats.revenue) : '—', DollarSign],
    ],
    [stats]
  );

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-[#0A0A0C]">
              <Store size={18} />
            </span>
            <div>
              <p className="text-sm font-extrabold leading-tight text-ink">WINTUU · Superadmin</p>
              <p className="text-xs text-ink-muted">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost !py-2" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />}
              Actualizar
            </button>
            <button className="btn-ghost !py-2" onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <div key={label} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-ink-muted">{label}</p>
                <Icon size={16} className="text-ink-muted" />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-ink">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-2 border-b border-line">
          {[
            ['apps', 'Apps'],
            ['pagos', 'Pagos'],
            ['soporte', 'Soporte'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition ${
                tab === id ? 'border-primary text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {tab === 'apps' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink">Apps</h2>
              <button className="btn-primary !py-2" onClick={() => setCreating((v) => !v)}>
                {creating ? <X size={16} /> : <Plus size={16} />}
                {creating ? 'Cancelar' : 'Nueva app'}
              </button>
            </div>

            {creating && <CreateForm onDone={() => { setCreating(false); load(); }} />}

            <div className="card overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-ink-muted">
                  <Loader2 className="animate-spin" size={22} />
                </div>
              ) : tenants.length === 0 ? (
                <p className="py-16 text-center text-sm text-ink-muted">Todavía no hay apps.</p>
              ) : (
                <div className="divide-y divide-line">
                  {tenants.map((t) => (
                    <TenantRow key={t.id} tenant={t} onSaved={load} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'pagos' && (
          <div className="mt-6">
            <div className="card overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-ink-muted">
                  <Loader2 className="animate-spin" size={22} />
                </div>
              ) : payments.length === 0 ? (
                <p className="py-16 text-center text-sm text-ink-muted">Todavía no hay pagos registrados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                        <th className="px-5 py-3">Fecha</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Plan</th>
                        <th className="px-5 py-3">Monto</th>
                        <th className="px-5 py-3">Estado</th>
                        <th className="px-5 py-3">App</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="px-5 py-3 text-ink-muted">{formatDate(p.created_at)}</td>
                          <td className="px-5 py-3 text-ink">{p.payer_email || '—'}</td>
                          <td className="px-5 py-3 capitalize text-ink">{p.plan}</td>
                          <td className="px-5 py-3 text-ink">{money(p.amount)}</td>
                          <td className="px-5 py-3">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-5 py-3 text-ink-muted">
                            {p.tenant_id ? <BadgeCheck size={16} className="text-emerald-500" /> : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'soporte' && <SupportTab />}
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400',
    cancelled: 'bg-ink-muted/10 text-ink-muted',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${map[status] || 'bg-ink-muted/10 text-ink-muted'}`}>
      {status}
    </span>
  );
}

function CreateForm({ onDone }) {
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [touched, setTouched] = useState(false);
  const [plan, setPlan] = useState('mensual');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!touched) setSlug(slugify(businessName));
  }, [businessName, touched]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/superadmin/tenants', {
        method: 'POST',
        body: { businessName, slug, plan, ownerEmail: ownerEmail || undefined },
      });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nombre del negocio</label>
          <input className="input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Link</label>
          <input
            className="input font-mono text-sm"
            value={slug}
            onChange={(e) => {
              setTouched(true);
              setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <label className="label">Plan</label>
          <select className="input" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="mensual">Mensual</option>
            <option value="vitalicia">De por vida</option>
          </select>
        </div>
        <div>
          <label className="label">Email del dueño (opcional)</label>
          <input
            className="input"
            type="email"
            placeholder="dueno@gmail.com"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
          />
          <p className="mt-1 text-xs text-ink-muted">
            Debe haber ingresado al menos una vez con Google.
          </p>
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <button className="btn-primary" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
        Crear app
      </button>
    </form>
  );
}

function TenantRow({ tenant, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [name, setName] = useState(tenant.business_name);
  const [slug, setSlug] = useState(tenant.slug);
  const [plan, setPlan] = useState(tenant.plan);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const patch = async (body) => {
    setBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenant.id}`, { method: 'PATCH', body });
      setEditing(false);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`¿Eliminar la app "${tenant.business_name}" y TODOS sus datos (clientes, pedidos, cupones, menú, config)? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenant.id}`, { method: 'DELETE' });
      onSaved();
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold text-ink">{tenant.business_name}</p>
            <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs font-semibold capitalize text-ink-muted">
              {tenant.plan}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-muted">
            <a
              href={`/${tenant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono hover:text-primary"
            >
              /{tenant.slug} <ExternalLink size={11} />
            </a>
            <span>{tenant.owner?.email || 'sin dueño'}</span>
            <span>
              {tenant.counts.clients} clientes · {tenant.counts.orders} pedidos · {tenant.counts.coupons} cupones
            </span>
          </div>
        </div>

        <select
          className={`input !w-auto !py-1.5 text-xs font-bold ${
            tenant.status === 'activo' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
          }`}
          value={tenant.status}
          disabled={busy || tenant.slug === 'wintuu'}
          onChange={(e) => patch({ status: e.target.value })}
        >
          <option value="activo">Activo</option>
          <option value="suspendido">Suspendido</option>
          <option value="pendiente">Pendiente</option>
        </select>

        {tenant.slug !== 'wintuu' && (
<button className="btn-ghost !py-1.5" onClick={() => setEditing((v) => !v)} disabled={busy || deleting}>
            {editing ? <X size={15} /> : <Pencil size={15} />}
            Editar
          </button>
        )}

        <button
          className="btn-ghost !py-1.5"
          onClick={() => setShowUsers((v) => !v)}
          disabled={busy || deleting}
        >
          <Users size={15} />
          {showUsers ? 'Ocultar' : 'Usuarios'}
        </button>

        {tenant.slug !== 'wintuu' && (
<button
            className="inline-flex items-center gap-1.5 rounded-xl px-3 !py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
            onClick={remove}
            disabled={busy || deleting}
          >
            {deleting ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
            Eliminar
          </button>
        )}
      </div>

      {showUsers && <TenantUsers tenantId={tenant.id} />}

      {(error || deleting) && (
        <p className="mt-2 text-xs font-medium text-red-500">{deleting ? 'Eliminando...' : error}</p>
      )}

      {editing && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-surface-alt p-4 sm:grid-cols-3">
          <div>
            <label className="label">Nombre</label>
            <input className="input !py-2" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Link</label>
            <input className="input !py-2 font-mono text-sm" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          </div>
          <div>
            <label className="label">Plan</label>
            <select className="input !py-2" value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="mensual">Mensual</option>
              <option value="vitalicia">De por vida</option>
            </select>
          </div>
          <div className="sm:col-span-3 flex items-center gap-3">
            <button
              className="btn-primary !py-2"
              disabled={busy}
              onClick={() => patch({ business_name: name, slug, plan })}
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              Guardar
            </button>
            {error && <span className="text-sm font-medium text-red-500">{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function SupportTab() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const loadTickets = useCallback(async () => {
    try {
      const data = await api('/api/superadmin/support');
      setTickets(data.tickets || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (ticketId) => {
    try {
      const data = await api(`/api/superadmin/support/${ticketId}`);
      setMessages(data.messages || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    const id = setInterval(loadTickets, 10000);
    return () => clearInterval(id);
  }, [loadTickets]);

  useEffect(() => {
    if (!selected) return undefined;
    loadMessages(selected);
    const id = setInterval(() => loadMessages(selected), 10000);
    return () => clearInterval(id);
  }, [selected, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !selected || sending) return;
    setSending(true);
    setError('');
    try {
      const { message } = await api(`/api/superadmin/support/${selected}`, { method: 'POST', body: { body } });
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      setText('');
      loadTickets();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const ticket = tickets.find((item) => item.id === selected);

  const changeStatus = async (status) => {
    try {
      await api(`/api/superadmin/support/${selected}`, { method: 'PATCH', body: { status } });
      loadTickets();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card flex items-center justify-center py-16 text-ink-muted">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="card py-16 text-center text-sm text-ink-muted">
          Todavía no hay tickets de soporte.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[320px,1fr]">
          <div className="card max-h-[62vh] overflow-y-auto p-2">
            {tickets.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                  selected === item.id ? 'bg-primary-softer' : 'hover:bg-surface-alt'
                }`}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-alt text-ink-muted">
                  <Store size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-ink">{item.tenant?.business_name || 'App eliminada'}</span>
                    {item.unread > 0 && (
                      <span className="rounded-full bg-amber-400 px-1.5 text-xs font-extrabold text-[#0A0A0C]">
                        {item.unread}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-ink">{item.subject}</span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-[11px] text-ink-muted">
                    <span className="font-mono">{item.code}</span>
                    <span className="font-bold uppercase">{item.status === 'nuevo' ? 'NUEVO TICKET' : item.status}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="card flex h-[62vh] flex-col overflow-hidden">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-ink-muted">
                <LifeBuoy size={30} />
                <p className="text-sm">Elegí un ticket.</p>
              </div>
            ) : (
              <>
                <div className="border-b border-line px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <a
                        href={`/${ticket?.tenant?.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink hover:text-primary"
                      >
                        {ticket?.tenant?.business_name}
                        <ExternalLink size={13} />
                      </a>
                      <p className="mt-0.5 text-sm font-bold text-ink">{ticket?.subject}</p>
                      <p className="font-mono text-xs text-ink-muted">{ticket?.code}</p>
                    </div>
                    <select className="input !w-auto !py-1.5 text-xs font-bold capitalize" value={ticket?.status || 'nuevo'} onChange={(event) => changeStatus(event.target.value)}>
                      <option value="nuevo">Nuevo</option>
                      <option value="abierto">Abierto</option>
                      <option value="respondido">Respondido</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <p className="mt-8 text-center text-sm text-ink-muted">Sin mensajes todavía.</p>
                  ) : (
                    messages.map((m) => {
                      const mine = m.sender_role === 'superadmin';
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                              mine
                                ? 'rounded-br-md bg-gradient-to-br from-primary to-primary-strong text-primary-contrast'
                                : 'rounded-bl-md bg-surface-alt text-ink'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.body}</p>
                            <p className={`mt-1 text-right text-[11px] ${mine ? 'text-primary-contrast/70' : 'text-ink-muted'}`}>
                              {formatDateTime(m.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {ticket?.status !== 'cerrado' && <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
                  <input
                    className="input flex-1"
                    placeholder="Responder..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={2000}
                  />
                  <button className="btn-primary !px-4" disabled={sending || !text.trim()} aria-label="Enviar">
                    {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                  </button>
                </form>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
