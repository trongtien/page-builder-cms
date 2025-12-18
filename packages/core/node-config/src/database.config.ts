import type { ValidationError } from "./node-config.type";
import { ConfigValidationError } from "./validate-error";

/**
 * Database configuration interface
 * Single file handles all database-related configuration
 */
export interface DatabaseConfig {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
    url: string; // Full connection URL (constructed or from env)
}

/**
 * Load and validate database configuration
 * Handles both individual fields and full URL
 */
export function loadDatabaseConfig(env: Record<string, string | undefined>): DatabaseConfig {
    const errors: ValidationError[] = [];

    // Validate host
    const host = env.DATABASE_HOST?.trim();
    if (!host) {
        errors.push({ field: "DATABASE_HOST", message: "Database host is required" });
    }

    // Validate port with default
    const portStr = env.DATABASE_PORT || "5432";
    const port = parseInt(portStr, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
        errors.push({
            field: "DATABASE_PORT",
            message: `Database port must be between 1 and 65535, got: ${portStr}`
        });
    }

    // Validate database name
    const name = env.DATABASE_NAME?.trim();
    if (!name) {
        errors.push({ field: "DATABASE_NAME", message: "Database name is required" });
    }

    // Validate username
    const username = env.DATABASE_USERNAME?.trim();
    if (!username) {
        errors.push({ field: "DATABASE_USERNAME", message: "Database username is required" });
    }

    // Validate password
    const password = env.DATABASE_PASSWORD;
    if (!password) {
        errors.push({ field: "DATABASE_PASSWORD", message: "Database password is required" });
    }

    // Parse SSL with default false
    const ssl = env.DATABASE_SSL?.toLowerCase() === "true";

    // Throw if validation errors exist
    if (errors.length > 0) {
        throw new ConfigValidationError("Database configuration invalid", errors, env);
    }

    // Build connection URL if not provided
    let url = env.DATABASE_URL;
    if (!url) {
        const protocol = ssl ? "postgresql" : "postgres";
        url = `${protocol}://${username}:${password}@${host}:${port}/${name}`;
        if (ssl) {
            url += "?sslmode=require";
        }
    }

    return {
        host: host!,
        port,
        name: name!,
        username: username!,
        password: password!,
        ssl,
        url
    };
}

/**
 * Database configuration singleton
 * Loads configuration on first access
 */
let cachedDatabaseConfig: DatabaseConfig | null = null;

export function getDatabaseConfig(): DatabaseConfig {
    if (!cachedDatabaseConfig) {
        cachedDatabaseConfig = loadDatabaseConfig(process.env);
    }
    return cachedDatabaseConfig;
}

/**
 * Reset cached configuration (useful for testing)
 */
export function resetDatabaseConfig(): void {
    cachedDatabaseConfig = null;
}
