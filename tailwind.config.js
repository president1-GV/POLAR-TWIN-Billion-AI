/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        polar: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          card: 'var(--bg-card)',
          'card-subtle': 'var(--bg-card-subtle)',
          input: 'var(--bg-input)',
          hover: 'var(--bg-hover)',
          border: 'var(--border-subtle)',
          'border-active': 'var(--border-default)',
          'border-strong': 'var(--border-strong)',
          
          // Typography
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-muted': 'var(--text-muted)',
          'text-disabled': 'var(--text-disabled)',

          // Semantic Colors
          cyan: 'var(--accent-primary)',
          'ice-cyan': 'var(--accent-secondary)',
          'polar-blue': 'var(--accent-primary)',
          healthy: 'var(--status-healthy)',
          warning: 'var(--status-warning)',
          critical: 'var(--status-critical)',
          offline: 'var(--status-offline)',
          muted: 'var(--text-muted)',

          // Compatibility Palette mapped to semantic tokens
          950: 'var(--bg-base)',
          900: 'var(--bg-surface)',
          850: 'var(--bg-elevated)',
          800: 'var(--bg-card)',
          750: 'var(--border-subtle)',
          700: 'var(--border-default)',
          600: 'var(--border-strong)',
          500: 'var(--accent-primary)',
          400: 'var(--accent-secondary)',
        }
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'mission-title': ['36px', { lineHeight: '42px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'section-title': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'subsection': ['15px', { lineHeight: '20px', letterSpacing: '-0.005em', fontWeight: '600' }],
        'primary-data': ['32px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'secondary-data': ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'metadata': ['12px', { lineHeight: '16px', letterSpacing: '0em', fontWeight: '400' }],
        'system-label': ['10px', { lineHeight: '14px', letterSpacing: '0.08em', fontWeight: '700' }],
      }
    },
  },
  plugins: [],
}
