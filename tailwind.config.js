/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        base: 'var(--color-bg-base)',
        surface: 'var(--color-bg-surface)',
        accent: 'var(--color-accent)',
        'amber-accent': 'var(--color-amber-accent)',
        'sage-accent': 'var(--color-sage-accent)',
        amber: {
          DEFAULT: 'var(--color-amber-accent)',
          accent: 'var(--color-amber-accent)',
        },
        sage: {
          DEFAULT: 'var(--color-sage-accent)',
          accent: 'var(--color-sage-accent)',
        },
        primary: 'var(--color-primary)',
        text: 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        // Dedicated Venice Blue tinted dark code theme tokens (consistent in both light & dark modes)
        code: {
          bg: '#071826',
          header: '#0B2234',
          border: 'rgba(111, 168, 204, 0.22)',
          text: '#F5EEDD',
          muted: 'rgba(245, 238, 221, 0.7)',
        }
      },
      fontSize: {
        '2xs': '0.6875rem', // 11px
        'xs': '0.75rem',    // 12px
        'sm': '0.8125rem',  // 13px (base body)
        'base': '0.9375rem',// 15px (lead paragraph)
        'lg': '1.0625rem',  // 17px
        'xl': '1.25rem',    // 20px (h3)
        '2xl': '1.5rem',    // 24px (h2)
        '3xl': '2rem',      // 32px (h1)
      },
      lineHeight: {
        body: '1.65',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        command: '0 16px 48px -12px rgba(0, 0, 0, 0.28)',
      }
    },
  },
  plugins: [],
};
