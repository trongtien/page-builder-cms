import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

const packagesDir = path.resolve(__dirname, "..");

const developmentAliases = [
    // Exact match for @page-builder/core-ui root
    {
        find: "@page-builder/core-ui",
        replacement: path.resolve(packagesDir, "core", "ui", "src")
    },
    // Subpath for @page-builder/core-ui/*
    {
        find: /^@page-builder\/core-ui\/(.+)$/,
        replacement: path.resolve(packagesDir, "core", "ui", "src", "$1")
    },
    // Exact match for @page-builder/core-utils root
    {
        find: "@page-builder/core-utils",
        replacement: path.resolve(packagesDir, "core", "utils", "src")
    },
    // Subpath for @page-builder/core-utils/*
    {
        find: /^@page-builder\/core-utils\/(.+)$/,
        replacement: path.resolve(packagesDir, "core", "utils", "src", "$1")
    }
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        tanstackRouter({
            routesDirectory: "./src/routes",
            generatedRouteTree: "./src/routeTree.gen.ts",
            quoteStyle: "single"
        }),
        react()
    ],
    resolve: {
        alias: [
            ...(mode === "development" ? developmentAliases : []),
            { find: "@", replacement: path.resolve(__dirname, "./src") },
            { find: "@/components", replacement: path.resolve(__dirname, "./src/components") },
            { find: "@/features", replacement: path.resolve(__dirname, "./src/features") },
            { find: "@/hooks", replacement: path.resolve(__dirname, "./src/hooks") },
            { find: "@/services", replacement: path.resolve(__dirname, "./src/services") },
            { find: "@/types", replacement: path.resolve(__dirname, "./src/types") },
            { find: "@/routes", replacement: path.resolve(__dirname, "./src/routes") }
        ],
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
    },
    optimizeDeps: {
        include: ["react", "react-dom", "@tanstack/react-router"],
        exclude:
            mode === "development"
                ? ["@tanstack/router-devtools"]
                : ["@page-builder/core-ui", "@page-builder/core-utils", "@tanstack/router-devtools"],
        force: true
    },
    server: {
        port: 3000,
        open: true,
        hmr: {
            overlay: true
        },
        watch: {
            ignored: ["!**/node_modules/@page-builder/**"]
        }
    },
    build: {
        target: "esnext",
        minify: "terser",
        cssMinify: "lightningcss",
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ["console.log", "console.info", "console.debug"]
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    "react-vendor": ["react", "react-dom"],
                    "router-vendor": ["@tanstack/react-router"],
                    "ui-vendor": ["@page-builder/core-ui"],
                    "utils-vendor": ["@page-builder/core-utils"]
                }
            }
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false,
        reportCompressedSize: false
    },
    css: {
        postcss: "./postcss.config.js"
    },
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" },
        legalComments: "none",
        treeShaking: true
    }
}));
