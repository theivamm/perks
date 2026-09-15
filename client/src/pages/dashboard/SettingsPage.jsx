import { useRef, useState } from 'react';
import { Check, ImagePlus, Loader2, Moon, Palette, Save, Sun, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { api } from '../../api.js';
import { PRESET_COLORS, hexToHsl } from '../../color.js';
import { toast } from '../../components/ui.jsx';

const CURRENCIES = ['$', '€', 'Bs', 'S/', 'Q', 'L', 'C$'];

export default function SettingsPage() {
  const { settings, updateSettings } = useTheme();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoInput = useRef(null);

  const setColor = async (color) => {
    setSaving(true);
    await updateSettings({ primaryColor: color });
    toast('Color de marca aplicado');
    setSaving(false);
  };

  const setTheme = async (theme) => {
    setSaving(true);
    await updateSettings({ theme });
    setSaving(false);
  };

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await api('/api/settings/upload-logo', { method: 'POST', body: fd });
      await updateSettings({ logo: res.url });
      toast('Logo actualizado');
    } catch (err) {
      toast(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    await updateSettings({ logo: '' });
    toast('Logo eliminado');
  };

  const { h, s, l } = hexToHsl(settings.primaryColor);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Configuración</h1>
          <p className="text-sm text-ink-muted">Personaliza el aspecto de toda la aplicación.</p>
        </div>
        {saving && (
          <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <Loader2 className="animate-spin" size={16} /> Guardando...
          </span>
        )}
      </div>

      <div className="space-y-6">
        <section className="card p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-ink">
            <ImagePlus size={20} className="text-primary-strong" />
            Logo de la plataforma
          </h2>
          <p className="mb-5 text-sm text-ink-muted">
            Se muestra en la barra de navegación de toda la web.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-sm">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo actual" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus size={24} className="opacity-80" />
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="animate-spin text-white" size={18} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
              <button className="btn-ghost" onClick={() => logoInput.current?.click()} disabled={uploading}>
                <ImagePlus size={15} />
                Subir logo
              </button>
              {settings.logo && (
                <button className="btn-ghost text-red-500 hover:bg-red-500/10" onClick={removeLogo}>
                  <Trash2 size={15} />
                  Quitar logo
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-ink">
            <Palette size={20} className="text-primary-strong" />
            Color de marca
          </h2>
          <p className="mb-5 text-sm text-ink-muted">
            Elige un solo color y toda la web se viste con su paleta: fondos, botones,
            textos destacados y más.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-4 border-surface shadow-lg" style={{ background: `hsl(${h}, ${s}%, ${l}%)` }}>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                title="Personalizar color"
              />
              <span className="flex h-full w-full items-center justify-center text-primary-contrast">
                <Palette size={22} />
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <input
                type="text"
                className="input !w-36 font-mono"
                value={settings.primaryColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v);
                }}
              />
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                      settings.primaryColor.toUpperCase() === c.toUpperCase()
                        ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface'
                        : ''
                    }`}
                    style={{ background: c }}
                    aria-label={`Usar color ${c}`}
                  >
                    {settings.primaryColor.toUpperCase() === c.toUpperCase() && (
                      <Check size={16} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-surface-alt p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
              Vista previa en vivo
            </p>
            <div className="space-y-3">
              <div className="h-10 rounded-xl bg-gradient-to-r from-primary to-primary-strong" />
              <div className="flex flex-wrap items-center gap-2">
                <button className="btn-primary !py-1.5 !text-xs">Botón principal</button>
                <button className="btn-ghost !py-1.5 !text-xs">Botón secundario</button>
                <span className="badge">Etiqueta</span>
                <span className="rounded-full bg-primary-softer px-3 py-1 text-xs font-bold text-primary-strong">
                  Texto en tono suave
                </span>
              </div>
              <p className="text-sm text-ink">
                Texto con color de tinta y un <span className="font-bold text-primary-strong">acento del color de marca</span>.
              </p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
            {settings.theme === 'dark' ? <Moon size={20} className="text-primary-strong" /> : <Sun size={20} className="text-primary-strong" />}
            Tema
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'light', label: 'Claro', icon: Sun, bg: 'bg-surface-page text-ink' },
              { value: 'dark', label: 'Oscuro', icon: Moon, bg: 'bg-ink text-surface-page' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`relative flex items-center justify-center gap-2 rounded-2xl border-2 p-4 font-bold transition-all ${
                  settings.theme === t.value
                    ? 'border-primary shadow-glow'
                    : 'border-line hover:border-primary/40'
                }`}
              >
                <t.icon size={18} />
                {t.label}
                {settings.theme === t.value && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-contrast">
                    <Check size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
            Moneda
          </h2>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  updateSettings({ currency: c });
                  toast(`Moneda: ${c}`);
                }}
                className={`rounded-xl border-2 px-5 py-2.5 text-base font-bold transition-all ${
                  settings.currency === c
                    ? 'border-primary bg-primary text-primary-contrast'
                    : 'border-line bg-surface text-ink hover:border-primary/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            Se usa para mostrar los precios en el menú público y en el dashboard.
          </p>
        </section>

        <div className="flex justify-end">
          <button
            className="btn-primary"
            onClick={() => {
              updateSettings(settings);
              toast('Configuración guardada');
            }}
          >
            <Save size={16} />
            Guardar configuración
          </button>
        </div>
      </div>
    </div>
  );
}