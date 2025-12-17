import type { Config } from "tailwindcss";
import sharedConfig from "@page-builder/config-tailwind";

const config: Config = {
    content: ["./app/**/*.{ts,tsx}", "../core/ui/src/**/*.{ts,tsx}"],
    presets: [sharedConfig],
    theme: {
        extend: {}
    },
    plugins: []
};

export default config;
