/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Green
        'primary': {
          50: '#f0fdf7',
          100: '#dcfce9',
          200: '#bbf7d6',
          300: '#86efb8',
          400: '#3EB489', // Main primary green
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Secondary Blue
        'secondary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1737C9', // Main secondary blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Accent Coral
        'accent': {
          50: '#fff5f5',
          100: '#ffe4e1',
          200: '#fecdd3',
          300: '#FFBFB7', // Main accent coral
          400: '#fda4af',
          500: '#fb7185',
          600: '#f43f5e',
          700: '#e11d48',
          800: '#be123c',
          900: '#9f1239',
        }
      }
    },
  },
  plugins: [],
}

