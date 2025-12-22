/**
 * @page-builder/persistence - Postgres module
 * Exports all postgres-related functionality
 */

// Client and connection
export { createPostgresClient, closePostgresClient, getClient } from "./client";
export type { PostgresClient } from "./postgres.type";

// Configuration
export { knexConfig, getDatabaseConfig } from "./config";

// Knex file configuration helper
export { initKnexFileConfig, createDefaultKnexFileConfig } from "./knex-file-config";
export type { KnexFileConfigOptions } from "./knex-file-config";

// Base Query
export { BaseQuery } from "./base-query";

// Transaction management
export { withTransaction, beginTransaction, commitTransaction, rollbackTransaction } from "./transaction";

// Health checks
export { checkDatabaseHealth, checkDatabaseConnection } from "./health";
