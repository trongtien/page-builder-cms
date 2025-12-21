/**
 * Prisma Client Singleton
 *
 * Provides a single shared instance of PrismaClient for the entire application.
 * Handles connection pooling, logging, and graceful shutdown automatically.
 *
 * Usage:
 * ```typescript
 * import { prisma } from '@page-builder/persistence';
 * const users = await prisma.user.findMany();
 * ```
 */

import { PrismaClient } from "../generated/client";

let prismaInstance: PrismaClient | null = null;

/**
 * Get or create the Prisma client singleton instance
 */
export function getPrismaClient(): PrismaClient {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient({
            log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"]
        });

        // Graceful shutdown handlers
        const cleanup = async () => {
            if (prismaInstance) {
                await prismaInstance.$disconnect();
                prismaInstance = null;
                console.log("Database connection closed");
            }
        };

        process.on("SIGINT", cleanup);
        process.on("SIGTERM", cleanup);
        process.on("beforeExit", cleanup);
    }

    return prismaInstance;
}

/**
 * Shared Prisma client instance
 * Use this for all database operations
 */
export const prisma = getPrismaClient();
