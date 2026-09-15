import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  FileSpreadsheet,
  HelpCircle,
  ImagePlus,
  Leaf,
  Loader2,
  Mail,
  Phone,
  PlusCircle,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Wheat,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EmptyState, Modal, Spinner, toast } from '../../components/ui.jsx';
import ImageCropper from '../../components/ImageCropper.jsx';

const EMPTY = { name: '', email: '', phone: '', image: '', preferences: {} };

const PREF_OPTIONS = [
  { key: 'vegetarian', label: 'Vegetariano/a', icon: Leaf },
  { key: 'glutenFree', label: 'Celiaco/a (sin TACC)', icon: Wheat },
  { key: 'vegan', label: 'Vegano/a', icon: Sparkles },
];

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showExcelHelp, setShowExcelHelp] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const excelRef = ExcelRef(null);
  const imageRef = ExcelRef(null);

  const load = async () => {
    const [c, r] = await Promise.all([
      api('/api/clients').catch(() => []),
      api('/api/clients/registered').catch(() => []),
    ]);
    setClients(c);
    setRegistered(r);
  };

  useEffect(() => {
    load()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const viewClient = (c) => navigate(`/dashboard/cliente/${c.id}`);

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

  const filtered = clients.filter((c) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  });

  const reFiltered = registered.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const togglePref = (key) =>
    setForm((f) => ({ ...f, preferences: { ...f.preferences, [key]: !f.preferences[key] } }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/clients', { method: 'POST', body: form });
      toast('Cliente registrado');
      setModalOpen(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`¿Eliminar a "${c.name}"?`)) return;
    try {
      await api(`/api/clients/${c.id}`, { method: 'DELETE' });
      toast('Cliente eliminado');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  const importExcel = async (file) => {
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api('/api/clients/import-excel', { method: 'POST', body: fd });
      toast(
        `¡Clientes importados! ${res.imported}${res.duplicated ? ` (${res.duplicated} ya existían)` : ''}`
      );
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setImporting(false);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api('/api/clients/upload-image', { method: 'POST', body: fd });
      setForm((f) => ({ ...f, image: res.url }));
      toast('Foto subida');
    } catch (err) {
      toast(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    e.target.value = '';
  };

  const closeCropper = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Clientes</h1>
          <p className="text-sm text-ink-muted">
            Escaneá el QR de un cliente para abrir su perfil y sumar compras.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button className="btn-ghost" onClick={() => excelRef.current?.click()} disabled={importing}>
              {importing ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
              Importar Excel
            </button>
            <button
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface text-ink-muted shadow-sm hover:bg-surface-alt hover:text-ink"
              onClick={() => setShowExcelHelp((s) => !s)}
              aria-label="Cómo preparar el archivo Excel"
            >
              <HelpCircle size={13} />
            </button>

            {showExcelHelp && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExcelHelp(false)} />
                <div className="absolute right-2 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-ink">Formato del archivo Excel</h4>
                    <button onClick={() => setShowExcelHelp(false)} className="text-ink-muted hover:text-ink" aria-label="Cerrar">
                      ✕
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    Archivo <strong>.xlsx</strong> o <strong>.xls</strong> con <strong>3 columnas</strong> en este orden:
                  </p>
                  <ol className="mt-2 space-y-1 text-xs font-medium text-ink">
                    <li><strong>1.</strong> Nombre y apellido</li>
                    <li><strong>2.</strong> Teléfono</li>
                    <li><strong>3.</strong> Email</li>
                  </ol>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    Si la primera fila es un encabezado (Nombre / Teléfono / Email), se ignora automáticamente. Clientes con email ya existente se saltan.
                  </p>
                  <div className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
                    <strong>Importante:</strong> si el archivo no respeta esta estructura exacta (3 columnas en el orden indicado), los clientes se importarán mal (nombre, teléfono o email quedarán cruzados).
                  </div>
                </div>
              </>
            )}

            <input
              ref={excelRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files[0] && importExcel(e.target.files[0])}
            />
          </div>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <UserPlus size={16} />
            Nuevo cliente
          </button>
        </div>
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
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary-strong">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
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

          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <Users size={18} className="text-primary-strong" />
            Clientes del local
          </h2>
        </>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin clientes del local"
          subtitle="Son clientes sin cuenta en la app. Podés agregarlos manualmente o importarlos por Excel."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-12 gap-3 border-b border-line bg-surface-alt px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-ink-muted sm:grid">
            <div className="col-span-3">Cliente</div>
            <div className="col-span-3">Contacto</div>
            <div className="col-span-3">Preferencias</div>
            <div className="col-span-2">Pedidos</div>
            <div className="col-span-1" />
          </div>
          <ul className="divide-y divide-line">
            {filtered.map((c) => (
              <li key={c.id} className="grid grid-cols-1 gap-2 px-4 py-3.5 sm:grid-cols-12 sm:items-center sm:gap-3">
                <div className="col-span-3 flex items-center gap-3">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary-strong">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{c.name}</p>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-ink-muted">
                  {c.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone size={13} /> {c.phone}
                    </p>
                  )}
                  {c.email && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail size={13} /> {c.email}
                    </p>
                  )}
                  {!c.phone && !c.email && <span className="text-xs">—</span>}
                </div>
                <div className="col-span-3 flex flex-wrap gap-1">
                  {[['vegetarian', 'Veg', Leaf], ['glutenFree', 'Sin TACC', Wheat], ['vegan', 'Vegano', Sparkles]].map(
                    ([key, label, Icon]) =>
                      c.preferences?.[key] && (
                        <span key={key} className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-strong">
                          <Icon size={11} />
                          {label}
                        </span>
                      )
                  )}
                  {!Object.values(c.preferences || {}).some(Boolean) && <span className="text-xs text-ink-muted">—</span>}
                </div>
                <div className="col-span-2">
                  <span className="badge">{c.orders} pedido{c.orders !== 1 && 's'}</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button className="btn-icon !p-1.5 text-red-500" onClick={() => remove(c)} aria-label={`Eliminar ${c.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo cliente">
        <form onSubmit={save} className="space-y-4">
          <div className="flex gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-primary to-primary-strong">
              {form.image ? (
                <img src={form.image} alt="Foto" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary-contrast/60">
                  <ImagePlus size={24} />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="animate-spin text-white" size={20} />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2">
              <button type="button" className="btn-ghost w-full" onClick={() => imageRef.current?.click()} disabled={uploading}>
                <ImagePlus size={15} />
                Subir foto
              </button>
              <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
              <input className="input !text-xs" placeholder="...o pega una URL de foto" value={form.image} onChange={set('image')} />
            </div>
          </div>

          <div>
            <label className="label">Nombre y apellido *</label>
            <input className="input" required value={form.name} onChange={set('name')} placeholder="Nombre completo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="+58 412 000 0000" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="cliente@mail.com" />
            </div>
          </div>

          <div>
            <label className="label">Preferencias alimentarias</label>
            <div className="flex flex-wrap gap-2.5">
              {PREF_OPTIONS.map(({ key, label, icon: Icon }) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all ${
                    form.preferences[key]
                      ? 'border-primary bg-primary-soft text-primary-strong'
                      : 'border-line bg-surface text-ink-muted hover:bg-surface-alt'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  <input type="checkbox" className="hidden" checked={Boolean(form.preferences[key])} onChange={() => togglePref(key)} />
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
              Registrar
            </button>
          </div>
        </form>
      </Modal>

      {cropSrc && <ImageCropper src={cropSrc} aspect={1} onSave={uploadImage} onCancel={closeCropper} />}
    </div>
  );
}

function ExcelRef(initial) {
  return { current: initial };
}