import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { pixel: ['var(--font-pixel)', 'system-ui', 'sans-serif'], display: ['var(--font-display)', 'var(--font-pixel)', 'system-ui', 'sans-serif'], ui: ['var(--font-ui)', 'var(--font-pixel)', 'system-ui', 'sans-serif'], clean: ['var(--font-clean)', 'var(--font-pixel)', 'system-ui', 'sans-serif'] },
      boxShadow: { pixel: '6px 6px 0 #171717', pixelSm: '3px 3px 0 #171717' },
    },
  },
  plugins: [],
};

export default config;
