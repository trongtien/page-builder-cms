export { DatabaseClient, getDatabaseClient, getKnex, db } from "./postgres/client";
export { DatabaseConfigBuilder, createDatabaseConfig, knexConfig } from "./postgres/config";
export { initKnexFileConfig, createDefaultKnexFileConfig } from "./postgres/knex-file-config";
export { BaseQuery } from "./postgres/base-query";
export {
    TransactionManager,
    withTransaction,
    withTransactionTimeout,
    transactionManager
} from "./postgres/transaction";
export {
    DatabaseHealthMonitor,
    checkDatabaseHealth,
    isDatabaseReady,
    waitForDatabase,
    healthMonitor
} from "./postgres/health";
export type {
    DatabaseConfig,
    KnexConfigOptions,
    KnexFileConfigOptions,
    HealthCheckResult,
    TransactionCallback,
    PaginationOptions,
    PaginationResult,
    QueryOptions,
    WhereCondition,
    InsertData,
    UpdateData,
    BaseModel
} from "./postgres/postgres.type";

// Redis exports
export { RedisClient } from "./redis/client";
export { RedisConfigBuilder } from "./redis/config";
export { checkRedisHealth } from "./redis/health";
export { executePipeline, executeTransaction } from "./redis/pipeline";
export type { RedisConfig, RedisConfigOptions, RedisHealthStatus, IORedisConfig } from "./redis/redis.type";

// Logger exports
export {
    logger,
    createChildLogger,
    persistenceLogger,
    logQuery,
    logTransaction,
    logConnection,
    getLogLevel,
    createLoggerConfig,
    LoggerConfigBuilder
} from "./logger";
export type { LoggerOptions, LoggerConfigOptions } from "./logger";
export type { Knex } from "knex";
