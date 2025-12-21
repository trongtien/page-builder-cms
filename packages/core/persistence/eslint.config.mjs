// @ts-check
import nodeConfig from "@page-builder/config-eslint/node.mts";

/**
 * ESLint configuration for @page-builder/persistence
 * Extends the shared Node.js configuration
 */
export default [
    ...nodeConfig,
    {
        files: ["**/*.{ts,js,mjs}"],
        rules: {
            // Package-specific overrides if needed
        }
    }
];
