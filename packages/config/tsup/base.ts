import { defineConfig, type Options } from "tsup";

/**
 * Base tsup configuration for utility libraries and API types
 *
 * Usage:
 * - For utilities that need both ESM and CJS (e.g., @page-builder/core-utils)
 * - For API types and schemas (e.g., @page-builder/api-types)
 *
 * Features:
 * - Dual format output (ESM + CJS)
 * - TypeScript declaration files
 * - Source maps for debugging
 * - Tree shaking enabled
 * - Clean build directory
 */
export const baseConfig: Options = {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    treeshake: true,
    splitting: false
};

export default defineConfig(baseConfig);
