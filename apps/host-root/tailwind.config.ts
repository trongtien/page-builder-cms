import type { Config } from "tailwindcss";
import sharedConfig from "@page-builder/config-tailwind";

const config: Config = {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}",
        // Include core-ui components for hot reload
        "../../packages/core/ui/src/**/*.{ts,tsx}"
    ],
    presets: [sharedConfig],
    theme: {
        extend: {
            // Additional theme customization for host-root
        }
    },
    plugins: []
};

export default config;
