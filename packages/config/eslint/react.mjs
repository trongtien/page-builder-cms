import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginPrettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";
import globals from "globals";

/**
 * React ESLint configuration for TypeScript projects
 * Optimized for React 19 and modern practices
 */
export default tseslint.config(
    // Ignore patterns
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
            "**/coverage/**",
            "**/.next/**",
            "**/out/**",
            "**/routeTree.gen.ts",
            "**/*.gen.ts"
        ]
    },

    // ESLint and TypeScript base configs
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    // React configurations for TypeScript files
    {
        files: ["**/*.{ts,tsx}"],
        ...pluginReact.configs.flat.recommended,
        ...pluginReact.configs.flat["jsx-runtime"],
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.browser,
                ...globals.es2022
            },
            parserOptions: {
                project: true, // Auto-discover tsconfig.json files
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        settings: {
            react: {
                version: "detect"
            }
        }
    },

    // React configurations for JavaScript files
    {
        files: ["**/*.{js,jsx}"],
        ...pluginReact.configs.flat.recommended,
        ...pluginReact.configs.flat["jsx-runtime"],
        languageOptions: {
            ...pluginReact.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.browser,
                ...globals.es2022
            },
            parserOptions: {
                allowDefaultProject: true,
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        settings: {
            react: {
                version: "detect"
            }
        }
    },

    // React Hooks rules
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        plugins: {
            "react-hooks": pluginReactHooks
        },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            "react-hooks/exhaustive-deps": "warn"
        }
    },

    // Accessibility rules
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        plugins: {
            "jsx-a11y": pluginJsxA11y
        },
        rules: {
            ...pluginJsxA11y.configs.recommended.rules
        }
    },

    // Custom rules for React
    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            prettier: pluginPrettier
        },
        rules: {
            // TypeScript + React optimizations
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

            // Disable problematic unsafe rules
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",

            // Async/Await rules
            "no-return-await": "off",
            "@typescript-eslint/return-await": "error",
            "@typescript-eslint/only-throw-error": "off", // Allow TanStack Router redirect()

            // React rules
            "react/prop-types": "off", // TypeScript handles this
            "react/react-in-jsx-scope": "off", // Not needed in React 17+
            "react/jsx-uses-react": "off", // Not needed in React 17+
            "react/jsx-no-target-blank": ["error", { allowReferrer: true }],
            "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],

            // Performance - disable slow rules
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/no-misused-promises": "off",
            "jsx-a11y/no-autofocus": "off",

            // Code quality
            "no-console": ["warn", { allow: ["info", "warn", "error"] }],
            "prefer-const": "error",
            "no-var": "error",

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
