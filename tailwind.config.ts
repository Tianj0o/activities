import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      backgroundColor: {
        b: 'var(--color-bg-base)',
        'carnation': {
          '50': '#fef2f2',
          '100': '#fee2e2',
          '200': '#fecaca',
          '300': '#fca5a5',
          '400': '#f87171',
          '500': '#ef4444',
          '600': '#dc2626',
          '700': '#b91c1c',
          '800': '#991b1b',
          '900': '#7f1d1d',
          '950': '#450a0a',
        },
      },
      textColor: {
        b: 'var(--color-text-base)',
        p: 'var(--color-primary)'
      },
      fontFamily: {
        'abel': ['Abel', 'sans-serif'],
        "oswald": ['Oswald', 'sans-serif']
      }
    }
  },
  safelist: [
    { pattern: /^bg-carnation-/, variants: ['hover', 'focus'] }
  ],
  plugins: []
} as Config;
