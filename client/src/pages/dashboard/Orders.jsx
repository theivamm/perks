import { useEffect, useState } from 'react';
import { ClipboardList, Filter, Trash2 } from 'lucide-react';
import { api, formatDate, formatMoney } from '../../api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EmptyState, Spinner, toast } from '../../components/ui.jsx';

const STATUS = [
  { value: 'nuevo', label: 'Nuevo', color: 'bg-blue-500' },
  { value: 'en preparación', label: 'En preparación', color: 'bg-amber-500' },
  { value: 'listo', label: 'Listo', color: 'bg-green-500' },
  { value: 'en camino', label: 'En camino', color: 'bg-sky-500' },
  { value: 'entregado', label: 'Entregado', color: 'bg-primary' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-500' },
];

export default function Orders() {
  const { settings } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [updating, setUpdating] = useState({});

  const load = () => api('/api/orders').then(setOrders).catch((e) => toast(e.message));

  useEffect(() => {
    api('/api/orders')
      .then(setOrders)
      .catch((e) => toast(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === 'todos' ? orders : orders.filter((o) => o.status === statusFilter);

  const changeStatus = async (order, value) => {
    setUpdating((u) => ({ ...u, [order.id]: true }));
    try {
      await api(`/api/orders/${order.id}/status`, { method: 'PUT', body: { status: value } });
      toast('Estado actualizado');
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setUpdating((u) => ({ ...u, [order.id]: false }));
    }
  };

  const remove = async (order) => {
    if (!confirm(`¿Eliminar el pedido #${order.id}?`)) return;
    try {
      await api(`/api/orders/${order.id}`, { method: 'DELETE' });
      toast('Pedido eliminado');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Pedidos</h1>
          <p className="text-sm text-ink-muted">Sigue el estado de los pedidos de tus clientes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge-outline">
            <Filter size={13} />
            {orders.length} en total
          </span>
          {['todos', ...STATUS.map((s) => s.value)].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-primary text-primary-contrast'
                  : 'border border-line bg-surface text-ink-muted hover:bg-surface-alt'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner label="Cargando pedidos..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No hay pedidos"
          subtitle="Los pedidos aparecerán aquí cuando los clientes hagan su pedido desde el menú público."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const status = STATUS.find((s) => s.value === order.status) || STATUS[0];
            return (
              <div key={order.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-alt/60 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-sm font-extrabold text-primary-contrast">
                      #{order.id}
                    </div>
                    <div>
                      <p className="font-bold text-ink">{order.client?.name || 'Cliente'}</p>
                      <p className="text-xs text-ink-muted">
                        {formatDate(order.created_at)}
                        {order.client?.phone && ` · ${order.client.phone}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <ul className="space-y-1.5">
                    {order.items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink">
                          <span className="font-semibold">{it.qty}×</span> {it.title}
                        </span>
                        <span className="text-ink-muted">{formatMoney(it.price * it.qty, settings.currency)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink-muted">Estado:</span>
                      <select
                        className="input !w-auto !py-1.5 !text-xs"
                        value={order.status}
                        disabled={updating[order.id]}
                        onChange={(e) => changeStatus(order, e.target.value)}
                      >
                        {STATUS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-lg font-extrabold text-primary-strong">
                        {formatMoney(order.total, settings.currency)}
                      </span>
                    </div>
                    <button className="btn-danger !py-1.5 !text-xs" onClick={() => remove(order)}>
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}