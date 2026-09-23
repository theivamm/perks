import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, KeyRound, Loader2, LogIn, Mail, Plus, RefreshCw, Search, Send, ShieldAlert, Trash2, X } from 'lucide-react';
import { api } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import TenantUsers from './TenantUsers.jsx';
import '../../styles/wintuu-landing.css';
import '../../styles/wintuu-landing-v2.css';
import WintuuLogo from '../../components/landing/WintuuLogo.jsx';
import AuthShell, { inputCls, primaryBtn } from '../../components/landing/AuthShell.jsx';
import { BUSINESS_TYPES } from '../../lib/businessTypes.js';

/* ── Estilos compartidos del panel ── */
export const CARD = 'rounded-[22px] border border-[rgba(20,36,37,0.08)] bg-white';
export const FIELD =
  'w-full min-w-0 rounded-[14px] border border-[rgba(20,36,37,0.12)] bg-white px-3.5 py-2.5 text-sm font-medium text-[var(--wt-text)] outline-none transition placeholder:text-[var(--wt-muted)]/60 focus:border-[var(--wt-mint)] focus:ring-2 focus:ring-[var(--wt-mint)]/20';
export const LABEL = 'flex flex-col gap-1.5 text-[13px] font-semibold text-[var(--wt-ink)]';
export const EYEBROW = 'text-[12px] font-extrabold tracking-[0.08em] text-[var(--wt-muted)]';
export const BTN_MINT = 'wt2-btn inline-flex items-center justify-center gap-2 rounded-full bg-[var(--wt-mint)] px-5 py-2.5 text-[13px] font-bold text-[#08282c] hover:bg-[var(--wt-mint-light)] disabled:opacity-50';
export const BTN_INK = 'wt2-btn inline-flex items-center justify-center gap-2 rounded-full bg-[#08282c] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[var(--wt-mint-dark)] disabled:opacity-50';
export const BTN_GHOST = 'wt2-btn inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(20,36,37,0.12)] bg-white px-4 py-2 text-[13px] font-semibold text-[#08282c] disabled:opacity-50';

const TINTS = ['#bff3ea', '#ffe9a8', '#ffc4e1', '#c9bbff', '#fff3e2'];
const TENANT_STATUS = {
  activo: { label: 'Activo', bg: '#dff8f1', ink: '#00705f', bar: '#00cfcd' },
  pendiente: { label: 'Pendiente', bg: '#fff3cf', ink: '#8a5a00', bar: '#ffe9a8' },
  suspendido: { label: 'Suspendido', bg: '#ffe3ef', ink: '#9b1c4b', bar: '#ffc4e1' },
};
const PAY_STATUS = {
  approved: { label: 'Aprobado', bg: '#dff8f1', ink: '#00705f' },
  pending: { label: 'Pendiente', bg: '#fff3cf', ink: '#8a5a00' },
  rejected: { label: 'Rechazado', bg: '#ffe3ef', ink: '#9b1c4b' },
  cancelled: { label: 'Cancelado', bg: '#eef1f1', ink: '#66787a' },
};
const TICKET_STATUS = {
  nuevo: { label: 'Nuevo', ink: '#007b79' },
  abierto: { label: 'Abierto', ink: '#8a5a00' },
  respondido: { label: 'Respondido', ink: '#66787a' },
  cerrado: { label: 'Cerrado', ink: '#9aa8a9' },
};
const PLAN_LABEL = { mensual: 'Mensual', vitalicia: 'De por vida' };
const NAV = [
  ['home', 'Resumen', '#5fe4da'],
  ['tenants', 'Negocios', '#ffe9a8'],
  ['pay', 'Pagos', '#c9bbff'],
  ['sup', 'Soporte', '#ffc4e1'],
];
const HEADS = {
  home: ['PANEL DE WINTUU', 'Buen día, equipo.'],
  tenants: ['NEGOCIOS', 'Todas las apps'],
  pay: ['PAGOS', 'Cobros de planes'],
  sup: ['SOPORTE', 'Conversaciones'],
};

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}
export function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
}
const tintFor = (id) => TINTS[Math.abs(String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % TINTS.length];
const num = (v) => Number(v || 0).toLocaleString('es-AR');
const money = (v) => `$ ${num(v)}`;
function compactMoney(v) {
  const n = Number(v || 0);
  if (n >= 1e6) return `$ ${(n / 1e6).toLocaleString('es-AR', { maximumFractionDigits: 1 })} M`;
  return money(n);
}
function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}
function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function timeAgo(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m} min`;
  if (m < 1440) return `${Math.round(m / 60)} h`;
  if (m < 2880) return 'ayer';
  return `${Math.round(m / 1440)} d`;
}
const sameMonth = (value) => {
  const d = new Date(value);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
};

function Avatar({ id, name, size = 40, radius = 13 }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center font-extrabold text-[#08282c]"
      style={{ width: size, height: size, borderRadius: radius, background: tintFor(id), fontSize: size * 0.32 }}
    >
      {initials(name)}
    </span>
  );
}

function Pill({ label, bg, ink }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold" style={{ background: bg, color: ink }}>
      {label}
    </span>
  );
}

function Segmented({ options, value, onChange, dark = true, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-1 rounded-[18px] border border-[rgba(20,36,37,0.08)] bg-white p-1 ${className}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="flex-1 whitespace-nowrap rounded-full px-3.5 py-2 text-[12.5px] font-bold transition"
            style={{
              background: on ? (dark ? '#08282c' : o.bg) : 'transparent',
              color: on ? (dark ? '#fff' : o.ink) : 'var(--wt-muted)',
            }}
          >
            {o.label}
            {o.count != null && <span className="ml-1 opacity-60">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Empty({ children }) {
  return <p className="px-5 py-14 text-center text-sm text-[var(--wt-muted)]">{children}</p>;
}
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-[var(--wt-muted)]">
      <Loader2 className="animate-spin" size={22} />
    </div>
  );
}

/* ── Ingreso ── */
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

  if (isSuper) return <Panel email={user?.email} onLogout={logout} />;

  return (
    <AuthShell variant="admin" back="/" backLabel="Inicio">
      <span className="inline-flex items-center gap-2 rounded-full bg-[#08282c] px-3 py-1.5 text-[11px] font-extrabold tracking-[0.14em] text-[var(--wt-mint-light)]">
        <ShieldAlert size={13} /> ZONA RESTRINGIDA
      </span>
      <h1 className="wt-heading mt-5 text-[clamp(34px,3.8vw,46px)] font-bold leading-[1.04] text-[var(--wt-ink)]">Panel de Wintuu.</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-[var(--wt-muted)]">Negocios, usuarios, pagos y soporte de todas las apps, en un solo lugar.</p>
      {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}
      <form onSubmit={submit} className="mt-8 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-[var(--wt-ink)]">Email</span>
          <span className="relative block">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
            <input className={inputCls} type="email" placeholder="superadmin@wintuu.app" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-[var(--wt-ink)]">Contraseña</span>
          <span className="relative block">
            <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
            <input className={inputCls} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </span>
        </label>
        <button type="submit" className={`${primaryBtn} !mt-5`} disabled={busy || !email || !password}>
          {busy ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
          Ingresar al panel
        </button>
      </form>
      <p className="mt-6 text-center text-[12.5px] text-[var(--wt-muted)]">Solo acceso autorizado. Los intentos quedan registrados.</p>
    </AuthShell>
  );
}

/* ── Panel ── */
function Panel({ email, onLogout }) {
  const [tab, setTab] = useState('home');
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [ticketId, setTicketId] = useState(null);

  const loadTickets = useCallback(async () => {
    try {
      const data = await api('/api/superadmin/support');
      setTickets(data.tickets || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [t, s, p] = await Promise.all([api('/api/superadmin/tenants'), api('/api/superadmin/stats'), api('/api/superadmin/payments')]);
      setTenants(t.tenants || []);
      setStats(s);
      setPayments(p.payments || []);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    load();
    const id = setInterval(loadTickets, 15000);
    return () => clearInterval(id);
  }, [load, loadTickets]);

  const unread = tickets.reduce((a, t) => a + (t.unread || 0), 0);
  const selected = tenants.find((t) => t.id === selectedId);
  const openTicket = (id) => {
    setTicketId(id);
    setTab('sup');
  };
  const [eyebrow, title] = HEADS[tab];

  const navButtons = (mobile) =>
    NAV.map(([id, label, dot]) => {
      const on = tab === id;
      return (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={`flex items-center gap-3 rounded-xl text-left text-[14px] font-semibold transition hover:bg-white/10 ${mobile ? 'shrink-0 px-3 py-2' : 'px-3 py-2.5'}`}
          style={{ background: on ? 'rgba(255,255,255,.1)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.62)' }}
        >
          <span className="h-2 w-2 rounded-[3px]" style={{ background: dot }} />
          <span className="flex-1">{label}</span>
          {id === 'sup' && unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--wt-mint)] px-1.5 text-[11px] font-extrabold text-[#08282c]">{unread}</span>
          )}
        </button>
      );
    });

  return (
    <div className="wintuu-landing min-h-screen bg-[var(--wt-bg)] lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen flex-col overflow-hidden bg-[#08282c] px-3.5 py-6 text-white lg:flex">
        <div className="wt-bg-blob" style={{ width: 260, height: 260, background: '#00cfcd', top: -90, right: -120, opacity: 0.18 }} />
        <div className="relative flex items-center gap-2.5 px-2">
          <WintuuLogo height={20} light />
          <span className="rounded-full bg-[rgba(0,207,205,.18)] px-2 py-1 text-[10px] font-extrabold tracking-[0.12em] text-[var(--wt-mint-light)]">ADMIN</span>
        </div>
        <nav className="relative mt-9 flex flex-col gap-1">{navButtons(false)}</nav>
        <div className="relative mt-auto flex flex-col gap-2.5 border-t border-white/10 px-2 pt-4">
          <span className="flex items-center gap-2 text-[12px] text-white/60">
            <span className="wt2-blink h-[7px] w-[7px] rounded-full bg-[#6fe4a8]" /> Sesión segura
          </span>
          <span className="truncate text-[13px] font-semibold">{email}</span>
          <button onClick={onLogout} className="self-start rounded-full border border-white/20 px-3.5 py-1.5 text-[12.5px] font-semibold transition hover:bg-white/10">
            Salir
          </button>
        </div>
      </aside>

      {/* Barra superior mobile */}
      <div className="sticky top-0 z-10 bg-[#08282c] px-4 pb-2 pt-3 text-white lg:hidden">
        <div className="flex items-center justify-between">
          <WintuuLogo height={18} light />
          <button onClick={onLogout} className="rounded-full border border-white/20 px-3 py-1 text-[12px] font-semibold">Salir</button>
        </div>
        <nav className="-mx-1 mt-2 flex gap-1 overflow-x-auto">{navButtons(true)}</nav>
      </div>

      <main className="flex min-w-0 flex-col gap-6 px-[clamp(18px,3vw,40px)] pb-12 pt-7">
        <header className="wt2-rise flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-extrabold tracking-[0.14em] text-[var(--wt-mint-dark)]">{eyebrow}</p>
            <h1 className="wt-heading mt-1.5 text-[34px] font-semibold leading-[1.05] text-[var(--wt-ink)]">{title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {updatedAt && <span className="text-[12.5px] text-[var(--wt-muted)]">Actualizado {timeAgo(updatedAt) === 'ahora' ? 'recién' : `hace ${timeAgo(updatedAt)}`}</span>}
            <button className={BTN_GHOST} onClick={load} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={15} /> : <RefreshCw size={15} />} Actualizar
            </button>
            {tab === 'tenants' && (
              <button className={BTN_MINT} onClick={() => setCreating(true)}>
                <Plus size={16} /> Nueva app
              </button>
            )}
          </div>
        </header>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>}

        {tab === 'home' && (
          <HomeTab stats={stats} tenants={tenants} payments={payments} tickets={tickets} loading={loading} onGo={setTab} onTicket={openTicket} />
        )}
        {tab === 'tenants' && <TenantsTab tenants={tenants} loading={loading} selectedId={selectedId} onOpen={setSelectedId} />}
        {tab === 'pay' && <PaymentsTab payments={payments} loading={loading} />}
        {tab === 'sup' && <SupportTab tickets={tickets} selected={ticketId} onSelect={setTicketId} reload={loadTickets} />}
      </main>

      {selected && (
        <TenantDrawer
          key={selected.id}
          tenant={selected}
          onClose={() => setSelectedId(null)}
          onSaved={load}
          onDeleted={() => {
            setSelectedId(null);
            load();
          }}
        />
      )}
      {creating && (
        <CreateModal
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ── Resumen ── */
function HomeTab({ stats, tenants, payments, tickets, loading, onGo, onTicket }) {
  const byStatus = useMemo(() => {
    const c = { activo: 0, pendiente: 0, suspendido: 0 };
    tenants.forEach((t) => {
      if (c[t.status] != null) c[t.status] += 1;
    });
    return c;
  }, [tenants]);
  const weekAgo = Date.now() - 7 * 864e5;
  const newThisWeek = tenants.filter((t) => t.created_at && new Date(t.created_at).getTime() > weekAgo).length;
  const monthRevenue = payments.filter((p) => p.status === 'approved' && sameMonth(p.created_at)).reduce((a, p) => a + Number(p.amount || 0), 0);
  const pending = tickets.filter((t) => t.status === 'nuevo' || t.status === 'abierto').slice(0, 5);

  const kpis = [
    { label: 'Negocios activos', value: stats ? num(byStatus.activo) : '—', note: newThisWeek ? `+${newThisWeek} esta semana` : `${num(stats?.tenants)} en total`, bg: '#08282c', ink: '#fff', sub: 'rgba(255,255,255,.7)' },
    { label: 'Usuarios', value: stats ? num(stats.users) : '—', note: 'en todas las apps', bg: '#bff3ea', ink: '#08282c', sub: '#1f5a57' },
    { label: 'Pedidos', value: stats ? num(stats.orders) : '—', note: 'desde el inicio', bg: '#ffe9a8', ink: '#08282c', sub: '#6b5310' },
    { label: 'Ingresos', value: stats ? compactMoney(stats.revenue) : '—', note: `${money(monthRevenue)} este mes`, bg: '#ffc4e1', ink: '#08282c', sub: '#7a2a4c' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        {kpis.map((k, i) => (
          <div key={k.label} className="wt2-rise wt2-lift rounded-[22px] p-5" style={{ background: k.bg, '--d': `${i * 80}ms` }}>
            <p className="text-[13px] font-semibold" style={{ color: k.sub }}>{k.label}</p>
            <p className="wt-heading mt-2.5 text-[34px] font-semibold leading-none" style={{ color: k.ink }}>{k.value}</p>
            <p className="mt-2.5 text-[12.5px] font-semibold" style={{ color: k.sub }}>{k.note}</p>
          </div>
        ))}
      </div>

      <div className={`${CARD} p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold text-[var(--wt-ink)]">Estado de los negocios</p>
          <p className="text-[13px] text-[var(--wt-muted)]">{tenants.length} apps en total</p>
        </div>
        <div className="mt-3.5 flex h-3.5 gap-[3px] overflow-hidden rounded-full bg-[#f3efe8]">
          {Object.entries(TENANT_STATUS).map(([id, s]) =>
            byStatus[id] ? <span key={id} className="transition-[flex-grow] duration-700" style={{ flexGrow: byStatus[id], background: s.bar }} /> : null
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
          {Object.entries(TENANT_STATUS).map(([id, s]) => (
            <span key={id} className="flex items-center gap-1.5">
              <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: s.bar }} />
              {byStatus[id]} {s.label.toLowerCase()}{byStatus[id] === 1 ? '' : 's'}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        <div className={`${CARD} px-2 pb-3 pt-2`}>
          <div className="flex items-center justify-between px-3 pb-2 pt-3">
            <p className="font-bold text-[var(--wt-ink)]">Últimos pagos</p>
            <button onClick={() => onGo('pay')} className="text-[13px] font-bold text-[var(--wt-mint-dark)]">Ver todos →</button>
          </div>
          {loading ? <Spinner /> : payments.length === 0 ? <Empty>Todavía no hay pagos.</Empty> : payments.slice(0, 4).map((p) => {
            const s = PAY_STATUS[p.status] || PAY_STATUS.cancelled;
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 transition hover:bg-[#fff4e6]">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.payer_email || '—'}</p>
                  <p className="mt-0.5 text-xs text-[var(--wt-muted)]">{formatDate(p.created_at)} · {PLAN_LABEL[p.plan] || p.plan}</p>
                </div>
                <span className="text-sm font-bold">{money(p.amount)}</span>
                <Pill {...s} />
              </div>
            );
          })}
        </div>

        <div className={`${CARD} px-2 pb-3 pt-2`}>
          <div className="flex items-center justify-between px-3 pb-2 pt-3">
            <p className="font-bold text-[var(--wt-ink)]">Soporte por responder</p>
            <button onClick={() => onGo('sup')} className="text-[13px] font-bold text-[var(--wt-mint-dark)]">Abrir soporte →</button>
          </div>
          {pending.length === 0 ? <Empty>No hay tickets pendientes.</Empty> : pending.map((t) => (
            <button key={t.id} onClick={() => onTicket(t.id)} className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition hover:bg-[#fff4e6]">
              <Avatar id={t.tenant?.id || t.id} name={t.tenant?.business_name || '?'} size={36} radius={12} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{t.tenant?.business_name || 'App eliminada'}</span>
                <span className="block truncate text-[12.5px] text-[var(--wt-muted)]">{t.subject}</span>
              </span>
              <span className="text-[11.5px] text-[var(--wt-muted)]">{timeAgo(t.updated_at)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Negocios ── */
function TenantsTab({ tenants, loading, selectedId, onOpen }) {
  const [filter, setFilter] = useState('todos');
  const [query, setQuery] = useState('');
  const counts = useMemo(() => {
    const c = { todos: tenants.length };
    tenants.forEach((t) => (c[t.status] = (c[t.status] || 0) + 1));
    return c;
  }, [tenants]);
  const q = query.trim().toLowerCase();
  const list = tenants.filter(
    (t) => (filter === 'todos' || t.status === filter) && (!q || `${t.business_name} ${t.slug} ${t.owner?.email || ''}`.toLowerCase().includes(q))
  );
  const COLS = 'grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_minmax(0,1.3fr)_110px] gap-3';

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-[240px] flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--wt-muted)]" />
          <input className={`${FIELD} !rounded-full !pl-10`} placeholder="Buscar por nombre, link o email del dueño" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <Segmented
          className="!rounded-full"
          value={filter}
          onChange={setFilter}
          options={[['todos', 'Todos'], ['activo', 'Activos'], ['pendiente', 'Pendientes'], ['suspendido', 'Suspendidos']].map(([value, label]) => ({ value, label, count: counts[value] || 0 }))}
        />
      </div>

      <div className={`${CARD} overflow-x-auto`}>
        <div className="min-w-[720px]">
          <div className={`${COLS} border-b border-[rgba(20,36,37,0.08)] px-5 py-3 text-[11.5px] font-extrabold tracking-[0.08em] text-[var(--wt-muted)]`}>
            <span>NEGOCIO</span><span>DUEÑO</span><span>ACTIVIDAD</span><span>ESTADO</span>
          </div>
          {loading ? <Spinner /> : list.length === 0 ? <Empty>{tenants.length ? 'Ningún negocio coincide con la búsqueda.' : 'Todavía no hay apps.'}</Empty> : list.map((t) => {
            const s = TENANT_STATUS[t.status] || TENANT_STATUS.pendiente;
            const c = t.counts || {};
            return (
              <button
                key={t.id}
                onClick={() => onOpen(t.id)}
                className={`${COLS} w-full items-center border-b border-[rgba(20,36,37,0.06)] px-5 py-3.5 text-left transition last:border-0 hover:bg-[#fff4e6]`}
                style={{ background: selectedId === t.id ? '#fff4e6' : undefined }}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar id={t.id} name={t.business_name} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14.5px] font-bold text-[var(--wt-ink)]">{t.business_name}</span>
                      <span className="shrink-0 rounded-full bg-[#fff3e2] px-2 py-0.5 text-[11px] font-bold text-[var(--wt-muted)]">{PLAN_LABEL[t.plan] || t.plan}</span>
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-xs text-[var(--wt-mint-dark)]">/{t.slug}</span>
                  </span>
                </span>
                <span className="truncate text-[13px]">{t.owner?.email || 'sin dueño'}</span>
                <span className="text-[12.5px] text-[var(--wt-muted)]">
                  {c.clients || c.orders ? `${num(c.clients)} clientes · ${num(c.orders)} pedidos` : 'Sin actividad todavía'}
                </span>
                <span className="justify-self-start"><Pill {...s} /></span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlanPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(PLAN_LABEL).map(([id, label]) => {
        const on = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="rounded-[14px] px-3.5 py-3 text-left text-[13.5px] font-bold text-[#08282c] transition"
            style={{ background: on ? '#e6faf6' : '#fff', border: `1.5px solid ${on ? '#00cfcd' : 'rgba(20,36,37,.12)'}` }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function TenantDrawer({ tenant, onClose, onSaved, onDeleted }) {
  const [tab, setTab] = useState('info');
  const [name, setName] = useState(tenant.business_name);
  const [slug, setSlug] = useState(tenant.slug);
  const [plan, setPlan] = useState(tenant.plan);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setupBusy, setSetupBusy] = useState(false);
  const [error, setError] = useState('');
  const central = tenant.slug === 'wintuu';
  const dirty = name !== tenant.business_name || slug !== tenant.slug || plan !== tenant.plan;
  const c = tenant.counts || {};

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const patch = async (body) => {
    setBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenant.id}`, { method: 'PATCH', body });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const setSetup = async (completed) => {
    setSetupBusy(true);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenant.id}/setup`, { method: 'PATCH', body: { completed } });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSetupBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`¿Eliminar la app "${tenant.business_name}" y TODOS sus datos (clientes, pedidos, cupones, menú, config)? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    setError('');
    try {
      await api(`/api/superadmin/tenants/${tenant.id}`, { method: 'DELETE' });
      onDeleted();
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-20 bg-[rgba(8,40,44,.35)] backdrop-blur-[2px]" />
      <aside className="wt2-drawer fixed inset-y-0 right-0 z-30 flex w-full max-w-[460px] flex-col bg-[var(--wt-bg)] shadow-[-30px_0_60px_-30px_rgba(8,40,44,.5)]">
        <div className="relative overflow-hidden bg-[#08282c] px-[22px] pt-[22px] text-white">
          <div className="wt-bg-blob" style={{ width: 220, height: 220, background: tintFor(tenant.id), top: -80, right: -60, opacity: 0.25 }} />
          <div className="relative flex items-start justify-between">
            <Avatar id={tenant.id} name={tenant.business_name} size={52} radius={16} />
            <button onClick={onClose} aria-label="Cerrar" className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10">
              <X size={16} />
            </button>
          </div>
          <p className="wt-heading relative mt-3.5 text-[26px] font-semibold">{tenant.business_name}</p>
          <a href={`/${tenant.slug}`} target="_blank" rel="noreferrer" className="relative inline-flex items-center gap-1 font-mono text-[13px] text-[var(--wt-mint-light)] hover:text-white">
            wintuu.app/{tenant.slug} <ExternalLink size={12} />
          </a>
          <div className="relative mt-4 flex gap-1">
            {[['info', 'Datos'], ['users', 'Usuarios']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="border-b-[3px] px-3.5 py-2.5 text-[13.5px] font-bold transition"
                style={{ color: tab === id ? '#fff' : 'rgba(255,255,255,.55)', borderColor: tab === id ? '#00cfcd' : 'transparent' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-[22px] py-5">
          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-600">{error}</p>}
          {tab === 'info' ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[['clientes', c.clients], ['pedidos', c.orders], ['cupones', c.coupons]].map(([label, v]) => (
                  <div key={label} className="rounded-2xl border border-[rgba(20,36,37,0.08)] bg-white p-3">
                    <p className="wt-heading text-[22px] font-semibold text-[var(--wt-ink)]">{num(v)}</p>
                    <p className="text-xs text-[var(--wt-muted)]">{label}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className={`${EYEBROW} mb-2`}>ESTADO</p>
                <div className={central || busy ? 'pointer-events-none opacity-60' : ''}>
                  <Segmented
                    dark={false}
                    className="!rounded-full"
                    value={tenant.status}
                    onChange={(status) => status !== tenant.status && patch({ status })}
                    options={Object.entries(TENANT_STATUS).map(([value, s]) => ({ value, label: s.label, bg: s.bg, ink: s.ink }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className={EYEBROW}>DATOS</p>
                <label className={LABEL}>
                  Nombre del negocio
                  <input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} disabled={central} />
                </label>
                <label className={LABEL}>
                  Link
                  <input className={`${FIELD} font-mono`} value={slug} onChange={(e) => setSlug(slugify(e.target.value))} disabled={central} />
                </label>
                <div className={LABEL}>
                  Plan
                  <div className={central ? 'pointer-events-none opacity-60' : ''}>
                    <PlanPicker value={plan} onChange={setPlan} />
                  </div>
                </div>
                <p className="text-[13px] text-[var(--wt-muted)]">
                  Dueño: <strong className="text-[var(--wt-text)]">{tenant.owner?.email || 'sin dueño'}</strong>
                  {tenant.created_at && ` · Alta ${formatDate(tenant.created_at)}`}
                </p>
              </div>

              {!central && (
                <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[rgba(20,36,37,0.08)] bg-white px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-bold text-[var(--wt-ink)]">
                      Primeros pasos
                      <Pill {...(tenant.setup_completed ? { label: 'Completados', bg: '#dff8f1', ink: '#00705f' } : { label: 'Pendientes', bg: '#fff3cf', ink: '#8a5a00' })} />
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-[var(--wt-muted)]">
                      {tenant.setup_completed ? 'El administrador ya configuró su app.' : 'El administrador verá el asistente al entrar al panel.'}
                    </p>
                  </div>
                  <button onClick={() => setSetup(!tenant.setup_completed)} disabled={setupBusy} className={`${BTN_GHOST} shrink-0 !px-3.5 !py-2 !text-[12.5px]`}>
                    {setupBusy && <Loader2 className="animate-spin" size={13} />}
                    {tenant.setup_completed ? 'Volver a mostrar' : 'Marcar hechos'}
                  </button>
                </div>
              )}

              {!central && (
                <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#ffc4e1] bg-[#fff5f9] px-4 py-3.5">
                  <div>
                    <p className="text-sm font-bold text-[#9b1c4b]">Eliminar app</p>
                    <p className="mt-0.5 text-[12.5px] text-[var(--wt-muted)]">Borra clientes, pedidos, cupones y menú.</p>
                  </div>
                  <button onClick={remove} disabled={deleting} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e98bb0] bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#9b1c4b] transition hover:bg-[#ffe3ef] disabled:opacity-50">
                    {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} Eliminar
                  </button>
                </div>
              )}
            </>
          ) : (
            <TenantUsers tenantId={tenant.id} />
          )}
        </div>

        {tab === 'info' && !central && (
          <div className="flex justify-end gap-2 border-t border-[rgba(20,36,37,0.08)] bg-white px-[22px] py-3.5">
            <button className={BTN_GHOST} onClick={onClose}>Cancelar</button>
            <button className={BTN_MINT} disabled={busy || !dirty || !name.trim() || !slug} onClick={() => patch({ business_name: name.trim(), slug, plan })}>
              {busy && <Loader2 className="animate-spin" size={15} />} Guardar cambios
            </button>
          </div>
        )}
      </aside>
      <style>{`
        @keyframes wt2-drawer-in { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
        .wt2-drawer { animation: wt2-drawer-in .35s cubic-bezier(.2,.8,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .wt2-drawer { animation: none; } }
      `}</style>
    </>
  );
}

function CreateModal({ onClose, onDone }) {
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [touched, setTouched] = useState(false);
  const [plan, setPlan] = useState('mensual');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [businessType, setBusinessType] = useState('cafeteria');
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
      await api('/api/superadmin/tenants', { method: 'POST', body: { businessName, slug, plan, businessType, ownerEmail: ownerEmail || undefined } });
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-[rgba(8,40,44,.4)] backdrop-blur-[3px]" />
      <form
        onSubmit={submit}
        className="wt2-pop-in fixed left-1/2 top-1/2 z-50 flex w-[min(520px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-3.5 rounded-[26px] bg-[var(--wt-bg)] p-[26px] shadow-[0_40px_80px_-30px_rgba(8,40,44,.5)]"
        style={{ translate: '-50% -50%', transform: 'none' }}
      >
        <p className="text-[12px] font-extrabold tracking-[0.14em] text-[var(--wt-mint-dark)]">NUEVA APP</p>
        <h2 className="wt-heading text-[26px] font-semibold text-[var(--wt-ink)]">Dar de alta un negocio</h2>
        <label className={LABEL}>
          Nombre del negocio
          <input className={FIELD} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Café Aurora" required autoFocus />
        </label>
        <label className={LABEL}>
          Link
          <span className="flex items-center rounded-[14px] border border-[rgba(20,36,37,0.12)] bg-white pl-3.5 font-mono text-sm focus-within:border-[var(--wt-mint)]">
            <span className="text-[var(--wt-muted)]">wintuu.app/</span>
            <input
              className="min-w-0 flex-1 bg-transparent py-2.5 pr-3.5 font-bold text-[var(--wt-mint-dark)] outline-none"
              value={slug}
              placeholder="tu-negocio"
              onChange={(e) => {
                setTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
            />
          </span>
        </label>
        <label className={LABEL}>
          Email del dueño (opcional)
          <input className={FIELD} type="email" placeholder="dueno@gmail.com" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
          <span className="text-xs font-medium text-[var(--wt-muted)]">Tiene que haber ingresado al menos una vez con Google.</span>
        </label>
        <label className={LABEL}>
          Tipo de negocio
          <select className={FIELD} value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <span className="text-xs font-medium text-[var(--wt-muted)]">El dueño lo puede cambiar en primeros pasos o en Configuración.</span>
        </label>
        <PlanPicker value={plan} onChange={setPlan} />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <div className="mt-1.5 flex justify-end gap-2">
          <button type="button" className={BTN_GHOST} onClick={onClose}>Cancelar</button>
          <button className={BTN_INK} disabled={busy || !businessName || !slug}>
            {busy ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />} Crear app
          </button>
        </div>
      </form>
    </>
  );
}

/* ── Pagos ── */
function PaymentsTab({ payments, loading }) {
  const [filter, setFilter] = useState('todos');
  const month = payments.filter((p) => p.status === 'approved' && sameMonth(p.created_at)).reduce((a, p) => a + Number(p.amount || 0), 0);
  const count = (s) => payments.filter((p) => p.status === s).length;
  const orphan = payments.filter((p) => p.status === 'approved' && !p.tenant_id).length;
  const list = filter === 'todos' ? payments : payments.filter((p) => p.status === filter);
  const COLS = 'grid grid-cols-[90px_minmax(0,2fr)_110px_110px_110px_90px] gap-3';

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <div className="wt2-rise rounded-[20px] bg-[#08282c] p-[18px] text-white">
          <p className="text-[13px] text-white/70">Cobrado este mes</p>
          <p className="wt-heading mt-2 text-[30px] font-semibold">{money(month)}</p>
        </div>
        {[['Aprobados', count('approved')], ['Pendientes', count('pending')], ['Aprobados sin app', orphan]].map(([label, v], i) => (
          <div key={label} className={`${CARD} wt2-rise !rounded-[20px] p-[18px]`} style={{ '--d': `${(i + 1) * 70}ms` }}>
            <p className="text-[13px] text-[var(--wt-muted)]">{label}</p>
            <p className="wt-heading mt-2 text-[30px] font-semibold text-[var(--wt-ink)]">{v}</p>
          </div>
        ))}
      </div>

      <Segmented
        className="self-start !rounded-full"
        value={filter}
        onChange={setFilter}
        options={[['todos', 'Todos'], ['approved', 'Aprobados'], ['pending', 'Pendientes'], ['rejected', 'Rechazados']].map(([value, label]) => ({ value, label }))}
      />

      <div className={`${CARD} overflow-x-auto`}>
        <div className="min-w-[680px]">
          <div className={`${COLS} border-b border-[rgba(20,36,37,0.08)] px-5 py-3 text-[11.5px] font-extrabold tracking-[0.08em] text-[var(--wt-muted)]`}>
            <span>FECHA</span><span>EMAIL</span><span>PLAN</span><span>MONTO</span><span>ESTADO</span><span>APP</span>
          </div>
          {loading ? <Spinner /> : list.length === 0 ? <Empty>No hay pagos para mostrar.</Empty> : list.map((p) => {
            const s = PAY_STATUS[p.status] || PAY_STATUS.cancelled;
            const orphanRow = p.status === 'approved' && !p.tenant_id;
            return (
              <div key={p.id} className={`${COLS} items-center border-b border-[rgba(20,36,37,0.06)] px-5 py-3 text-[13.5px] last:border-0 hover:bg-[var(--wt-bg)]`}>
                <span className="text-[var(--wt-muted)]">{formatDate(p.created_at)}</span>
                <span className="truncate font-semibold">{p.payer_email || '—'}</span>
                <span>{PLAN_LABEL[p.plan] || p.plan}</span>
                <span className="font-bold">{money(p.amount)}</span>
                <span className="justify-self-start"><Pill {...s} /></span>
                <span className="truncate font-semibold" style={{ color: p.tenant_id ? '#00705f' : orphanRow ? '#9b1c4b' : 'var(--wt-muted)' }}>
                  {p.tenant_id ? 'Creada' : orphanRow ? 'Sin asignar' : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Soporte ── */
function SupportTab({ tickets, selected, onSelect, reload }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const ticket = tickets.find((t) => t.id === selected);

  const loadMessages = useCallback(async (id) => {
    try {
      const data = await api(`/api/superadmin/support/${id}`);
      setMessages(data.messages || []);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    if (!selected && tickets[0]) onSelect(tickets[0].id);
  }, [selected, tickets, onSelect]);

  useEffect(() => {
    if (!selected) return undefined;
    setMessages([]);
    loadMessages(selected).then(reload);
    const id = setInterval(() => loadMessages(selected), 10000);
    return () => clearInterval(id);
  }, [selected, loadMessages, reload]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
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
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status) => {
    try {
      await api(`/api/superadmin/support/${selected}`, { method: 'PATCH', body: { status } });
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  if (tickets.length === 0) return <div className={CARD}><Empty>Todavía no hay tickets de soporte.</Empty></div>;

  return (
    <div className="grid min-h-[480px] gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
      <div className={`${CARD} flex max-h-[calc(100vh-150px)] min-w-0 flex-col gap-0.5 overflow-y-auto p-2`}>
        {tickets.map((t) => {
          const on = t.id === selected;
          const s = TICKET_STATUS[t.status] || TICKET_STATUS.abierto;
          return (
            <button key={t.id} onClick={() => onSelect(t.id)} className="flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-[#fff4e6]" style={{ background: on ? '#e6faf6' : undefined }}>
              <Avatar id={t.tenant?.id || t.id} name={t.tenant?.business_name || '?'} size={38} radius={12} />
              <span className="min-w-0 flex-1">
                <span className="flex justify-between gap-1.5">
                  <span className="truncate text-sm font-bold text-[var(--wt-ink)]">{t.tenant?.business_name || 'App eliminada'}</span>
                  {t.unread > 0 && !on && <span className="rounded-full bg-[var(--wt-mint)] px-[7px] text-[11px] font-extrabold text-[#08282c]">{t.unread}</span>}
                </span>
                <span className="mt-0.5 block truncate text-[13px]">{t.subject}</span>
                <span className="mt-1.5 flex justify-between text-[11px] text-[var(--wt-muted)]">
                  <span className="font-mono">{t.code}</span>
                  <span className="font-bold" style={{ color: s.ink }}>{s.label}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={`${CARD} flex h-[calc(100vh-150px)] min-h-[480px] min-w-0 flex-col overflow-hidden`}>
        {!ticket ? (
          <Empty>Elegí un ticket.</Empty>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(20,36,37,0.08)] px-5 py-4">
              <div className="min-w-0">
                <a href={`/${ticket.tenant?.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--wt-mint-dark)] hover:text-[var(--wt-ink)]">
                  {ticket.tenant?.business_name} <ExternalLink size={12} />
                </a>
                <p className="wt-heading mt-0.5 text-[20px] font-semibold text-[var(--wt-ink)]">{ticket.subject}</p>
                <p className="font-mono text-xs text-[var(--wt-muted)]">{ticket.code}</p>
              </div>
              <Segmented value={ticket.status} onChange={changeStatus} options={Object.entries(TICKET_STATUS).map(([value, s]) => ({ value, label: s.label }))} />
            </div>

            <div ref={scrollRef} className="flex min-w-0 flex-1 flex-col gap-2.5 overflow-y-auto overflow-x-hidden bg-[var(--wt-bg)] p-5">
              {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-600">{error}</p>}
              {messages.length === 0 ? (
                <p className="mt-8 text-center text-sm text-[var(--wt-muted)]">Sin mensajes todavía.</p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_role === 'superadmin';
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="wt2-rise max-w-[75%] rounded-[18px] px-[15px] py-[11px] text-sm leading-[1.45]"
                        style={mine ? { background: '#08282c', color: '#fff', borderBottomRightRadius: 6 } : { background: '#fff', color: 'var(--wt-text)', borderBottomLeftRadius: 6 }}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className="mt-1 text-right text-[11px] opacity-65">{formatDateTime(m.created_at)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {ticket.status !== 'cerrado' ? (
              <form onSubmit={send} className="flex gap-2 border-t border-[rgba(20,36,37,0.08)] p-3">
                <input className={`${FIELD} !rounded-full flex-1 !px-[18px] !py-3`} placeholder="Escribí una respuesta…" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} />
                <button className={`${BTN_INK} shrink-0`} disabled={sending || !text.trim()}>
                  {sending ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />} Enviar
                </button>
              </form>
            ) : (
              <p className="border-t border-[rgba(20,36,37,0.08)] p-4 text-center text-[13px] text-[var(--wt-muted)]">Ticket cerrado. Cambiá el estado para volver a responder.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
