import Redis from "ioredis";
import { RedisConfigBuilder } from "./config";
import type { RedisConfigOptions } from "./redis.type";
import { persistenceLogger } from "../logger";

export class RedisClient {
    private static instance: RedisClient;
    private redisInstance: Redis | null = null;
    private configBuilder: RedisConfigBuilder;
    private isConnected = false;

    private constructor(options: RedisConfigOptions = {}) {
        this.configBuilder = new RedisConfigBuilder(options);
        this.setupGracefulShutdown();
    }

    public static getInstance(options?: RedisConfigOptions): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient(options);
        }
        return RedisClient.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected && this.redisInstance) {
            persistenceLogger.connection("connect", { message: "Already connected" });
            return;
        }

        try {
            const config = this.configBuilder.buildIORedisConfig();
            this.redisInstance = new Redis(config);

            this.redisInstance.on("connect", () => {
                this.isConnected = true;
                persistenceLogger.connection("connect", {
                    host: config.host,
                    port: config.port,
                    db: config.db,
                    message: "Redis connection established"
                });
            });

            this.redisInstance.on("error", (error: Error) => {
                this.isConnected = false;
                persistenceLogger.error("redis-error", {
                    error: error.message,
                    message: "Redis connection error"
                });
            });

            this.redisInstance.on("close", () => {
                this.isConnected = false;
                persistenceLogger.connection("disconnect", {
                    message: "Redis connection closed"
                });
            });

            this.redisInstance.on("reconnecting", () => {
                persistenceLogger.connection("retry", {
                    message: "Attempting to reconnect to Redis"
                });
            });

            // Test connection
            await this.redisInstance.ping();
            this.isConnected = true;
        } catch (error) {
            this.isConnected = false;
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            persistenceLogger.error("redis-connection-failed", {
                error: errorMessage,
                connectionString: this.configBuilder.getConnectionString()
            });
            throw new Error(`Failed to connect to Redis: ${errorMessage}`);
        }
    }

    /**
     * Disconnect from Redis server
     */
    public async disconnect(): Promise<void> {
        if (!this.redisInstance) {
            return;
        }

        try {
            await this.redisInstance.quit();
            this.redisInstance = null;
            this.isConnected = false;
            persistenceLogger.connection("disconnect", {
                message: "Redis connection closed gracefully"
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            persistenceLogger.error("redis-disconnect-failed", {
                error: errorMessage
            });
            throw new Error(`Failed to disconnect from Redis: ${errorMessage}`);
        }
    }

    /**
     * Check if connected to Redis
     */
    public isRedisConnected(): boolean {
        return this.isConnected && this.redisInstance !== null;
    }

    /**
     * Get the underlying Redis client instance
     */
    public getClient(): Redis {
        if (!this.redisInstance) {
            throw new Error("Redis client not initialized. Call connect() first.");
        }
        return this.redisInstance;
    }

    /**
     * Convenience method: GET key
     */
    public async get(key: string): Promise<string | null> {
        try {
            const client = this.getClient();
            return await client.get(key);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            persistenceLogger.error("redis-get-failed", { key, error: errorMessage });
            throw error;
        }
    }

    /**
     * Convenience method: SET key value with optional TTL
     */
    public async set(key: string, value: string, ttl?: number): Promise<void> {
        try {
            const client = this.getClient();
            if (ttl) {
                await client.setex(key, ttl, value);
            } else {
                await client.set(key, value);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            persistenceLogger.error("redis-set-failed", { key, error: errorMessage });
            throw error;
        }
    }

    /**
     * Convenience method: DELETE key
     */
    public async del(key: string): Promise<void> {
        try {
            const client = this.getClient();
            await client.del(key);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            persistenceLogger.error("redis-del-failed", { key, error: errorMessage });
            throw error;
        }
    }

    /**
     * Convenience method: EXISTS key
     */
    public async exists(key: string): Promise<boolean> {
        try {
            const client = this.getClient();
            const result = await client.exists(key);
            return result === 1;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            persistenceLogger.error("redis-exists-failed", { key, error: errorMessage });
            throw error;
        }
    }

    /**
     * Create a pipeline for batch operations
     */
    public pipeline() {
        const client = this.getClient();
        return client.pipeline();
    }

    /**
     * Setup graceful shutdown handlers
     */
    private setupGracefulShutdown(): void {
        const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
        signals.forEach((signal) => {
            process.on(signal, async () => {
                persistenceLogger.connection("disconnect", {
                    signal,
                    message: `Received ${signal}, closing Redis connection`
                });
                await this.disconnect();
                process.exit(0);
            });
        });
    }
}
