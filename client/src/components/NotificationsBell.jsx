import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Bell, CheckCheck, Loader2 } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import { supabase } from '../lib/supabase.js';
import { formatWhen, groupByDay, notificationMeta } from '../lib/notifications.js';
import CouponPointOverlay from './CouponPointOverlay.jsx';

const POLL_MS = 10000;

export default function NotificationsBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTenant();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [celebrate, setCelebrate] = useState(null);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const ref = useRef(null);
  const itemsRef = useRef([]);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api('/api/notifications');
      itemsRef.current = res.items || [];
      setItems(res.items || []);
      setUnread(res.unread || 0);
    } catch {
      /* tabla sin migrar todavía */
    } finally {
      setLoading(false);
    }
  };

  const onRealtime = (payload) => {
    const row = payload?.new;
    if (!row || !row.user_id || row.user_id !== user?.id) return;
    if (itemsRef.current.some((n) => n.id === row.id)) return;
    itemsRef.current = [row, ...itemsRef.current];
    setItems((list) => (list.some((n) => n.id === row.id) ? list : [row, ...list]));
    if (!row.read) setUnread((u) => u + 1);
    if (['reward_progress', 'coupon_won'].includes(row.type) && row.data?.user_coupon_id) setCelebrate(row);
  };

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), POLL_MS);
    if (!user?.id) return () => clearInterval(timer);
    const channel = supabase
      .channel('notifications-bell')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, onRealtime)
      .subscribe();
    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Ya no marcamos todo como leído al abrir: el usuario ve qué es nuevo y decide.
  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) load(true);
  };

  const markAllRead = () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setUnread(0);
    api('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
  };

  const archive = async (n) => {
    try {
      await api(`/api/notifications/${n.id}/archive`, { method: 'POST' });
      setItems((list) => list.filter((x) => x.id !== n.id));
      if (!n.read) setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* noop */
    }
  };

  const openItem = (n) => {
    setOpen(false);
    if (['reward_progress', 'coupon_won'].includes(n.type) && n.data?.user_coupon_id) {
      setCelebrate(n);
      return;
    }
    if (n.link && /^https?:\/\//i.test(n.link)) {
      window.open(n.link, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(n.link ? t(n.link) : t('/notificaciones'));
  };

  const shown = useMemo(() => (onlyUnread ? items.filter((n) => !n.read) : items).slice(0, 12), [items, onlyUnread]);
  const groups = useMemo(() => groupByDay(shown), [shown]);
  const hasUnread = unread > 0 || items.some((n) => !n.read);

  return (
    <div className="relative" ref={ref}>
      {celebrate && <CouponPointOverlay note={celebrate} onClose={() => setCelebrate(null)} />}
      <button className="btn-icon relative" onClick={toggleOpen} aria-label="Notificaciones" aria-expanded={open}>
        <Bell size={18} />
        {unread > 0 && (
          <span
            key={unread}
            aria-label={`${unread} notificaciones sin leer`}
            className="animate-pop absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-contrast ring-2 ring-surface"
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-fade-up fixed inset-x-3 top-[4.5rem] z-50 flex max-h-[78vh] flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[400px]">
          <div className="shrink-0 space-y-3 border-b border-line px-4 pb-3 pt-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading text-lg font-bold text-ink">Notificaciones</p>
              {hasUnread && (
                <button
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-primary-strong transition-colors hover:bg-primary-softer"
                  onClick={markAllRead}
                >
                  <CheckCheck size={14} />
                  Marcar como leídas
                </button>
              )}
            </div>
            <div className="flex gap-1 rounded-xl bg-surface-alt p-1">
              {[
                [false, 'Todas'],
                [true, `Sin leer${unread ? ` · ${unread}` : ''}`],
              ].map(([v, label]) => (
                <button
                  key={label}
                  onClick={() => setOnlyUnread(v)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${onlyUnread === v ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-ink-muted">
                <Loader2 size={15} className="animate-spin" />
                Cargando...
              </div>
            ) : shown.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-softer text-primary-strong">
                  <Bell size={20} />
                </span>
                <p className="text-sm font-bold text-ink">{onlyUnread ? 'Estás al día' : 'No tenés notificaciones'}</p>
                <p className="text-xs text-ink-muted">Acá te avisamos cuando sumes puntos o completes un cupón.</p>
              </div>
            ) : (
              groups.map(({ label, items: list }) => (
                <div key={label}>
                  <p className="sticky top-0 z-10 bg-surface/95 px-4 pb-1 pt-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-muted backdrop-blur">
                    {label}
                  </p>
                  <ul className="px-2 pb-1">
                    {list.map((n) => {
                      const meta = notificationMeta(n.type);
                      const Icon = meta.icon;
                      return (
                        <li key={n.id} className={`group relative flex items-start rounded-2xl transition-colors hover:bg-surface-alt ${!n.read ? 'bg-primary-softer/70' : ''}`}>
                          <button className="flex min-w-0 flex-1 items-start gap-3 px-2.5 py-2.5 text-left" onClick={() => openItem(n)}>
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.style}`}>
                              <Icon size={17} />
                            </span>
                            <span className="min-w-0 flex-1 pr-7">
                              <span className="flex items-baseline justify-between gap-2">
                                <span className="truncate text-sm font-bold text-ink">{n.title}</span>
                                <span className="shrink-0 text-[11px] font-medium text-ink-muted">{formatWhen(n.created_at)}</span>
                              </span>
                              <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-ink-muted">{n.body}</span>
                            </span>
                          </button>
                          {!n.read && <span className="pointer-events-none absolute right-3.5 top-4 h-2 w-2 rounded-full bg-primary group-hover:hidden" />}
                          <button
                            type="button"
                            aria-label="Archivar"
                            title="Archivar"
                            className="absolute right-1.5 top-2 hidden h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface hover:text-ink group-hover:flex"
                            onClick={() => archive(n)}
                          >
                            <Archive size={14} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>

          <button
            className="shrink-0 border-t border-line px-4 py-3 text-center text-sm font-bold text-primary-strong transition-colors hover:bg-surface-alt"
            onClick={() => {
              setOpen(false);
              navigate(t('/notificaciones'));
            }}
          >
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
}
