import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Bell, CheckCheck, History, Loader2 } from 'lucide-react';
import { api } from '../api.js';
import { formatWhen, notificationMeta } from '../lib/notifications.js';
import CouponPointOverlay from './CouponPointOverlay.jsx';

const POLL_MS = 30000;

export default function NotificationsBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [celebrate, setCelebrate] = useState(null);
  const ref = useRef(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api('/api/notifications');
      setItems(res.items || []);
      setUnread(res.unread || 0);
    } catch {
      /* tabla sin migrar todavía */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        await api('/api/notifications/read-all', { method: 'POST' });
      } catch {
        /* noop */
      }
      setUnread(0);
      load(true);
    }
  };

  const archive = async (n) => {
    try {
      await api(`/api/notifications/${n.id}/archive`, { method: 'POST' });
      setItems((list) => list.filter((x) => x.id !== n.id));
    } catch (e) {
      /* noop */
    }
  };

  const openItem = (n) => {
    setOpen(false);
    if (['reward_progress', 'coupon_won'].includes(n.type) && n.data?.user_coupon_id) {
      setCelebrate(n);
      return;
    }
    navigate(n.link || '/notificaciones');
  };

  return (
    <div className="relative" ref={ref}>
      {celebrate && <CouponPointOverlay note={celebrate} onClose={() => setCelebrate(null)} />}
      <button
        className="btn-icon relative"
        onClick={toggleOpen}
        aria-label="Notificaciones"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            key={unread}
            className="animate-pop absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-surface"
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-fade-up fixed inset-x-0 top-[4.25rem] z-50 mx-auto w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-line bg-surface shadow-xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mx-0 sm:mt-2 sm:w-80 sm:max-w-none">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <p className="text-sm font-extrabold text-ink">Notificaciones</p>
            <div className="flex items-center gap-1">
              <button
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
                onClick={() => {
                  setOpen(false);
                  navigate('/notificaciones');
                }}
              >
                <History size={13} />
                Historial
              </button>
              {items.some((n) => !n.read) && (
                <button
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-primary-strong transition-colors hover:bg-surface-alt"
                  onClick={() => {
                    setItems((list) => list.map((n) => ({ ...n, read: true })));
                    api('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
                  }}
                >
                  <CheckCheck size={13} />
                  Leer todo
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-ink-muted">
                <Loader2 size={15} className="animate-spin" />
                Cargando...
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-muted">
                No tenés notificaciones nuevas.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {items.slice(0, 10).map((n) => {
                  const meta = notificationMeta(n.type);
                  const Icon = meta.icon;
                  return (
                    <li key={n.id}>
                      <button
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-alt"
                        onClick={() => openItem(n)}
                      >
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.style}`}>
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-extrabold text-ink">{n.title}</span>
                            {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-strong" />}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{n.body}</span>
                          <span className="mt-1 block text-[11px] font-semibold text-ink-muted/70">
                            {formatWhen(n.created_at)}
                          </span>
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="Archivar"
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                          onClick={(e) => {
                            e.stopPropagation();
                            archive(n);
                          }}
                        >
                          <Archive size={14} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}