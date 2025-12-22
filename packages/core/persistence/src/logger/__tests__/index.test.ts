import { describe, it, expect } from "vitest";
import * as loggerExports from "../index";

describe("logger module exports", () => {
    describe("functions", () => {
        it("should export logger", () => {
            expect(loggerExports.logger).toBeDefined();
            expect(typeof loggerExports.logger.info).toBe("function");
        });

        it("should export createChildLogger", () => {
            expect(loggerExports.createChildLogger).toBeDefined();
            expect(typeof loggerExports.createChildLogger).toBe("function");
        });

        it("should export persistenceLogger", () => {
            expect(loggerExports.persistenceLogger).toBeDefined();
            expect(typeof loggerExports.persistenceLogger.info).toBe("function");
        });

        it("should export logQuery", () => {
            expect(loggerExports.logQuery).toBeDefined();
            expect(typeof loggerExports.logQuery).toBe("function");
        });

        it("should export logTransaction", () => {
            expect(loggerExports.logTransaction).toBeDefined();
            expect(typeof loggerExports.logTransaction).toBe("function");
        });

        it("should export logConnection", () => {
            expect(loggerExports.logConnection).toBeDefined();
            expect(typeof loggerExports.logConnection).toBe("function");
        });
    });

    describe("config exports", () => {
        it("should export loggerConfig", () => {
            expect(loggerExports.loggerConfig).toBeDefined();
            expect(loggerExports.loggerConfig).toHaveProperty("level");
            expect(loggerExports.loggerConfig).toHaveProperty("format");
        });

        it("should export getLogLevel", () => {
            expect(loggerExports.getLogLevel).toBeDefined();
            expect(typeof loggerExports.getLogLevel).toBe("function");
        });

        it("should export createLoggerConfig", () => {
            expect(loggerExports.createLoggerConfig).toBeDefined();
            expect(typeof loggerExports.createLoggerConfig).toBe("function");
        });

        it("should export LoggerConfigBuilder", () => {
            expect(loggerExports.LoggerConfigBuilder).toBeDefined();
            expect(typeof loggerExports.LoggerConfigBuilder).toBe("function");
        });
    });

    describe("usage examples", () => {
        it("should create child logger from exported function", () => {
            const childLogger = loggerExports.createChildLogger({ module: "test" });
            expect(childLogger).toBeDefined();
        });

        it("should create config using exported builder", () => {
            const config = new loggerExports.LoggerConfigBuilder({
                serviceName: "@page-builder/test"
            }).build();

            expect(config).toBeDefined();
            expect(config.defaultMeta).toHaveProperty("service", "@page-builder/test");
        });

        it("should create config using exported function", () => {
            const config = loggerExports.createLoggerConfig({
                serviceName: "@page-builder/test",
                level: "info"
            });

            expect(config).toBeDefined();
            expect(config.level).toBe("info");
        });

        it("should use persistence logger methods", () => {
            expect(() => {
                loggerExports.persistenceLogger.query("SELECT 1");
                loggerExports.persistenceLogger.transaction("start");
                loggerExports.persistenceLogger.connection("connect");
            }).not.toThrow();
        });
    });

    describe("complete module interface", () => {
        it("should export all expected members", () => {
            const expectedExports = [
                // Logger functions
                "logger",
                "createChildLogger",
                "persistenceLogger",
                "logQuery",
                "logTransaction",
                "logConnection",
                // Config
                "loggerConfig",
                "getLogLevel",
                "createLoggerConfig",
                "LoggerConfigBuilder"
            ];

            expectedExports.forEach((exportName) => {
                expect(loggerExports).toHaveProperty(exportName);
            });
        });

        it("should have correct export count", () => {
            const exportKeys = Object.keys(loggerExports);
            expect(exportKeys.length).toBeGreaterThanOrEqual(10);
        });
    });
});
