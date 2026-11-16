/** @type {import('tailwindcss').Config} */

// Colours are CSS variables holding space-separated RGB channels (see
// src/styles/tokens.css) so Tailwind opacity modifiers keep working
// (`text-ink/70`, `bg-accent/10`) and the dark/light themes swap by changing
// the variables only. Never write a colour literal in a component.
const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Tokens already swap per theme, so `dark:` variants are rarely needed, but
  // they work off the same attribute the theme provider sets.
  darkMode: ['selector', "[data-theme='dark']"],
  theme: {
    // Radius scale 8 / 14 / 22 / 32 + full.
    //   rounded-md  (8)  tags, code, chips      rounded-lg / xl (14) inputs, menus
    //   rounded-2xl (22) cards, panels          rounded-3xl (32) hero + bento tiles
    // sm and DEFAULT also resolve to 8 so legacy classes stay on the scale.
    borderRadius: {
      none: '0',
      sm: 'var(--radius-1)',
      DEFAULT: 'var(--radius-1)',
      md: 'var(--radius-1)',
      lg: 'var(--radius-2)',
      xl: 'var(--radius-2)',
      '2xl': 'var(--radius-3)',
      '3xl': 'var(--radius-4)',
      full: '9999px',
    },
    // Type scale: body 17-18 px fluid, line-height 1.6.
    fontSize: {
      xs: ['0.8125rem', { lineHeight: '1.25rem' }],
      sm: ['0.9375rem', { lineHeight: '1.5rem' }],
      base: ['var(--text-base)', { lineHeight: '1.6' }],
      lg: ['1.25rem', { lineHeight: '1.7rem' }],
      xl: ['1.5rem', { lineHeight: '2rem' }],
      '2xl': ['1.875rem', { lineHeight: '2.3rem' }],
      '3xl': ['var(--text-3xl)', { lineHeight: '1.1' }],
      '4xl': ['var(--text-4xl)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      '5xl': ['clamp(2.25rem, 1.8rem + 2.4vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
      '6xl': ['clamp(2.5rem, 1.9rem + 3vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      '7xl': ['clamp(2.75rem, 2rem + 4vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
      // Hero headline.
      display: ['var(--text-display)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
    },
    // Layered soft shadows. `shadow` (no suffix) = card.
    boxShadow: {
      none: 'none',
      DEFAULT: 'var(--shadow-card)',
      card: 'var(--shadow-card)',
      lift: 'var(--shadow-lift)',
      overlay: 'var(--shadow-overlay)',
      glow: 'var(--glow)',
    },
    extend: {
      colors: {
        background: channel('bg'),
        bg: channel('bg'),
        surface: { DEFAULT: channel('surface'), 2: channel('surface-2') },
        ink: channel('text'),
        muted: channel('muted'),
        // Hairline: colour + a fixed alpha, so it has no `/NN` modifier.
        line: 'rgb(var(--line) / var(--line-alpha))',
        // Kept as `border` so `border-border` style utilities resolve to the same token.
        border: 'rgb(var(--line) / var(--line-alpha))',
        control: channel('control'),
        accent: {
          DEFAULT: channel('accent'),
          ink: channel('accent-ink'),
          2: channel('accent-2'),
        },
        danger: channel('danger'),
        success: channel('success'),
        warning: channel('warning'),
        scrim: channel('scrim'),
        'on-scrim': channel('on-scrim'),
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        // `display` = heading face (same family as the body).
        display: ['var(--font-display)'],
        serif: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      spacing: {
        section: 'var(--space-section)',
        gutter: 'var(--gutter)',
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      maxWidth: {
        page: '1280px',
        measure: '68ch',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
        slower: 'var(--dur-slower)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease)',
      },
      keyframes: {
        reveal: {
          from: { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
      },
      animation: {
        reveal: 'reveal var(--dur-slower) var(--ease) both',
        'fade-in': 'fade-in var(--dur-slow) var(--ease) both',
        marquee: 'marquee 48s linear infinite',
      },
    },
  },
  plugins: [],
};
