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
  Store,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { api } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import TenantUsers from './TenantUsers.jsx';
import '../../styles/wintuu-landing.css';
import WintuuLogo from '../../components/landing/WintuuLogo.jsx';

const INPUT_CLS =
  'w-full rounded-xl border border-[var(--wt-border)] bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-[var(--wt-text)] outline-none placeholder:text-[var(--wt-muted)]/50 focus:border-[var(--wt-mint)] focus:ring-2 focus:ring-[var(--wt-mint)]/20';
const LABEL_CLS = 'mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--wt-muted)]';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
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

  if (!isSuper) {
    return (
      <div className="wintuu-landing wintuu-dark relative min-h-screen lg:grid lg:grid-cols-2">
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
          <div className="wt-halo h-72 w-72 -left-10 -top-10" style={{ opacity: 0.5 }} />
          <div className="wt-halo h-64 w-64 -bottom-10 -right-10" style={{ opacity: 0.35 }} />

          <div className="wt-glass relative w-full max-w-lg p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="wt-tag">Zona restringida</span>
              <WintuuLogo height={20} />
            </div>

            <div className="mt-8 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(0,207,205,0.14)] text-[var(--wt-mint-light)]">
                <ShieldAlert size={22} />
              </span>
              <div>
                <h1 className="wt-h2 text-[26px] text-[var(--wt-text)]">Superadmin</h1>
                <p className="text-sm text-[var(--wt-muted)]">Acceso exclusivo al panel de control de Wintuu.</p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
                <input
                  className={`${INPUT_CLS} pl-10`}
                  type="email"
                  placeholder="superadmin@wintuu.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
                <input
                  className={`${INPUT_CLS} pl-10`}
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="wt-btn-mint w-full" disabled={busy || !email || !password}>
                {busy ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
                Ingresar al panel
              </button>
            </form>
          </div>
        </section>

        <aside className="relative hidden min-h-screen items-end overflow-hidden lg:flex" style={{ background: 'linear-gradient(165deg, #0d131a 0%, #0a0e13 100%)' }}>
          <div className="wt-halo h-96 w-96 -right-20 -top-20" style={{ opacity: 0.4 }} />
          <div className="relative max-w-xl p-12">
            <p className="wt-eyebrow-light">Solo acceso autorizado</p>
            <p className="wt-heading mt-3 text-[38px] font-semibold leading-tight text-[var(--wt-text)]">
              Panel de control de todas las apps Wintuu.
            </p>
            <p className="wt-body mt-4">Gestión de negocios, usuarios, pagos y soporte desde un único lugar.</p>
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
    <div className="wintuu-landing wintuu-dark min-h-screen">
      <header className="border-b border-[var(--wt-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <WintuuLogo height={18} />
            <div className="border-l border-[var(--wt-border)] pl-3">
              <p className="text-sm font-extrabold leading-tight text-[var(--wt-text)]">Superadmin</p>
              <p className="text-xs text-[var(--wt-muted)]">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="wt-btn-ghost !h-9 !px-4 !text-[13px]" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />}
              Actualizar
            </button>
            <button className="wt-btn-ghost !h-9 !px-4 !text-[13px]" onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <div key={label} className="wt-glass p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--wt-muted)]">{label}</p>
                <Icon size={16} className="text-[var(--wt-muted)]" />
              </div>
              <p className="wt-heading mt-2 text-2xl font-semibold text-[var(--wt-text)]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-2 border-b border-[var(--wt-border)]">
          {[
            ['apps', 'Apps'],
            ['pagos', 'Pagos'],
            ['soporte', 'Soporte'],
          ].map(([id, label]) => (
            <button
              key={id}
              className="-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition"
              style={{
                borderColor: tab === id ? 'var(--wt-mint)' : 'transparent',
                color: tab === id ? 'var(--wt-text)' : 'var(--wt-muted)',
              }}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400">
            {error}
          </div>
        )}

        {tab === 'apps' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="wt-heading text-lg font-semibold text-[var(--wt-text)]">Apps</h2>
              <button className="wt-btn-mint !h-10 !px-4 !text-[13px]" onClick={() => setCreating((v) => !v)}>
                {creating ? <X size={16} /> : <Plus size={16} />}
                {creating ? 'Cancelar' : 'Nueva app'}
              </button>
            </div>

            {creating && <CreateForm onDone={() => { setCreating(false); load(); }} />}

            <div className="wt-glass overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-[var(--wt-muted)]">
                  <Loader2 className="animate-spin" size={22} />
                </div>
              ) : tenants.length === 0 ? (
                <p className="py-16 text-center text-sm text-[var(--wt-muted)]">Todavía no hay apps.</p>
              ) : (
                <div className="divide-y divide-[var(--wt-border)]">
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
            <div className="wt-glass overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-[var(--wt-muted)]">
                  <Loader2 className="animate-spin" size={22} />
                </div>
              ) : payments.length === 0 ? (
                <p className="py-16 text-center text-sm text-[var(--wt-muted)]">Todavía no hay pagos registrados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--wt-border)] text-left text-xs uppercase tracking-wide text-[var(--wt-muted)]">
                        <th className="px-5 py-3">Fecha</th>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Plan</th>
                        <th className="px-5 py-3">Monto</th>
                        <th className="px-5 py-3">Estado</th>
                        <th className="px-5 py-3">App</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--wt-border)]">
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="px-5 py-3 text-[var(--wt-muted)]">{formatDate(p.created_at)}</td>
                          <td className="px-5 py-3 text-[var(--wt-text)]">{p.payer_email || '—'}</td>
                          <td className="px-5 py-3 capitalize text-[var(--wt-text)]">{p.plan}</td>
                          <td className="px-5 py-3 text-[var(--wt-text)]">{money(p.amount)}</td>
                          <td className="px-5 py-3">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-5 py-3 text-[var(--wt-muted)]">
                            {p.tenant_id ? <BadgeCheck size={16} className="text-emerald-400" /> : '—'}
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
    approved: 'bg-emerald-500/15 text-emerald-400',
    pending: 'bg-amber-500/15 text-amber-400',
    rejected: 'bg-red-500/15 text-red-400',
    cancelled: 'bg-white/10 text-[var(--wt-muted)]',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${map[status] || 'bg-white/10 text-[var(--wt-muted)]'}`}>
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
    <form onSubmit={submit} className="wt-glass space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLS}>Nombre del negocio</label>
          <input className={INPUT_CLS} value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </div>
        <div>
          <label className={LABEL_CLS}>Link</label>
          <input
            className={`${INPUT_CLS} font-mono`}
            value={slug}
            onChange={(e) => {
              setTouched(true);
              setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Plan</label>
          <select className={INPUT_CLS} value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="mensual">Mensual</option>
            <option value="vitalicia">De por vida</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLS}>Email del dueño (opcional)</label>
          <input
            className={INPUT_CLS}
            type="email"
            placeholder="dueno@gmail.com"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--wt-muted)]">Debe haber ingresado al menos una vez con Google.</p>
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-400">{error}</p>}
      <button className="wt-btn-mint" disabled={busy}>
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
            <p className="truncate font-bold text-[var(--wt-text)]">{tenant.business_name}</p>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-semibold capitalize text-[var(--wt-muted)]">
              {tenant.plan}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-[var(--wt-muted)]">
            <a
              href={`/${tenant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono hover:text-[var(--wt-mint-light)]"
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
          className={`${INPUT_CLS} !w-auto !py-1.5 text-xs font-bold`}
          style={{ color: tenant.status === 'activo' ? '#6fe4a8' : '#f5c76b' }}
          value={tenant.status}
          disabled={busy || tenant.slug === 'wintuu'}
          onChange={(e) => patch({ status: e.target.value })}
        >
          <option value="activo">Activo</option>
          <option value="suspendido">Suspendido</option>
          <option value="pendiente">Pendiente</option>
        </select>

        {tenant.slug !== 'wintuu' && (
          <button className="wt-btn-ghost !h-9 !px-3.5 !text-[13px]" onClick={() => setEditing((v) => !v)} disabled={busy || deleting}>
            {editing ? <X size={15} /> : <Pencil size={15} />}
            Editar
          </button>
        )}

        <button className="wt-btn-ghost !h-9 !px-3.5 !text-[13px]" onClick={() => setShowUsers((v) => !v)} disabled={busy || deleting}>
          <Users size={15} />
          {showUsers ? 'Ocultar' : 'Usuarios'}
        </button>

        {tenant.slug !== 'wintuu' && (
          <button
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
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
        <p className="mt-2 text-xs font-medium text-red-400">{deleting ? 'Eliminando...' : error}</p>
      )}

      {editing && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-[var(--wt-border)] bg-white/[0.03] p-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLS}>Nombre</label>
            <input className={`${INPUT_CLS} !py-2`} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLS}>Link</label>
            <input className={`${INPUT_CLS} !py-2 font-mono`} value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          </div>
          <div>
            <label className={LABEL_CLS}>Plan</label>
            <select className={`${INPUT_CLS} !py-2`} value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="mensual">Mensual</option>
              <option value="vitalicia">De por vida</option>
            </select>
          </div>
          <div className="flex items-center gap-3 sm:col-span-3">
            <button className="wt-btn-mint !h-10 !px-4 !text-[13px]" disabled={busy} onClick={() => patch({ business_name: name, slug, plan })}>
              {busy ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              Guardar
            </button>
            {error && <span className="text-sm font-medium text-red-400">{error}</span>}
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
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="wt-glass flex items-center justify-center py-16 text-[var(--wt-muted)]">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="wt-glass py-16 text-center text-sm text-[var(--wt-muted)]">Todavía no hay tickets de soporte.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[320px,1fr]">
          <div className="wt-glass max-h-[62vh] overflow-y-auto p-2">
            {tickets.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item.id)}
                className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition"
                style={{ background: selected === item.id ? 'rgba(0,207,205,0.1)' : 'transparent' }}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[var(--wt-muted)]">
                  <Store size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-[var(--wt-text)]">{item.tenant?.business_name || 'App eliminada'}</span>
                    {item.unread > 0 && (
                      <span className="rounded-full bg-[var(--wt-mint)] px-1.5 text-xs font-extrabold text-[var(--wt-ink)]">
                        {item.unread}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-[var(--wt-text)]">{item.subject}</span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[var(--wt-muted)]">
                    <span className="font-mono">{item.code}</span>
                    <span className="font-bold uppercase">{item.status === 'nuevo' ? 'NUEVO TICKET' : item.status}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="wt-glass flex h-[62vh] flex-col overflow-hidden">
            {!selected ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[var(--wt-muted)]">
                <LifeBuoy size={30} />
                <p className="text-sm">Elegí un ticket.</p>
              </div>
            ) : (
              <>
                <div className="border-b border-[var(--wt-border)] px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <a
                        href={`/${ticket?.tenant?.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[var(--wt-text)] hover:text-[var(--wt-mint-light)]"
                      >
                        {ticket?.tenant?.business_name}
                        <ExternalLink size={13} />
                      </a>
                      <p className="mt-0.5 text-sm font-bold text-[var(--wt-text)]">{ticket?.subject}</p>
                      <p className="font-mono text-xs text-[var(--wt-muted)]">{ticket?.code}</p>
                    </div>
                    <select
                      className={`${INPUT_CLS} !w-auto !py-1.5 text-xs font-bold capitalize`}
                      value={ticket?.status || 'nuevo'}
                      onChange={(event) => changeStatus(event.target.value)}
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="abierto">Abierto</option>
                      <option value="respondido">Respondido</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <p className="mt-8 text-center text-sm text-[var(--wt-muted)]">Sin mensajes todavía.</p>
                  ) : (
                    messages.map((m) => {
                      const mine = m.sender_role === 'superadmin';
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm"
                            style={
                              mine
                                ? { borderBottomRightRadius: 6, background: 'linear-gradient(135deg, var(--wt-mint), var(--wt-mint-light))', color: 'var(--wt-ink)' }
                                : { borderBottomLeftRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'var(--wt-text)' }
                            }
                          >
                            <p className="whitespace-pre-wrap break-words">{m.body}</p>
                            <p className="mt-1 text-right text-[11px]" style={{ opacity: mine ? 0.7 : 1, color: mine ? 'var(--wt-ink)' : 'var(--wt-muted)' }}>
                              {formatDateTime(m.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {ticket?.status !== 'cerrado' && (
                  <form onSubmit={send} className="flex items-center gap-2 border-t border-[var(--wt-border)] p-3">
                    <input
                      className={`${INPUT_CLS} flex-1`}
                      placeholder="Responder..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={2000}
                    />
                    <button className="wt-btn-mint !h-11 !w-11 !px-0" disabled={sending || !text.trim()} aria-label="Enviar">
                      {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
