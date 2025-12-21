/**
 * Transaction Helper
 *
 * Provides a convenient wrapper around Prisma's interactive transactions
 * with automatic error handling and rollback.
 *
 * Usage:
 * ```typescript
 * import { withTransaction } from '@page-builder/persistence';
 *
 * const result = await withTransaction(async (tx) => {
 *   const user = await tx.user.create({ data: { email: 'test@example.com' } });
 *   await tx.profile.create({ data: { userId: user.id } });
 *   return user;
 * });
 * ```
 */

import type { PrismaClient } from "../generated/client";
import { prisma } from "./client";
import { persistenceLogger } from "../logger";

/**
 * Callback function type for transaction operations
 */
export type TransactionCallback<T> = (tx: PrismaClient) => Promise<T>;

/**
 * Execute a callback within a Prisma transaction
 *
 * Automatically rolls back if the callback throws an error.
 * All database operations within the callback must use the `tx` parameter.
 *
 * @param callback - Async function that receives a transaction client
 * @returns The result of the callback
 * @throws The error from the callback if transaction fails
 */
export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
    try {
        return await prisma.$transaction(async (tx) => {
            return callback(tx as PrismaClient);
        });
    } catch (error) {
        // Log error for debugging
        persistenceLogger.transaction("rollback", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });

        // Re-throw to allow caller to handle
        throw error;
    }
}

/**
 * Execute a callback within a Prisma transaction with custom timeout
 *
 * @param callback - Async function that receives a transaction client
 * @param timeout - Maximum time in milliseconds for the transaction
 * @returns The result of the callback
 * @throws The error from the callback if transaction fails or times out
 */
export async function withTransactionTimeout<T>(callback: TransactionCallback<T>, timeout: number): Promise<T> {
    try {
        return await prisma.$transaction(
            async (tx) => {
                return callback(tx as PrismaClient);
            },
            {
                timeout
            }
        );
    } catch (error) {
        // Log error for debugging
        persistenceLogger.transaction("rollback", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            timeout
        });

        throw error;
    }
}
