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
          950: '#040810',
          900: '#080E1A',
          850: '#0C1527',
          800: '#111D36',
          750: '#182747',
          700: '#1F3258',
          600: '#2A4374',
          500: '#3B82F6',
          400: '#60A5FA',
          cyan: '#00E5FF',
          ice: '#E2F1FF',
          warning: '#F59E0B',
          critical: '#EF4444',
          normal: '#10B981',
          offline: '#64748B'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
