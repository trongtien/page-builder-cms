import { defineConfig, type Options } from "tsup";

/**
 * React-specific tsup configuration for UI component libraries
 *
 * Usage:
 * - For React component libraries (e.g., @page-builder/core-ui)
 * - For packages that use "use client" directive
 *
 * Features:
 * - ESM format only (modern React apps)
 * - External React dependencies (peer dependencies)
 * - "use client" banner for RSC compatibility
 * - TypeScript declaration files
 * - Source maps for debugging
 * - Tree shaking enabled
 */
export const reactConfig: Options = {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["react", "react-dom"],
    treeshake: true,
    splitting: false,
    esbuildOptions(options) {
        options.banner = {
            js: '"use client"'
        };
    }
};

export default defineConfig(reactConfig);
