import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRedisHealth } from "../health";
import type { RedisClient } from "../client";

// Mock logger
vi.mock("../../logger", () => ({
    persistenceLogger: {
        connection: vi.fn(),
        error: vi.fn()
    }
}));

describe("checkRedisHealth", () => {
    const createMockClient = (
        options: {
            isConnected?: boolean;
            pingDelay?: number;
            shouldThrow?: boolean;
        } = {}
    ): RedisClient => {
        const { isConnected = true, pingDelay = 10, shouldThrow = false } = options;

        return {
            isRedisConnected: vi.fn().mockReturnValue(isConnected),
            getClient: vi.fn().mockReturnValue({
                ping: vi.fn().mockImplementation(() => {
                    if (shouldThrow) {
                        return Promise.reject(new Error("PING failed"));
                    }
                    return new Promise((resolve) => {
                        setTimeout(() => resolve("PONG"), pingDelay);
                    });
                })
            })
        } as any;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return healthy status when connected", async () => {
        const mockClient = createMockClient({ isConnected: true, pingDelay: 5 });
        const status = await checkRedisHealth(mockClient);

        expect(status.connected).toBe(true);
        expect(status.latency).toBeGreaterThanOrEqual(5);
        expect(status.error).toBeUndefined();
        expect(status.lastCheck).toBeInstanceOf(Date);
    });

    it("should return unhealthy status when not connected", async () => {
        const mockClient = createMockClient({ isConnected: false });
        const status = await checkRedisHealth(mockClient);

        expect(status.connected).toBe(false);
        expect(status.error).toBe("Redis client not connected");
        expect(status.lastCheck).toBeInstanceOf(Date);
    });

    it("should return unhealthy status when PING fails", async () => {
        const mockClient = createMockClient({ isConnected: true, shouldThrow: true });
        const status = await checkRedisHealth(mockClient);

        expect(status.connected).toBe(false);
        expect(status.error).toBe("PING failed");
        expect(status.lastCheck).toBeInstanceOf(Date);
    });

    it("should measure latency accurately", async () => {
        const mockClient = createMockClient({ isConnected: true, pingDelay: 50 });
        const status = await checkRedisHealth(mockClient);

        expect(status.latency).toBeGreaterThanOrEqual(50);
        expect(status.latency).toBeLessThan(100); // Should not take too long
    });

    it("should have recent timestamp", async () => {
        const mockClient = createMockClient();
        const before = new Date();
        const status = await checkRedisHealth(mockClient);
        const after = new Date();

        expect(status.lastCheck.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(status.lastCheck.getTime()).toBeLessThanOrEqual(after.getTime());
    });
});
