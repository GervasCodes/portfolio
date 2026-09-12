/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Natural, premium palette: clean white canvas, deep-ink text,
        // sage-green primary accent, muted gold/bronze secondary accent.
        // Accent stays reserved for selected/active states (nav pills,
        // tabs, selected buttons) per the light-theme redesign.
        background: '#ffffff',
        surface: 'rgba(15,23,20,0.035)',
        border: 'rgba(15,23,20,0.09)',
        ink: '#14171a',
        accent: {
          DEFAULT: '#6f8f6b',
          light: '#9fbd97',
          glow: '#86a67f',
          dark: '#4a6647',
        },
        cyan: { accent: '#c9a267' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(111,143,107,0.55)',
      },
    },
  },
  plugins: [],
};
