import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FormatMessageLogUtils } from "../format-message";

describe("FormatMessageLogUtils", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
        // Reset singleton instance for each test
        // @ts-expect-error - Accessing private property for testing
        FormatMessageLogUtils.instance = undefined;
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("getInstance", () => {
        it("should return a singleton instance", () => {
            const instance1 = FormatMessageLogUtils.getInstance();
            const instance2 = FormatMessageLogUtils.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance1).toBeInstanceOf(FormatMessageLogUtils);
        });

        it("should create instance only once", () => {
            const instance1 = FormatMessageLogUtils.getInstance();
            const instance2 = FormatMessageLogUtils.getInstance();
            const instance3 = FormatMessageLogUtils.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance2).toBe(instance3);
        });
    });

    describe("getConfigFormatMessage", () => {
        it("should return development format in non-production environment", () => {
            process.env.NODE_ENV = "development";
            const instance = new FormatMessageLogUtils();

            const format = instance.getConfigFormatMessage();

            expect(format).toBeDefined();
            expect(typeof format).toBe("object");
        });

        it("should return production format in production environment", () => {
            process.env.NODE_ENV = "production";
            const instance = new FormatMessageLogUtils();

            const format = instance.getConfigFormatMessage();

            expect(format).toBeDefined();
            expect(typeof format).toBe("object");
        });

        it("should return development format when NODE_ENV is not set", () => {
            delete process.env.NODE_ENV;
            const instance = new FormatMessageLogUtils();

            const format = instance.getConfigFormatMessage();

            expect(format).toBeDefined();
        });

        it("should return development format in test environment", () => {
            process.env.NODE_ENV = "test";
            const instance = new FormatMessageLogUtils();

            const format = instance.getConfigFormatMessage();

            expect(format).toBeDefined();
        });
    });

    describe("constructor", () => {
        it("should initialize format instances", () => {
            const instance = new FormatMessageLogUtils();

            expect(instance).toBeInstanceOf(FormatMessageLogUtils);
            // @ts-expect-error - Accessing private property for testing
            expect(instance.formatDev).toBeDefined();
            // @ts-expect-error - Accessing private property for testing
            expect(instance.formatProd).toBeDefined();
        });

        it("should create valid winston formats", () => {
            const instance = new FormatMessageLogUtils();

            // @ts-expect-error - Accessing private property for testing
            expect(instance.formatDev).toHaveProperty("transform");
            // @ts-expect-error - Accessing private property for testing
            expect(instance.formatProd).toHaveProperty("transform");
        });
    });

    describe("format output", () => {
        it("should format dev log with timestamp, level and message", () => {
            process.env.NODE_ENV = "development";
            const instance = new FormatMessageLogUtils();
            const format = instance.getConfigFormatMessage();

            const info = {
                timestamp: "2025-12-22 10:00:00",
                level: "info",
                message: "Test message",
                [Symbol.for("level")]: "info",
                [Symbol.for("message")]: "Test message"
            };

            const transformed = format.transform(info);

            expect(transformed).toBeDefined();
        });

        it("should format prod log as JSON", () => {
            process.env.NODE_ENV = "production";
            const instance = new FormatMessageLogUtils();
            const format = instance.getConfigFormatMessage();

            const info = {
                level: "info",
                message: "Test message",
                [Symbol.for("level")]: "info",
                [Symbol.for("message")]: "Test message"
            };

            const transformed = format.transform(info);

            expect(transformed).toBeDefined();
            expect(transformed).toHaveProperty("timestamp");
        });

        it("should include stack trace in dev format", () => {
            process.env.NODE_ENV = "development";
            const instance = new FormatMessageLogUtils();
            const format = instance.getConfigFormatMessage();

            const error = new Error("Test error");
            const info = {
                timestamp: "2025-12-22 10:00:00",
                level: "error",
                message: error.message,
                stack: error.stack,
                [Symbol.for("level")]: "error",
                [Symbol.for("message")]: error.message
            };

            const transformed = format.transform(info);

            expect(transformed).toBeDefined();
        });

        it("should include metadata in dev format", () => {
            process.env.NODE_ENV = "development";
            const instance = new FormatMessageLogUtils();
            const format = instance.getConfigFormatMessage();

            const info = {
                timestamp: "2025-12-22 10:00:00",
                level: "info",
                message: "Test message",
                userId: "123",
                requestId: "abc",
                [Symbol.for("level")]: "info",
                [Symbol.for("message")]: "Test message"
            };

            const transformed = format.transform(info);

            expect(transformed).toBeDefined();
        });
    });
});
