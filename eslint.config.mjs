// @ts-nocheck
import baseConfig from "./packages/config/eslint/base.mts";

/**
 * Root ESLint configuration using flat config format
 * This extends the base config from @page-builder/config-eslint
 */
export default [
    ...baseConfig,
    {
        files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
        rules: {
            // Add any project-specific rule overrides here
        }
    },
    {
        files: ["packages/core/node-config/test/**/*.ts"],
        rules: {
            // Disable unsafe type rules for test files
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-assignment": "off"
        }
    }
];
