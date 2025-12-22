import { prisma } from "./client";
import { persistenceLogger } from "../logger";

export interface HealthCheckResult {
    status: "healthy" | "unhealthy";
    latency: number;
    timestamp: Date;
    error?: string;
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timestamp = new Date();

    try {
        // Simple query to verify connectivity
        // Using $queryRaw for lightweight check
        await prisma.$queryRaw`SELECT 1 as result`;

        const latency = Date.now() - startTime;

        return {
            status: "healthy",
            latency,
            timestamp
        };
    } catch (error) {
        const latency = Date.now() - startTime;

        return {
            status: "unhealthy",
            latency,
            timestamp,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

export async function isDatabaseReady(): Promise<boolean> {
    const health = await checkDatabaseHealth();
    return health.status === "healthy";
}

export async function waitForDatabase(maxRetries = 5, delayMs = 2000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const isReady = await isDatabaseReady();

        if (isReady) {
            if (attempt > 1) {
                persistenceLogger.connection("connect", {
                    attempts: attempt,
                    message: "Database connection established"
                });
            }
            return true;
        }

        if (attempt < maxRetries) {
            persistenceLogger.connection("retry", {
                attempt,
                maxRetries,
                delayMs,
                message: "Database not ready, retrying"
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
