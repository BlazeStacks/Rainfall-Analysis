/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0f1e',
          800: '#0d1528',
          700: '#111d35',
          600: '#162040',
          500: '#1a2548',
        },
        slate: {
          850: '#1a2035',
        },
        brand: {
          teal:  '#14b8a6',
          blue:  '#3b82f6',
          cyan:  '#06b6d4',
          indigo:'#6366f1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)',
        glow: '0 0 20px rgba(20,184,166,0.15)',
      }
    },
  },
  plugins: [],
}
