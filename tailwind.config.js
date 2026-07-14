/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aws: {
          orange: '#ff9900',
          dark: '#232f3e',
          navy: '#1a1a2e',
          blue: '#0f3460',
        },
      },
    },
  },
  plugins: [],
}
