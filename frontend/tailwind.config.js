/** @type {import('tailwindcss').Config} */

// Colours are CSS variables holding space-separated RGB channels (see
// src/styles/tokens.css) so Tailwind opacity modifiers keep working
// (`text-ink/70`, `bg-accent/10`) AND a theme or direction can be swapped
// by changing the variables only.
const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    // Radius is deliberately limited to two real values (0 and 8px) plus
    // `full` for avatars and dots. Every rounded-* utility resolves to one of
    // them, so no component can introduce a third corner style.
    borderRadius: {
      none: '0',
      sm: '0',
      DEFAULT: 'var(--radius-md)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-md)',
      xl: 'var(--radius-md)',
      '2xl': 'var(--radius-md)',
      '3xl': 'var(--radius-md)',
      full: '9999px',
    },
    // Type scale (base 17px, ratio ~1.25), matching --text-* in tokens.css.
    fontSize: {
      xs: ['0.8125rem', { lineHeight: '1.25rem' }],
      sm: ['0.9375rem', { lineHeight: '1.45rem' }],
      base: ['1.0625rem', { lineHeight: '1.65rem' }],
      lg: ['1.25rem', { lineHeight: '1.85rem' }],
      xl: ['1.5625rem', { lineHeight: '2.1rem' }],
      '2xl': ['1.9375rem', { lineHeight: '2.4rem' }],
      '3xl': ['2.4375rem', { lineHeight: '2.8rem' }],
      '4xl': ['3.0625rem', { lineHeight: '3.3rem' }],
      '5xl': ['3.8125rem', { lineHeight: '1.05' }],
      '6xl': ['4.75rem', { lineHeight: '1.04' }],
      '7xl': ['5.9375rem', { lineHeight: '1' }],
    },
    // Shadows exist for overlays only (menus, dialogs, toasts).
    boxShadow: {
      none: 'none',
      overlay: 'var(--shadow-overlay)',
    },
    extend: {
      colors: {
        background: channel('bg'),
        bg: channel('bg'),
        surface: channel('surface'),
        ink: channel('text'),
        muted: channel('muted'),
        line: channel('line'),
        // Kept as `border` so existing `border-border` style utilities,
        // if any appear later, resolve to the same token as `line`.
        border: channel('line'),
        accent: {
          DEFAULT: channel('accent'),
          ink: channel('accent-ink'),
        },
        danger: channel('danger'),
        success: channel('success'),
        warning: channel('warning'),
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        // `display` is the heading face (serif in direction B).
        display: ['var(--font-display)'],
        serif: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease)',
      },
    },
  },
  plugins: [],
};
