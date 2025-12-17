import type { Config } from "tailwindcss";
import sharedConfig from "@page-builder/config-tailwind";

const config: Config = {
    content: ["./src/**/*.{ts,tsx}"],
    presets: [sharedConfig],
    theme: {
        extend: {
            // Additional theme customization for core-ui
        }
    },
    plugins: []
};

export default config;
