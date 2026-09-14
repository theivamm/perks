import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgePercent,
  Gift,
  Loader2,
  Mail,
  PlusCircle,
  QrCode,
  ReceiptText,
  ScanLine,
  Sparkles,
  Users,
} from 'lucide-react';
import { api, formatMoney } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { EmptyState, toast } from './ui.jsx';
import { formatWhen } from '../lib/notifications.js';

export default function AdminSummary() {
  const navigate = useNavigate();
  const { settings } = useTheme();
  const [clients, setClients] = useState(null);

  const load = () =>
    api('/api/clients/summary')
      .then(setClients)
      .catch((e) => toast(e.message));

  useEffect(() => {
    load();
  }, []);

  const addCompra = async (c) => {
    if (!confirm(`¿Sumar 1 compra a "${c.name}"?`)) return;
    try {
      await api(`/api/clients/registered/${c.id}/compras`, { method: 'POST', body: { total: 0 } });
      toast('Compra sumada. El cliente ya recibió su notificación.');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  const withCoupons = (clients || []).filter((c) => c.couponsActive.length > 0);

  return (
    <div className="space-y-6">
      <button className="card flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-surface-alt" onClick={() => navigate('/dashboard/escanear')}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
          <ScanLine size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-ink">Escanear QR</p>
          <p className="text-sm text-ink-muted">Escanéá el QR de un cliente para sumarle una compra.</p>
        </div>
        <QrCode size={20} className="shrink-0 text-primary-strong" />
      </button>

      {clients === null ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary-strong" size={26} />
        </div>
      ) : (
        <>
          {withCoupons.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
                <BadgePercent size={20} className="text-primary-strong" />
                Cupones disponibles por cliente
              </h2>
              <div className="space-y-4">
                {withCoupons.map((c) => (
                  <div key={c.id} className="card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-alt/50 px-4 py-2.5">
                      <p className="flex items-center gap-2 font-extrabold text-ink">
                        <Gift size={15} className="text-primary-strong" />
                        {c.name}
                      </p>
                      <span className="text-xs font-semibold text-ink-muted">
                        {c.couponsActive.length} cupón{c.couponsActive.length !== 1 && 'es'}
                      </span>
                    </div>
                    <ul className="divide-y divide-line px-4">
                      {c.couponsActive.map((cp) => (
                        <li key={cp.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-ink">
                              {cp.type === 'descuento' ? `${cp.value}% OFF` : cp.type === 'regalo' ? 'Regalo' : `${formatMoney(cp.value, settings.currency)}`}
                              <span className="text-ink-muted"> · {cp.description || 'premio'}</span>
                            </p>
                            <p className="text-[11px] text-ink-muted">
                              Compra #{cp.milestone} · código <span className="font-mono font-bold">{cp.code}</span>
                            </p>
                          </div>
                          <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-600">
                            disponible
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
              <Users size={20} className="text-primary-strong" />
              Historial de clientes
            </h2>
            {clients.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Aún no hay clientes"
                subtitle="Cuando un cliente se registre, acá vas a ver sus compras y puntos."
              />
            ) : (
              <div className="space-y-4">
                {clients.map((c) => (
                  <div key={c.id} className="card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="h-11 w-11 rounded-2xl object-cover shadow-sm" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-base font-extrabold text-primary-contrast">
                            {(c.name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-extrabold text-ink">{c.name}</p>
                          <p className="flex items-center gap-1.5 truncate text-xs text-ink-muted">
                            <Mail size={11} /> {c.email || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge">
                          <Sparkles size={12} className="mr-1 inline" />
                          {c.point} punto{c.point !== 1 && 's'}
                        </span>
                        <button className="btn-ghost !px-2.5 !py-1.5 !text-xs" onClick={() => addCompra(c)}>
                          <PlusCircle size={13} />
                          Sumar
                        </button>
                        <button className="btn-ghost !px-2.5 !py-1.5 !text-xs" onClick={() => navigate(`/dashboard/cliente/${c.id}`)}>
                          Ver perfil
                        </button>
                      </div>
                    </div>

                    {c.recentOrders.length > 0 && (
                      <div className="mt-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
                          <ReceiptText size={13} />
                          Últimas compras ({c.recentOrders.length})
                        </h3>
                        <ul className="space-y-1">
                          {c.recentOrders.map((o) => (
                            <li key={o.id} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
                              <span className="text-xs text-ink-muted">{formatWhen(o.created_at)}</span>
                              <span className="font-extrabold text-primary-strong">
                                {formatMoney(o.total, settings.currency)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}