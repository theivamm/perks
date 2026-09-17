import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { applyPalette, initialPalette } from '../color';

const ThemeContext = createContext(null);

const DEFAULT_SETTINGS = {
  primaryColor: '#2563eb',
  theme: 'light',
  currency: '$',
  logo: '',
  logoIso: '',
  isoIcon: 'chef-hat',
  businessName: 'Fidelización App',
  tagline: '',
};

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...(initialPalette || {}) }));

  useEffect(() => {
    api('/api/settings')
      .then((data) => {
        if (data?.primaryColor) {
          const next = {
            primaryColor: data.primaryColor,
            theme: data.theme || 'light',
            currency: data.currency || '$',
            logo: data.logo || '',
            logoIso: data.logoIso || '',
            isoIcon: data.isoIcon || 'chef-hat',
            businessName: data.businessName || 'Fidelización App',
            tagline: data.tagline || '',
          };
          setSettings(next);
          applyPalette(next.primaryColor, next.theme === 'dark');
        }
      })
      .catch(() => {
        if (!initialPalette) applyPalette('#2563eb', false, false);
      });
  }, []);

  useEffect(() => {
    const name = settings.businessName || 'Fidelización App';
    document.title = settings.tagline ? `${name} · ${settings.tagline}` : name;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && settings.tagline) meta.setAttribute('content', settings.tagline);
  }, [settings.businessName, settings.tagline]);

  useEffect(() => {
    const href = settings.logoIso || settings.logo || '/favicon.svg';
    const setIcon = (rel) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
      return link;
    };
    setIcon('icon');
    setIcon('apple-touch-icon');
  }, [settings.logoIso, settings.logo]);

  const updateSettings = useCallback(
    async (patch) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      applyPalette(next.primaryColor, next.theme === 'dark');
      try {
        const data = await api('/api/settings', { method: 'PUT', body: patch });
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      } catch (e) {
        console.error(e);
      }
    },
    [settings]
  );

  const toggleTheme = useCallback(
    () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' }),
    [settings.theme, updateSettings]
  );

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}