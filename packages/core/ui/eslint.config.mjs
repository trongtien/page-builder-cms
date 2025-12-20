// @ts-nocheck
import reactConfig from "../../config/eslint/react.mts";

/**
 * ESLint configuration for core-ui package
 */
export default [
    ...reactConfig,
    {
        ignores: ["**/*.test.ts", "**/*.test.tsx", "**/vitest.config.ts", "**/vitest.setup.ts"]
    }
];
