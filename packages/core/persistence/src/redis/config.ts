import type { RedisConfig, RedisConfigOptions, IORedisConfig } from "./redis.type";

/**
 * Redis Configuration Builder
 * Creates Redis configuration with customizable options
 */
export class RedisConfigBuilder {
    private static instance: RedisConfigBuilder;

    private host: string;
    private port: number;
    private password?: string;
    private db: number;
    private family: 4 | 6;
    private tls: boolean;
    private keyPrefix?: string;
    private maxRetriesPerRequest: number;
    private enableReadyCheck: boolean;
    private enableOfflineQueue: boolean;
    private debug: boolean;

    constructor(options: RedisConfigOptions = {}) {
        const config = options.config || {};

        this.host = config.host ?? (process.env.REDIS_HOST || "localhost");
        this.port = config.port ?? (Number(process.env.REDIS_PORT) || 6379);
        this.password = config.password ?? (process.env.REDIS_PASSWORD || undefined);
        this.db = config.db ?? (Number(process.env.REDIS_DB) || 0);
        this.family = (config.family as 4 | 6) ?? 4;
        this.tls = config.tls ?? process.env.REDIS_TLS === "true";
        this.keyPrefix = config.keyPrefix ?? (process.env.REDIS_KEY_PREFIX || undefined);
        this.maxRetriesPerRequest = config.maxRetriesPerRequest ?? 3;
        this.enableReadyCheck = config.enableReadyCheck ?? true;
        this.enableOfflineQueue = config.enableOfflineQueue ?? true;
        this.debug = options.debug ?? process.env.NODE_ENV === "development";
    }

    /**
     * Get singleton instance
     */
    public static getInstance(options?: RedisConfigOptions): RedisConfigBuilder {
        if (!RedisConfigBuilder.instance) {
            RedisConfigBuilder.instance = new RedisConfigBuilder(options);
        }
        return RedisConfigBuilder.instance;
    }

    /**
     * Set Redis host
     */
    public setHost(host: string): this {
        this.host = host;
        return this;
    }

    /**
     * Set Redis port
     */
    public setPort(port: number): this {
        if (port < 1 || port > 65535) {
            throw new Error(`Invalid port number: ${port}. Must be between 1 and 65535.`);
        }
        this.port = port;
        return this;
    }

    /**
     * Set Redis password
     */
    public setPassword(password: string): this {
        this.password = password;
        return this;
    }

    /**
     * Set Redis database index
     */
    public setDatabase(db: number): this {
        if (db < 0 || db > 15) {
            throw new Error(`Invalid database index: ${db}. Must be between 0 and 15.`);
        }
        this.db = db;
        return this;
    }

    /**
     * Set TLS/SSL enabled
     */
    public setTLS(enabled: boolean): this {
        this.tls = enabled;
        return this;
    }

    /**
     * Set key prefix
     */
    public setKeyPrefix(prefix: string): this {
        this.keyPrefix = prefix;
        return this;
    }

    /**
     * Build Redis configuration
     */
    public build(): RedisConfig {
        if (!this.validate()) {
            throw new Error("Invalid Redis configuration");
        }

        return {
            host: this.host,
            port: this.port,
            password: this.password,
            db: this.db,
            family: this.family,
            tls: this.tls,
            keyPrefix: this.keyPrefix,
            maxRetriesPerRequest: this.maxRetriesPerRequest,
            enableReadyCheck: this.enableReadyCheck,
            enableOfflineQueue: this.enableOfflineQueue,
            retryStrategy: (times: number): number => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        };
    }

    /**
     * Build ioredis-compatible configuration
     */
    public buildIORedisConfig(): IORedisConfig {
        const config = this.build();

        return {
            host: config.host,
            port: config.port,
            password: config.password,
            db: config.db,
            family: config.family,
            keyPrefix: config.keyPrefix,
            maxRetriesPerRequest: config.maxRetriesPerRequest,
            enableReadyCheck: config.enableReadyCheck,
            enableOfflineQueue: config.enableOfflineQueue,
            retryStrategy: config.retryStrategy,
            ...(config.tls
                ? {
                      tls: {
                          rejectUnauthorized: process.env.NODE_ENV === "production"
                      }
                  }
                : {})
        };
    }

    /**
     * Validate configuration
     */
    public validate(): boolean {
        if (!this.host || this.host.trim() === "") {
            return false;
        }

        if (this.port < 1 || this.port > 65535) {
            return false;
        }

        if (this.db < 0 || this.db > 15) {
            return false;
        }

        return true;
    }

    /**
     * Get connection string (for logging, without password)
     */
    public getConnectionString(): string {
        const protocol = this.tls ? "rediss" : "redis";
        return `${protocol}://${this.host}:${this.port}/${this.db}`;
    }
}
