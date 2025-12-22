import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LoggerConfigBuilder, createLoggerConfig, getLogLevel, loggerConfig } from "../config";
import type { LoggerConfigOptions } from "../logger.type";
import type winston from "winston";

describe("LoggerConfigBuilder", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        // Reset singleton instance for each test
        // @ts-expect-error - Accessing private property for testing
        LoggerConfigBuilder.instance = undefined;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("constructor", () => {
        it("should create instance with default options", () => {
            const builder = new LoggerConfigBuilder();
            const config = builder.build();

            expect(config).toBeDefined();
            expect(config.defaultMeta).toHaveProperty("service", "@page-builder/persistence");
            expect(config.defaultMeta).toHaveProperty("environment");
        });

        it("should create instance with custom service name", () => {
            const builder = new LoggerConfigBuilder({ serviceName: "@page-builder/api" });
            const config = builder.build();

            expect(config.defaultMeta).toHaveProperty("service", "@page-builder/api");
        });

        it("should create instance with custom level", () => {
            const builder = new LoggerConfigBuilder({ level: "warn" });
            const config = builder.build();

            expect(config.level).toBe("warn");
        });

        it("should create instance with custom default meta", () => {
            const customMeta = { version: "1.0.0", region: "us-east-1" };
            const builder = new LoggerConfigBuilder({ defaultMeta: customMeta });
            const config = builder.build();

            expect(config.defaultMeta).toMatchObject(customMeta);
        });

        it("should create instance with file logging enabled", () => {
            process.env.NODE_ENV = "production";
            const builder = new LoggerConfigBuilder({ enableFileLogging: true });
            const config = builder.build();

            expect(config.transports).toBeDefined();
            expect(Array.isArray(config.transports)).toBe(true);
            expect((config.transports as winston.transport[]).length).toBeGreaterThan(1);
        });

        it("should create instance with custom log directory", () => {
            process.env.NODE_ENV = "production";
            const builder = new LoggerConfigBuilder({
                enableFileLogging: true,
                logDir: "./custom-logs"
            });
            const config = builder.build();

            expect(config.transports).toBeDefined();
        });
    });

    describe("getInstance", () => {
        it("should return singleton instance", () => {
            const instance1 = LoggerConfigBuilder.getInstance();
            const instance2 = LoggerConfigBuilder.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(LoggerConfigBuilder);
        });

        it("should create instance only once", () => {
            const instance1 = LoggerConfigBuilder.getInstance();
            const instance2 = LoggerConfigBuilder.getInstance();
            const instance3 = LoggerConfigBuilder.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
        });
    });

    describe("builder pattern methods", () => {
        it("should chain setServiceName", () => {
            const builder = new LoggerConfigBuilder();
            const result = builder.setServiceName("@page-builder/test");
            const config = result.build();

            expect(result).toBe(builder);
            expect(config.defaultMeta).toHaveProperty("service", "@page-builder/test");
        });

        it("should chain setLevel", () => {
            const builder = new LoggerConfigBuilder();
            const result = builder.setLevel("error");
            const config = result.build();

            expect(result).toBe(builder);
            expect(config.level).toBe("error");
        });

        it("should chain addDefaultMeta", () => {
            const builder = new LoggerConfigBuilder();
            const result = builder.addDefaultMeta({ version: "1.0.0" }).addDefaultMeta({ region: "us-west-2" });
            const config = result.build();

            expect(result).toBe(builder);
            expect(config.defaultMeta).toMatchObject({
                version: "1.0.0",
                region: "us-west-2"
            });
        });

        it("should merge metadata with addDefaultMeta", () => {
            const builder = new LoggerConfigBuilder({ defaultMeta: { foo: "bar" } });
            builder.addDefaultMeta({ baz: "qux" });
            const config = builder.build();

            expect(config.defaultMeta).toMatchObject({
                foo: "bar",
                baz: "qux"
            });
        });

        it("should chain setDefaultMeta", () => {
            const builder = new LoggerConfigBuilder({ defaultMeta: { old: "value" } });
            const result = builder.setDefaultMeta({ new: "value" });
            const config = result.build();

            expect(result).toBe(builder);
            expect(config.defaultMeta).toMatchObject({ new: "value" });
            expect(config.defaultMeta).not.toHaveProperty("old");
        });

        it("should replace metadata with setDefaultMeta", () => {
            const builder = new LoggerConfigBuilder({ defaultMeta: { foo: "bar" } });
            builder.setDefaultMeta({ baz: "qux" });
            const config = builder.build();

            expect(config.defaultMeta).toMatchObject({ baz: "qux" });
            expect(config.defaultMeta).not.toHaveProperty("foo");
        });

        it("should chain enableFileLogging", () => {
            process.env.NODE_ENV = "production";
            const builder = new LoggerConfigBuilder();
            const result = builder.enableFileLogging(true);
            const config = result.build();

            expect(result).toBe(builder);
            expect((config.transports as winston.transport[]).length).toBeGreaterThan(1);
        });

        it("should chain enableFileLogging with false", () => {
            process.env.NODE_ENV = "production";
            const builder = new LoggerConfigBuilder({ enableFileLogging: true });
            const result = builder.enableFileLogging(false);
            const config = result.build();

            expect(result).toBe(builder);
            expect((config.transports as winston.transport[]).length).toBe(1);
        });

        it("should chain setLogDir", () => {
            process.env.NODE_ENV = "production";
            const builder = new LoggerConfigBuilder();
            const result = builder.enableFileLogging(true).setLogDir("./test-logs");

            expect(result).toBe(builder);
        });

        it("should support method chaining", () => {
            process.env.NODE_ENV = "production";
            const config = new LoggerConfigBuilder()
                .setServiceName("@page-builder/chained")
                .setLevel("info")
                .addDefaultMeta({ version: "2.0.0" })
                .enableFileLogging(true)
                .setLogDir("./chained-logs")
                .build();

            expect(config.defaultMeta).toHaveProperty("service", "@page-builder/chained");
            expect(config.level).toBe("info");
            expect(config.defaultMeta).toMatchObject({ version: "2.0.0" });
        });
    });

    describe("build", () => {
        it("should build valid LoggerOptions", () => {
            const builder = new LoggerConfigBuilder();
            const config = builder.build();

            expect(config).toHaveProperty("level");
            expect(config).toHaveProperty("format");
            expect(config).toHaveProperty("defaultMeta");
            expect(config).toHaveProperty("transports");
            expect(config).toHaveProperty("exitOnError", false);
        });

        it("should include console transport", () => {
            const builder = new LoggerConfigBuilder();
            const config = builder.build();

            expect(config.transports).toBeDefined();
            expect(Array.isArray(config.transports)).toBe(true);
            expect((config.transports as winston.transport[]).length).toBeGreaterThanOrEqual(1);
        });

        it("should include file transports in production when enabled", () => {
            process.env.NODE_ENV = "production";
            const builder = new LoggerConfigBuilder({ enableFileLogging: true });
            const config = builder.build();

            expect((config.transports as winston.transport[]).length).toBe(3); // console + error + combined
        });

        it("should not include file transports in development", () => {
            process.env.NODE_ENV = "development";
            const builder = new LoggerConfigBuilder({ enableFileLogging: true });
            const config = builder.build();

            expect((config.transports as winston.transport[]).length).toBe(1); // console only
        });

        it("should not include file transports when disabled", () => {
            process.env.NODE_ENV = "production";
            const builder = new LoggerConfigBuilder({ enableFileLogging: false });
            const config = builder.build();

            expect((config.transports as winston.transport[]).length).toBe(1); // console only
        });

        it("should include environment in defaultMeta", () => {
            process.env.NODE_ENV = "test";
            const builder = new LoggerConfigBuilder();
            const config = builder.build();

            expect(config.defaultMeta).toHaveProperty("environment", "test");
        });

        it("should default to development environment when NODE_ENV not set", () => {
            delete process.env.NODE_ENV;
            const builder = new LoggerConfigBuilder();
            const config = builder.build();

            expect(config.defaultMeta).toHaveProperty("environment", "development");
        });
    });

    describe("getLogLevel", () => {
        it("should return LOG_LEVEL from environment if set", () => {
            process.env.LOG_LEVEL = "warn";
            const level = LoggerConfigBuilder.getLogLevel();

            expect(level).toBe("warn");
        });

        it("should return info in production without LOG_LEVEL", () => {
            delete process.env.LOG_LEVEL;
            process.env.NODE_ENV = "production";
            const level = LoggerConfigBuilder.getLogLevel();

            expect(level).toBe("info");
        });

        it("should return debug in development without LOG_LEVEL", () => {
            delete process.env.LOG_LEVEL;
            process.env.NODE_ENV = "development";
            const level = LoggerConfigBuilder.getLogLevel();

            expect(level).toBe("debug");
        });

        it("should return debug when NODE_ENV not set", () => {
            delete process.env.LOG_LEVEL;
            delete process.env.NODE_ENV;
            const level = LoggerConfigBuilder.getLogLevel();

            expect(level).toBe("debug");
        });
    });

    describe("createLoggerConfig function", () => {
        it("should create config with default options", () => {
            const config = createLoggerConfig();

            expect(config).toBeDefined();
            expect(config).toHaveProperty("level");
            expect(config).toHaveProperty("transports");
        });

        it("should create config with custom options", () => {
            const config = createLoggerConfig({
                serviceName: "@page-builder/functional",
                level: "error"
            });

            expect(config.defaultMeta).toHaveProperty("service", "@page-builder/functional");
            expect(config.level).toBe("error");
        });

        it("should be equivalent to using builder", () => {
            const options: LoggerConfigOptions = {
                serviceName: "@page-builder/test",
                level: "warn"
            };

            const configFromFunction = createLoggerConfig(options);
            const configFromBuilder = new LoggerConfigBuilder(options).build();

            expect(configFromFunction.level).toBe(configFromBuilder.level);
            expect(configFromFunction.defaultMeta).toEqual(configFromBuilder.defaultMeta);
        });
    });

    describe("getLogLevel utility function", () => {
        it("should return current log level", () => {
            process.env.LOG_LEVEL = "debug";
            const level = getLogLevel();

            expect(level).toBe("debug");
        });

        it("should delegate to LoggerConfigBuilder.getLogLevel", () => {
            process.env.NODE_ENV = "production";
            delete process.env.LOG_LEVEL;

            const level = getLogLevel();

            expect(level).toBe(LoggerConfigBuilder.getLogLevel());
        });
    });

    describe("loggerConfig default export", () => {
        it("should be a valid LoggerOptions object", () => {
            expect(loggerConfig).toBeDefined();
            expect(loggerConfig).toHaveProperty("level");
            expect(loggerConfig).toHaveProperty("format");
            expect(loggerConfig).toHaveProperty("defaultMeta");
            expect(loggerConfig).toHaveProperty("transports");
        });

        it("should use default service name", () => {
            expect(loggerConfig.defaultMeta).toHaveProperty("service", "@page-builder/persistence");
        });
    });

    describe("environment variable handling", () => {
        it("should respect LOG_TO_FILE environment variable", () => {
            process.env.NODE_ENV = "production";
            process.env.LOG_TO_FILE = "true";
            const builder = new LoggerConfigBuilder();
            const config = builder.build();

            expect((config.transports as winston.transport[]).length).toBe(3);
        });

        it("should respect LOG_DIR environment variable", () => {
            process.env.NODE_ENV = "production";
            process.env.LOG_DIR = "/var/log/app";
            const builder = new LoggerConfigBuilder({ enableFileLogging: true });
            const config = builder.build();

            expect(config.transports).toBeDefined();
        });

        it("should use default log directory when LOG_DIR not set", () => {
            process.env.NODE_ENV = "production";
            delete process.env.LOG_DIR;
            const builder = new LoggerConfigBuilder({ enableFileLogging: true });
            const config = builder.build();

            expect(config.transports).toBeDefined();
        });
    });
});
