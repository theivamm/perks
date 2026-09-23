import { useEffect, useState } from 'react';
import {
  BadgePercent,
  CheckCircle2,
  Coins,
  Percent,
  Eye,
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
import { EmptyState, Field, Modal, Spinner, Stepper, SwitchRow, confirmDialog, toast } from '../../components/ui.jsx';
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
    if (!(await confirmDialog({ title: `¿Eliminar "${c.title}"?`, message: 'Los clientes que lo tengan activo conservan su progreso, pero nadie más podrá activarlo.', confirmLabel: 'Eliminar cupón' }))) return;
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Cupones</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {tab === 'catalog'
              ? 'Definí los premios y cuántos puntos se necesitan para conseguirlos.'
              : 'Cuando un cliente muestre el código en el local, comprobalo acá para canjearlo.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
      <div className="flex w-fit gap-1 rounded-2xl bg-surface-alt p-1">
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
          {tab === 'catalog' && (
            <button className="btn-primary" onClick={openNew}>
              <Plus size={16} />
              Nuevo cupón
            </button>
          )}
        </div>
      </div>

      {tab === 'catalog' ? (
        <>
          {loading ? (
            <Spinner label="Cargando cupones..." />
          ) : list.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="Todavía no hay cupones"
              subtitle="Creá el primer premio del catálogo para que tus clientes puedan activarlo."
            />
          ) : (
            <ul className="space-y-3">
              {list.map((c) => (
                <li
                  key={c.id}
                  className={`flex flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-opacity sm:flex-row ${!c.active ? 'opacity-55' : ''}`}
                >
                  <div className="relative flex shrink-0 items-center justify-between gap-3 bg-gradient-to-br from-primary to-primary-strong p-5 text-primary-contrast sm:w-44 sm:flex-col sm:items-start">
                    <p className="font-heading text-3xl font-bold leading-none">{couponValue(c, currency)}</p>
                    <p className="inline-flex items-center gap-1 text-xs font-extrabold opacity-90">
                      <BadgePercent size={13} />
                      {Number(c.target_points)} puntos
                    </p>
                    <span className="absolute -right-2.5 -top-2.5 hidden h-5 w-5 rounded-full bg-surface-page sm:block" />
                    <span className="absolute -bottom-2.5 -right-2.5 hidden h-5 w-5 rounded-full bg-surface-page sm:block" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-bold text-ink">{c.title}</h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            c.type === 'regalo'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300'
                              : c.type === 'descuento'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                          }`}
                        >
                          {TYPE_LABELS[c.type] || c.type}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            c.active ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-surface-alt text-ink-muted'
                          }`}
                        >
                          {c.active ? 'Activo' : 'Pausado'}
                        </span>
                      </div>
                      {c.description && <p className="mt-1 text-sm text-ink-muted">{c.description}</p>}
                    </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
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
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            icon={Gift}
            title={editing ? 'Editar cupón' : 'Nuevo cupón'}
            subtitle="Definí el premio y cuántos puntos hacen falta."
            footer={
              <>
                <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" form="coupon-form" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Gift size={16} />}
                  {editing ? 'Guardar cambios' : 'Crear cupón'}
                </button>
              </>
            }
          >
            <form id="coupon-form" onSubmit={save} className="space-y-5">
              <Field label="Tipo de premio">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['monto', `Monto ${currency}`, 'Descuenta un valor fijo', Coins, 'text-amber-700 dark:text-amber-300', 'bg-amber-100 dark:bg-amber-500/15'],
                    ['descuento', 'Descuento %', 'Un porcentaje de la compra', Percent, 'text-sky-700 dark:text-sky-300', 'bg-sky-100 dark:bg-sky-500/15'],
                    ['regalo', 'Regalo', 'Un producto gratis', Gift, 'text-rose-700 dark:text-rose-300', 'bg-rose-100 dark:bg-rose-500/15'],
                  ].map(([v, label, hint, Icon, fg, bg]) => {
                    const on = form.type === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setForm({ ...form, type: v })}
                        aria-pressed={on}
                        className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-3 text-left transition ${
                          on ? 'border-primary bg-primary-softer' : 'border-line bg-surface hover:border-primary/40'
                        }`}
                      >
                        <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg} ${fg}`}>
                          <Icon size={16} />
                        </span>
                        <span className="text-sm font-bold text-ink">{label}</span>
                        <span className="hidden text-[11px] leading-snug text-ink-muted sm:block">{hint}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Nombre del cupón" htmlFor="c-title" required>
                <input
                  id="c-title"
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={form.type === 'regalo' ? 'Ej: Café de regalo' : form.type === 'descuento' ? 'Ej: 25% OFF' : 'Ej: $5.000 de descuento'}
                  required
                />
              </Field>

              <Field label="Descripción" htmlFor="c-desc" hint="Lo ve el cliente: explicá qué gana y cuándo suma un punto.">
                <textarea
                  id="c-desc"
                  className="input min-h-20 resize-y"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ej: Con cada compra mayor a $35.000 sumás un punto."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={form.type === 'descuento' ? 'Porcentaje' : form.type === 'monto' ? 'Valor' : 'Valor (opcional)'}
                  htmlFor="c-value"
                >
                  <div className="relative">
                    {form.type !== 'descuento' && (
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-muted">{currency}</span>
                    )}
                    <input
                      id="c-value"
                      className={`input ${form.type === 'descuento' ? '!pr-9' : '!pl-9'}`}
                      type="number"
                      min="0"
                      max={form.type === 'descuento' ? 100 : undefined}
                      step="any"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                      placeholder={form.type === 'regalo' ? '—' : '0'}
                    />
                    {form.type === 'descuento' && (
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-muted">%</span>
                    )}
                  </div>
                </Field>
                <Field label="Puntos para completarlo" htmlFor="c-points" required>
                  <Stepper id="c-points" value={form.target_points} onChange={(v) => setForm({ ...form, target_points: v })} min={1} max={100} suffix="pts" />
                </Field>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-line bg-surface-alt/60 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-muted">Así lo ve el cliente</p>
                  <p className="mt-1 truncate font-heading text-2xl font-bold text-ink">
                    {couponValue({ ...form, value: Number(form.value) || 0 }, currency) || form.title || '—'}
                  </p>
                  <p className="truncate text-xs text-ink-muted">{form.description || 'Agregá una descripción'}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {Array.from({ length: Math.min(Number(form.target_points) || 1, 8) }, (_, i) => (
                    <span key={i} className={`h-3 w-3 rounded-full ${i === 0 ? 'bg-primary' : 'border-2 border-primary/30'}`} />
                  ))}
                  {Number(form.target_points) > 8 && <span className="ml-0.5 text-[11px] font-bold text-ink-muted">+{Number(form.target_points) - 8}</span>}
                </div>
              </div>

              <SwitchRow
                checked={form.active}
                onChange={(v) => setForm({ ...form, active: v })}
                icon={Eye}
                title="Visible para los clientes"
                subtitle="Si lo apagás, queda pausado y nadie puede activarlo."
              />
            </form>
          </Modal>
        </>
      ) : (
        <div className="max-w-3xl">
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