import winston from "winston";
import { loggerConfig } from "./config";

export const logger = winston.createLogger(loggerConfig);

export function createChildLogger(metadata: Record<string, unknown>): winston.Logger {
    return logger.child(metadata);
}

export function logQuery(query: string, metadata?: Record<string, unknown>): void {
    logger.debug("Database query", {
        query,
        ...metadata,
        type: "query"
    });
}

export function logTransaction(action: "start" | "commit" | "rollback", metadata?: Record<string, unknown>): void {
    logger.debug(`Transaction ${action}`, {
        action,
        ...metadata,
        type: "transaction"
    });
}

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

export const persistenceLogger = {
    query: logQuery,
    transaction: logTransaction,
    connection: logConnection,
    info: (message: string, meta?: Record<string, unknown>) => logger.info(message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta),
    error: (message: string, meta?: Record<string, unknown>) => logger.error(message, meta),
    debug: (message: string, meta?: Record<string, unknown>) => logger.debug(message, meta)
};
