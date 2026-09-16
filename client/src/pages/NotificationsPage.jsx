import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, ArrowLeft, Bell, CheckCheck, History as HistoryIcon } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EmptyState, Spinner, toast } from '../components/ui.jsx';
import { formatWhen, notificationMeta } from '../lib/notifications.js';
import CouponPointOverlay from '../components/CouponPointOverlay.jsx';

export default function NotificationsPage() {
  const { user } = useAuth();
  const backTo = user?.role === 'admin' ? '/dashboard' : '/';
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('activas');
  const [celebrate, setCelebrate] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api('/api/notifications/history');
        setItems(res.items || []);
        await api('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
        setItems((list) => list.map((n) => ({ ...n, read: true })));
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
      setItems((list) => list.filter((x) => x.id !== n.id));
    } catch (err) {
      toast(err.message);
    }
  };

  const active = items.filter((n) => !n.archived);
  const archived = items.filter((n) => n.archived);
  const visible = tab === 'activas' ? active : archived;

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/page px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
          <span className="text-sm font-bold text-ink">Notificaciones</span>
          <span className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-surface p-1.5">
          <button
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
              tab === 'activas' ? 'bg-primary text-primary-contrast shadow-md' : 'text-ink-muted hover:bg-surface-alt'
            }`}
            onClick={() => setTab('activas')}
          >
            Activas ({active.length})
          </button>
          <button
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
              tab === 'historial' ? 'bg-primary text-primary-contrast shadow-md' : 'text-ink-muted hover:bg-surface-alt'
            }`}
            onClick={() => setTab('historial')}
          >
            Historial ({archived.length})
          </button>
        </div>

        {loading ? (
          <Spinner label="Cargando notificaciones..." />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={tab === 'activas' ? Bell : HistoryIcon}
            title={tab === 'activas' ? 'No tenés notificaciones' : 'El historial está vacío'}
            subtitle={
              tab === 'activas'
                ? 'Cuando haya novedades (pedidos, cupones, premios) aparecerán acá.'
                : 'Las notificaciones archivadas se guardan acá permanentemente.'
            }
          />
        ) : (
          <ul className="space-y-3">
            {visible.map((n) => {
              const meta = notificationMeta(n.type);
              const Icon = meta.icon;
              return (
                <li
                  key={n.id}
                  className={`card flex items-start gap-3 p-4 ${
                    ['reward_progress', 'coupon_won'].includes(n.type) && n.data?.user_coupon_id
                      ? 'cursor-pointer transition-colors hover:bg-surface-alt'
                      : ''
                  }`}
                  onClick={() => {
                    if (['reward_progress', 'coupon_won'].includes(n.type) && n.data?.user_coupon_id) {
                      setCelebrate(n);
                    }
                  }}
                >
                  <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.style}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-ink">{n.title}</p>
                      {tab === 'historial' && (
                        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                          Archivada
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{n.body}</p>
                    <p className="mt-1 text-[11px] font-semibold text-ink-muted/70 dark:text-ink-muted">{formatWhen(n.created_at)}</p>
                  </div>
                  {tab === 'activas' && (
                    <button
                      className="btn-ghost !px-2.5 !py-1.5 text-xs"
                      onClick={() => archive(n)}
                      title="Archivar"
                    >
                      <Archive size={14} />
                      Archivar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {tab === 'historial' && archived.length > 0 && (
          <p className="flex items-center justify-center gap-1.5 pt-2 text-center text-xs text-ink-muted">
            <CheckCheck size={13} />
            Las notificaciones no se eliminan, solo se archivan. Acá queda todo tu historial.
          </p>
        )}
      </main>

      {celebrate && <CouponPointOverlay note={celebrate} onClose={() => setCelebrate(null)} />}
    </div>
  );
}