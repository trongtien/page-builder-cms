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
    server: {
        port: 4000,
        open: true
    },
    build: {
        outDir: "dist",
        sourcemap: true
    }
});
