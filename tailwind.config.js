/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        polar: {
          base: '#050A12',
          surface: '#07111D',
          elevated: '#0A1422',
          card: '#0D1726',
          border: '#1E293B',
          'border-active': '#26354A',
          
          // Semantic Colors
          cyan: '#22D3EE',
          'ice-cyan': '#38BDF8',
          'polar-blue': '#60A5FA',
          ice: '#E2F1FF',
          healthy: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
          offline: '#64748B',
          muted: '#94A3B8',

          // Compatibility Palette
          950: '#050A12',
          900: '#07111D',
          850: '#0A1422',
          800: '#0D1726',
          750: '#1E293B',
          700: '#26354A',
          600: '#1E293B',
          500: '#38BDF8',
          400: '#60A5FA',
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
