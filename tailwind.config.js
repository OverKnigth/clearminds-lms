/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#1a202e',
        },
        krake: {
          red: '#DC2626', // Rojo principal de KrakeDev
          'red-dark': '#B91C1C',
          'red-light': '#EF4444',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-red-lg': '0 0 30px rgba(220, 38, 38, 0.4)',
      },
    },
  },
  plugins: [],
}
