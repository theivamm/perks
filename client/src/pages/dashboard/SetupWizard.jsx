import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgePercent,
  Check,
  Coffee,
  ImagePlus,
  LifeBuoy,
  Loader2,
  Palette,
  Rocket,
  SkipForward,
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
import '../../styles/wintuu-landing.css';
import WintuuLogo from '../../components/landing/WintuuLogo.jsx';

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
  const [openingTicket, setOpeningTicket] = useState(false);
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

  const requestLogoReview = async () => {
    setOpeningTicket(true);
    try {
      const { ticket } = await api('/api/support/tickets', {
        method: 'POST',
        body: {
          subject: 'Solicitud de revisión de logo e ícono',
          category: 'logo',
          body: 'Necesito ayuda de administración para preparar o revisar el logo horizontal de 400 × 120 px y el ícono de 400 × 400 px de mi app.',
        },
      });
      toast(`Ticket ${ticket.code} creado`);
      navigate(t('/dashboard/soporte'));
    } catch (err) {
      toast(err.message);
    } finally {
      setOpeningTicket(false);
    }
  };

  const { h, s, l } = hexToHsl(settings.primaryColor);
  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div className="wintuu-landing relative min-h-screen overflow-hidden">
      <div className="wt-bg-blob" style={{ width: 340, height: 340, background: '#bff3ea', top: '-8%', right: '-6%' }} />
      <div className="wt-bg-blob" style={{ width: 300, height: 300, background: '#ffd3ea', bottom: '-6%', left: '-6%' }} />

      <header className="relative mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-6">
        <div className="flex items-center gap-2.5">
          <WintuuLogo height={18} />
          <span className="text-[13px] font-semibold text-[var(--wt-muted)]">Primeros pasos</span>
        </div>
        <button
          onClick={() => finish()}
          disabled={saving}
          className="wt-nav-link inline-flex items-center gap-1.5 text-sm font-semibold"
        >
          <SkipForward size={15} />
          Saltar todo
        </button>
      </header>

      <div className="relative mx-auto max-w-3xl px-5">
        <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[var(--wt-muted)]">
          <span>Paso {step + 1} de {STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(20,36,37,0.08)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progress, 4)}%`, background: 'linear-gradient(90deg, var(--wt-mint), var(--wt-mint-light))' }}
          />
        </div>
      </div>

      <main className="relative mx-auto max-w-3xl px-5 py-8">
        {step === 0 && (
          <div className="wt-glass p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-[var(--wt-ink)]" style={{ background: 'linear-gradient(135deg, var(--wt-mint), var(--wt-mint-light))', boxShadow: '0 10px 26px rgba(0,207,205,0.32)' }}>
              <Rocket size={28} />
            </div>
            <h1 className="wt-h2 mt-5 text-[28px] text-[var(--wt-text)]">¡Bienvenido a tu app!</h1>
            <p className="wt-body mx-auto mt-2 max-w-md text-[15px]">
              En unos minutos vas a dejar todo listo para empezar a fidelizar clientes. Te
              acompañamos paso a paso: podés completar cada uno o saltearlo y hacerlo más tarde
              desde el panel.
            </p>
            <button className="wt-btn-mint mx-auto mt-6" onClick={next}>
              Empezar
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="wt-glass p-8">
            <StepHeader icon={Store} title="Tu negocio" subtitle="¿Cómo se llama y qué lo hace especial?" />
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--wt-muted)]">
                  Nombre del negocio
                </span>
                <input
                  className="w-full rounded-2xl border border-[var(--wt-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--wt-text)] outline-none placeholder:text-[var(--wt-muted)]/60 focus:border-[var(--wt-mint)] focus:ring-2 focus:ring-[var(--wt-mint)]/15"
                  value={biz.name}
                  onChange={(e) => setBiz((b) => ({ ...b, name: e.target.value }))}
                  maxLength={60}
                  placeholder="Por ej. Café Shanti"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--wt-muted)]">
                  Frase corta (opcional)
                </span>
                <input
                  className="w-full rounded-2xl border border-[var(--wt-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--wt-text)] outline-none placeholder:text-[var(--wt-muted)]/60 focus:border-[var(--wt-mint)] focus:ring-2 focus:ring-[var(--wt-mint)]/15"
                  value={biz.tagline}
                  onChange={(e) => setBiz((b) => ({ ...b, tagline: e.target.value }))}
                  maxLength={80}
                  placeholder="Por ej. Sumá visitas, ganá premios"
                />
              </label>
            </div>
            <StepFooter onSkip={next} onNext={saveBiz} nextLabel="Guardar y continuar" busy={saving} />
          </div>
        )}

        {step === 2 && (
          <div className="wt-glass p-8">
            <StepHeader icon={Palette} title="Tu marca" subtitle="Elegí el color que va a vestir toda tu app." />
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="relative h-16 w-16 overflow-hidden rounded-2xl border-4 border-white shadow-lg"
                style={{ background: `hsl(${h}, ${s}%, ${l}%)` }}
              >
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  title="Personalizar color"
                />
                <span className="flex h-full w-full items-center justify-center text-white">
                  <Palette size={22} />
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ primaryColor: c })}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      boxShadow: settings.primaryColor.toUpperCase() === c.toUpperCase() ? '0 0 0 2px #fff, 0 0 0 4px var(--wt-text)' : 'none',
                    }}
                    aria-label={`Usar color ${c}`}
                  >
                    {settings.primaryColor.toUpperCase() === c.toUpperCase() && <Check size={16} className="text-white" />}
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
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 p-4 font-bold transition-all"
                  style={{
                    borderColor: settings.theme === opt.value ? 'var(--wt-mint)' : 'var(--wt-border)',
                    background: settings.theme === opt.value ? 'rgba(0,207,205,0.07)' : 'transparent',
                    color: 'var(--wt-text)',
                  }}
                >
                  <opt.icon size={18} />
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--wt-border)] bg-[rgba(20,36,37,0.03)] p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--wt-muted)]">Vista previa de tu color</p>
              <div className="h-10 rounded-xl bg-gradient-to-r from-primary to-primary-strong" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button className="btn-primary !py-1.5 !text-xs">Botón principal</button>
                <span className="badge">Etiqueta</span>
                <span className="rounded-full bg-primary-softer px-3 py-1 text-xs font-bold text-primary-strong">Acento</span>
              </div>
            </div>

            <StepFooter onSkip={next} onNext={next} nextLabel="Continuar" />
          </div>
        )}

        {step === 3 && (
          <div className="wt-glass p-8">
            <StepHeader icon={ImagePlus} title="Tu logo" subtitle="Subí el logo horizontal y el ícono cuadrado de tu app." />
            <div className="mb-5 rounded-2xl border border-amber-300/50 bg-amber-50 p-4 text-sm text-[var(--wt-text)]">
              <p className="font-extrabold">Medidas obligatorias</p>
              <p className="mt-1 text-[var(--wt-muted)]">
                Logo horizontal: <strong className="text-[var(--wt-text)]">400 × 120 px</strong>. Ícono cuadrado: <strong className="text-[var(--wt-text)]">400 × 400 px</strong>.
                No se aceptan otras medidas; el editor recorta y guarda las imágenes exactamente en estos tamaños.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <div className="relative flex h-14 w-44 items-center justify-center overflow-hidden rounded-xl border border-[var(--wt-border)]" style={{ background: 'linear-gradient(135deg, rgba(0,207,205,0.14), rgba(201,187,255,0.14))' }}>
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <ImagePlus size={24} className="text-[var(--wt-mint-dark)]" />
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="animate-spin text-white" size={18} />
                  </div>
                )}
              </div>
              <input ref={logoInput} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e, 'logo')} />
              <button className="wt-btn-ghost" onClick={() => logoInput.current?.click()} disabled={uploading}>
                <ImagePlus size={15} />
                {settings.logo ? 'Cambiar logo' : 'Subir logo'}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-[var(--wt-border)] pt-5">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[var(--wt-border)]" style={{ background: 'linear-gradient(135deg, rgba(0,207,205,0.14), rgba(201,187,255,0.14))' }}>
                {settings.logoIso ? (
                  <img src={settings.logoIso} alt="Ícono" className="h-full w-full object-cover" />
                ) : (
                  <Coffee size={24} className="text-[var(--wt-mint-dark)]" />
                )}
              </div>
              <input ref={isoInput} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e, 'iso')} />
              <button className="wt-btn-ghost" onClick={() => isoInput.current?.click()} disabled={uploading}>
                <ImagePlus size={15} />
                {settings.logoIso ? 'Cambiar ícono' : 'Subir ícono'}
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--wt-border)] bg-[rgba(20,36,37,0.03)] p-4">
              <p className="text-sm font-extrabold text-[var(--wt-text)]">El ícono es muy necesario</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--wt-muted)]">
                Aunque podés continuar sin subirlo, se usa como favicon del navegador y mejora notablemente la experiencia visual de la página.
                Si todavía no tenés las piezas en estas medidas, administración puede ayudarte a prepararlas o revisarlas.
              </p>
              <button className="wt-btn-ghost mt-3" onClick={requestLogoReview} disabled={openingTicket}>
                {openingTicket ? <Loader2 className="animate-spin" size={15} /> : <LifeBuoy size={15} />}
                Abrir ticket con administración
              </button>
            </div>

            <StepFooter onSkip={next} onNext={next} nextLabel="Continuar" />
          </div>
        )}

        {step === 4 && (
          <div className="wt-glass p-8">
            <StepHeader icon={UtensilsCrossed} title="Tu menú y recompensas" subtitle="Cargá lo que tus clientes pueden consumir y qué premios ganan." />
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => finish(t('/dashboard/menu'))}
                className="wt-card-hover flex flex-col items-start gap-2 rounded-2xl border-2 border-[var(--wt-border)] p-5 text-left transition-all hover:border-[var(--wt-mint)]"
                style={{ background: 'rgba(255,255,255,0.5)' }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(0,207,205,0.14)] text-[var(--wt-mint-dark)]">
                  <UtensilsCrossed size={20} />
                </span>
                <span className="wt-heading font-semibold text-[var(--wt-text)]">Cargar productos</span>
                <span className="text-xs text-[var(--wt-muted)]">
                  Café, comidas o servicios con su precio. Es lo que acumula puntos por compra.
                </span>
              </button>
              <button
                onClick={() => finish(t('/dashboard/cupones'))}
                className="wt-card-hover flex flex-col items-start gap-2 rounded-2xl border-2 border-[var(--wt-border)] p-5 text-left transition-all hover:border-[var(--wt-mint)]"
                style={{ background: 'rgba(255,255,255,0.5)' }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(0,207,205,0.14)] text-[var(--wt-mint-dark)]">
                  <BadgePercent size={20} />
                </span>
                <span className="wt-heading font-semibold text-[var(--wt-text)]">Crear recompensas</span>
                <span className="text-xs text-[var(--wt-muted)]">
                  Cupones y premios canjeables por puntos. Es lo que hace que vuelvan.
                </span>
              </button>
            </div>
            <p className="mt-4 text-xs text-[var(--wt-muted)]">
              Al tocar una opción terminamos la configuración y te llevamos directo a esa sección.
            </p>

            <StepFooter onSkip={next} onNext={next} nextLabel="Lo hago después" />
          </div>
        )}

        {step === 5 && (
          <div className="wt-glass p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-[var(--wt-ink)]" style={{ background: 'linear-gradient(135deg, var(--wt-mint), var(--wt-mint-light))', boxShadow: '0 10px 26px rgba(0,207,205,0.32)' }}>
              <Check size={30} />
            </div>
            <h1 className="wt-h2 mt-5 text-[28px] text-[var(--wt-text)]">¡Tu app está lista!</h1>
            <p className="wt-body mx-auto mt-2 max-w-md text-[15px]">
              Ya podés compartir tu página con tus clientes, escanear sus QR y entregar
              recompensas. Todo lo que falte lo encontrás en el panel.
            </p>
            <button className="wt-btn-mint mx-auto mt-6" onClick={() => finish()} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Rocket size={16} />}
              Ir a mi panel
            </button>
          </div>
        )}

        {step > 0 && step < STEPS.length - 1 && (
          <div className="mt-4 text-center">
            <button onClick={back} className="text-sm font-semibold text-[var(--wt-muted)] transition hover:text-[var(--wt-text)]">
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
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(0,207,205,0.14)] text-[var(--wt-mint-dark)]">
        <Icon size={20} />
      </span>
      <h1 className="wt-heading mt-3 text-xl font-semibold text-[var(--wt-text)]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[var(--wt-muted)]">{subtitle}</p>}
    </div>
  );
}

function StepFooter({ onSkip, onNext, nextLabel, busy }) {
  return (
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
      <button onClick={onSkip} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--wt-muted)] transition hover:text-[var(--wt-text)]">
        <SkipForward size={15} />
        Omitir paso
      </button>
      <button className="wt-btn-mint" onClick={onNext} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" size={16} /> : null}
        {nextLabel}
        {!busy && <ArrowRight size={16} />}
      </button>
    </div>
  );
}
