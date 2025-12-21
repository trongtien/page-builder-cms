/**
 * Unit tests for transaction helper module
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the client module
const mockTransaction = vi.fn();
const mockPrisma = {
    $transaction: mockTransaction
};

vi.mock("../src/postgres/client", () => ({
    prisma: mockPrisma
}));

describe("withTransaction", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should execute callback within transaction", async () => {
        const { withTransaction } = await import("../src/postgres/transaction");

        const callback = vi.fn().mockResolvedValue("result");
        mockTransaction.mockImplementation((cb) => cb(mockPrisma));

        const result = await withTransaction(callback);

        expect(mockTransaction).toHaveBeenCalledOnce();
        expect(callback).toHaveBeenCalledWith(mockPrisma);
        expect(result).toBe("result");
    });

    it("should return callback result", async () => {
        const { withTransaction } = await import("../src/postgres/transaction");

        const expectedResult = { id: "123", name: "test" };
        const callback = vi.fn().mockResolvedValue(expectedResult);
        mockTransaction.mockImplementation((cb) => cb(mockPrisma));

        const result = await withTransaction(callback);

        expect(result).toEqual(expectedResult);
    });

    it("should propagate errors from callback", async () => {
        const { withTransaction } = await import("../src/postgres/transaction");

        const error = new Error("Transaction failed");
        const callback = vi.fn().mockRejectedValue(error);
        mockTransaction.mockImplementation((cb) => cb(mockPrisma).catch((e: Error) => Promise.reject(e)));

        await expect(withTransaction(callback)).rejects.toThrow("Transaction failed");
    });

    it("should handle transaction rollback on error", async () => {
        const { withTransaction } = await import("../src/postgres/transaction");

        const callback = vi.fn().mockRejectedValue(new Error("Operation failed"));
        mockTransaction.mockImplementation((cb) => cb(mockPrisma).catch((e: Error) => Promise.reject(e)));

        await expect(withTransaction(callback)).rejects.toThrow("Operation failed");
        expect(mockTransaction).toHaveBeenCalledOnce();
    });

    it("should support async callback functions", async () => {
        const { withTransaction } = await import("../src/postgres/transaction");

        const callback = vi.fn(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return "async result";
        });
        mockTransaction.mockImplementation((cb) => cb(mockPrisma));

        const result = await withTransaction(callback);

        expect(result).toBe("async result");
    });
});

describe("withTransactionTimeout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should execute callback with custom timeout", async () => {
        const { withTransactionTimeout } = await import("../src/postgres/transaction");

        const callback = vi.fn().mockResolvedValue("result");
        mockTransaction.mockImplementation((cb) => cb(mockPrisma));

        const result = await withTransactionTimeout(callback, 10000);

        expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ timeout: 10000 }));
        expect(result).toBe("result");
    });

    it("should pass timeout option to Prisma transaction", async () => {
        const { withTransactionTimeout } = await import("../src/postgres/transaction");

        const callback = vi.fn().mockResolvedValue("result");
        mockTransaction.mockImplementation((cb) => cb(mockPrisma));

        await withTransactionTimeout(callback, 5000);

        expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function), { timeout: 5000 });
    });

    it("should propagate errors with timeout", async () => {
        const { withTransactionTimeout } = await import("../src/postgres/transaction");

        const error = new Error("Timeout exceeded");
        const callback = vi.fn().mockRejectedValue(error);
        mockTransaction.mockImplementation((cb) => cb(mockPrisma).catch((e: Error) => Promise.reject(e)));

        await expect(withTransactionTimeout(callback, 1000)).rejects.toThrow("Timeout exceeded");
    });
});
