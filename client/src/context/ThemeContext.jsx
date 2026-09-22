import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { applyPalette, readPalette } from '../color';
import { useTenant } from './TenantContext.jsx';

const ThemeContext = createContext(null);

const DEFAULT_SETTINGS = {
  primaryColor: '#2563eb',
  theme: 'light',
  currency: '$',
  logo: '',
  logoIso: '',
  isoIcon: 'store',
  businessName: 'Mi negocio',
  tagline: '',
  setupCompleted: 'true',
};

const settingsKey = (slug = '') => `wintuu:settings:${slug || '_wintuu'}`;

function normalize(data) {
  return {
    primaryColor: data.primaryColor || DEFAULT_SETTINGS.primaryColor,
    theme: data.theme || 'light',
    currency: data.currency || DEFAULT_SETTINGS.currency,
    logo: data.logo || '',
    logoIso: data.logoIso || '',
    isoIcon: data.isoIcon || DEFAULT_SETTINGS.isoIcon,
    businessName: data.businessName || DEFAULT_SETTINGS.businessName,
    tagline: data.tagline || '',
    setupCompleted: String(data.setupCompleted ?? DEFAULT_SETTINGS.setupCompleted),
  };
}

// Cache POR NEGOCIO: nunca se mezcla el branding entre apps.
function loadCachedSettings(slug) {
  try {
    const raw = localStorage.getItem(settingsKey(slug));
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object') return null;
    return normalize(d);
  } catch {
    return null;
  }
}

function persistSettings(next, slug) {
  try {
    localStorage.setItem(settingsKey(slug), JSON.stringify(normalize(next)));
  } catch {
    /* noop */
  }
}

function initialFor(slug) {
  const cached = loadCachedSettings(slug);
  const palette = readPalette(slug);
  return { ...DEFAULT_SETTINGS, ...(cached || {}), ...(palette || {}) };
}

export function ThemeProvider({ children }) {
  const { slug } = useTenant();
  const [settings, setSettings] = useState(() => initialFor(slug));

  useEffect(() => {
    const cached = initialFor(slug);
    setSettings(cached);
    applyPalette(cached.primaryColor, cached.theme === 'dark', true, slug);

    // Sin tenant (landing, onboarding, panel WINTUU): no pedimos settings de
    // ningún negocio para no filtrar branding ajeno.
    if (!slug) return undefined;

    let alive = true;
    api('/api/settings')
      .then((data) => {
        if (!alive || !data) return;
        const next = normalize(data);
        setSettings(next);
        persistSettings(next, slug);
        applyPalette(next.primaryColor, next.theme === 'dark', true, slug);
      })
      .catch(() => {
        /* se mantiene el cache/default */
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const name = settings.businessName || 'Mi negocio';
    document.title = settings.tagline ? `${name} · ${settings.tagline}` : name;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && settings.tagline) meta.setAttribute('content', settings.tagline);
  }, [slug, settings.businessName, settings.tagline]);

  useEffect(() => {
    const href = settings.logoIso || settings.logo || '/favicon.png';
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
      persistSettings(next, slug);
      applyPalette(next.primaryColor, next.theme === 'dark', true, slug);
      try {
        const data = await api('/api/settings', { method: 'PUT', body: patch });
        if (data) {
          const merged = normalize({ ...next, ...data });
          setSettings(merged);
          persistSettings(merged, slug);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [settings, slug]
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
