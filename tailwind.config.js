/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1e40af',
          cyan: '#0284c7',
          emerald: '#059669',
          amber: '#d97706',
          dark: '#0f172a'
        }
      },
      keyframes: {
        pulseFast: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' }
        }
      },
      animation: {
        'pulse-fast': 'pulseFast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave-1': 'wave 1s ease-in-out infinite',
        'wave-2': 'wave 1s ease-in-out 0.2s infinite',
        'wave-3': 'wave 1s ease-in-out 0.4s infinite',
      }
    },
  },
  plugins: [],
}
