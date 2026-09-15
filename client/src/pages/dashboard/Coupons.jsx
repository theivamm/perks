import { useEffect, useState } from 'react';
import {
  BadgePercent,
  CheckCircle2,
  Gift,
  Loader2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import { api, formatDate } from '../../api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EmptyState, Modal, Spinner, toast } from '../../components/ui.jsx';
import { couponValue } from '../../components/CouponCards.jsx';

const EMPTY = { title: '', description: '', type: 'monto', value: '', target_points: '10', active: true };
const TYPE_LABELS = { monto: 'Monto', descuento: 'Descuento', regalo: 'Regalo' };

export default function Coupons() {
  const { settings } = useTheme();
  const currency = settings.currency || '$';

  const [tab, setTab] = useState('catalog');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [checking, setChecking] = useState(false);

  const load = async () => {
    try {
      const res = await api('/api/coupons/catalog/all');
      setList(res.coupons || []);
    } catch (e) {
      toast(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      title: c.title || '',
      description: c.description || '',
      type: c.type || 'monto',
      value: c.value ?? '',
      target_points: c.target_points ?? '',
      active: c.active,
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        type: form.type,
        value: Number(form.value) || 0,
        target_points: Number(form.target_points) || 1,
        active: form.active,
      };
      if (editing) {
        await api(`/api/coupons/catalog/${editing.id}`, { method: 'PUT', body });
        toast('Cupón actualizado');
      } else {
        await api('/api/coupons/catalog', { method: 'POST', body });
        toast('Cupón creado');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    try {
      await api(`/api/coupons/catalog/${c.id}`, { method: 'PUT', body: { active: !c.active } });
      toast(c.active ? 'Cupón pausado' : 'Cupón activado');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (c) => {
    if (!confirm(`¿Eliminar el cupón "${c.title}"?`)) return;
    try {
      await api(`/api/coupons/catalog/${c.id}`, { method: 'DELETE' });
      toast('Cupón eliminado');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  const validate = async (e) => {
    e?.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setResult(null);
    setErr('');
    try {
      const data = await api('/api/coupons/validate', { method: 'POST', body: { code } });
      setResult(data);
      toast('Cupón validado y marcado como canjeado');
    } catch (err2) {
      setErr(err2.message);
      toast(err2.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex w-fit gap-2 rounded-2xl bg-surface-alt p-1">
        <button
          className={`rounded-xl px-4 py-2 text-sm font-extrabold transition ${
            tab === 'catalog' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
          }`}
          onClick={() => setTab('catalog')}
        >
          Catálogo
        </button>
        <button
          className={`rounded-xl px-4 py-2 text-sm font-extrabold transition ${
            tab === 'validate' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
          }`}
          onClick={() => setTab('validate')}
        >
          Validar cupón
        </button>
      </div>

      {tab === 'catalog' ? (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-ink">Catálogo de cupones</h1>
              <p className="text-sm text-ink-muted">
                Definí los premios y cuántos puntos se necesitan para conseguirlos.
              </p>
            </div>
            <button className="btn-primary" onClick={openNew}>
              <Plus size={16} />
              Nuevo cupón
            </button>
          </div>

          {loading ? (
            <Spinner label="Cargando cupones..." />
          ) : list.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="Todavía no hay cupones"
              subtitle="Creá el primer premio del catálogo para que tus clientes puedan activarlo."
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {list.map((c) => (
                <li key={c.id} className={`card relative overflow-hidden p-5 ${!c.active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
                        <Gift size={22} />
                      </span>
                      <div>
                        <p className="text-xl font-black text-ink">{couponValue(c, currency)}</p>
                        <p className="text-sm font-bold text-ink">{c.title}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        c.active ? 'bg-green-500/15 text-green-600' : 'bg-surface-alt text-ink-muted'
                      }`}
                    >
                      {c.active ? 'Activo' : 'Pausado'}
                    </span>
                  </div>

                  {c.description && <p className="mt-2 text-sm text-ink-muted">{c.description}</p>}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge-outline">
                      <BadgePercent size={13} />
                      {Number(c.target_points)} puntos
                    </span>
                    <span className="badge-outline">{TYPE_LABELS[c.type] || c.type}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                    <button className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => openEdit(c)}>
                      <Pencil size={13} />
                      Editar
                    </button>
                    <button className="btn-ghost !px-3 !py-1.5 !text-xs" onClick={() => toggleActive(c)}>
                      <ShieldCheck size={13} />
                      {c.active ? 'Pausar' : 'Activar'}
                    </button>
                    <button
                      className="btn-ghost !px-3 !py-1.5 !text-xs text-red-500 hover:!bg-red-500/10"
                      onClick={() => remove(c)}
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar cupón' : 'Nuevo cupón'}>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="label">Nombre del cupón *</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Café de regalo"
                  required
                />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea
                  className="input min-h-20 resize-y"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detalle del premio para el cliente"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo de premio</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="monto">Monto ({currency})</option>
                    <option value="descuento">Descuento (%)</option>
                    <option value="regalo">Regalo</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    {form.type === 'descuento'
                      ? 'Porcentaje (%)'
                      : form.type === 'monto'
                        ? `Valor (${currency})`
                        : 'Valor (opcional)'}
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="any"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === 'regalo' ? '—' : '0'}
                  />
                </div>
              </div>
              <div>
                <label className="label">Puntos objetivo *</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={form.target_points}
                  onChange={(e) => setForm({ ...form, target_points: e.target.value })}
                  placeholder="Ej: 10"
                  required
                />
                <p className="mt-1 text-xs text-ink-muted">
                  Cuántos puntos debe sumar el cliente para completar este cupón.
                </p>
              </div>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
                <span className="text-sm font-bold text-ink">Visible para los clientes</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Gift size={16} />}
                  {editing ? 'Guardar cambios' : 'Crear cupón'}
                </button>
              </div>
            </form>
          </Modal>
        </>
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-ink">Validar cupón</h1>
            <p className="text-sm text-ink-muted">
              Cuando un cliente muestre el código en el local, comprobalo acá para canjearlo.
            </p>
          </div>

          <form
            onSubmit={validate}
            className="animate-fade-up flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:flex-nowrap"
          >
            <div className="min-w-0 flex-1">
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <Search size={13} />
                Código del cupón
              </label>
              <input
                className="input !py-3 !text-base !font-extrabold !uppercase tracking-widest"
                placeholder="CP-XXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
            <button className="btn-primary !self-end !py-3 !text-base" disabled={checking || !code.trim()}>
              {checking ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              Validar
            </button>
          </form>

          {err && (
            <div className="animate-pop mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-500/10 p-4">
              <XCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="font-extrabold text-ink">Cupón no válido</p>
                <p className="mt-0.5 text-sm text-ink-muted">{err}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="animate-pop mt-5 overflow-hidden rounded-3xl border border-line shadow-soft">
              <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 text-white">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={22} className="animate-pop" />
                  <p className="text-base font-extrabold">Cupón válido</p>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  marcado como canjeado
                </span>
              </div>

              <div className="grid gap-5 bg-surface p-5 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
                      <Gift size={22} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-ink">{couponValue(result, currency)}</p>
                      <p className="text-sm font-semibold text-ink-muted">
                        {result.title || result.description || 'Premio'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="badge-outline">
                      <BadgePercent size={13} />
                      Completado con {result.points} puntos
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-1 rounded-2xl bg-surface-alt p-4 text-center sm:min-w-44">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Código canjeado</p>
                  <p className="text-2xl font-black tracking-widest text-primary-strong">{result.code}</p>
                  <p className="text-xs text-ink-muted">{formatDate(result.redeemed_at)}</p>
                </div>
              </div>
            </div>
          )}

          {!result && !err && (
            <div className="animate-fade-up mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-surface/60 p-5">
              <Sparkles size={18} className="shrink-0 text-primary" />
              <p className="text-sm text-ink-muted">
                Probá pegando el código que te muestra el cliente en su perfil. Si ya fue usado, te va a avisar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}