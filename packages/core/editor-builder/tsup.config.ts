import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["react", "react-dom", "@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
    treeshake: true,
    esbuildOptions(options) {
        options.banner = {
            js: '"use client"'
        };
    }
});
