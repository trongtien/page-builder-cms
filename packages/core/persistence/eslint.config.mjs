// @ts-check
import baseConfig from "../../config/eslint/base.mts";

/**
 * ESLint configuration for @page-builder/persistence
 * Extends the shared base configuration for Node.js projects
 */
export default [
    ...baseConfig,
    {
        // Ignore generated files and test files that are not in tsconfig
        ignores: ["src/generated/**", "test/**", "**/*.test.ts"]
    },
    {
        files: ["**/*.{ts,js,mjs}"],
        rules: {
            // Package-specific overrides if needed
        }
    },
    {
        // Logger files use Winston which has some type issues with strict ESLint
        files: ["src/logger/**/*.ts"],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-base-to-string": "off"
        }
    }
];
