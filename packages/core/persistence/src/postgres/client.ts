import knex, { type Knex } from "knex";
import { DatabaseConfigBuilder } from "./config";
import type { KnexConfigOptions } from "./postgres.type";
import { persistenceLogger } from "../logger";

export class DatabaseClient {
    private static instance: DatabaseClient;
    private knexInstance: Knex | null = null;
    private configBuilder: DatabaseConfigBuilder;
    private isConnected = false;

    private constructor(options: KnexConfigOptions = {}) {
        this.configBuilder = new DatabaseConfigBuilder(options);
        this.setupGracefulShutdown();
    }

    public static getInstance(options?: KnexConfigOptions): DatabaseClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new DatabaseClient(options);
        }
        return DatabaseClient.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected && this.knexInstance) {
            persistenceLogger.connection("connect", { message: "Already connected" });
            return;
        }

        try {
            const config = this.configBuilder.build();
            this.knexInstance = knex(config);

            // Test connection
            await this.knexInstance.raw("SELECT 1");

            this.isConnected = true;
            persistenceLogger.connection("connect", {
                host:
                    typeof config.connection === "object" && "host" in config.connection
                        ? String(config.connection.host)
                        : "unknown",
                database:
                    typeof config.connection === "object" && "database" in config.connection
                        ? String(config.connection.database)
                        : "unknown",
                message: "Database connection established"
            });
        } catch (error) {
            this.isConnected = false;
            persistenceLogger.connection("error", {
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }

    /**
     * Get Knex instance
     * Automatically connects if not connected
     */
    public async getKnex(): Promise<Knex> {
        if (!this.knexInstance || !this.isConnected) {
            await this.connect();
        }

        if (!this.knexInstance) {
            throw new Error("Failed to initialize database connection");
        }

        return this.knexInstance;
    }

    /**
     * Get Knex instance synchronously (assumes already connected)
     */
    public getKnexSync(): Knex {
        if (!this.knexInstance) {
            throw new Error("Database not connected. Call connect() first or use getKnex()");
        }
        return this.knexInstance;
    }

    /**
     * Get database connection from pool
     */
    public async getConnection(): Promise<Knex.Transaction> {
        const knexInstance = await this.getKnex();
        return knexInstance.transaction();
    }

    /**
     * Disconnect from database
     */
    public async disconnect(): Promise<void> {
        if (this.knexInstance && this.isConnected) {
            try {
                await this.knexInstance.destroy();
                this.isConnected = false;
                persistenceLogger.connection("disconnect", { message: "Database connection closed" });
            } catch (error) {
                persistenceLogger.connection("error", {
                    error: error instanceof Error ? error.message : "Disconnect error",
                    message: "Error during disconnect"
                });
                throw error;
            } finally {
                this.knexInstance = null;
            }
        }
    }

    /**
     * Check if connected
     */
    public isReady(): boolean {
        return this.isConnected && this.knexInstance !== null;
    }

    /**
     * Get configuration builder
     */
    public getConfigBuilder(): DatabaseConfigBuilder {
        return this.configBuilder;
    }

    /**
     * Execute raw query
     */
    public async raw<T = unknown>(query: string, bindings?: readonly unknown[]): Promise<T> {
        const knexInstance = await this.getKnex();

        if (bindings) {
            const result = await knexInstance.raw<{ rows?: T }>(query, [...bindings]);
            return (result.rows || result) as T;
        }

        const result = await knexInstance.raw<{ rows?: T }>(query);
        return (result.rows || result) as T;
    }

    /**
     * Setup graceful shutdown handlers
     */
    private setupGracefulShutdown(): void {
        const cleanup = async () => {
            try {
                await this.disconnect();
                persistenceLogger.connection("disconnect", { reason: "graceful-shutdown" });
            } catch (error) {
                persistenceLogger.error("Cleanup error", {
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }
        };

        process.on("SIGINT", cleanup);
        process.on("SIGTERM", cleanup);
        process.on("beforeExit", cleanup);
    }

    public static async resetInstance(): Promise<void> {
        if (DatabaseClient.instance) {
            await DatabaseClient.instance.disconnect();
            // @ts-expect-error - Resetting singleton for testing
            DatabaseClient.instance = null;
        }
    }
}

export function getDatabaseClient(options?: KnexConfigOptions): DatabaseClient {
    return DatabaseClient.getInstance(options);
}
export async function getKnex(options?: KnexConfigOptions): Promise<Knex> {
    const client = DatabaseClient.getInstance(options);
    return client.getKnex();
}
export const db = DatabaseClient.getInstance();
