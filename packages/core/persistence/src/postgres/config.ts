/**
 * Database Configuration Module
 *
 * Loads and validates database connection configuration from environment variables.
 * Provides sensible defaults for connection pooling and timeouts.
 */

export interface DatabaseConfig {
    databaseUrl: string;
    connectionTimeout: number;
    poolTimeout: number;
    maxConnections: number;
    minConnections: number;
}

/**
 * Load database configuration from environment variables
 *
 * @throws {Error} If DATABASE_URL is not set or invalid
 */
export function loadConfig(): DatabaseConfig {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error(
            "DATABASE_URL environment variable is required. " +
                "Please set it in your .env file. " +
                'Example: DATABASE_URL="postgresql://user:password@localhost:5432/dbname"'
        );
    }

    const config: DatabaseConfig = {
        databaseUrl,
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT ?? "30000", 10),
        poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT ?? "30000", 10),
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS ?? "10", 10),
        minConnections: parseInt(process.env.DB_MIN_CONNECTIONS ?? "2", 10)
    };

    validateConfig(config);

    return config;
}

/**
 * Validate database configuration
 *
 * @throws {Error} If configuration is invalid
 */
export function validateConfig(config: DatabaseConfig): void {
    if (!config.databaseUrl.startsWith("postgresql://") && !config.databaseUrl.startsWith("postgres://")) {
        throw new Error(
            "DATABASE_URL must be a valid PostgreSQL connection string. " +
                "Expected format: postgresql://user:password@host:port/database"
        );
    }

    if (config.maxConnections < config.minConnections) {
        throw new Error(
            `DB_MAX_CONNECTIONS (${config.maxConnections}) must be >= ` +
                `DB_MIN_CONNECTIONS (${config.minConnections})`
        );
    }

    if (config.minConnections < 0) {
        throw new Error(`DB_MIN_CONNECTIONS must be >= 0, got ${config.minConnections}`);
    }

    if (config.connectionTimeout < 0) {
        throw new Error(`DB_CONNECTION_TIMEOUT must be >= 0, got ${config.connectionTimeout}`);
    }

    if (config.poolTimeout < 0) {
        throw new Error(`DB_POOL_TIMEOUT must be >= 0, got ${config.poolTimeout}`);
    }
}
