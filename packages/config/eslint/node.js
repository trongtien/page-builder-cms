// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * Node.js ESLint configuration for TypeScript projects
 * Optimized for backend and build tools
 */
export default tseslint.config(
  // Ignore patterns
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/build/**', '**/.turbo/**', '**/coverage/**'],
  },

  // ESLint and TypeScript base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Node.js specific configuration
  {
    files: ['**/*.{ts,js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript optimizations
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // Node.js specific
      'no-console': 'off', // Console is normal in Node.js
      'no-process-exit': 'warn',

      // Code quality
      'prefer-const': 'error',
      'no-var': 'error',

      // Performance - disable slow rules
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  }
);
