/**
 * Unit tests for client singleton module
 *
 * Note: These tests mock the PrismaClient to avoid requiring a real database connection.
 * Integration tests will verify actual database connectivity.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the generated client before importing
const MockPrismaClientConstructor = vi.fn();

vi.mock("../src/generated/client", () => {
    class MockPrismaClient {
        constructor(config?: unknown) {
            MockPrismaClientConstructor(config);
        }
        $disconnect = vi.fn().mockResolvedValue(undefined);
        $connect = vi.fn().mockResolvedValue(undefined);
        $queryRaw = vi.fn().mockResolvedValue([{ result: 1 }]);
    }

    return {
        PrismaClient: MockPrismaClient
    };
});

describe("Prisma Client Singleton", () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = process.env;
        process.env = { ...originalEnv };
        process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

        // Clear module cache to reset singleton
        vi.resetModules();
    });

    afterEach(() => {
        process.env = originalEnv;
        vi.clearAllMocks();
    });

    it("should export prisma client instance", async () => {
        const { prisma } = await import("../src/postgres/client");

        expect(prisma).toBeDefined();
        expect(typeof prisma).toBe("object");
    });

    it("should export getPrismaClient function", async () => {
        const { getPrismaClient } = await import("../src/postgres/client");

        expect(getPrismaClient).toBeDefined();
        expect(typeof getPrismaClient).toBe("function");
    });

    it("should return same instance on multiple calls", async () => {
        const { getPrismaClient } = await import("../src/postgres/client");

        const instance1 = getPrismaClient();
        const instance2 = getPrismaClient();

        expect(instance1).toBe(instance2);
    });

    it("should create client with development logging when NODE_ENV is development", async () => {
        process.env.NODE_ENV = "development";
        vi.resetModules();
        MockPrismaClientConstructor.mockClear();

        await import("../src/postgres/client");

        expect(MockPrismaClientConstructor).toHaveBeenCalledWith(
            expect.objectContaining({
                log: ["query", "info", "warn", "error"]
            })
        );
    });

    it("should create client with error-only logging when NODE_ENV is production", async () => {
        process.env.NODE_ENV = "production";
        vi.resetModules();
        MockPrismaClientConstructor.mockClear();

        await import("../src/postgres/client");

        expect(MockPrismaClientConstructor).toHaveBeenCalledWith(
            expect.objectContaining({
                log: ["error"]
            })
        );
    });

    it("should have $disconnect method", async () => {
        const { prisma } = await import("../src/postgres/client");

        expect(prisma.$disconnect).toBeDefined();
        expect(typeof prisma.$disconnect).toBe("function");
    });

    it("should have $queryRaw method", async () => {
        const { prisma } = await import("../src/postgres/client");

        expect(prisma.$queryRaw).toBeDefined();
        expect(typeof prisma.$queryRaw).toBe("function");
    });
});
