/**
 * Logger Instance
 *
 * Provides a configured Winston logger instance for use throughout the persistence layer
 * Supports structured logging with context and metadata
 */

import winston from "winston";
import { loggerConfig } from "./config";

/**
 * Singleton logger instance
 * Use this for all logging throughout the persistence package
 */
export const logger = winston.createLogger(loggerConfig);

/**
 * Create a child logger with additional context
 *
 * Useful for adding module-specific or request-specific metadata
 *
 * @example
 * ```typescript
 * const dbLogger = createChildLogger({ module: 'database' });
 * dbLogger.info('Connection established');
 * ```
 *
 * @param metadata - Additional metadata to include in all log messages
 * @returns Child logger with additional context
 */
export function createChildLogger(metadata: Record<string, unknown>): winston.Logger {
    return logger.child(metadata);
}

/**
 * Log database query with metadata
 *
 * @param query - SQL query or description
 * @param metadata - Additional query metadata (duration, params, etc.)
 */
export function logQuery(query: string, metadata?: Record<string, unknown>): void {
    logger.debug("Database query", {
        query,
        ...metadata,
        type: "query"
    });
}

/**
 * Log database transaction
 *
 * @param action - Transaction action (start, commit, rollback)
 * @param metadata - Additional transaction metadata
 */
export function logTransaction(action: "start" | "commit" | "rollback", metadata?: Record<string, unknown>): void {
    logger.debug(`Transaction ${action}`, {
        action,
        ...metadata,
        type: "transaction"
    });
}

/**
 * Log database connection event
 *
 * @param event - Connection event (connect, disconnect, error)
 * @param metadata - Additional connection metadata
 */
export function logConnection(
    event: "connect" | "disconnect" | "error" | "retry",
    metadata?: Record<string, unknown>
): void {
    const level = event === "error" ? "error" : "info";
    logger.log(level, `Database ${event}`, {
        event,
        ...metadata,
        type: "connection"
    });
}

/**
 * Type-safe logging interface
 * Provides convenient methods for common logging patterns
 */
export const persistenceLogger = {
    query: logQuery,
    transaction: logTransaction,
    connection: logConnection,
    info: (message: string, meta?: Record<string, unknown>) => logger.info(message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta),
    error: (message: string, meta?: Record<string, unknown>) => logger.error(message, meta),
    debug: (message: string, meta?: Record<string, unknown>) => logger.debug(message, meta)
};
