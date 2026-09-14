export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          strong: 'hsl(var(--primary-strong) / <alpha-value>)',
          soft: 'hsl(var(--primary-soft) / <alpha-value>)',
          softer: 'hsl(var(--primary-softer) / <alpha-value>)',
          contrast: 'hsl(var(--primary-contrast) / <alpha-value>)',
        },
        surface: {
          page: 'hsl(var(--bg) / <alpha-value>)',
          DEFAULT: 'hsl(var(--surface) / <alpha-value>)',
          alt: 'hsl(var(--surface-alt) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'hsl(var(--ink) / <alpha-value>)',
          muted: 'hsl(var(--ink-muted) / <alpha-value>)',
        },
        line: 'hsl(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px hsl(var(--line) / 0.45)',
        glow: '0 8px 30px hsl(var(--primary) / 0.35)',
      },
    },
  },
  plugins: [],
};