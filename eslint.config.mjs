// @ts-nocheck
import baseConfig from '@page-builder/config-eslint/base';

/**
 * Root ESLint configuration using flat config format
 * This extends the base config from @page-builder/config-eslint
 */
export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    rules: {
      // Add any project-specific rule overrides here
    },
  },
];
