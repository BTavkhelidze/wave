/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './Widgets/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(96, 165, 250, 0.18), 0 24px 80px -24px rgba(15, 23, 42, 0.9)',
      },
      colors: {
        ink: {
          50: '#f5f7ff',
          100: '#e8edff',
          200: '#cfd9ff',
          300: '#a8b9ff',
          400: '#7d93ff',
          500: '#5b6dff',
          600: '#4450ea',
          700: '#3940c1',
          800: '#2a3191',
          900: '#181d5f',
          950: '#0a0e24',
        },
      },
    },
  },
  plugins: [],
};
