import { defineConfig, mergeConfig } from "vitest/config";
import { reactConfig } from "@page-builder/config-vitest/react";
import path from "path";

export default mergeConfig(
    reactConfig,
    defineConfig({
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src")
            }
        }
    })
);
