import { DatabaseClient } from "./client";
import { persistenceLogger } from "../logger";
import type { HealthCheckResult } from "./postgres.type";

export class DatabaseHealthMonitor {
    private static instance: DatabaseHealthMonitor;
    private dbClient: DatabaseClient;

    private constructor(dbClient?: DatabaseClient) {
        this.dbClient = dbClient || DatabaseClient.getInstance();
    }

    public static getInstance(dbClient?: DatabaseClient): DatabaseHealthMonitor {
        if (!DatabaseHealthMonitor.instance) {
            DatabaseHealthMonitor.instance = new DatabaseHealthMonitor(dbClient);
        }
        return DatabaseHealthMonitor.instance;
    }

    public async check(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        const timestamp = new Date();

        try {
            const knex = await this.dbClient.getKnex();

            // Simple query to verify connectivity
            await knex.raw("SELECT 1 as result");

            const latency = Date.now() - startTime;
            const connected = this.dbClient.isReady();

            return {
                status: "healthy",
                latency,
                timestamp,
                details: {
                    connected
                }
            };
        } catch (error) {
            const latency = Date.now() - startTime;

            return {
                status: "unhealthy",
                latency,
                timestamp,
                error: error instanceof Error ? error.message : "Unknown error",
                details: {
                    connected: false
                }
            };
        }
    }

    public async isHealthy(): Promise<boolean> {
        const health = await this.check();
        return health.status === "healthy";
    }

    public isReady(): boolean {
        return this.dbClient.isReady();
    }

    public async waitUntilReady(maxRetries = 5, delayMs = 2000): Promise<boolean> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const isHealthy = await this.isHealthy();

            if (isHealthy) {
                if (attempt > 1) {
                    persistenceLogger.connection("connect", {
                        attempts: attempt,
                        message: "Database connection established after retries"
                    });
                }
                return true;
            }

            if (attempt < maxRetries) {
                persistenceLogger.connection("retry", {
                    attempt,
                    maxRetries,
                    delayMs,
                    message: "Database not ready, retrying..."
                });
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }

        persistenceLogger.connection("error", {
            attempts: maxRetries,
            message: "Database connection failed after max retries"
        });
        return false;
    }

    public async getStatus(): Promise<{
        connected: boolean;
        healthy: boolean;
        latency?: number;
        error?: string;
    }> {
        const connected = this.isReady();
        const health = await this.check();

        return {
            connected,
            healthy: health.status === "healthy",
            latency: health.latency,
            error: health.error
        };
    }
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
    return DatabaseHealthMonitor.getInstance().check();
}
export async function isDatabaseReady(): Promise<boolean> {
    return DatabaseHealthMonitor.getInstance().isHealthy();
}
export async function waitForDatabase(maxRetries = 5, delayMs = 2000): Promise<boolean> {
    return DatabaseHealthMonitor.getInstance().waitUntilReady(maxRetries, delayMs);
}
export const healthMonitor = DatabaseHealthMonitor.getInstance();
