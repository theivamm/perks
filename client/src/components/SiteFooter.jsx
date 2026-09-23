import { Clock, ExternalLink, Globe, Mail, MapPin, MessageCircle, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import Logo from './Logo.jsx';

// Íconos de marca (lucide ya no los incluye).
const Brand = {
  whatsapp: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.42 9.42 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43m8.03-17.46A11.3 11.3 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.5l5.9-1.55a11.3 11.3 0 0 0 5.54 1.41h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02" />
    </svg>
  ),
  instagram: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  ),
  facebook: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46H16.6V4.46A21 21 0 0 0 14.3 4.3c-2.28 0-3.8 1.39-3.8 3.93v2.27H8v3h2.5V21z" />
    </svg>
  ),
  tiktok: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.59-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.68 5.7 3.13 0 5.68-2.55 5.68-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.23-1.48" />
    </svg>
  ),
};
export const BrandIcon = Brand;

const digits = (v) => String(v || '').replace(/\D/g, '');
const handle = (v) => String(v || '').trim().replace(/^@/, '');
const socialUrl = (kind, v) => {
  const s = String(v || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (kind === 'instagram') return `https://instagram.com/${handle(s)}`;
  if (kind === 'facebook') return `https://facebook.com/${handle(s)}`;
  if (kind === 'tiktok') return `https://tiktok.com/@${handle(s)}`;
  return `https://${s}`;
};
export const waUrl = (num, msg = '') => {
  const d = digits(num);
  return d ? `https://wa.me/${d}${msg ? `?text=${encodeURIComponent(msg)}` : ''}` : '';
};
const mapsUrl = (s) => s.mapsUrl || (s.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}` : '');

export function useContact() {
  const { settings: s } = useTheme();
  const socials = [
    ['instagram', 'Instagram', s.instagram],
    ['facebook', 'Facebook', s.facebook],
    ['tiktok', 'TikTok', s.tiktok],
  ]
    .filter(([, , v]) => String(v || '').trim())
    .map(([k, label, v]) => ({ key: k, label, url: socialUrl(k, v), Icon: Brand[k] }));
  return {
    s,
    socials,
    wa: waUrl(s.whatsapp, s.contactMessage),
    tel: digits(s.phone) ? `tel:${String(s.phone).replace(/[^\d+]/g, '')}` : '',
    maps: mapsUrl(s),
    web: s.website ? socialUrl('web', s.website) : '',
  };
}

export function SiteFooter() {
  const { s, socials, wa, tel, maps, web } = useContact();
  const year = new Date().getFullYear();
  const contactRows = [
    s.address && { Icon: MapPin, label: s.address, href: maps, ext: true },
    s.phone && { Icon: Phone, label: s.phone, href: tel },
    s.whatsapp && { Icon: Brand.whatsapp, label: `WhatsApp ${s.whatsapp}`, href: wa, ext: true },
    s.email && { Icon: Mail, label: s.email, href: `mailto:${s.email}` },
    web && { Icon: Globe, label: String(s.website).replace(/^https?:\/\//, '').replace(/\/$/, ''), href: web, ext: true },
  ].filter(Boolean);
  const hasInfo = contactRows.length > 0 || s.hours || s.businessDescription || socials.length > 0;

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {hasInfo && (
          <div className="grid gap-10 py-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="max-w-sm space-y-4">
              <Logo size="md" showText={false} />
              <div>
                <p className="font-heading text-lg font-bold text-ink">{s.businessName}</p>
                {s.tagline && <p className="text-sm text-ink-muted">{s.tagline}</p>}
              </div>
              {s.businessDescription && <p className="text-sm leading-relaxed text-ink-muted">{s.businessDescription}</p>}
              {socials.length > 0 && (
                <div className="flex gap-2">
                  {socials.map(({ key, label, url, Icon }) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-contrast"
                    >
                      <Icon width={17} height={17} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {contactRows.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-muted">Contacto</p>
                <ul className="space-y-2.5">
                  {contactRows.map(({ Icon, label, href, ext }) => (
                    <li key={label}>
                      <a
                        href={href || undefined}
                        target={ext ? '_blank' : undefined}
                        rel={ext ? 'noreferrer' : undefined}
                        className="group flex items-start gap-3 text-sm text-ink transition-colors hover:text-primary-strong"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-softer text-primary-strong">
                          <Icon width={15} height={15} size={15} />
                        </span>
                        <span className="min-w-0 pt-1.5 [overflow-wrap:anywhere]">{label}</span>
                        {ext && <ExternalLink size={12} className="mt-2 shrink-0 opacity-0 transition group-hover:opacity-60" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {s.hours && (
              <div className="space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-muted">Horarios</p>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-softer text-primary-strong">
                    <Clock size={15} />
                  </span>
                  <p className="whitespace-pre-line pt-1 text-sm leading-relaxed text-ink">{s.hours}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-ink-muted ${hasInfo ? 'border-t border-line' : ''}`}>
          <div className="flex items-center gap-3">
            {!hasInfo && <Logo size="sm" showText={false} />}
            <span>
              © {year} <span className="font-bold text-ink">{s.businessName}</span>
              {!hasInfo && s.tagline ? ` · ${s.tagline}` : ''}
            </span>
          </div>
          <a href="https://www.wintuu.com" target="_blank" rel="noreferrer" className="font-semibold hover:text-ink">
            Hecho con Wintuu
          </a>
        </div>
      </div>
    </footer>
  );
}

/**
 * Botón flotante de contacto. `raised` lo sube en mobile cuando hay otra barra fija abajo.
 * Se configura en Configuración → Contacto (contactButton: 'whatsapp' | 'phone' | 'off').
 */
export function ContactFab({ raised = false }) {
  const { s, wa, tel } = useContact();
  const [hint, setHint] = useState(false);
  const mode = s.contactButton || (s.whatsapp ? 'whatsapp' : 'off');
  const href = mode === 'whatsapp' ? wa : mode === 'phone' ? tel : '';

  useEffect(() => {
    if (!href || sessionStorage.getItem('contact-hint-seen')) return;
    const t = setTimeout(() => setHint(true), 4000);
    return () => clearTimeout(t);
  }, [href]);

  if (!href) return null;
  const isWa = mode === 'whatsapp';
  const closeHint = () => {
    setHint(false);
    sessionStorage.setItem('contact-hint-seen', '1');
  };

  return (
    <div className={`fixed right-4 z-40 flex flex-col items-end gap-2 sm:right-6 lg:bottom-6 ${raised ? 'bottom-[92px]' : 'bottom-5'}`}>
      {hint && (
        <div className="animate-fade-up relative max-w-[240px] rounded-2xl rounded-br-md border border-line bg-surface py-3 pl-4 pr-9 text-sm text-ink shadow-xl">
          <p className="font-bold">¿Tenés una consulta?</p>
          <p className="text-xs text-ink-muted">{isWa ? 'Escribinos por WhatsApp.' : 'Llamanos, te atendemos al toque.'}</p>
          <button onClick={closeHint} className="absolute right-2 top-2 rounded-lg p-1 text-ink-muted hover:bg-surface-alt" aria-label="Cerrar">
            <X size={14} />
          </button>
        </div>
      )}
      <a
        href={href}
        target={isWa ? '_blank' : undefined}
        rel="noreferrer"
        onClick={closeHint}
        aria-label={isWa ? 'Escribir por WhatsApp' : 'Llamar al local'}
        className={`group flex h-14 items-center gap-2 rounded-full pl-4 pr-4 text-white shadow-2xl transition hover:-translate-y-0.5 active:scale-95 ${
          isWa ? 'bg-[#25D366] shadow-[#25D366]/30' : 'bg-primary shadow-glow'
        }`}
      >
        {isWa ? <Brand.whatsapp width={26} height={26} /> : <Phone size={22} />}
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-[160px] sm:inline">
          {isWa ? 'Escribinos' : 'Llamanos'}
        </span>
      </a>
    </div>
  );
}

export { MessageCircle };
