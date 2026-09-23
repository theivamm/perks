import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Mail, Phone, PlusCircle, ScanLine, Search, Users } from 'lucide-react';
import { api } from '../../api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { EmptyState, Spinner, toast } from '../../components/ui.jsx';

export default function Clients() {
  const navigate = useNavigate();
  const { t } = useTenant();
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(null);

  const load = async () => {
    try {
      const r = await api('/api/clients/registered');
      setRegistered(r);
    } catch (err) {
      toast(err.message);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const viewClient = (c) => navigate(t(`/dashboard/cliente/${c.id}`));

  const addPoint = async (c) => {
    setAdding(c.id);
    try {
      await api(`/api/clients/registered/${c.id}/puntos`, { method: 'POST' });
      toast('Punto sumado. El cliente recibió su notificación.');
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setAdding(null);
    }
  };

  const reFiltered = registered.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Clientes</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Usuarios de la app con QR. Escaneá su QR para abrir el perfil y sumar compras.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input className="input pl-10" placeholder="Buscar cliente…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <Spinner label="Cargando clientes..." />
      ) : registered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="Todavía no hay clientes"
            subtitle="Cuando un cliente se registre o entre con Google, aparece acá con su QR."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_120px_220px] gap-4 border-b border-line bg-surface-alt px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-muted md:grid">
            <span>Cliente</span>
            <span>Contacto</span>
            <span>Compras</span>
            <span />
          </div>
          {reFiltered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-muted">Sin resultados para “{search}”.</p>
          ) : (
            <ul className="divide-y divide-line">
              {reFiltered.map((c) => (
                <li
                  key={c.id}
                  className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_120px_220px] md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-heading text-sm font-bold text-primary-strong">
                        {(c.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="truncate font-semibold text-ink">{c.name || 'Sin nombre'}</p>
                  </div>
                  <div className="min-w-0 space-y-0.5 text-sm text-ink-muted">
                    {c.email ? (
                      <p className="flex items-center gap-1.5 truncate"><Mail size={13} className="shrink-0" /> {c.email}</p>
                    ) : (
                      <p className="text-xs">—</p>
                    )}
                    {c.phone && <p className="flex items-center gap-1.5 truncate text-xs"><Phone size={12} className="shrink-0" /> {c.phone}</p>}
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-primary-softer px-2.5 py-1 text-xs font-bold text-primary-strong">
                      {c.orders} compra{c.orders !== 1 && 's'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <button
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-primary-strong transition hover:border-primary/40 hover:bg-primary-softer disabled:opacity-50"
                      onClick={() => addPoint(c)}
                      disabled={adding === c.id}
                      title="Sumar 1 punto al cupón activo y notificar"
                    >
                      <PlusCircle size={14} />
                      Sumar punto
                    </button>
                    <button className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => viewClient(c)} title="Ver perfil del cliente">
                      <Eye size={14} />
                      Ver perfil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t border-line bg-primary-softer px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-contrast">
              <ScanLine size={18} />
            </span>
            <p className="min-w-0 flex-1 text-sm text-ink-muted">
              <span className="font-bold text-ink">Más rápido en caja: </span>
              escaneá el QR del cliente y el punto se suma directo en su perfil.
            </p>
            <button className="btn-ghost !py-1.5 !text-xs" onClick={() => navigate(t('/dashboard/escanear'))}>
              Escanear QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
