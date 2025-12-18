// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";
import globals from "globals";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Node.js ESLint configuration for TypeScript projects
 * Optimized for backend and build tools
 */
const config: ReturnType<typeof tseslint.config> = tseslint.config(
    // Ignore patterns
    {
        ignores: ["**/dist/**", "**/node_modules/**", "**/build/**", "**/.turbo/**", "**/coverage/**"]
    },

    // ESLint and TypeScript base configs
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    // Node.js specific configuration
    {
        files: ["**/*.{ts,js,mjs,cjs}"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2022
            },
            parserOptions: {
                projectService: {
                    allowDefaultProject: []
                },
                tsconfigRootDir: __dirname
            }
        },
        plugins: {
            prettier: pluginPrettier
        },
        rules: {
            // TypeScript optimizations
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    fixStyle: "inline-type-imports"
                }
            ],
            "@typescript-eslint/no-import-type-side-effects": "error",

            // Async/Await rules
            "no-return-await": "off",
            "@typescript-eslint/return-await": "error",

            // Node.js specific
            "no-console": "off", // Console is normal in Node.js
            "no-process-exit": "warn",

            // Code quality
            "prefer-const": "error",
            "no-var": "error",

            // Performance - disable slow rules
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-misused-promises": "off",

            // Prettier integration
            "prettier/prettier": [
                "warn",
                {
                    printWidth: 120,
                    useTabs: false,
                    tabWidth: 4,
                    trailingComma: "none",
                    semi: true,
                    singleQuote: false,
                    bracketSpacing: true,
                    arrowParens: "always",
                    jsxSingleQuote: false,
                    bracketSameLine: false,
                    endOfLine: "lf"
                }
            ]
        }
    },

    // Prettier config to disable conflicting rules
    configPrettier
);

export default config;
