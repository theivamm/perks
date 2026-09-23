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
import { api } from '../../api.js';
import { money } from '../../lib/money.js';
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
      const okCat = filter === 'Todas' || (it.category || 'General') === filter;
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

  const cats = useMemo(() => {
    const counts = new Map();
    for (const it of data.items) counts.set(it.category || 'General', (counts.get(it.category || 'General') || 0) + 1);
    return [{ name: 'Todas', count: data.items.length }, ...[...counts.entries()].map(([name, count]) => ({ name, count }))];
  }, [data.items]);
  const hiddenCount = data.items.filter((it) => !it.available).length;
  const missingPhotos = data.items.filter((it) => !it.image).length;

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
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Menú</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {data.items.length} productos
            {hiddenCount > 0 && ` · ${hiddenCount} oculto${hiddenCount > 1 ? 's' : ''}`}
            {missingPhotos > 0 && ` · ${missingPhotos} sin foto`}
          </p>
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

      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside className="card hidden p-2.5 lg:sticky lg:top-24 lg:block">
          <p className="px-2.5 pb-2 pt-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink-muted">Categorías</p>
          <div className="space-y-0.5">
            {cats.map(({ name, count }) => (
              <button
                key={name}
                onClick={() => setFilter(name)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                  filter === name ? 'bg-surface-alt font-bold text-primary-strong' : 'font-medium text-ink hover:bg-surface-alt'
                }`}
              >
                <span className="truncate">{name === 'Todas' ? 'Todo el menú' : name}</span>
                <span className="text-[11px] font-bold text-ink-muted">{count}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-52 flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input className="input pl-10" placeholder="Buscar por nombre o categoría..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {missingPhotos > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-2xl border border-dashed border-primary/50 px-3.5 py-2.5 text-xs font-semibold text-primary-strong">
                <Sparkles size={14} />
                {missingPhotos} sin foto · tocá ✦ en cada producto para generarla con IA
              </span>
            )}
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
            {cats.map(({ name, count }) => (
              <button
                key={name}
                onClick={() => setFilter(name)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  filter === name ? 'border-primary bg-primary text-primary-contrast' : 'border-line bg-surface text-ink'
                }`}
              >
                {name === 'Todas' ? 'Todo' : name} · {count}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner label="Cargando menú..." />
          ) : items.length === 0 ? (
            <EmptyState icon={UtensilsCrossed} title="Sin productos" subtitle="Crea uno nuevo o importa un archivo Excel." />
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([category, list]) => (
                <section key={category || 'General'} className="card overflow-hidden">
                  <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-alt px-4 py-2.5">
                    <h2 className="font-sans text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-muted">{category || 'General'}</h2>
                    <span className="text-[11px] font-bold text-ink-muted">{list.length}</span>
                  </div>
                  <ul className="divide-y divide-line">
                    {list.map((item) => {
                      const disc = Number(item.discount) > 0;
                      const final = disc ? (Number(item.price) * (100 - Number(item.discount))) / 100 : item.price;
                      const busy = generatingId === item.id;
                      return (
                        <li
                          key={item.id}
                          className={`grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 px-4 py-3 md:grid-cols-[auto_minmax(0,1fr)_110px_130px_auto] md:gap-x-4 ${
                            item.featured ? 'bg-amber-50/60 dark:bg-amber-400/5' : ''
                          }`}
                        >
                          <div className={`relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-xl ${!item.available ? 'opacity-50' : ''}`}>
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <button
                                type="button"
                                onClick={() => generateImage(item)}
                                disabled={!!generatingId}
                                title="Generar imagen con IA"
                                className="flex h-full w-full flex-col items-center justify-center rounded-xl border-[1.5px] border-dashed border-primary/60 text-[10px] font-bold text-primary-strong transition hover:bg-primary-softer disabled:opacity-60"
                              >
                                <Sparkles size={14} />
                                IA
                              </button>
                            )}
                            {busy && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55">
                                <Loader2 className="animate-spin text-white" size={16} />
                                <span className="text-[10px] font-black text-white">{Math.round(progress[item.id] || 0)}%</span>
                              </div>
                            )}
                          </div>

                          <div className={`min-w-0 ${!item.available ? 'opacity-50' : ''}`}>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-sans text-sm font-semibold text-ink">{item.title}</h3>
                              {item.featured && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-black text-white">
                                  <Star size={10} className="fill-white" />
                                  {disc ? `OFERTA · −${Number(item.discount)}%` : item.featured_label || 'Oferta'}
                                </span>
                              )}
                            </div>
                            {item.description && <p className="truncate text-xs text-ink-muted">{item.description}</p>}
                          </div>

                          <div className="col-span-2 flex items-center justify-between gap-3 md:contents">
                            <div className={`flex items-baseline gap-2 md:justify-end ${!item.available ? 'opacity-50' : ''}`}>
                              {disc && <span className="text-xs text-ink-muted line-through">{money(item.price, settings.currency)}</span>}
                              <span className="font-heading text-base font-bold text-primary-strong">{money(final, settings.currency)}</span>
                            </div>

                            <button
                              onClick={(e) => toggleAvailable(item, e)}
                              className="flex items-center gap-2"
                              role="switch"
                              aria-checked={Boolean(item.available)}
                              title="Cambiar disponibilidad"
                            >
                              <span className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${item.available ? 'bg-primary' : 'bg-line'}`}>
                                <span className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${item.available ? 'left-[18px]' : 'left-[2px]'}`} />
                              </span>
                              <span className="hidden text-xs font-semibold text-ink sm:inline">{item.available ? 'Visible' : 'Oculto'}</span>
                            </button>

                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                className={`btn-icon !h-8 !w-8 border ${item.featured ? 'border-amber-400/60 text-amber-500' : 'border-line'}`}
                                onClick={(e) => toggleFeatured(item, e)}
                                title={item.featured ? 'Quitar de ofertas' : 'Marcar como oferta especial'}
                                aria-label={item.featured ? 'Quitar de ofertas' : 'Marcar como oferta especial'}
                              >
                                <Star size={14} className={item.featured ? 'fill-amber-400' : ''} />
                              </button>
                              {item.image && (
                                <button
                                  className="btn-icon !h-8 !w-8 border border-line"
                                  onClick={() => generateImage(item)}
                                  disabled={!!generatingId}
                                  title="Regenerar imagen con IA"
                                  aria-label="Regenerar imagen con IA"
                                >
                                  {busy ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                </button>
                              )}
                              <button className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => openEdit(item)}>
                                <Pencil size={13} />
                                Editar
                              </button>
                              <button
                                className="btn-icon !h-8 !w-8 border border-red-200 text-red-500 hover:!bg-red-500/10 dark:border-red-400/30"
                                onClick={() => remove(item)}
                                aria-label={`Eliminar ${item.title}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

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
                      {money(Number(form.price), settings.currency)} →{' '}
                      {money((Number(form.price) * (100 - Number(form.discount))) / 100, settings.currency)}
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