import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * React-specific Vitest configuration for UI component libraries
 *
 * Usage:
 * - For React component libraries (e.g., @page-builder/core-ui)
 * - For packages that test React components
 *
 * Features:
 * - jsdom environment (browser-like)
 * - React plugin for JSX/TSX support
 * - Global test APIs
 * - CSS support
 * - Coverage reporting
 *
 * Setup:
 * Create a vitest.setup.ts in your package root with:
 * ```typescript
 * import "@testing-library/jest-dom/vitest";
 * ```
 */
export const reactConfig = {
    plugins: [react()],
    test: {
        globals: true,
        environment: "jsdom" as const,
        setupFiles: ["./vitest.setup.ts"],
        css: true,
        coverage: {
            provider: "v8" as const,
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/",
                "dist/",
                "**/*.config.ts",
                "**/*.config.js",
                "**/*.d.ts",
                "**/index.ts",
                "**/*.stories.tsx",
                "**/*.test.tsx",
                "**/*.test.ts"
            ]
        }
    }
};

export default defineConfig(reactConfig);
