import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { applyPalette } from '../color';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState({
    primaryColor: '#2563eb',
    theme: 'light',
    currency: '$',
  });

  useEffect(() => {
    api('/api/settings')
      .then((data) => {
        if (data?.primaryColor) {
          const next = {
            primaryColor: data.primaryColor,
            theme: data.theme || 'light',
            currency: data.currency || '$',
          };
          setSettings(next);
          applyPalette(next.primaryColor, next.theme === 'dark');
        }
      })
      .catch(() => applyPalette('#2563eb', false));
  }, []);

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