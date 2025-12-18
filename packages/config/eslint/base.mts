import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Base ESLint configuration for TypeScript projects
 * Optimized for performance and type safety
 */
const config: ReturnType<typeof tseslint.config> = tseslint.config(
    // Ignore patterns for better performance
    {
        ignores: [
            "**/dist/**",
            "**/node_modules/**",
            "**/build/**",
            "**/.turbo/**",
            "**/*.config.js",
            "**/*.config.cjs",
            "**/*.config.mjs",
            "**/*.config.ts",
            "**/*.config.mts",
            "**/coverage/**",
            "**/.next/**",
            "**/out/**",
            "**/packages/config/tailwind/**",
            "**/packages/config/eslint/**"
        ]
    },

    // ESLint recommended rules
    eslint.configs.recommended,

    // TypeScript recommended rules with performance optimizations
    ...tseslint.configs.recommendedTypeChecked,

    // Custom rules for optimization and best practices
    {
        languageOptions: {
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
            // Performance optimizations
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

            // Code quality
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
            "@typescript-eslint/only-throw-error": "off", // Allow TanStack Router redirect() and other valid non-Error throws

            // Best practices
            "no-console": ["warn", { allow: ["info", "warn", "error"] }],
            "prefer-const": "error",
            "no-var": "error",

            // Disable slow rules for performance
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
