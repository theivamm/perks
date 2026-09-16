export function hexToHsl(hex) {
  let clean = String(hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) clean = '2563eb';
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const PALETTE_KEY = 'perks:palette';

export function persistPalette(primaryHex, dark) {
  try {
    localStorage.setItem(PALETTE_KEY, JSON.stringify({ primaryHex, dark: !!dark }));
  } catch {
    /* noop */
  }
}

export function applyPalette(primaryHex, dark, persist = true) {
  const { h, s } = hexToHsl(primaryHex);
  const sat = clamp(s, 40, 75);
  const root = document.documentElement;
  root.classList.toggle('dark', !!dark);

  if (dark) {
    root.style.setProperty('--primary', `${h} ${sat}% 55%`);
    root.style.setProperty('--primary-strong', `${h} ${clamp(sat + 5, 40, 75)}% 66%`);
    root.style.setProperty('--primary-soft', `${h} ${clamp(sat + 8, 40, 80)}% 20%`);
    root.style.setProperty('--primary-softer', `${h} ${clamp(sat + 8, 40, 80)}% 14%`);
    root.style.setProperty('--primary-contrast', '0 0% 100%');
    root.style.setProperty('--bg', `${h} 26% 9%`);
    root.style.setProperty('--surface', `${h} 22% 13%`);
    root.style.setProperty('--surface-alt', `${h} 24% 18%`);
    root.style.setProperty('--ink', '0 0% 92%');
    root.style.setProperty('--ink-muted', '0 0% 66%');
    root.style.setProperty('--line', `${h} 16% 26%`);
  } else {
    root.style.setProperty('--primary', `${h} ${sat}% 45%`);
    root.style.setProperty('--primary-strong', `${h} ${sat}% 34%`);
    root.style.setProperty('--primary-soft', `${h} ${clamp(sat + 12, 50, 88)}% 90%`);
    root.style.setProperty('--primary-softer', `${h} ${clamp(sat + 12, 50, 88)}% 96%`);
    root.style.setProperty('--primary-contrast', '0 0% 100%');
    root.style.setProperty('--bg', `${h} 45% 97%`);
    root.style.setProperty('--surface', '0 0% 100%');
    root.style.setProperty('--surface-alt', `${h} 55% 92%`);
    root.style.setProperty('--ink', `${h} 30% 13%`);
    root.style.setProperty('--ink-muted', `${h} 12% 42%`);
    root.style.setProperty('--line', `${h} 25% 86%`);
  }

  if (persist) persistPalette(primaryHex, dark);
}

export function initPalette() {
  try {
    const raw = localStorage.getItem(PALETTE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const hex = data && /^#[0-9a-fA-F]{6}$/.test(String(data.primaryHex || '')) ? data.primaryHex : '';
    if (!hex) return null;
    const dark = !!data.dark;
    applyPalette(hex, dark, false);
    return { primaryColor: hex, theme: dark ? 'dark' : 'light' };
  } catch (e) {
    return null;
  }
}

export const initialPalette = initPalette();

export const PRESET_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#16a34a',
  '#0891b2',
  '#eab308',
  '#dc2626',
  '#0f172a',
];