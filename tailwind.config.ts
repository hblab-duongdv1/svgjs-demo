export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy
        surface: '#fbf8ff',
        'surface-dim': '#dbd9e2',
        'surface-container-low': '#f4f2fc',
        'surface-container-lowest': '#ffffff',
        'surface-container': '#efedf6',
        'surface-container-high': '#e9e7f0',
        'surface-container-highest': '#e3e1ea',
        'surface-tint': '#4955b3',

        // Foreground/on-* tokens
        'on-surface': '#1a1b22',
        'on-surface-variant': '#454652',

        // Primary actions
        primary: '#2b3896',
        'primary-container': '#4551af',

        // Secondary/chips
        'secondary-container': '#c9cffd',
        'on-secondary-container': '#51577f',

        // Error + tertiary (warnings)
        error: '#ba1a1a',
        tertiary: '#6c3400',

        // Extra tokens used by the demo HTML (kept for exact fidelity)
        'error-container': '#ffdad6',
        'on-primary-container': '#cbcfff',
        'on-secondary-container': '#51577f',
        outline: '#757684',
        'outline-variant': '#c5c5d4',
        background: '#fbf8ff',
        'on-background': '#1a1b22',
        'on-error-container': '#93000a',
      },

      // Typography: editorial authority
      fontFamily: {
        display: ['Manrope'],
        headline: ['Manrope'],
        title: ['Inter'],
        body: ['Inter'],
        label: ['Inter'],
      },

      fontSize: {
        // display-lg: 3.5rem with tighter tracking
        'display-lg': ['3.5rem', { letterSpacing: '-0.02em' }],
        // body-sm: 0.75rem
        'body-sm': ['0.75rem', { lineHeight: '1rem' }],
      },

      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },

      // Absolute rule: ambient shadow only (no default Tailwind shadows for floating elements).
      boxShadow: {
        ambient: '0 24px 48px -12px rgba(26, 27, 34, 0.08)',
      },
    },
  },
};
