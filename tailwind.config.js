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
          bg: '#030712',
          surface: '#0B1220',
          elevated: '#111827',
          border: '#1E293B',
          950: '#030712',
          900: '#0B1220',
          850: '#0F172A',
          800: '#111827',
          750: '#1E293B',
          700: '#334155',
          600: '#1E293B',
          500: '#3B82F6',
          400: '#60A5FA',
          cyan: '#22D3EE',
          sky: '#38BDF8',
          ice: '#E2F1FF',
          healthy: '#10B981',
          warning: '#F59E0B',
          critical: '#EF4444',
          normal: '#10B981',
          offline: '#64748B'
        }
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
