import { ChefHat } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const SIZES = {
  sm: { box: 'h-8 w-8', icon: 17 },
  md: { box: 'h-9 w-9', icon: 20 },
  lg: { box: 'h-12 w-12', icon: 26 },
};

export default function Logo({ text = 'Fidelización App', size = 'md', showText = true, light = false }) {
  const { settings } = useTheme();
  const sz = SIZES[size] || SIZES.md;

  return (
    <span className="flex items-center gap-2.5 font-extrabold text-ink">
      {settings.logo ? (
        <img
          src={settings.logo}
          alt="Logo"
          className={`${sz.box} shrink-0 rounded-xl object-cover ${size === 'lg' ? 'shadow-glow' : 'shadow-sm'}`}
        />
      ) : (
        <span
          className={`${sz.box} flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow`}
        >
          <ChefHat size={sz.icon} />
        </span>
      )}
      {showText && (
        <span className={`hidden text-sm font-extrabold sm:block ${light ? 'text-white' : 'text-ink'}`}>
          {text}
        </span>
      )}
    </span>
  );
}