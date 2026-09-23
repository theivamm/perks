import { useEffect, useMemo, useState } from 'react';
import { Archive, Bell, CheckCheck, History as HistoryIcon } from 'lucide-react';
import { api } from '../api.js';
import { EmptyState, Segmented, Spinner, toast } from '../components/ui.jsx';
import Navbar from '../components/Navbar.jsx';
import { formatDateTime, formatWhen, groupByDay, notificationGroup, notificationMeta } from '../lib/notifications.js';
import CouponPointOverlay from '../components/CouponPointOverlay.jsx';

const FILTERS = [
  ['todas', 'Todas'],
  ['puntos', 'Puntos'],
  ['cupones', 'Cupones'],
  ['compras', 'Compras'],
];

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('activas');
  const [filter, setFilter] = useState('todas');
  const [celebrate, setCelebrate] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api('/api/notifications/history');
        setItems(res.items || []);
      } catch (err) {
        toast(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const archive = async (n) => {
    try {
      await api(`/api/notifications/${n.id}/archive`, { method: 'POST' });
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, archived: true, read: true } : x)));
    } catch (err) {
      toast(err.message);
    }
  };

  const markAllRead = async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    await api('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
  };

  const active = items.filter((n) => !n.archived);
  const archived = items.filter((n) => n.archived);
  const base = tab === 'activas' ? active : archived;
  const counts = useMemo(() => {
    const c = { todas: base.length };
    for (const n of base) c[notificationGroup(n.type)] = (c[notificationGroup(n.type)] || 0) + 1;
    return c;
  }, [base]);
  const visible = filter === 'todas' ? base : base.filter((n) => notificationGroup(n.type) === filter);
  const groups = groupByDay(visible);
  const unread = active.filter((n) => !n.read).length;

  const isCelebration = (n) => ['reward_progress', 'coupon_won'].includes(n.type) && n.data?.user_coupon_id;

  return (
    <div className="page-aurora min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-3xl space-y-5 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-ink sm:text-4xl">Notificaciones</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {unread > 0 ? `Tenés ${unread} sin leer.` : 'Estás al día.'} Las archivadas quedan guardadas en el historial.
            </p>
          </div>
          {unread > 0 && (
            <button className="btn-ghost !py-2 text-sm" onClick={markAllRead}>
              <CheckCheck size={15} />
              Marcar todo como leído
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            className="w-full sm:w-auto"
            value={tab}
            onChange={(v) => {
              setTab(v);
              setFilter('todas');
            }}
            options={[
              { value: 'activas', label: `Activas · ${active.length}`, icon: Bell },
              { value: 'historial', label: `Archivadas · ${archived.length}`, icon: HistoryIcon },
            ]}
          />
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.filter(([k]) => k === 'todas' || counts[k]).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  filter === k ? 'border-primary bg-primary text-primary-contrast' : 'border-line bg-surface text-ink hover:bg-surface-alt'
                }`}
              >
                {label} · {counts[k] || 0}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Spinner label="Cargando notificaciones..." />
        ) : visible.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={tab === 'activas' ? Bell : HistoryIcon}
              title={tab === 'activas' ? 'No tenés notificaciones' : 'El historial está vacío'}
              subtitle={
                tab === 'activas'
                  ? 'Cuando sumes puntos, completes un cupón o haya novedades, aparecen acá.'
                  : 'Las notificaciones que archives se guardan acá.'
              }
            />
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map(({ label, items: list }) => (
              <section key={label} className="space-y-2">
                <h2 className="px-1 font-sans text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-muted">{label}</h2>
                <ul className="card divide-y divide-line overflow-hidden">
                  {list.map((n) => {
                    const meta = notificationMeta(n.type);
                    const Icon = meta.icon;
                    const clickable = isCelebration(n);
                    return (
                      <li
                        key={n.id}
                        className={`group flex items-start gap-3 px-4 py-3.5 sm:px-5 ${!n.read ? 'bg-primary-softer/60' : ''} ${
                          clickable ? 'cursor-pointer transition-colors hover:bg-surface-alt' : ''
                        }`}
                        onClick={() => clickable && setCelebrate(n)}
                      >
                        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.style}`}>
                          <Icon size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="flex items-center gap-1.5 text-sm font-bold text-ink">
                              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                              {n.title}
                            </p>
                            <p className="shrink-0 text-[11px] font-medium text-ink-muted" title={formatDateTime(n.created_at)}>
                              {formatWhen(n.created_at)}
                            </p>
                          </div>
                          <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{n.body}</p>
                          {clickable && <p className="mt-1 text-xs font-bold text-primary-strong">Ver progreso →</p>}
                        </div>
                        {tab === 'activas' && (
                          <button
                            className="btn-icon shrink-0 opacity-60 transition group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              archive(n);
                            }}
                            title="Archivar"
                            aria-label="Archivar"
                          >
                            <Archive size={15} />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      {celebrate && <CouponPointOverlay note={celebrate} onClose={() => setCelebrate(null)} />}
    </div>
  );
}
