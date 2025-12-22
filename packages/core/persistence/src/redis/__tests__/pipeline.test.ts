import { describe, it, expect, beforeEach, vi } from "vitest";
import { executePipeline, executeTransaction } from "../pipeline";
import type { RedisClient } from "../client";

// Mock logger
vi.mock("../../logger", () => ({
    persistenceLogger: {
        info: vi.fn(),
        error: vi.fn()
    }
}));

describe("Pipeline functions", () => {
    const createMockPipeline = (shouldThrow = false) => {
        return {
            set: vi.fn(),
            get: vi.fn(),
            del: vi.fn(),
            exec: vi.fn().mockImplementation(() => {
                if (shouldThrow) {
                    return Promise.reject(new Error("Pipeline execution failed"));
                }
                return Promise.resolve([
                    [null, "OK"],
                    [null, "value"],
                    [null, 1]
                ]);
            })
        };
    };

    const createMockClient = (pipelineShouldThrow = false): RedisClient => {
        return {
            pipeline: vi.fn(() => createMockPipeline(pipelineShouldThrow)),
            getClient: vi.fn().mockReturnValue({
                multi: vi.fn(() => createMockPipeline(pipelineShouldThrow))
            })
        } as any;
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("executePipeline", () => {
        it("should execute pipeline successfully", async () => {
            const mockClient = createMockClient();
            const results = await executePipeline(mockClient, (pipeline: any) => {
                pipeline.set("key1", "value1");
                pipeline.get("key2");
                pipeline.del("key3");
            });

            expect(results).toHaveLength(3);
            expect(results[0]).toEqual([null, "OK"]);
            expect(results[1]).toEqual([null, "value"]);
            expect(results[2]).toEqual([null, 1]);
        });

        it("should call commands on pipeline", async () => {
            const mockClient = createMockClient();
            const mockPipeline = createMockPipeline();
            vi.mocked(mockClient.pipeline).mockReturnValue(mockPipeline as any);

            await executePipeline(mockClient, (pipeline: any) => {
                pipeline.set("key1", "value1");
                pipeline.get("key2");
            });

            expect(mockPipeline.set).toHaveBeenCalledWith("key1", "value1");
            expect(mockPipeline.get).toHaveBeenCalledWith("key2");
            expect(mockPipeline.exec).toHaveBeenCalled();
        });

        it("should handle pipeline execution failure", async () => {
            const mockClient = createMockClient(true);

            await expect(
                executePipeline(mockClient, (pipeline: any) => {
                    pipeline.set("key", "value");
                })
            ).rejects.toThrow("Pipeline execution failed");
        });

        it("should return empty array when no results", async () => {
            const mockClient = createMockClient();
            const mockPipeline = createMockPipeline();
            mockPipeline.exec.mockResolvedValue(null);
            vi.mocked(mockClient.pipeline).mockReturnValue(mockPipeline as any);

            const results = await executePipeline(mockClient, () => {});

            expect(results).toEqual([]);
        });
    });

    describe("executeTransaction", () => {
        it("should execute transaction successfully", async () => {
            const mockClient = createMockClient();
            const results = await executeTransaction(mockClient, (pipeline: any) => {
                pipeline.set("key1", "value1");
                pipeline.get("key2");
            });

            expect(results).toHaveLength(3);
            expect(Array.isArray(results)).toBe(true);
        });

        it("should use multi() for transaction", async () => {
            const mockClient = createMockClient();
            const mockRedis = mockClient.getClient();
            const mockMulti = vi.fn(() => createMockPipeline());
            vi.mocked(mockRedis).multi = mockMulti;

            await executeTransaction(mockClient, (pipeline: any) => {
                pipeline.set("key", "value");
            });

            expect(mockMulti).toHaveBeenCalled();
        });

        it("should handle transaction failure", async () => {
            const mockClient = createMockClient(true);

            await expect(
                executeTransaction(mockClient, (pipeline: any) => {
                    pipeline.set("key", "value");
                })
            ).rejects.toThrow("Transaction execution failed");
        });

        it("should execute all commands atomically", async () => {
            const mockClient = createMockClient();
            const mockPipeline = createMockPipeline();
            const mockRedis = mockClient.getClient();
            vi.mocked(mockRedis).multi = vi.fn(() => mockPipeline as any);

            await executeTransaction(mockClient, (pipeline: any) => {
                pipeline.set("key1", "value1");
                pipeline.set("key2", "value2");
                pipeline.set("key3", "value3");
            });

            expect(mockPipeline.set).toHaveBeenCalledTimes(3);
            expect(mockPipeline.exec).toHaveBeenCalledOnce();
        });

        it("should return empty array when no results", async () => {
            const mockClient = createMockClient();
            const mockPipeline = createMockPipeline();
            mockPipeline.exec.mockResolvedValue(null);
            const mockRedis = mockClient.getClient();
            vi.mocked(mockRedis).multi = vi.fn(() => mockPipeline as any);

            const results = await executeTransaction(mockClient, () => {});

            expect(results).toEqual([]);
        });
    });
});
