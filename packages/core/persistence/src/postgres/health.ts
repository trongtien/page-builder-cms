/**
 * Database Health Check Module
 *
 * Provides utilities to verify database connectivity and measure latency.
 * Useful for health check endpoints and monitoring systems.
 *
 * Usage:
 * ```typescript
 * import { checkDatabaseHealth } from '@page-builder/persistence';
 *
 * const health = await checkDatabaseHealth();
 * if (health.status === 'unhealthy') {
 *   console.error('Database issue:', health.error);
 * }
 * ```
 */

import { prisma } from "./client";

export interface HealthCheckResult {
    /** Health status of the database connection */
    status: "healthy" | "unhealthy";
    /** Query latency in milliseconds */
    latency: number;
    /** Timestamp when the check was performed */
    timestamp: Date;
    /** Error message if unhealthy */
    error?: string;
}

/**
 * Check database connectivity and measure latency
 *
 * Executes a simple query to verify the database is accessible.
 * Returns detailed health information including latency metrics.
 *
 * @returns Health check result with status and latency
 */
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

/**
 * Check if database connection is ready
 *
 * Simple boolean check for database availability.
 * Useful for startup validation and circuit breakers.
 *
 * @returns true if database is healthy, false otherwise
 */
export async function isDatabaseReady(): Promise<boolean> {
    const health = await checkDatabaseHealth();
    return health.status === "healthy";
}

/**
 * Wait for database to become available with retries
 *
 * Useful during application startup to ensure database is ready
 * before accepting requests.
 *
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 * @param delayMs - Delay between retries in milliseconds (default: 2000)
 * @returns true if database became available, false if max retries exceeded
 */
export async function waitForDatabase(maxRetries = 5, delayMs = 2000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const isReady = await isDatabaseReady();

        if (isReady) {
            if (attempt > 1) {
                console.log(`Database connection established after ${attempt} attempts`);
            }
            return true;
        }

        if (attempt < maxRetries) {
            console.log(`Database not ready (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    console.error(`Database connection failed after ${maxRetries} attempts`);
    return false;
}
