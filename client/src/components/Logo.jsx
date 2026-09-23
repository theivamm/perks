import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { getSystemIso } from './SystemIsos.jsx';

const SIZES = {
  sm: { logo: 'h-8 max-w-[130px]', iso: 'h-8 w-8', icon: 17 },
  md: { logo: 'h-9 max-w-[200px]', iso: 'h-9 w-9', icon: 20 },
  lg: { logo: 'h-12 max-w-[240px]', iso: 'h-12 w-12', icon: 26 },
  xl: { logo: 'h-14 max-w-[320px]', iso: 'h-12 w-12', icon: 28 },
};

function businessInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Logo({
  text,
  size = 'md',
  showText = true,
  light = false,
  variant = 'logo',
  fallback = 'icon',
  circle = false,
  fullWidth = false,
  className = '',
}) {
  const { settings } = useTheme();
  const sz = SIZES[size] || SIZES.md;
  const brandText = text || settings.businessName || 'Wintuu';
  const DefaultIso = getSystemIso(settings.isoIcon).Icon;
  const [broken, setBroken] = useState({ logo: false, iso: false });
  const shape = circle ? 'rounded-full' : 'rounded-xl';

  useEffect(() => {
    setBroken({ logo: false, iso: false });
  }, [settings.logo, settings.logoIso]);

  const isoClasses = (rounded) =>
    `${sz.iso} shrink-0 ${rounded ? shape : ''} object-cover ${size === 'lg' ? 'shadow-glow' : 'shadow-sm'}`;

  const fallbackIso = (
    <span
      className={`${sz.iso} flex shrink-0 items-center justify-center ${shape} bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow`}
    >
      {fallback === 'initials' ? (
        <span className="text-sm font-extrabold">{businessInitials(brandText)}</span>
      ) : (
        <DefaultIso size={sz.icon} />
      )}
    </span>
  );

  const textNode = showText && (
    <span className={`hidden text-sm font-extrabold sm:block ${light ? 'text-white' : 'text-ink'}`}>{brandText}</span>
  );

  const wrapper = `flex items-center gap-2.5 font-extrabold ${
    fullWidth && variant === 'logo' ? 'w-full justify-center' : ''
  } ${className}`;

  if (variant === 'iso') {
    const src =
      (settings.logoIso && !broken.iso && settings.logoIso) ||
      (settings.logo && !broken.logo && settings.logo) ||
      '';
    return (
      <span className={wrapper}>
        {src ? (
          <img
            src={src}
            alt="ISO"
            className={isoClasses(true)}
            onError={() => setBroken((b) => ({ ...b, [src === settings.logoIso ? 'iso' : 'logo']: true }))}
          />
        ) : (
          fallbackIso
        )}
        {textNode}
      </span>
    );
  }

  const logoOk = settings.logo && !broken.logo;
  const isoOk = settings.logoIso && !broken.iso;
  return (
    <span className={wrapper}>
      {logoOk ? (
        <img
          src={settings.logo}
          alt="Logo"
          className={
            fullWidth ? 'h-auto w-full shrink-0 object-contain' : `${sz.logo} w-auto shrink-0 object-contain`
          }
          onError={() => setBroken((b) => ({ ...b, logo: true }))}
        />
      ) : isoOk ? (
        <img
          src={settings.logoIso}
          alt="ISO"
          className={isoClasses(true)}
          onError={() => setBroken((b) => ({ ...b, iso: true }))}
        />
      ) : (
        fallbackIso
      )}
      {textNode}
    </span>
  );
}