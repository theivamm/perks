import { useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, KeyRound, Loader2, Moon, Palette, Save, ShieldCheck, Smartphone, Sun, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { api } from '../../api.js';
import { PRESET_COLORS, hexToHsl } from '../../color.js';
import { toast } from '../../components/ui.jsx';
import QRCode from 'qrcode';

const CURRENCIES = ['$', '€', 'Bs', 'S/', 'Q', 'L', 'C$'];

export default function SettingsPage() {
  const { settings, updateSettings } = useTheme();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoInput = useRef(null);

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [otp, setOtp] = useState({ enabled: null, qr: '', secret: '', code: '' });
  const [otpBusy, setOtpBusy] = useState(false);

  const loadOtpStatus = async () => {
    try {
      const res = await api('/api/auth/admin/otp/status');
      setOtp((o) => ({ ...o, enabled: res.enabled }));
    } catch {
      /* el estado queda null y no se muestra la sección cargada */
    }
  };

  useEffect(() => {
    loadOtpStatus();
  }, []);

  const changePassword = async () => {
    if (pwd.next.length < 6) return toast('La contraseña debe tener al menos 6 caracteres');
    if (pwd.next !== pwd.confirm) return toast('Las contraseñas nuevas no coinciden');
    setSavingPwd(true);
    try {
      await api('/api/auth/admin/password', {
        method: 'POST',
        body: { current_password: pwd.current, password: pwd.next },
      });
      toast('Contraseña actualizada');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast(err.message);
    } finally {
      setSavingPwd(false);
    }
  };

  const provisionOtp = async () => {
    setOtpBusy(true);
    try {
      const res = await api('/api/auth/admin/otp/provision', { method: 'POST' });
      const qr = await QRCode.toDataURL(res.otpauth_url, {
        margin: 1,
        width: 240,
        color: { dark: '#1f2937', light: '#ffffff' },
      });
      setOtp((o) => ({ ...o, qr, secret: res.secret, code: '' }));
    } catch (err) {
      toast(err.message);
    } finally {
      setOtpBusy(false);
    }
  };

  const enableOtp = async () => {
    if (otp.code.length !== 6) return toast('Ingresá el código de 6 dígitos');
    setOtpBusy(true);
    try {
      const res = await api('/api/auth/admin/otp/enable', { method: 'POST', body: { code: otp.code } });
      setOtp((o) => ({ ...o, enabled: res.enabled, qr: '', secret: '', code: '' }));
      toast('Autenticación en 2 pasos activada');
    } catch (err) {
      toast(err.message);
    } finally {
      setOtpBusy(false);
    }
  };

  const disableOtp = async () => {
    if (otp.code.length !== 6) return toast('Ingresá el código de 6 dígitos');
    setOtpBusy(true);
    try {
      const res = await api('/api/auth/admin/otp/disable', { method: 'POST', body: { code: otp.code } });
      setOtp((o) => ({ ...o, enabled: res.enabled, qr: '', secret: '', code: '' }));
      toast('Autenticación en 2 pasos desactivada');
    } catch (err) {
      toast(err.message);
    } finally {
      setOtpBusy(false);
    }
  };

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

  const pickImage = (e, kind) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const src = URL.createObjectURL(file);
    setCropFor({ src, kind });
  };

  const saveCropped = async (file) => {
    if (!cropFor) return;
    const { kind } = cropFor;
    setUploading(true);
    const field = kind === 'iso' ? 'iso' : 'logo';
    try {
      const fd = new FormData();
      fd.append(field, file);
      const res = await api(`/api/settings/upload-${field}`, { method: 'POST', body: fd });
      await updateSettings(kind === 'iso' ? { logoIso: res.url } : { logo: res.url });
      toast(kind === 'iso' ? 'ISO actualizado' : 'Logo actualizado');
    } catch (err) {
      toast(err.message);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(cropFor.src);
      setCropFor(null);
    }
  };

  const removeImage = async (kind) => {
    await updateSettings(kind === 'iso' ? { logoIso: '' } : { logo: '' });
    toast(kind === 'iso' ? 'ISO eliminado' : 'Logo eliminado');
  };

  const LogoUploader = ({ kind, label, previewBox, display }) => {
    const ref = kind === 'iso' ? isoInput : logoInput;
    const has = settings[kind === 'iso' ? 'logoIso' : 'logo'];
    return (
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`relative flex items-center justify-center overflow-hidden border border-line bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-sm ${previewBox}`}
        >
          {has ? (
            <img src={has} alt={`${label} actual`} className={display} />
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
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => pickImage(e, kind)} />
          <button className="btn-ghost" onClick={() => ref.current?.click()} disabled={uploading}>
            <ImagePlus size={15} />
            {has ? 'Cambiar' : `Subir ${label.toLowerCase()}`}
          </button>
          {has && (
            <button className="btn-ghost text-red-500 hover:bg-red-500/10" onClick={() => removeImage(kind)}>
              <Trash2 size={15} />
              Quitar {label.toLowerCase()}
            </button>
          )}
        </div>
      </div>
    );
  };

  const { h, s, l } = hexToHsl(settings.primaryColor);

  return (
    <div>
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
            <Image size={20} className="text-primary-strong" />
            Logo de la plataforma
          </h2>
          <p className="mb-5 text-sm text-ink-muted">
            Imagen horizontal, se muestra completa en la barra de navegación. Podés recortar los bordes a tu gusto.
          </p>
          <LogoUploader kind="logo" label="Logo" previewBox="h-20 w-44 rounded-2xl" display="h-full w-full object-contain" />
        </section>

        <section className="card p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-ink">
            <Square size={20} className="text-primary-strong" />
            ISO (ícono cuadrado)
          </h2>
          <p className="mb-5 text-sm text-ink-muted">
            Ícono cuadrado que se usa como imagen del logo cuando no hay un logo horizontal cargado.
          </p>
          <LogoUploader kind="iso" label="ISO" previewBox="h-20 w-20 rounded-2xl" display="h-full w-full object-cover" />
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

        <section className="card p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-ink">
            <ShieldCheck size={20} className="text-primary-strong" />
            Cuenta del administrador
          </h2>
          <p className="mb-5 text-sm text-ink-muted">
            Cambiá la contraseña del acceso único de administración y protegé la cuenta con un segundo paso.
          </p>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface-alt p-4">
              <h3 className="mb-3 flex items-center gap-2 font-extrabold text-ink">
                <KeyRound size={16} className="text-primary-strong" />
                Cambiar contraseña
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Contraseña actual
                  </label>
                  <input
                    className="input"
                    type="password"
                    value={pwd.current}
                    onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Nueva contraseña
                  </label>
                  <input
                    className="input"
                    type="password"
                    value={pwd.next}
                    onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    className="input"
                    type="password"
                    value={pwd.confirm}
                    onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                    autoComplete="new-password"
                  />
                </div>
                <button
                  className="btn-primary justify-center"
                  onClick={changePassword}
                  disabled={savingPwd || !pwd.current || !pwd.next || !pwd.confirm}
                >
                  {savingPwd ? <Loader2 className="animate-spin" size={16} /> : <KeyRound size={16} />}
                  Guardar contraseña
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface-alt p-4">
              <h3 className="mb-1 flex items-center gap-2 font-extrabold text-ink">
                <Smartphone size={16} className="text-primary-strong" />
                Autenticación en 2 pasos
              </h3>
              <p className="mb-3 text-xs text-ink-muted">
                Al activar, además de usuario y contraseña pedirá un código de tu app de autenticación
                (Google Authenticator, Authy, etc.).
              </p>

              {otp.enabled === null ? (
                otpBusy ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-ink-muted">
                    <Loader2 className="animate-spin" size={16} /> Cargando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl bg-surface px-3 py-6 text-sm text-ink-muted">
                    No se pudo consultar el estado del 2FA.
                  </div>
                )
              ) : otp.enabled ? (
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Check size={13} /> Activada
                  </span>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Código actual para desactivar
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="input font-mono text-center tracking-[0.3em]"
                        placeholder="••••••"
                        value={otp.code}
                        onChange={(e) =>
                          setOtp((o) => ({ ...o, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))
                        }
                        inputMode="numeric"
                      />
                      <button
                        className="btn-ghost shrink-0 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                        onClick={disableOtp}
                        disabled={otpBusy || otp.code.length !== 6}
                      >
                        {otpBusy ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                        Desactivar
                      </button>
                    </div>
                  </div>
                </div>
              ) : otp.qr ? (
                <div className="space-y-3">
                  <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-sm">
                    <img src={otp.qr} alt="Código QR para configurar la app de autenticación" className="h-44 w-44" />
                  </div>
                  <p className="text-center text-xs leading-relaxed text-ink-muted">
                    Escaneá el código con tu app de autenticación y luego ingresá el código de 6 dígitos
                    que te muestra para confirmar la activación.
                  </p>
                  <div className="flex gap-2">
                    <input
                      className="input font-mono text-center tracking-[0.3em]"
                      placeholder="••••••"
                      value={otp.code}
                      onChange={(e) =>
                        setOtp((o) => ({ ...o, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))
                      }
                      inputMode="numeric"
                    />
                    <button
                      className="btn-ghost shrink-0"
                      onClick={() => setOtp((o) => ({ ...o, qr: '', secret: '' }))}
                      disabled={otpBusy}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-primary shrink-0"
                      onClick={enableOtp}
                      disabled={otpBusy || otp.code.length !== 6}
                    >
                      {otpBusy ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                      Activar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-xs text-ink-muted">
                    Tu cuenta todavía no tiene el segundo paso de seguridad.
                  </p>
                  <button className="btn-primary justify-center" onClick={provisionOtp} disabled={otpBusy}>
                    {otpBusy ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                    Activar autenticación en 2 pasos
                  </button>
                </div>
              )}
            </div>
          </div>
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

      {cropFor && (
        <ImageCropper
          src={cropFor.src}
          aspect={cropFor.kind === 'iso' ? 1 : undefined}
          cropShape="rect"
          onSave={saveCropped}
          onCancel={() => {
            URL.revokeObjectURL(cropFor.src);
            setCropFor(null);
          }}
        />
      )}
    </div>
  );
}