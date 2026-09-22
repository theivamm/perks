import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileSpreadsheet,
  HelpCircle,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { api, formatMoney } from '../../api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EmptyState, Modal, Spinner, toast } from '../../components/ui.jsx';
import ImageCropper from '../../components/ImageCropper.jsx';

const EMPTY_FORM = { title: '', description: '', price: '', category: 'General', image: '', available: 1, featured: 0, featured_label: '', discount: 0 };

export default function MenuManager() {
  const { settings } = useTheme();
  const [data, setData] = useState({ items: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todas');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [showExcelHelp, setShowExcelHelp] = useState(false);
  const [isNewCat, setIsNewCat] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [progress, setProgress] = useState({});
  const generatingRef = useRef(null);
  const excelInput = useRef(null);
  const imageInput = useRef(null);

  const load = () =>
    api('/api/menu')
      .then(setData)
      .catch((e) => toast(e.message));

  useEffect(() => {
    setLoading(true);
    api('/api/menu')
      .then(setData)
      .catch((e) => toast(e.message))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo(() => {
    return data.items.filter((it) => {
      const okCat = filter === 'Todas' || it.category === filter;
      const q = search.trim().toLowerCase();
      const okSearch = !q || it.title.toLowerCase().includes(q) || (it.category || '').toLowerCase().includes(q);
      return okCat && okSearch;
    });
  }, [data.items, filter, search]);

  const grouped = useMemo(() => {
    const map = {};
    for (const it of items) (map[it.category] ||= []).push(it);
    return map;
  }, [items]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsNewCat(false);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...EMPTY_FORM, ...item });
    setIsNewCat(false);
    setModalOpen(true);
  };

  const onCategoryChange = (e) => {
    const v = e.target.value;
    if (v === '__new__') {
      setIsNewCat(true);
      setForm((f) => ({ ...f, category: '' }));
    } else {
      setIsNewCat(false);
      setForm((f) => ({ ...f, category: v }));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api(`/api/menu/${editing.id}`, { method: 'PUT', body: form });
      else await api('/api/menu', { method: 'POST', body: form });
      toast(editing ? 'Producto actualizado' : 'Producto creado');
      setModalOpen(false);
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return;
    try {
      await api(`/api/menu/${item.id}`, { method: 'DELETE' });
      toast('Producto eliminado');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  const runGenerateImage = async (item) => {
    if (generatingRef.current) return;
    generatingRef.current = item.id;
    setGeneratingId(item.id);
    setProgress((p) => ({ ...p, [item.id]: 4 }));

    const sim = setInterval(() => {
      setProgress((p) => ({
        ...p,
        [item.id]: Math.min(94, (p[item.id] || 4) + Math.random() * 6 + 2),
      }));
    }, 400);

    const close = (pct) => {
      clearInterval(sim);
      setProgress((p) => ({ ...p, [item.id]: pct }));
    };

    try {
      const res = await api(`/api/menu/${item.id}/generate-image`, {
        method: 'POST',
        signal: AbortSignal.timeout(70000),
      });
      setData((d) => ({
        ...d,
        items: d.items.map((it) => (it.id === res.id ? res : it)),
      }));
      close(100);
      return { ok: true };
    } catch (err) {
      close(90);
      return { ok: false, error: err.message };
    } finally {
      generatingRef.current = null;
      setTimeout(() => {
        setGeneratingId(null);
        setProgress((p) => {
          const n = { ...p };
          delete n[item.id];
          return n;
        });
      }, 600);
    }
  };

  const generateImage = async (item) => {
    const r = await runGenerateImage(item);
    if (!r) return;
    toast(r.ok ? 'Imagen generada' : r.error || 'No se pudo generar. Probá de nuevo.');
  };

  const toggleAvailable = async (item, e) => {
    e.stopPropagation();
    try {
      await api(`/api/menu/${item.id}`, {
        method: 'PUT',
        body: { available: item.available ? 0 : 1 },
      });
      toast(item.available ? 'Oculto del menú público' : 'Visible en el menú');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  const toggleFeatured = async (item, e) => {
    e.stopPropagation();
    try {
      await api(`/api/menu/${item.id}`, {
        method: 'PUT',
        body: { featured: item.featured ? 0 : 1 },
      });
      toast(item.featured ? 'Quitado de ofertas especiales' : '¡Marcado como oferta especial!');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api('/api/menu/upload-image', { method: 'POST', body: fd });
      setForm((f) => ({ ...f, image: res.url }));
      toast('Imagen subida');
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

  const importExcel = async (file) => {
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api('/api/menu/import-excel', { method: 'POST', body: fd });
      toast(`¡Excel importado! ${res.imported} productos${res.skipped ? ` (${res.skipped} fila(s) ignorada(s))` : ''}`);
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setImporting(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Gestión del menú</h1>
          <p className="text-sm text-ink-muted">Agrega, edita o importa productos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button className="btn-ghost" onClick={() => excelInput.current?.click()} disabled={importing}>
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
                <div
                  className="fixed inset-x-4 top-1/2 z-50 max-h-[85vh] w-[calc(100vw-2rem)] max-w-sm -translate-y-1/2 overflow-hidden overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-xl md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:max-h-none md:w-80 md:max-w-none md:-translate-y-0 md:p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-ink">Formato del archivo Excel</h4>
                    <button onClick={() => setShowExcelHelp(false)} className="text-ink-muted hover:text-ink" aria-label="Cerrar">
                      ✕
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    El archivo debe ser <strong>.xlsx</strong> o <strong>.xls</strong> con <strong>4 columnas</strong> en este orden:
                  </p>
                  <ol className="mt-2 space-y-1 text-xs font-medium text-ink">
                    <li><strong>1.</strong> Título del producto (obligatorio)</li>
                    <li><strong>2.</strong> Precio (ej: <code>1500</code> o <code>1.500,50</code>)</li>
                    <li><strong>3.</strong> Categoría (ej: Bebidas, Postres)</li>
                    <li><strong>4.</strong> Descripción (opcional)</li>
                  </ol>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    Las <strong>imágenes se agregan manualmente</strong> después de importar. Si la primera fila es un encabezado (Título / Precio / ...), se ignora automáticamente.
                  </p>
                  <div className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
                    <strong>Importante:</strong> si el archivo no respeta esta estructura exacta (4 columnas en el orden indicado), los productos se importarán mal (título, precio o categoría quedarán cruzados).
                  </div>
                </div>
              </>
            )}

            <input
              ref={excelInput}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files[0] && importExcel(e.target.files[0])}
            />
          </div>
          <button className="btn-primary" onClick={openNew}>
            <Plus size={16} />
            Nuevo producto
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['Todas', ...data.categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === cat
                  ? 'bg-primary text-primary-contrast shadow'
                  : 'border border-line bg-surface text-ink-muted hover:bg-surface-alt'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner label="Cargando menú..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Sin productos"
          subtitle="Crea uno nuevo o importa un archivo Excel."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, list]) => (
            <section key={category || 'General'}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-lg font-extrabold text-ink">{category || 'General'}</h2>
                <span className="badge">{list.length}</span>
                <div className="h-px flex-1 bg-line" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((item) => (
                  <div key={item.id} className="card overflow-hidden">
                    <div className="relative aspect-square bg-gradient-to-br from-primary to-primary-strong">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-primary-contrast/60">
                          {(item.title || '?').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute right-2 top-2 flex flex-wrap items-center justify-end gap-1.5">
                        {Number(item.discount) > 0 ? (
                          <>
                            <span className="rounded-full bg-surface/90 px-2.5 py-1 text-xs font-bold text-ink-muted line-through">
                              {formatMoney(item.price, settings.currency)}
                            </span>
                            <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-black text-white shadow">
                              {formatMoney((Number(item.price) * (100 - Number(item.discount))) / 100, settings.currency)}
                            </span>
                            <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-black text-white shadow">
                              -{Number(item.discount)}%
                            </span>
                          </>
                        ) : (
                          <span className="rounded-full bg-surface/90 px-2.5 py-1 text-xs font-bold text-primary-strong">
                            {formatMoney(item.price, settings.currency)}
                          </span>
                        )}
                      </div>
                      <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
                        <button
                          onClick={(e) => toggleAvailable(item, e)}
                          className={`rounded-full px-2.5 py-1 text-xs font-bold shadow ${
                            item.available
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                          title="Cambiar disponibilidad"
                        >
                          {item.available ? 'Visible' : 'Oculto'}
                        </button>
                        {item.featured && (
                          <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-xs font-black text-white shadow-glow">
                            <Star size={12} className="inline-block" /> {item.featured_label || 'Oferta'}
                          </span>
                        )}
                      </div>
                      {generatingId === item.id && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-hidden bg-black/55 backdrop-blur-[2px]">
                          <div className="animate-shimmer pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.35)_42%,rgba(255,255,255,0.35)_50%,transparent_58%)] bg-[length:200%_100%]" />
                          <div className="relative h-14 w-14">
                            <div className="absolute inset-0 rounded-full border-2 border-white/25" />
                            <div
                              className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary-contrast"
                              style={{ animationDuration: '1s' }}
                            />
                            <div className="absolute inset-2.5 rounded-full bg-white/25" />
                            <Sparkles size={14} className="absolute inset-0 m-auto text-white" />
                          </div>
                          <span className="text-sm font-black text-white">
                            {Math.round(progress[item.id] || 0)}%
                          </span>
                          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/25">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 shadow-glow transition-[width] duration-300"
                              style={{ width: `${Math.round(progress[item.id] || 0)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-ink">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{item.description}</p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button className="btn-ghost flex-1 !py-1.5 !text-xs" onClick={() => openEdit(item)}>
                          <Pencil size={14} />
                          Editar
                        </button>
                        <button
                          className={`btn-ghost !px-2.5 !py-1.5 !text-xs ${item.featured ? 'border-amber-400/60 text-amber-600 dark:text-amber-400' : ''}`}
                          onClick={(e) => toggleFeatured(item, e)}
                          title={item.featured ? 'Quitar de ofertas' : 'Marcar como oferta especial'}
                          aria-label={item.featured ? 'Quitar de ofertas' : 'Marcar como oferta especial'}
                        >
                          <Star size={14} className={item.featured ? 'fill-amber-400 text-amber-500' : ''} />
                        </button>
                        <button
                          className="btn-danger !py-1.5 !text-xs"
                          onClick={() => remove(item)}
                          aria-label={`Eliminar ${item.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/40 py-2.5 text-xs font-semibold text-primary-strong transition-colors hover:bg-primary-soft active:scale-[0.98]"
                        style={{ touchAction: 'manipulation' }}
                        onClick={() => generateImage(item)}
                        disabled={!!generatingId}
                      >
                        {generatingId === item.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {generatingId === item.id ? 'Generando...' : generatingId ? 'Esperá...' : 'Generar imagen con IA'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={save} className="space-y-4">
          <div className="flex gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-primary to-primary-strong">
              {form.image ? (
                <img src={form.image} alt="Vista previa" className="h-full w-full object-cover" />
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
              <button
                type="button"
                className="btn-ghost w-full"
                onClick={() => imageInput.current?.click()}
                disabled={uploading}
              >
                <ImagePlus size={15} />
                Subir imagen
              </button>
              <input
                ref={imageInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
              />
              <input
                className="input !text-xs"
                placeholder="...o pega una URL de imagen"
                value={form.image}
                onChange={set('image')}
              />
            </div>
          </div>

          <div>
            <label className="label">Titulo *</label>
            <input className="input" required value={form.title} onChange={set('title')} placeholder="Ej: Pizza Margherita" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Precio *</label>
              <input
                className="input"
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={set('price')}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Categoría</label>
              <select
                className="input"
                value={isNewCat ? '__new__' : form.category || ''}
                onChange={onCategoryChange}
              >
                <option value="">General</option>
                {data.categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__new__">+ Nueva categoría…</option>
              </select>
              {isNewCat && (
                <input
                  className="input mt-2"
                  value={form.category}
                  onChange={set('category')}
                  placeholder="Escribí el nombre de la nueva categoría"
                  autoFocus
                />
              )}
            </div>
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-20 resize-y"
              value={form.description}
              onChange={set('description')}
              placeholder="Ingredientes, detalles, etc."
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[hsl(var(--primary))]"
              checked={Boolean(form.available)}
              onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked ? 1 : 0 }))}
            />
            <span className="text-sm font-semibold text-ink">Disponible en el menú público</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-3 dark:border-amber-400/40 dark:bg-amber-400/10">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[hsl(var(--primary))]"
              checked={Boolean(form.featured)}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked ? 1 : 0 }))}
            />
            <span className="text-sm font-semibold text-ink">
              <Star size={13} className="inline-block text-amber-500" />
              Oferta especial / Favorito (se muestra arriba del menú en el inicio)
            </span>
          </label>

          {Boolean(form.featured) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="animate-fade-up">
                  <label className="label">Descuento %</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={form.discount}
                    onChange={set('discount')}
                    placeholder="0"
                  />
                  {Number(form.discount) > 0 && Number(form.price) > 0 && (
                    <p className="mt-1.5 rounded-lg bg-green-500/10 px-2.5 py-1.5 text-[11px] font-bold text-green-600 dark:text-green-400">
                      {formatMoney(Number(form.price), settings.currency)} →{' '}
                      {formatMoney((Number(form.price) * (100 - Number(form.discount))) / 100, settings.currency)}
                    </p>
                  )}
                </div>
                <div className="animate-fade-up">
                  <label className="label">Texto de la oferta</label>
                  <input
                    className="input"
                    value={form.featured_label}
                    onChange={set('featured_label')}
                    placeholder="Ej: 2x1 · Regalo · Combos"
                  />
                </div>
              </div>
              <p className="text-[11px] text-ink-muted">
                El % se calcula solo: el precio original queda tachado y se muestra el nuevo. El texto es un mensaje aparte que acompaña a la oferta.
              </p>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              {editing ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </Modal>

      {cropSrc && <ImageCropper src={cropSrc} aspect={4 / 3} onSave={uploadImage} onCancel={closeCropper} />}
    </div>
  );
}