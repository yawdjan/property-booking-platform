/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary - Warm Beige
        'primary': {
          50: '#faf9f5',
          100: '#f5f3eb',
          200: '#ebe7d7',
          300: '#e1dbc3',
          400: '#d7cfaf',
          500: '#CBBD93', // Main primary
          600: '#b8a97a',
          700: '#9d8f62',
          800: '#7e734f',
          900: '#5f583c',
        },
        // Secondary - Warm Orange
        'secondary': {
          50: '#fff8ed',
          100: '#fff0d5',
          200: '#ffe1ab',
          300: '#ffd280',
          400: '#ffc356',
          500: '#FFB16E', // Main secondary (orange)
          600: '#f99d4f',
          700: '#f38838',
          800: '#e6721f',
          900: '#c45d0d',
        },
        // Accent - Golden Sand
        'accent': {
          50: '#fdf8ef',
          100: '#faf1df',
          200: '#f5e3bf',
          300: '#efd59f',
          400: '#e9c77f',
          500: '#CCA25A', // Main accent
          600: '#b88d47',
          700: '#9e7838',
          800: '#7f612d',
          900: '#5f4921',
        },
        // Light - Soft Cream
        'cream': {
          50: '#fffef9',
          100: '#fffdf3',
          200: '#fffce7',
          300: '#fffadb',
          400: '#fff9cf',
          500: '#FFF5B8', // Main cream
          600: '#ffe89a',
          700: '#ffdb7c',
          800: '#ffce5e',
          900: '#ffc140',
        }
      }
    },
  },
  plugins: [],
}