import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: { 500: '#004F59', 600: '#052f36', 900: '#031e23' },
        neon: { 300: '#4af8d4' },
        turquoise: { 500: '#00BFB3' },
        ink: { 700: '#0d1f22', 600: '#4a6e74' },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: { sans: ["'Inter'", 'sans-serif'] },
    },
  },
};
export default config;
