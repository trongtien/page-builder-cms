import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
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

// Aliases for handling @/ imports inside core-ui package source files
const coreUIInternalAliases = [
    { find: "@/lib/utils", replacement: path.resolve(packagesDir, "core", "ui", "src", "lib", "utils") },
    { find: "@/contexts", replacement: path.resolve(packagesDir, "core", "ui", "src", "contexts") }
];

export default defineConfig(({ mode }) => ({
    plugins: [
        TanStackRouterVite({
            routesDirectory: "./app/routes",
            generatedRouteTree: "./app/routeTree.gen.ts",
            quoteStyle: "double"
        }),
        react()
    ],
    resolve: {
        alias: [
            ...(mode === "development" ? developmentAliases : []),
            ...(mode === "development" ? coreUIInternalAliases : []),
            { find: "@", replacement: path.resolve(__dirname, "./app") },
            { find: "~", replacement: path.resolve(__dirname, "./app") }
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
        port: 4000,
        open: true,
        hmr: {
            overlay: true
        },
        watch: {
            ignored: ["!**/node_modules/@page-builder/**"]
        }
    },
    build: {
        outDir: "dist",
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    "react-vendor": ["react", "react-dom"],
                    "router-vendor": ["@tanstack/react-router"],
                    "ui-vendor": ["@page-builder/core-ui"],
                    "utils-vendor": ["@page-builder/core-utils"]
                }
            }
        }
    }
}));
