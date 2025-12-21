/**
 * @page-builder/persistence
 *
 * Database persistence layer with Prisma and PostgreSQL connection pooling.
 *
 * @example
 * ```typescript
 * // Import the client
 * import { prisma } from '@page-builder/persistence';
 *
 * // Execute queries
 * const users = await prisma.user.findMany();
 *
 * // Use transactions
 * import { withTransaction } from '@page-builder/persistence';
 * await withTransaction(async (tx) => {
 *   await tx.user.create({ data: { email: 'test@example.com' } });
 * });
 *
 * // Health checks
 * import { checkDatabaseHealth } from '@page-builder/persistence';
 * const health = await checkDatabaseHealth();
 * ```
 */

// Export Prisma client singleton
export { prisma, getPrismaClient } from "./postgres/client";

// Export transaction helpers
export { withTransaction, withTransactionTimeout, type TransactionCallback } from "./postgres/transaction";

// Export health check utilities
export { checkDatabaseHealth, isDatabaseReady, waitForDatabase, type HealthCheckResult } from "./postgres/health";

// Export configuration utilities
export { loadConfig, validateConfig, type DatabaseConfig } from "./postgres/config";

// Re-export Prisma Client types for convenience
export { PrismaClient, Prisma } from "./generated/client";

// Re-export all generated types
export type * from "./generated/client";
