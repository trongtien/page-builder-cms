import type { Knex } from "knex";
import type { DatabaseConfig, KnexConfigOptions } from "./postgres.type";

/**
 * Database Configuration Builder
 * Creates Knex configuration with customizable options
 */
export class DatabaseConfigBuilder {
    private static instance: DatabaseConfigBuilder;

    private host: string;
    private port: number;
    private database: string;
    private user: string;
    private password: string;
    private ssl: boolean | { rejectUnauthorized: boolean };
    private poolMin: number;
    private poolMax: number;
    private idleTimeout: number;
    private acquireTimeout: number;
    private debug: boolean;
    private migrationsDir: string;
    private seedsDir: string;

    constructor(options: KnexConfigOptions = {}) {
        const config = options.config || {};

        this.host = config.host || process.env.DB_HOST || "localhost";
        this.port = config.port || Number(process.env.DB_PORT) || 5432;
        this.database = options.database || config.database || process.env.DB_NAME || "postgres";
        this.user = config.user || process.env.DB_USER || "postgres";
        this.password = config.password || process.env.DB_PASSWORD || "";
        this.ssl = config.ssl ?? (process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false);
        this.poolMin = config.pool?.min || Number(process.env.DB_POOL_MIN) || 2;
        this.poolMax = config.pool?.max || Number(process.env.DB_POOL_MAX) || 10;
        this.idleTimeout = config.pool?.idleTimeoutMillis || Number(process.env.DB_IDLE_TIMEOUT) || 30000;
        this.acquireTimeout = config.pool?.acquireTimeoutMillis || Number(process.env.DB_ACQUIRE_TIMEOUT) || 60000;
        this.debug = options.debug ?? process.env.NODE_ENV === "development";
        this.migrationsDir = options.migrationsDir || "./migrations";
        this.seedsDir = options.seedsDir || "./seeds";
    }

    /**
     * Get singleton instance
     */
    public static getInstance(options?: KnexConfigOptions): DatabaseConfigBuilder {
        if (!DatabaseConfigBuilder.instance) {
            DatabaseConfigBuilder.instance = new DatabaseConfigBuilder(options);
        }
        return DatabaseConfigBuilder.instance;
    }

    public setHost(host: string): this {
        this.host = host;
        return this;
    }

    public setPort(port: number): this {
        this.port = port;
        return this;
    }

    public setDatabase(database: string): this {
        this.database = database;
        return this;
    }

    public setUser(user: string): this {
        this.user = user;
        return this;
    }

    public setPassword(password: string): this {
        this.password = password;
        return this;
    }

    public setSSL(ssl: boolean | { rejectUnauthorized: boolean }): this {
        this.ssl = ssl;
        return this;
    }

    public setPoolConfig(min: number, max: number): this {
        this.poolMin = min;
        this.poolMax = max;
        return this;
    }

    public setDebug(debug: boolean): this {
        this.debug = debug;
        return this;
    }

    public setMigrationsDir(dir: string): this {
        this.migrationsDir = dir;
        return this;
    }

    public setSeedsDir(dir: string): this {
        this.seedsDir = dir;
        return this;
    }

    /**
     * Build Knex configuration object
     */
    public build(): Knex.Config {
        return {
            client: "pg",
            connection: {
                host: this.host,
                port: this.port,
                database: this.database,
                user: this.user,
                password: this.password,
                ssl: this.ssl
            },
            pool: {
                min: this.poolMin,
                max: this.poolMax,
                idleTimeoutMillis: this.idleTimeout,
                acquireTimeoutMillis: this.acquireTimeout
            },
            migrations: {
                directory: this.migrationsDir,
                tableName: "knex_migrations",
                extension: "ts",
                loadExtensions: [".ts"]
            },
            seeds: {
                directory: this.seedsDir,
                extension: "ts",
                loadExtensions: [".ts"]
            },
            debug: this.debug,
            acquireConnectionTimeout: this.acquireTimeout
        };
    }

    /**
     * Get database configuration without pool and migrations settings
     */
    public getDatabaseConfig(): DatabaseConfig {
        return {
            host: this.host,
            port: this.port,
            database: this.database,
            user: this.user,
            password: this.password,
            ssl: this.ssl,
            pool: {
                min: this.poolMin,
                max: this.poolMax,
                idleTimeoutMillis: this.idleTimeout,
                acquireTimeoutMillis: this.acquireTimeout
            }
        };
    }

    /**
     * Get connection string
     */
    public getConnectionString(): string {
        const auth = `${this.user}:${this.password}`;
        const sslParam = this.ssl ? "?ssl=true" : "";
        return `postgresql://${auth}@${this.host}:${this.port}/${this.database}${sslParam}`;
    }
}

/**
 * Create Knex configuration (functional approach)
 */
export function createDatabaseConfig(options: KnexConfigOptions = {}): Knex.Config {
    return new DatabaseConfigBuilder(options).build();
}

/**
 * Default Knex configuration
 */
export const knexConfig: Knex.Config = new DatabaseConfigBuilder().build();
