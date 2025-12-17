import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({
            routesDirectory: "./src/routes",
            generatedRouteTree: "./src/routeTree.gen.ts",
            quoteStyle: "single"
        }),
        react()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@/components": path.resolve(__dirname, "./src/components"),
            "@/features": path.resolve(__dirname, "./src/features"),
            "@/hooks": path.resolve(__dirname, "./src/hooks"),
            "@/services": path.resolve(__dirname, "./src/services"),
            "@/types": path.resolve(__dirname, "./src/types"),
            "@/routes": path.resolve(__dirname, "./src/routes")
        }
    },
    optimizeDeps: {
        include: ["react", "react-dom", "@tanstack/react-router"],
        exclude: ["@page-builder/core-ui", "@page-builder/core-utils", "@tanstack/router-devtools"],
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
});
