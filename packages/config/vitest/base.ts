import { defineConfig } from "vitest/config";

/**
 * Base Vitest configuration for utility libraries and Node.js packages
 *
 * Usage:
 * - For utility libraries (e.g., @page-builder/core-utils)
 * - For API types and schemas (e.g., @page-builder/api-types)
 * - For Node.js packages without React
 *
 * Features:
 * - Node environment
 * - Global test APIs
 * - Coverage reporting
 */
export const baseConfig = {
    test: {
        globals: true,
        environment: "node" as const,
        coverage: {
            provider: "v8" as const,
            reporter: ["text", "json", "html"],
            exclude: ["node_modules/", "dist/", "**/*.config.ts", "**/*.config.js", "**/*.d.ts", "**/index.ts"]
        }
    }
};

export default defineConfig(baseConfig);
