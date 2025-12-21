import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";
import type { EnvLoaderOptions, EnvLoaderResult } from "./types";

/**
 * Load environment variables from a file using dotenv
 *
 * @param options - Configuration options for loading
 * @returns Result object with loading status and details
 *
 * @example
 * // Load from default .env file
 * loadEnv();
 *
 * @example
 * // Load from custom path
 * loadEnv({ path: './config/.env.production' });
 *
 * @example
 * // Require file to exist
 * loadEnv({ path: '.env.local', required: true });
 */
export function loadEnv(options: EnvLoaderOptions = {}): EnvLoaderResult {
    const { path: envPath = ".env", override = false, required = false, encoding = "utf8" } = options;

    // Resolve to absolute path
    const absolutePath = resolve(process.cwd(), envPath);

    // Check file existence
    if (!existsSync(absolutePath)) {
        const errorMessage = required
            ? `Required environment file not found: ${absolutePath}`
            : `Environment file not found: ${absolutePath}`;

        return {
            success: false,
            path: absolutePath,
            error: errorMessage
        };
    }

    // Load with dotenv
    try {
        const result = config({
            path: absolutePath,
            override,
            encoding
        });

        if (result.error) {
            return {
                success: false,
                path: absolutePath,
                error: result.error.message
            };
        }

        return {
            success: true,
            path: absolutePath,
            parsed: result.parsed || {}
        };
    } catch (error) {
        return {
            success: false,
            path: absolutePath,
            error: error instanceof Error ? error.message : "Unknown error occurred while loading environment file"
        };
    }
}

/**
 * Load environment variables from a file, throwing if it fails
 *
 * @param options - Configuration options for loading
 * @throws {Error} If the file cannot be loaded
 *
 * @example
 * // Will throw if file doesn't exist
 * loadEnvOrThrow({ path: '.env.production' });
 */
export function loadEnvOrThrow(options?: EnvLoaderOptions): void {
    const result = loadEnv(options);

    if (!result.success) {
        throw new Error(`Failed to load environment file: ${result.error}`);
    }
}
