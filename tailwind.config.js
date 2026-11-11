/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        subtle: 'var(--bg-subtle)',
        'border-subtle': 'var(--border-subtle)',
        'border-hover': 'var(--border-hover)',
        heading: 'var(--text-heading)',
        body: 'var(--text-body)',
        muted: 'var(--text-muted)',
        dim: 'var(--text-dim)',
        brand: {
          DEFAULT: 'var(--brand-teal)',
          hover: 'var(--brand-teal-hover)',
          text: 'var(--brand-teal-text)',
          subtle: 'var(--brand-teal-subtle)',
        },
        status: {
          error: 'var(--color-status-error)',
          success: 'var(--color-status-success)',
          warning: 'var(--color-status-warning)',
        },
        dh: {
          bg: 'var(--dh-bg)',
          surface: 'var(--dh-surface)',
          'surface-alt': 'var(--dh-surface-alt)',
          border: 'var(--dh-border)',
          text: 'var(--dh-text)',
          muted: 'var(--dh-text-muted)',
          primary: {
            DEFAULT: 'var(--dh-primary)',
            hover: 'var(--dh-primary-hover)',
            contrast: 'var(--dh-primary-contrast)',
          },
          highlight: 'var(--dh-highlight)',
          'tag-bg': 'var(--dh-tag-bg)',
          'tag-text': 'var(--dh-tag-text)',
          'brand-navy': 'var(--dh-brand-navy)',
        },
      },
      backgroundImage: {
        'gradient-brand': 'var(--dh-gradient-brand)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
