import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Mail, Phone, PlusCircle, Search, ShieldCheck } from 'lucide-react';
import { api } from '../../api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { Spinner, toast } from '../../components/ui.jsx';

export default function Clients() {
  const navigate = useNavigate();
  const { t } = useTenant();
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    const r = await api('/api/clients/registered').catch(() => []);
    setRegistered(r);
  };

  useEffect(() => {
    load()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const viewClient = (c) => navigate(t(`/dashboard/cliente/${c.id}`));

  const addPoint = async (c) => {
    if (!confirm(`¿Sumar 1 punto al cupón activo de "${c.name}"?`)) return;
    try {
      await api(`/api/clients/registered/${c.id}/puntos`, { method: 'POST' });
      toast('Punto sumado. El cliente recibió su notificación.');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  const reFiltered = registered.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink">Clientes</h1>
        <p className="text-sm text-ink-muted">
          Escaneá el QR de un cliente para abrir su perfil y sumar compras.
        </p>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          className="input pl-9"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner label="Cargando clientes..." />
      ) : (
        <>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <ShieldCheck size={18} className="text-primary-strong" />
            Usuarios de la app (con QR)
          </h2>
          {reFiltered.length === 0 ? (
            <p className="mb-8 text-sm text-ink-muted">
              Todavía no hay usuarios registrados. Cuando un cliente se registre o entre con Google, aparece acá con su QR.
            </p>
          ) : (
            <div className="card mb-8 overflow-hidden">
              <div className="hidden grid-cols-12 gap-3 border-b border-line bg-surface-alt px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-ink-muted sm:grid">
                <div className="col-span-4">Cliente</div>
                <div className="col-span-4">Contacto</div>
                <div className="col-span-2">Compras</div>
                <div className="col-span-2">Acciones</div>
              </div>
              <ul className="divide-y divide-line">
                {reFiltered.map((c) => (
                  <li key={c.id} className="grid grid-cols-1 gap-2 px-4 py-3.5 sm:grid-cols-12 sm:items-center sm:gap-3">
                    <div className="col-span-4 flex items-center gap-3">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary-strong">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p className="truncate font-bold text-ink">{c.name}</p>
                    </div>
                    <div className="col-span-4 text-sm text-ink-muted">
                      <p className="flex items-center gap-1.5 truncate">
                        {c.email ? <><Mail size={13} /> {c.email}</> : <span className="text-xs">—</span>}
                        {c.phone && <span className="truncate text-xs">· {c.phone}</span>}
                      </p>
                    </div>
                    <div className="col-span-2 text-sm">
                      <span className="badge">{c.orders} compra{c.orders !== 1 && 's'}</span>
                    </div>
                    <div className="col-span-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <button
                        className="btn-ghost !px-2 !py-1 !text-xs"
                        onClick={() => addPoint(c)}
                        title="Sumar 1 punto al cupón activo y notificar"
                      >
                        <PlusCircle size={13} />
                        Sumar punto
                      </button>
                      <button
                        className="btn-ghost !px-2 !py-1 !text-xs"
                        onClick={() => viewClient(c)}
                        title="Ver perfil del cliente"
                      >
                        <Eye size={13} />
                        Ver
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}