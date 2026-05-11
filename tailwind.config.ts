import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { pixel: ['var(--font-pixel)', 'monospace'] },
      boxShadow: { pixel: '6px 6px 0 #171717', pixelSm: '3px 3px 0 #171717' },
    },
  },
  plugins: [],
};

export default config;
