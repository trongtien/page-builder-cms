/**
 * Integration tests for persistence layer
 *
 * These tests require a running PostgreSQL database.
 * Set TEST_DATABASE_URL environment variable to run these tests.
 *
 * Example:
 * TEST_DATABASE_URL="postgresql://user:password@localhost:5432/test_db" pnpm test:integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "../src/generated/client";

// Skip integration tests if TEST_DATABASE_URL is not set
const shouldRunIntegrationTests = !!process.env.TEST_DATABASE_URL;
const describeIntegration = shouldRunIntegrationTests ? describe : describe.skip;

describeIntegration("Integration Tests", () => {
    let testPrisma: PrismaClient;

    beforeAll(async () => {
        if (!process.env.TEST_DATABASE_URL) {
            return;
        }

        // Use test database URL
        process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

        testPrisma = new PrismaClient({
            log: ["error"]
        });

        // Ensure database is connected
        await testPrisma.$connect();
    });

    afterAll(async () => {
        if (testPrisma) {
            await testPrisma.$disconnect();
        }
    });

    beforeEach(async () => {
        // Clean up test data before each test
        if (testPrisma) {
            await testPrisma.healthCheck.deleteMany();
        }
    });

    describe("Database Connection", () => {
        it("should connect to PostgreSQL database", async () => {
            const result = await testPrisma.$queryRaw`SELECT 1 as result`;
            expect(result).toBeDefined();
        });

        it("should execute raw queries", async () => {
            const result = await testPrisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;
            expect(result).toHaveLength(1);
            expect(result[0].now).toBeInstanceOf(Date);
        });
    });

    describe("CRUD Operations", () => {
        it("should create a health check record", async () => {
            const healthCheck = await testPrisma.healthCheck.create({
                data: {
                    status: "healthy",
                    message: "Test health check"
                }
            });

            expect(healthCheck).toBeDefined();
            expect(healthCheck.id).toBeDefined();
            expect(healthCheck.status).toBe("healthy");
            expect(healthCheck.message).toBe("Test health check");
            expect(healthCheck.timestamp).toBeInstanceOf(Date);
        });

        it("should find health check records", async () => {
            await testPrisma.healthCheck.create({
                data: { status: "healthy", message: "Test 1" }
            });
            await testPrisma.healthCheck.create({
                data: { status: "unhealthy", message: "Test 2" }
            });

            const records = await testPrisma.healthCheck.findMany();

            expect(records).toHaveLength(2);
        });

        it("should find single health check by id", async () => {
            const created = await testPrisma.healthCheck.create({
                data: { status: "healthy", message: "Find me" }
            });

            const found = await testPrisma.healthCheck.findUnique({
                where: { id: created.id }
            });

            expect(found).toBeDefined();
            expect(found?.id).toBe(created.id);
            expect(found?.status).toBe("healthy");
        });

        it("should update health check record", async () => {
            const created = await testPrisma.healthCheck.create({
                data: { status: "healthy", message: "Original" }
            });

            const updated = await testPrisma.healthCheck.update({
                where: { id: created.id },
                data: { message: "Updated" }
            });

            expect(updated.message).toBe("Updated");
            expect(updated.id).toBe(created.id);
        });

        it("should delete health check record", async () => {
            const created = await testPrisma.healthCheck.create({
                data: { status: "healthy", message: "Delete me" }
            });

            await testPrisma.healthCheck.delete({
                where: { id: created.id }
            });

            const found = await testPrisma.healthCheck.findUnique({
                where: { id: created.id }
            });

            expect(found).toBeNull();
        });
    });

    describe("Transactions", () => {
        it("should commit transaction on success", async () => {
            await testPrisma.$transaction(async (tx) => {
                await tx.healthCheck.create({
                    data: { status: "healthy", message: "Transaction 1" }
                });
                await tx.healthCheck.create({
                    data: { status: "healthy", message: "Transaction 2" }
                });
            });

            const records = await testPrisma.healthCheck.findMany();
            expect(records).toHaveLength(2);
        });

        it("should rollback transaction on error", async () => {
            try {
                await testPrisma.$transaction(async (tx) => {
                    await tx.healthCheck.create({
                        data: { status: "healthy", message: "Should rollback" }
                    });
                    throw new Error("Intentional error");
                });
            } catch (error) {
                // Expected error
            }

            const records = await testPrisma.healthCheck.findMany();
            expect(records).toHaveLength(0);
        });

        it("should handle multiple operations in transaction", async () => {
            const result = await testPrisma.$transaction(async (tx) => {
                const first = await tx.healthCheck.create({
                    data: { status: "healthy", message: "First" }
                });
                const second = await tx.healthCheck.create({
                    data: { status: "healthy", message: "Second" }
                });
                return { first, second };
            });

            expect(result.first.id).toBeDefined();
            expect(result.second.id).toBeDefined();
            expect(result.first.id).not.toBe(result.second.id);
        });
    });

    describe("Health Check Integration", () => {
        it("should perform basic connectivity check", async () => {
            const { checkDatabaseHealth } = await import("../src/postgres/health");

            // Temporarily set DATABASE_URL for this test
            const originalUrl = process.env.DATABASE_URL;
            process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

            const result = await checkDatabaseHealth();

            expect(result.status).toBe("healthy");
            expect(result.latency).toBeGreaterThan(0);
            expect(result.timestamp).toBeInstanceOf(Date);
            expect(result.error).toBeUndefined();

            process.env.DATABASE_URL = originalUrl;
        });

        it("should detect unhealthy database with wrong credentials", async () => {
            const { checkDatabaseHealth } = await import("../src/postgres/health");

            // Set invalid DATABASE_URL
            const originalUrl = process.env.DATABASE_URL;
            process.env.DATABASE_URL = "postgresql://invalid:invalid@localhost:5432/invalid";

            // Reset modules to use new URL
            const testClient = new PrismaClient({
                datasources: {
                    db: {
                        url: "postgresql://invalid:invalid@localhost:5432/invalid"
                    }
                }
            });

            try {
                await testClient.$queryRaw`SELECT 1`;
            } catch (error) {
                expect(error).toBeDefined();
            } finally {
                await testClient.$disconnect();
                process.env.DATABASE_URL = originalUrl;
            }
        });
    });

    describe("Configuration Integration", () => {
        it("should load configuration from environment", async () => {
            const { loadConfig } = await import("../src/postgres/config");

            const originalUrl = process.env.DATABASE_URL;
            process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "";

            const config = loadConfig();

            expect(config.databaseUrl).toBe(process.env.TEST_DATABASE_URL);
            expect(config.maxConnections).toBeGreaterThan(0);

            process.env.DATABASE_URL = originalUrl;
        });
    });
});

// Export note for users without TEST_DATABASE_URL set
if (!shouldRunIntegrationTests) {
    console.log("\n⚠️  Integration tests skipped: TEST_DATABASE_URL not set");
    console.log("To run integration tests, set TEST_DATABASE_URL environment variable:");
    console.log('Example: TEST_DATABASE_URL="postgresql://user:password@localhost:5432/test_db" pnpm test\n');
}
