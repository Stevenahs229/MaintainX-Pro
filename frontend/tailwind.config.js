/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0edff',
          100: '#d4ccff',
          200: '#b3a6ff',
          300: '#8c7aff',
          400: '#6b4dff',
          500: '#4D1BFF',
          600: '#3d0fd9',
          700: '#2f0ab3',
          800: '#21068c',
          900: '#150366',
          950: '#0c003d',
        },
      },
    },
  },
  plugins: [],
};
