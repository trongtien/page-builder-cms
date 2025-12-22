import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { logger, createChildLogger, logQuery, logTransaction, logConnection, persistenceLogger } from "../logger";
import winston from "winston";

describe("logger", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        // Spy on logger methods
        vi.spyOn(logger, "info").mockImplementation(() => logger);
        vi.spyOn(logger, "warn").mockImplementation(() => logger);
        vi.spyOn(logger, "error").mockImplementation(() => logger);
        vi.spyOn(logger, "debug").mockImplementation(() => logger);
        vi.spyOn(logger, "log").mockImplementation(() => logger);
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    describe("logger instance", () => {
        it("should be a winston logger instance", () => {
            expect(logger).toBeDefined();
            expect(typeof logger.info).toBe("function");
            expect(typeof logger.error).toBe("function");
            expect(typeof logger.warn).toBe("function");
            expect(typeof logger.debug).toBe("function");
        });

        it("should have correct configuration", () => {
            expect(logger).toHaveProperty("level");
            expect(logger).toHaveProperty("format");
            expect(logger).toHaveProperty("transports");
        });
    });

    describe("createChildLogger", () => {
        it("should create a child logger with metadata", () => {
            const metadata = { module: "database", operation: "query" };
            const childLogger = createChildLogger(metadata);

            expect(childLogger).toBeDefined();
            expect(childLogger).toBeInstanceOf(winston.Logger);
        });

        it("should create child logger with custom metadata", () => {
            const metadata = {
                userId: "user-123",
                requestId: "req-456",
                correlationId: "corr-789"
            };
            const childLogger = createChildLogger(metadata);

            expect(childLogger).toBeDefined();
        });

        it("should create child logger with empty metadata", () => {
            const childLogger = createChildLogger({});

            expect(childLogger).toBeDefined();
        });

        it("should create multiple independent child loggers", () => {
            const child1 = createChildLogger({ module: "auth" });
            const child2 = createChildLogger({ module: "api" });

            expect(child1).not.toBe(child2);
            expect(child1).toBeInstanceOf(winston.Logger);
            expect(child2).toBeInstanceOf(winston.Logger);
        });
    });

    describe("logQuery", () => {
        it("should log database query with message and query", () => {
            const query = "SELECT * FROM users WHERE id = 1";

            logQuery(query);

            expect(logger.debug).toHaveBeenCalledWith(
                "Database query",
                expect.objectContaining({
                    query,
                    type: "query"
                })
            );
        });

        it("should log query with additional metadata", () => {
            const query = "INSERT INTO users (name) VALUES ('John')";
            const metadata = { duration: 150, rowsAffected: 1 };

            logQuery(query, metadata);

            expect(logger.debug).toHaveBeenCalledWith(
                "Database query",
                expect.objectContaining({
                    query,
                    type: "query",
                    ...metadata
                })
            );
        });

        it("should log query without metadata", () => {
            const query = "UPDATE users SET status = 'active'";

            logQuery(query);

            expect(logger.debug).toHaveBeenCalledWith(
                "Database query",
                expect.objectContaining({
                    query,
                    type: "query"
                })
            );
        });

        it("should handle complex queries", () => {
            const query = `
                SELECT u.id, u.name, p.title
                FROM users u
                LEFT JOIN posts p ON u.id = p.user_id
                WHERE u.status = 'active'
                ORDER BY u.created_at DESC
            `;
            const metadata = { database: "main", duration: 250 };

            logQuery(query, metadata);

            expect(logger.debug).toHaveBeenCalledWith(
                "Database query",
                expect.objectContaining({
                    query,
                    type: "query",
                    database: "main",
                    duration: 250
                })
            );
        });
    });

    describe("logTransaction", () => {
        it("should log transaction start", () => {
            logTransaction("start");

            expect(logger.debug).toHaveBeenCalledWith(
                "Transaction start",
                expect.objectContaining({
                    action: "start",
                    type: "transaction"
                })
            );
        });

        it("should log transaction commit", () => {
            logTransaction("commit");

            expect(logger.debug).toHaveBeenCalledWith(
                "Transaction commit",
                expect.objectContaining({
                    action: "commit",
                    type: "transaction"
                })
            );
        });

        it("should log transaction rollback", () => {
            logTransaction("rollback");

            expect(logger.debug).toHaveBeenCalledWith(
                "Transaction rollback",
                expect.objectContaining({
                    action: "rollback",
                    type: "transaction"
                })
            );
        });

        it("should log transaction with additional metadata", () => {
            const metadata = { transactionId: "tx-123", duration: 500 };

            logTransaction("commit", metadata);

            expect(logger.debug).toHaveBeenCalledWith(
                "Transaction commit",
                expect.objectContaining({
                    action: "commit",
                    type: "transaction",
                    ...metadata
                })
            );
        });

        it("should log transaction with error metadata", () => {
            const metadata = { error: "Constraint violation", errorCode: "23505" };

            logTransaction("rollback", metadata);

            expect(logger.debug).toHaveBeenCalledWith(
                "Transaction rollback",
                expect.objectContaining({
                    action: "rollback",
                    type: "transaction",
                    ...metadata
                })
            );
        });
    });

    describe("logConnection", () => {
        it("should log connection event with info level", () => {
            logConnection("connect");

            expect(logger.log).toHaveBeenCalledWith(
                "info",
                "Database connect",
                expect.objectContaining({
                    event: "connect",
                    type: "connection"
                })
            );
        });

        it("should log disconnect event with info level", () => {
            logConnection("disconnect");

            expect(logger.log).toHaveBeenCalledWith(
                "info",
                "Database disconnect",
                expect.objectContaining({
                    event: "disconnect",
                    type: "connection"
                })
            );
        });

        it("should log error event with error level", () => {
            logConnection("error");

            expect(logger.log).toHaveBeenCalledWith(
                "error",
                "Database error",
                expect.objectContaining({
                    event: "error",
                    type: "connection"
                })
            );
        });

        it("should log retry event with info level", () => {
            logConnection("retry");

            expect(logger.log).toHaveBeenCalledWith(
                "info",
                "Database retry",
                expect.objectContaining({
                    event: "retry",
                    type: "connection"
                })
            );
        });

        it("should log connection with additional metadata", () => {
            const metadata = { host: "localhost", port: 5432, database: "testdb" };

            logConnection("connect", metadata);

            expect(logger.log).toHaveBeenCalledWith(
                "info",
                "Database connect",
                expect.objectContaining({
                    event: "connect",
                    type: "connection",
                    ...metadata
                })
            );
        });

        it("should log connection error with error details", () => {
            const metadata = {
                error: "Connection timeout",
                code: "ETIMEDOUT",
                attempts: 3
            };

            logConnection("error", metadata);

            expect(logger.log).toHaveBeenCalledWith(
                "error",
                "Database error",
                expect.objectContaining({
                    event: "error",
                    type: "connection",
                    ...metadata
                })
            );
        });
    });

    describe("persistenceLogger", () => {
        it("should have all required methods", () => {
            expect(persistenceLogger).toHaveProperty("query");
            expect(persistenceLogger).toHaveProperty("transaction");
            expect(persistenceLogger).toHaveProperty("connection");
            expect(persistenceLogger).toHaveProperty("info");
            expect(persistenceLogger).toHaveProperty("warn");
            expect(persistenceLogger).toHaveProperty("error");
            expect(persistenceLogger).toHaveProperty("debug");
        });

        it("should call logQuery through query method", () => {
            const query = "SELECT 1";
            persistenceLogger.query(query);

            expect(logger.debug).toHaveBeenCalledWith(
                "Database query",
                expect.objectContaining({ query, type: "query" })
            );
        });

        it("should call logTransaction through transaction method", () => {
            persistenceLogger.transaction("start");

            expect(logger.debug).toHaveBeenCalledWith(
                "Transaction start",
                expect.objectContaining({ action: "start", type: "transaction" })
            );
        });

        it("should call logConnection through connection method", () => {
            persistenceLogger.connection("connect");

            expect(logger.log).toHaveBeenCalledWith(
                "info",
                "Database connect",
                expect.objectContaining({ event: "connect", type: "connection" })
            );
        });

        it("should log info messages", () => {
            const message = "Info message";
            const meta = { data: "test" };

            persistenceLogger.info(message, meta);

            expect(logger.info).toHaveBeenCalledWith(message, meta);
        });

        it("should log warn messages", () => {
            const message = "Warning message";
            const meta = { severity: "medium" };

            persistenceLogger.warn(message, meta);

            expect(logger.warn).toHaveBeenCalledWith(message, meta);
        });

        it("should log error messages", () => {
            const message = "Error message";
            const meta = { error: "Critical failure" };

            persistenceLogger.error(message, meta);

            expect(logger.error).toHaveBeenCalledWith(message, meta);
        });

        it("should log debug messages", () => {
            const message = "Debug message";
            const meta = { trace: "stack-trace" };

            persistenceLogger.debug(message, meta);

            expect(logger.debug).toHaveBeenCalledWith(message, meta);
        });

        it("should log without metadata", () => {
            persistenceLogger.info("Simple message");
            persistenceLogger.warn("Warning");
            persistenceLogger.error("Error");
            persistenceLogger.debug("Debug");

            expect(logger.info).toHaveBeenCalledWith("Simple message", undefined);
            expect(logger.warn).toHaveBeenCalledWith("Warning", undefined);
            expect(logger.error).toHaveBeenCalledWith("Error", undefined);
            expect(logger.debug).toHaveBeenCalledWith("Debug", undefined);
        });
    });

    describe("integration scenarios", () => {
        it("should handle complete database operation flow", () => {
            // Connection
            persistenceLogger.connection("connect", { host: "localhost" });

            // Transaction
            persistenceLogger.transaction("start", { transactionId: "tx-1" });

            // Query
            persistenceLogger.query("SELECT * FROM users", { duration: 50 });

            // Commit
            persistenceLogger.transaction("commit", { transactionId: "tx-1" });

            expect(logger.log).toHaveBeenCalledTimes(1);
            expect(logger.debug).toHaveBeenCalledTimes(3); // transaction start + query + transaction commit
        });

        it("should handle error scenario", () => {
            persistenceLogger.connection("connect");
            persistenceLogger.transaction("start");
            persistenceLogger.query("INVALID SQL");
            persistenceLogger.error("Query failed", { error: "Syntax error" });
            persistenceLogger.transaction("rollback", { reason: "Query error" });

            expect(logger.error).toHaveBeenCalled();
            expect(logger.debug).toHaveBeenCalledTimes(3); // transaction start + query + transaction rollback
        });

        it("should handle retry scenario", () => {
            persistenceLogger.connection("connect");
            persistenceLogger.connection("error", { attempt: 1 });
            persistenceLogger.connection("retry", { attempt: 2 });
            persistenceLogger.connection("connect", { success: true });

            expect(logger.log).toHaveBeenCalledTimes(4);
        });
    });
});
