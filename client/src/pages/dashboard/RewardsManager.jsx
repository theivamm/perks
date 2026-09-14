import { useEffect, useState } from 'react';
import { Gift, Loader2, Pencil, Plus, Power, Save, Trash2, X } from 'lucide-react';
import { api } from '../../api.js';
import { EmptyState, Spinner, toast } from '../../components/ui.jsx';

const EMPTY = { name: '', every_orders: 10, type: 'monto', value: '', mode: 'local', description: '', active: true };
const TYPE_LABEL = { monto: 'Monto ($)', descuento: 'Descuento (%)', regalo: 'Regalo' };
const MODE_LABEL = { web: 'Web', local: 'Local', ambos: 'Web + Local' };

export default function RewardsManager() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () =>
    api('/api/rewards')
      .then(setRules)
      .catch((e) => toast(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setCreating(true);
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
    setForm(EMPTY);
  };

  const startEdit = (r) => {
    setCreating(false);
    setEditing(r);
    setForm({ name: r.name, every_orders: r.every_orders, type: r.type, value: r.value, mode: r.mode, description: r.description, active: r.active });
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api(`/api/rewards/${editing.id}`, { method: 'PUT', body: form });
        toast('Premio actualizado');
      } else {
        await api('/api/rewards', { method: 'POST', body: form });
        toast('Premio creado');
      }
      setEditing(null);
      setCreating(false);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r) => {
    try {
      await api(`/api/rewards/${r.id}`, { method: 'PUT', body: { active: !r.active } });
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (r) => {
    if (!confirm(`¿Eliminar el premio "${r.name}"?`)) return;
    try {
      await api(`/api/rewards/${r.id}`, { method: 'DELETE' });
      toast('Premio eliminado');
      await load();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <section className="card p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
          <Gift size={20} className="text-primary-strong" />
          Cupones y premios
        </h2>
        <button className="btn-primary !py-1.5 !px-3 !text-xs" onClick={startNew}>
          <Plus size={14} />
          Nuevo premio
        </button>
      </div>
      <p className="mb-5 text-sm text-ink-muted">
        Cada regla define un premio que se entrega automáticamente cada N pedidos completados
        de un cliente.
      </p>

      {loading ? (
        <Spinner label="Cargando premios..." />
      ) : (
        <>
          {rules.length === 0 && !creating && !editing && (
            <EmptyState
              icon={Gift}
              title="Sin premios configurados"
              subtitle="Creá el primero, por ejemplo: «5 compras = 25% OFF». Así tus clientes empiezan a acumular pedidos."
            />
          )}

          {rules.length > 0 && (
            <div className="space-y-3">
              {rules.map((r) => (
                <div key={r.id} className={`rounded-2xl border p-4 ${r.active ? 'border-line bg-surface' : 'border-line bg-surface-alt opacity-70'}`}>
                  {editing?.id === r.id ? (
                    <RuleForm form={form} set={set} saving={saving} onSave={save} onCancel={cancel} editing />
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-extrabold text-ink">{r.name}</p>
                          <span className="badge">cada {r.every_orders} pedidos</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${r.active ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'bg-surface-alt text-ink-muted'}`}>
                            {r.active ? 'Activo' : 'Pausado'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-ink-muted">
                          {TYPE_LABEL[r.type]}: <strong className="text-ink">{r.type === 'descuento' ? `${Number(r.value) || 0}%` : `$${Number(r.value) || 0}`}</strong>
                          <span className="mx-1.5">·</span>
                          Canje: {MODE_LABEL[r.mode] || r.mode}
                          {r.description && <><span className="mx-1.5">·</span>{r.description}</>}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button className="btn-icon" onClick={() => toggleActive(r)} aria-label="Activar/Pausar" title={r.active ? 'Pausar' : 'Activar'}>
                          <Power size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => startEdit(r)} aria-label="Editar" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button className="btn-icon !text-red-500" onClick={() => remove(r)} aria-label="Eliminar" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {creating && <RuleForm form={form} set={set} saving={saving} onSave={save} onCancel={cancel} />}
        </>
      )}
    </section>
  );
}

function RuleForm({ form, set, saving, onSave, onCancel, editing }) {
  return (
    <form onSubmit={onSave} className={`${editing ? '' : 'mt-4 rounded-2xl border border-dashed border-line p-4'}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Nombre *</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="Ej: Voucher $30.000 de regalo" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Cada N pedidos</label>
            <input className="input" type="number" min="1" required value={form.every_orders} onChange={set('every_orders')} />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.type} onChange={set('type')}>
              <option value="monto">Monto ($)</option>
              <option value="descuento">Descuento (%)</option>
              <option value="regalo">Regalo</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">{form.type === 'descuento' ? 'Valor (%)' : 'Valor ($)'}</label>
          <input className="input" type="number" min="0" step="0.01" value={form.value} onChange={set('value')} placeholder="30000" />
        </div>
        <div>
          <label className="label">Cómo se canjea</label>
          <select className="input" value={form.mode} onChange={set('mode')}>
            <option value="web">En la web (descuento automático)</option>
            <option value="local">En el local (voucher con código)</option>
            <option value="ambos">Web y local</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Descripción</label>
          <input className="input" value={form.description} onChange={set('description')} placeholder="Ej: Boucher de regalo gratis para tu próxima visita" />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          <X size={15} />
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {editing ? 'Guardar cambios' : 'Crear premio'}
        </button>
      </div>
    </form>
  );
}