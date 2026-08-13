/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Natural, premium palette: deep charcoal-green canvas, warm ivory
        // text, sage-green primary accent, muted gold/bronze secondary accent.
        background: '#0c0f0d',
        surface: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.08)',
        accent: {
          DEFAULT: '#6f8f6b',
          light: '#9fbd97',
          glow: '#86a67f',
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
