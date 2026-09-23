import { useState } from 'react';
import { Briefcase, Cake, Coffee, Dumbbell, Loader2, PawPrint, Scissors, Shirt, Sparkles, Store, Tag, UtensilsCrossed, Wrench } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { BUSINESS_TYPES, DEFAULT_TYPE, KINDS, getBusinessType, getVocab } from '../lib/businessTypes.js';
import { toast } from './ui.jsx';

export const TYPE_ICONS = {
  coffee: Coffee, utensils: UtensilsCrossed, cake: Cake, scissors: Scissors, sparkles: Sparkles,
  shirt: Shirt, store: Store, dumbbell: Dumbbell, wrench: Wrench, paw: PawPrint,
};

/**
 * Grilla de tipos de negocio (controlada). Se usa en Configuración y en Primeros pasos.
 * tone: 'app' (tokens del panel) | 'landing' (variables --wt-* del asistente)
 */
export function BusinessTypePicker({ value, onChange, tone = 'app' }) {
  const landing = tone === 'landing';
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {BUSINESS_TYPES.map((t) => {
        const Icon = TYPE_ICONS[t.icon] || Store;
        const on = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={on}
            className={`flex items-center gap-2.5 rounded-2xl border-[1.5px] px-3 py-2.5 text-left text-[13px] font-bold transition ${
              landing
                ? on
                  ? 'border-[var(--wt-mint)] bg-[#e6faf6] text-[var(--wt-ink)]'
                  : 'border-[var(--wt-border)] bg-[var(--wt-surface)] text-[var(--wt-text)] hover:border-[var(--wt-ink)]'
                : on
                  ? 'border-primary bg-primary-softer text-primary-strong'
                  : 'border-line bg-surface text-ink hover:border-ink-muted'
            }`}
          >
            <Icon size={17} className="shrink-0" />
            <span className="leading-tight">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Sección completa para Configuración → Negocio.
export default function BusinessTypeSettings() {
  const { settings, updateSettings } = useTheme();
  const [form, setForm] = useState(() => ({
    businessType: settings.businessType || DEFAULT_TYPE,
    businessTypeOther: settings.businessTypeOther || '',
    catalogKind: settings.catalogKind || '',
    catalogLabel: settings.catalogLabel || '',
    itemLabel: settings.itemLabel || '',
    itemLabelPlural: settings.itemLabelPlural || '',
  }));
  const [saving, setSaving] = useState(false);
  const preset = getBusinessType(form.businessType);
  const preview = getVocab(form);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      toast('Tipo de negocio guardado');
    } catch (e) {
      toast(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card p-6">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-ink">
        <Briefcase size={20} className="text-primary-strong" />
        Tipo de negocio
      </h2>
      <p className="mb-4 text-sm text-ink-muted">Cambia cómo se llama tu catálogo, los ejemplos al cargar y los campos disponibles.</p>

      <BusinessTypePicker value={form.businessType} onChange={(id) => setForm((f) => ({ ...f, businessType: id }))} />

      {form.businessType === 'otro' && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-ink">¿Qué tipo de negocio es?</span>
            <input className="input" value={form.businessTypeOther} onChange={set('businessTypeOther')} placeholder="Ej: Florería" maxLength={40} />
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-bold text-ink">¿Qué ofrecés?</span>
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface-alt p-1">
              {Object.entries(KINDS).map(([id, label]) => {
                const on = (form.catalogKind || preset.kind) === id;
                return (
                  <button key={id} type="button" onClick={() => setForm((f) => ({ ...f, catalogKind: id }))} className={`rounded-xl py-2 text-xs font-bold transition ${on ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted'}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-line pt-5">
        <p className="mb-1 flex items-center gap-2 text-sm font-extrabold text-ink"><Tag size={15} /> Nombres personalizados</p>
        <p className="mb-3 text-xs text-ink-muted">Opcional. Si los dejás vacíos usamos los del tipo de negocio.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">Nombre de la sección</span>
            <input className="input" value={form.catalogLabel} onChange={set('catalogLabel')} placeholder={preset.section} maxLength={30} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">Cada ítem (singular)</span>
            <input className="input" value={form.itemLabel} onChange={set('itemLabel')} placeholder={preset.item} maxLength={24} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink">Plural</span>
            <input className="input" value={form.itemLabelPlural} onChange={set('itemLabelPlural')} placeholder={form.itemLabel ? `${form.itemLabel}s` : preset.items} maxLength={28} />
          </label>
        </div>
        <p className="mt-3 rounded-2xl bg-surface-alt px-4 py-3 text-[13px] text-ink-muted">
          Así se verá: <strong className="text-ink">{preview.section}</strong> · botón <strong className="text-ink">“{preview.newItem}”</strong> · “12 {preview.items}”
          {preview.isService && ' · con duración, profesional y reserva por WhatsApp'}
        </p>
      </div>

      <div className="mt-5 flex justify-end">
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving && <Loader2 className="animate-spin" size={16} />} Guardar
        </button>
      </div>
    </section>
  );
}
