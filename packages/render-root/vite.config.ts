import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
    plugins: [
        TanStackRouterVite({
            routesDirectory: "./app/routes",
            generatedRouteTree: "./app/routeTree.gen.ts",
            quoteStyle: "double"
        }),
        react()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./app"),
            "~": path.resolve(__dirname, "./app")
        }
    },
    optimizeDeps: {
        include: ["react", "react-dom", "@tanstack/react-router"],
        exclude: ["@page-builder/core-ui", "@page-builder/core-utils", "@tanstack/router-devtools"],
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
});
