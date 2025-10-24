/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e6f1ff',
          100: '#cce3ff',
          200: '#99c7ff',
          300: '#66abff',
          400: '#338fff',
          500: '#0073ff',
          600: '#003d8f',
          700: '#002a5f',
          800: '#001d44',
          900: '#001529',
          950: '#000a14',
        },
        apricot: {
          50: '#fff8f1',
          100: '#ffeedd',
          200: '#ffd9b3',
          300: '#ffc489',
          400: '#ffaf5f',
          500: '#ff9a35',
          600: '#e67d1a',
          700: '#b35f0f',
          800: '#804309',
          900: '#4d2805',
        }
      },
    },
  },
  plugins: [],
}