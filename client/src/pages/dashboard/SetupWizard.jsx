import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgePercent,
  Check,
  Coffee,
  ImagePlus,
  Loader2,
  Palette,
  Rocket,
  SkipForward,
  Sparkles,
  Store,
  Sun,
  Moon,
  UtensilsCrossed,
} from 'lucide-react';
import { api } from '../../api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import { PRESET_COLORS, hexToHsl } from '../../color.js';
import { toast } from '../../components/ui.jsx';
import ImageCropper from '../../components/ImageCropper.jsx';

const STEPS = ['Bienvenida', 'Tu negocio', 'Tu marca', 'Tu logo', 'Tu menú', 'Listo'];

export default function SetupWizard() {
  const { settings, updateSettings } = useTheme();
  const { t } = useTenant();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [biz, setBiz] = useState({
    name: settings.businessName === 'Mi negocio' ? '' : settings.businessName || '',
    tagline: settings.tagline || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [crop, setCrop] = useState(null);
  const logoInput = useRef(null);
  const isoInput = useRef(null);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async (to) => {
    setSaving(true);
    try {
      await updateSettings({ setupCompleted: 'true' });
    } finally {
      setSaving(false);
    }
    toast('¡Todo listo!');
    navigate(to || t('/dashboard'));
  };

  const saveBiz = async () => {
    setSaving(true);
    try {
      await updateSettings({
        businessName: biz.name.trim() || 'Mi negocio',
        tagline: biz.tagline.trim(),
      });
      next();
    } finally {
      setSaving(false);
    }
  };

  const pickImage = (e, kind) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setCrop({ src: URL.createObjectURL(file), kind });
  };

  const saveCropped = async (file) => {
    if (!crop) return;
    const { kind, src } = crop;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append(kind, file);
      const res = await api(`/api/settings/upload-${kind}`, { method: 'POST', body: fd });
      await updateSettings(kind === 'iso' ? { logoIso: res.url } : { logo: res.url });
      toast(kind === 'iso' ? 'Ícono actualizado' : 'Logo actualizado');
    } catch (err) {
      toast(err.message);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(src);
      setCrop(null);
    }
  };

  const { h, s, l } = hexToHsl(settings.primaryColor);
  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div className="page-aurora min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-5">
        <span className="inline-flex items-center gap-2 text-sm font-black text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast">
            <Sparkles size={16} />
          </span>
          Primeros pasos
        </span>
        <button
          onClick={() => finish()}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-ink"
        >
          <SkipForward size={15} />
          Saltar todo
        </button>
      </header>

      <div className="mx-auto max-w-3xl px-5">
        <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-ink-muted">
          <span>
            Paso {step + 1} de {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-alt">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-strong transition-all duration-500"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-5 py-8">
        {step === 0 && (
          <div className="card p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
              <Rocket size={28} />
            </div>
            <h1 className="mt-5 text-2xl font-black text-ink">¡Bienvenido a tu app!</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              En unos minutos vas a dejar todo listo para empezar a fidelizar clientes. Te
              acompañamos paso a paso: podés completar cada uno o saltearlo y hacerlo más tarde
              desde el panel.
            </p>
            <button className="btn-primary mx-auto mt-6" onClick={next}>
              Empezar
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="card p-8">
            <StepHeader icon={Store} title="Tu negocio" subtitle="¿Cómo se llama y qué lo hace especial?" />
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                  Nombre del negocio
                </span>
                <input
                  className="input w-full"
                  value={biz.name}
                  onChange={(e) => setBiz((b) => ({ ...b, name: e.target.value }))}
                  maxLength={60}
                  placeholder="Por ej. Café Shanti"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                  Frase corta (opcional)
                </span>
                <input
                  className="input w-full"
                  value={biz.tagline}
                  onChange={(e) => setBiz((b) => ({ ...b, tagline: e.target.value }))}
                  maxLength={80}
                  placeholder="Por ej. Sumá visitas, ganá premios"
                />
              </label>
            </div>
            <StepFooter
              onSkip={next}
              onNext={saveBiz}
              nextLabel="Guardar y continuar"
              busy={saving}
            />
          </div>
        )}

        {step === 2 && (
          <div className="card p-8">
            <StepHeader icon={Palette} title="Tu marca" subtitle="Elegí el color que va a vestir toda tu app." />
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="relative h-16 w-16 overflow-hidden rounded-2xl border-4 border-surface shadow-lg"
                style={{ background: `hsl(${h}, ${s}%, ${l}%)` }}
              >
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  title="Personalizar color"
                />
                <span className="flex h-full w-full items-center justify-center text-primary-contrast">
                  <Palette size={22} />
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ primaryColor: c })}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 ${
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

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { value: 'light', label: 'Claro', icon: Sun },
                { value: 'dark', label: 'Oscuro', icon: Moon },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ theme: opt.value })}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 p-4 font-bold transition-all ${
                    settings.theme === opt.value ? 'border-primary shadow-glow' : 'border-line hover:border-primary/40'
                  }`}
                >
                  <opt.icon size={18} />
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-surface-alt p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Vista previa</p>
              <div className="h-10 rounded-xl bg-gradient-to-r from-primary to-primary-strong" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button className="btn-primary !py-1.5 !text-xs">Botón principal</button>
                <span className="badge">Etiqueta</span>
                <span className="rounded-full bg-primary-softer px-3 py-1 text-xs font-bold text-primary-strong">
                  Acento
                </span>
              </div>
            </div>

            <StepFooter onSkip={next} onNext={next} nextLabel="Continuar" />
          </div>
        )}

        {step === 3 && (
          <div className="card p-8">
            <StepHeader
              icon={ImagePlus}
              title="Tu logo"
              subtitle="Subí tu logo horizontal y, si querés, un ícono cuadrado."
            />
            <div className="flex flex-wrap items-center gap-5">
              <div className="relative flex h-14 w-44 items-center justify-center overflow-hidden rounded-xl border border-line bg-gradient-to-br from-primary to-primary-strong text-primary-contrast">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <ImagePlus size={24} className="opacity-80" />
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="animate-spin text-white" size={18} />
                  </div>
                )}
              </div>
              <input
                ref={logoInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e, 'logo')}
              />
              <button className="btn-ghost" onClick={() => logoInput.current?.click()} disabled={uploading}>
                <ImagePlus size={15} />
                {settings.logo ? 'Cambiar logo' : 'Subir logo'}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-line pt-5">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-primary to-primary-strong text-primary-contrast">
                {settings.logoIso ? (
                  <img src={settings.logoIso} alt="Ícono" className="h-full w-full object-cover" />
                ) : (
                  <Coffee size={24} className="opacity-80" />
                )}
              </div>
              <input
                ref={isoInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e, 'iso')}
              />
              <button className="btn-ghost" onClick={() => isoInput.current?.click()} disabled={uploading}>
                <ImagePlus size={15} />
                {settings.logoIso ? 'Cambiar ícono' : 'Subir ícono (opcional)'}
              </button>
            </div>

            <StepFooter onSkip={next} onNext={next} nextLabel="Continuar" />
          </div>
        )}

        {step === 4 && (
          <div className="card p-8">
            <StepHeader
              icon={UtensilsCrossed}
              title="Tu menú y recompensas"
              subtitle="Cargá lo que tus clientes pueden consumir y qué premios ganan."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => finish(t('/dashboard/menu'))}
                className="flex flex-col items-start gap-2 rounded-2xl border-2 border-line p-5 text-left transition-all hover:border-primary hover:bg-primary-softer/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-softer text-primary-strong">
                  <UtensilsCrossed size={20} />
                </span>
                <span className="font-extrabold text-ink">Cargar productos</span>
                <span className="text-xs text-ink-muted">
                  Café, comidas o servicios con su precio. Es lo que acumula puntos por compra.
                </span>
              </button>
              <button
                onClick={() => finish(t('/dashboard/cupones'))}
                className="flex flex-col items-start gap-2 rounded-2xl border-2 border-line p-5 text-left transition-all hover:border-primary hover:bg-primary-softer/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-softer text-primary-strong">
                  <BadgePercent size={20} />
                </span>
                <span className="font-extrabold text-ink">Crear recompensas</span>
                <span className="text-xs text-ink-muted">
                  Cupones y premios canjeables por puntos. Es lo que hace que vuelvan.
                </span>
              </button>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              Al tocar una opción terminamos la configuración y te llevamos directo a esa sección.
            </p>

            <StepFooter onSkip={next} onNext={next} nextLabel="Lo hago después" />
          </div>
        )}

        {step === 5 && (
          <div className="card p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
              <Check size={30} />
            </div>
            <h1 className="mt-5 text-2xl font-black text-ink">¡Tu app está lista!</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              Ya podés compartir tu página con tus clientes, escanear sus QR y entregar
              recompensas. Todo lo que falte lo encontrás en el panel.
            </p>
            <button className="btn-primary mx-auto mt-6" onClick={() => finish()} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />}
              Ir a mi panel
            </button>
          </div>
        )}

        {step > 0 && step < STEPS.length - 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={back}
              className="text-sm font-semibold text-ink-muted transition hover:text-ink"
            >
              Volver
            </button>
          </div>
        )}
      </main>

      {crop && (
        <ImageCropper
          src={crop.src}
          aspect={crop.kind === 'iso' ? 1 : 400 / 120}
          outputSize={crop.kind === 'iso' ? { width: 400, height: 400 } : { width: 400, height: 120 }}
          outputFormat="png"
          cropShape="rect"
          onSave={saveCropped}
          onCancel={() => {
            URL.revokeObjectURL(crop.src);
            setCrop(null);
          }}
        />
      )}
    </div>
  );
}

function StepHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-softer text-primary-strong">
        <Icon size={20} />
      </span>
      <h1 className="mt-3 text-xl font-black text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
    </div>
  );
}

function StepFooter({ onSkip, onNext, nextLabel, busy }) {
  return (
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={onSkip}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-ink"
      >
        <SkipForward size={15} />
        Omitir paso
      </button>
      <button className="btn-primary" onClick={onNext} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" size={16} /> : null}
        {nextLabel}
        {!busy && <ArrowRight size={16} />}
      </button>
    </div>
  );
}
