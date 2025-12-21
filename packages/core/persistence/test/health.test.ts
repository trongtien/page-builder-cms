/**
 * Unit tests for health check module
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the client module
const mockQueryRaw = vi.fn();
const mockPrisma = {
    $queryRaw: mockQueryRaw
};

vi.mock("../src/postgres/client", () => ({
    prisma: mockPrisma
}));

describe("checkDatabaseHealth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return healthy status when query succeeds", async () => {
        const { checkDatabaseHealth } = await import("../src/postgres/health");

        mockQueryRaw.mockResolvedValue([{ result: 1 }]);

        const result = await checkDatabaseHealth();

        expect(result.status).toBe("healthy");
        expect(result.latency).toBeGreaterThanOrEqual(0);
        expect(result.timestamp).toBeInstanceOf(Date);
        expect(result.error).toBeUndefined();
    });

    it("should return unhealthy status when query fails", async () => {
        const { checkDatabaseHealth } = await import("../src/postgres/health");

        mockQueryRaw.mockRejectedValue(new Error("Connection refused"));

        const result = await checkDatabaseHealth();

        expect(result.status).toBe("unhealthy");
        expect(result.latency).toBeGreaterThanOrEqual(0);
        expect(result.timestamp).toBeInstanceOf(Date);
        expect(result.error).toBe("Connection refused");
    });

    it("should measure query latency", async () => {
        const { checkDatabaseHealth } = await import("../src/postgres/health");

        mockQueryRaw.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([{ result: 1 }]), 50)));

        const result = await checkDatabaseHealth();

        expect(result.latency).toBeGreaterThanOrEqual(50);
        expect(result.latency).toBeLessThan(200);
    });

    it("should include timestamp in result", async () => {
        const { checkDatabaseHealth } = await import("../src/postgres/health");

        mockQueryRaw.mockResolvedValue([{ result: 1 }]);
        const before = new Date();

        const result = await checkDatabaseHealth();

        const after = new Date();
        expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should handle non-Error exceptions", async () => {
        const { checkDatabaseHealth } = await import("../src/postgres/health");

        mockQueryRaw.mockRejectedValue("String error");

        const result = await checkDatabaseHealth();

        expect(result.status).toBe("unhealthy");
        expect(result.error).toBe("Unknown error");
    });

    it("should execute SELECT 1 query", async () => {
        const { checkDatabaseHealth } = await import("../src/postgres/health");

        mockQueryRaw.mockResolvedValue([{ result: 1 }]);

        await checkDatabaseHealth();

        expect(mockQueryRaw).toHaveBeenCalledOnce();
    });
});

describe("isDatabaseReady", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return true when database is healthy", async () => {
        const { isDatabaseReady } = await import("../src/postgres/health");

        mockQueryRaw.mockResolvedValue([{ result: 1 }]);

        const result = await isDatabaseReady();

        expect(result).toBe(true);
    });

    it("should return false when database is unhealthy", async () => {
        const { isDatabaseReady } = await import("../src/postgres/health");

        mockQueryRaw.mockRejectedValue(new Error("Connection failed"));

        const result = await isDatabaseReady();

        expect(result).toBe(false);
    });
});

describe("waitForDatabase", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return true immediately if database is ready", async () => {
        const { waitForDatabase } = await import("../src/postgres/health");

        mockQueryRaw.mockResolvedValue([{ result: 1 }]);

        const promise = waitForDatabase(3, 100);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toBe(true);
        expect(mockQueryRaw).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and return true when successful", async () => {
        const { waitForDatabase } = await import("../src/postgres/health");

        mockQueryRaw
            .mockRejectedValueOnce(new Error("Not ready"))
            .mockRejectedValueOnce(new Error("Still not ready"))
            .mockResolvedValue([{ result: 1 }]);

        const promise = waitForDatabase(5, 100);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toBe(true);
        expect(mockQueryRaw).toHaveBeenCalledTimes(3);
    });

    it("should return false after max retries", async () => {
        const { waitForDatabase } = await import("../src/postgres/health");

        mockQueryRaw.mockRejectedValue(new Error("Connection failed"));

        const promise = waitForDatabase(3, 100);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toBe(false);
        expect(mockQueryRaw).toHaveBeenCalledTimes(3);
    });

    it("should use custom retry count", async () => {
        const { waitForDatabase } = await import("../src/postgres/health");

        mockQueryRaw.mockRejectedValue(new Error("Failed"));

        const promise = waitForDatabase(5, 100);
        await vi.runAllTimersAsync();
        await promise;

        expect(mockQueryRaw).toHaveBeenCalledTimes(5);
    });

    it("should use custom delay between retries", async () => {
        const { waitForDatabase } = await import("../src/postgres/health");

        mockQueryRaw.mockRejectedValueOnce(new Error("Not ready")).mockResolvedValue([{ result: 1 }]);

        const promise = waitForDatabase(3, 500);

        // First attempt fails immediately
        await vi.advanceTimersByTimeAsync(0);

        // Wait for delay
        await vi.advanceTimersByTimeAsync(500);

        // Second attempt succeeds
        await vi.runAllTimersAsync();

        const result = await promise;
        expect(result).toBe(true);
    });
});
