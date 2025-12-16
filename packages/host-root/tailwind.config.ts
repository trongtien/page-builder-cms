import type { Config } from 'tailwindcss';
import uiConfig from '@page-builder/core-ui/tailwind.config';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    // Include core-ui components for hot reload
    '../core/ui/src/**/*.{ts,tsx}',
  ],
  presets: [uiConfig],
  theme: {
    extend: {
      // Additional theme customization for host-root
    },
  },
  plugins: [],
};

export default config;
