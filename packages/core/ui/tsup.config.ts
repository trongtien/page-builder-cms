import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["react", "react-dom"],
    treeshake: true,
    esbuildOptions(options) {
        options.banner = {
            js: '"use client"'
        };
        // Note: Previously had "@": "./src" alias, but removed after refactoring
        // to relative imports (e.g., "../lib/utils"). This avoids confusion in
        // build contexts where the alias is unused.
    }
});
