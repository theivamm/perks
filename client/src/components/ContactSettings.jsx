import { useEffect, useState } from 'react';
import { Clock, Globe, Loader2, Mail, MapPin, MessageCircle, Phone, Save, Share2, Store } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { Field, Segmented, toast } from './ui.jsx';
import { BrandIcon, waUrl } from './SiteFooter.jsx';

const KEYS = [
  'businessDescription', 'address', 'mapsUrl', 'phone', 'whatsapp', 'email', 'website',
  'instagram', 'facebook', 'tiktok', 'hours', 'contactButton', 'contactMessage',
];

function Card({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="card p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-softer text-primary-strong">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function IconInput({ icon: Icon, prefix, ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center gap-1 text-ink-muted">
        <Icon width={16} height={16} size={16} />
        {prefix && <span className="text-sm font-semibold">{prefix}</span>}
      </span>
      <input className={`input ${prefix ? '!pl-[4.25rem]' : '!pl-10'}`} {...props} />
    </div>
  );
}

// Configuración → pestaña "Contacto": datos que se muestran en el footer y en el botón flotante.
export default function ContactSettings() {
  const { settings, updateSettings } = useTheme();
  const pick = () => Object.fromEntries(KEYS.map((k) => [k, settings[k] || '']));
  const [f, setF] = useState(pick);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) setF(pick());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const set = (k) => (e) => {
    setDirty(true);
    setF((x) => ({ ...x, [k]: e?.target ? e.target.value : e }));
  };

  const mode = f.contactButton || (f.whatsapp ? 'whatsapp' : 'off');

  const save = async () => {
    if (mode === 'whatsapp' && !f.whatsapp.replace(/\D/g, '')) return toast('Cargá un número de WhatsApp para el botón flotante');
    if (mode === 'phone' && !f.phone.replace(/\D/g, '')) return toast('Cargá un teléfono para el botón flotante');
    setSaving(true);
    try {
      await updateSettings({ ...Object.fromEntries(KEYS.map((k) => [k, String(f[k] || '').trim()])), contactButton: mode });
      setDirty(false);
      toast('Datos de contacto guardados');
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-5">
        <Card icon={Store} title="Sobre el local" subtitle="Aparece en el pie de tu página.">
          <Field label="Descripción" htmlFor="ct-desc" hint={`${f.businessDescription.length}/240`}>
            <textarea
              id="ct-desc"
              className="input min-h-24 resize-y"
              maxLength={240}
              value={f.businessDescription}
              onChange={set('businessDescription')}
              placeholder="Ej: Cafetería de especialidad en el corazón de Palermo. Tostamos nuestro propio café."
            />
          </Field>
        </Card>

        <Card icon={MapPin} title="Dónde estamos" subtitle="Dirección y horarios de atención.">
          <div className="space-y-4">
            <Field label="Dirección" htmlFor="ct-addr">
              <IconInput id="ct-addr" icon={MapPin} value={f.address} onChange={set('address')} placeholder="Ej: Av. Corrientes 1234, CABA" />
            </Field>
            <Field label="Link de Google Maps (opcional)" htmlFor="ct-maps" hint="Si lo dejás vacío, buscamos la dirección en Maps.">
              <IconInput id="ct-maps" icon={Globe} value={f.mapsUrl} onChange={set('mapsUrl')} placeholder="https://maps.app.goo.gl/…" />
            </Field>
            <Field label="Horarios" htmlFor="ct-hours" hint="Una línea por día o rango.">
              <textarea
                id="ct-hours"
                className="input min-h-24 resize-y"
                value={f.hours}
                onChange={set('hours')}
                placeholder={'Lun a Vie · 8 a 20 h\nSáb · 9 a 14 h\nDom · cerrado'}
              />
            </Field>
          </div>
        </Card>

        <Card icon={Phone} title="Cómo contactarte" subtitle="Tus clientes pueden tocar para llamar o escribir.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teléfono" htmlFor="ct-phone">
              <IconInput id="ct-phone" icon={Phone} type="tel" value={f.phone} onChange={set('phone')} placeholder="+54 11 1234-5678" />
            </Field>
            <Field label="WhatsApp" htmlFor="ct-wa" hint="Con código de país, sin 0 ni 15.">
              <IconInput id="ct-wa" icon={BrandIcon.whatsapp} type="tel" value={f.whatsapp} onChange={set('whatsapp')} placeholder="5491112345678" />
            </Field>
            <Field label="Email" htmlFor="ct-mail">
              <IconInput id="ct-mail" icon={Mail} type="email" value={f.email} onChange={set('email')} placeholder="hola@tulocal.com" />
            </Field>
            <Field label="Sitio web" htmlFor="ct-web">
              <IconInput id="ct-web" icon={Globe} value={f.website} onChange={set('website')} placeholder="tulocal.com" />
            </Field>
          </div>
        </Card>

        <Card icon={Share2} title="Redes sociales" subtitle="Usuario o link completo.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Instagram" htmlFor="ct-ig">
              <IconInput id="ct-ig" icon={BrandIcon.instagram} value={f.instagram} onChange={set('instagram')} placeholder="@tulocal" />
            </Field>
            <Field label="Facebook" htmlFor="ct-fb">
              <IconInput id="ct-fb" icon={BrandIcon.facebook} value={f.facebook} onChange={set('facebook')} placeholder="tulocal" />
            </Field>
            <Field label="TikTok" htmlFor="ct-tt">
              <IconInput id="ct-tt" icon={BrandIcon.tiktok} value={f.tiktok} onChange={set('tiktok')} placeholder="@tulocal" />
            </Field>
          </div>
        </Card>
      </div>

      {/* Botón flotante + guardar */}
      <div className="space-y-4 xl:sticky xl:top-24">
        <Card icon={MessageCircle} title="Botón flotante" subtitle="Un acceso directo fijo en tu página.">
          <div className="space-y-4">
            <Segmented
              value={mode}
              onChange={(v) => {
                setDirty(true);
                setF((x) => ({ ...x, contactButton: v }));
              }}
              options={[
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'phone', label: 'Llamada' },
                { value: 'off', label: 'Oculto' },
              ]}
            />
            {mode === 'whatsapp' && (
              <Field label="Mensaje inicial" htmlFor="ct-msg" hint="Se escribe solo al abrir WhatsApp.">
                <input id="ct-msg" className="input" value={f.contactMessage} onChange={set('contactMessage')} placeholder="¡Hola! Tengo una consulta…" />
              </Field>
            )}

            <div className="relative h-40 overflow-hidden rounded-2xl border border-line bg-surface-page">
              <div className="space-y-2 p-3">
                <div className="h-2.5 w-2/3 rounded-full bg-line" />
                <div className="h-2.5 w-1/2 rounded-full bg-line" />
                <div className="h-14 rounded-xl bg-surface-alt" />
              </div>
              {mode !== 'off' ? (
                <span
                  className={`absolute bottom-3 right-3 flex h-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold text-white shadow-lg ${
                    mode === 'whatsapp' ? 'bg-[#25D366]' : 'bg-primary'
                  }`}
                >
                  {mode === 'whatsapp' ? <BrandIcon.whatsapp width={18} height={18} /> : <Phone size={16} />}
                  {mode === 'whatsapp' ? 'Escribinos' : 'Llamanos'}
                </span>
              ) : (
                <span className="absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-ink-muted">Sin botón flotante</span>
              )}
            </div>
            {mode === 'whatsapp' && waUrl(f.whatsapp) && (
              <a href={waUrl(f.whatsapp, f.contactMessage)} target="_blank" rel="noreferrer" className="block text-center text-xs font-bold text-primary-strong hover:underline">
                Probar el link →
              </a>
            )}
          </div>
        </Card>

        <button className="btn-primary w-full justify-center !py-3" onClick={save} disabled={saving || !dirty}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {dirty ? 'Guardar contacto' : 'Guardado'}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-muted">
          <Clock size={12} /> Los cambios se ven al instante en tu página.
        </p>
      </div>
    </div>
  );
}
