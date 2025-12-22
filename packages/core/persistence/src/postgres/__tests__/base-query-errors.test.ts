import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseQuery } from "../base-query";
import { persistenceLogger } from "../../logger";
import { setupTestMocks, resetMockState, type TestUser } from "./test-helpers";

class TestUserQuery extends BaseQuery<TestUser> {
    constructor(softDelete = false) {
        super("users", { softDelete });
    }
}

describe("BaseQuery - Error Handling", () => {
    let userQuery: TestUserQuery;
    let mockState: ReturnType<typeof setupTestMocks>["mockState"];

    beforeEach(() => {
        vi.clearAllMocks();
        const mocks = setupTestMocks();
        mockState = mocks.mockState;
        userQuery = new TestUserQuery();
    });

    describe("findAll errors", () => {
        it("should log error on failure", async () => {
            const error = new Error("Query failed");
            mockState.error = error;

            await expect(userQuery.findAll()).rejects.toThrow("Query failed");
            expect(vi.mocked(persistenceLogger.error)).toHaveBeenCalledWith("Query failed", {
                table: "users",
                operation: "findAll",
                error: "Query failed"
            });
        });
    });

    describe("paginate errors", () => {
        it("should log error on failure", async () => {
            const error = new Error("Pagination failed");
            mockState.error = error;

            await expect(userQuery.paginate({})).rejects.toThrow("Pagination failed");
            expect(vi.mocked(persistenceLogger.error)).toHaveBeenCalledWith("Pagination query failed", {
                table: "users",
                operation: "paginate",
                error: "Pagination failed"
            });
        });
    });

    describe("insert errors", () => {
        it("should log and rethrow insert errors", async () => {
            const error = new Error("Insert failed");
            mockState.error = error;

            await expect(userQuery.insert({ email: "test@test.com" })).rejects.toThrow("Insert failed");
            expect(vi.mocked(persistenceLogger.error)).toHaveBeenCalledWith("Insert failed", {
                table: "users",
                operation: "insert",
                error: "Insert failed"
            });
        });
    });

    describe("update errors", () => {
        it("should log and rethrow update errors", async () => {
            const error = new Error("Update failed");
            mockState.error = error;

            await expect(userQuery.update({ id: 1 }, { email: "test@test.com" })).rejects.toThrow("Update failed");
            expect(vi.mocked(persistenceLogger.error)).toHaveBeenCalledWith("Update failed", {
                table: "users",
                operation: "update",
                error: "Update failed"
            });
        });
    });

    describe("delete errors", () => {
        it("should log and rethrow delete errors", async () => {
            const error = new Error("Delete failed");
            mockState.error = error;

            await expect(userQuery.delete({ id: 1 })).rejects.toThrow("Delete failed");
            expect(vi.mocked(persistenceLogger.error)).toHaveBeenCalledWith("Delete failed", {
                table: "users",
                operation: "delete",
                error: "Delete failed"
            });
        });
    });

    describe("count errors", () => {
        it("should log and rethrow count errors", async () => {
            const error = new Error("Count failed");
            mockState.error = error;

            await expect(userQuery.count()).rejects.toThrow("Count failed");
            expect(vi.mocked(persistenceLogger.error)).toHaveBeenCalledWith("Count query failed", {
                table: "users",
                operation: "count",
                error: "Count failed"
            });
        });
    });

    describe("unknown errors", () => {
        it("should log unknown errors", async () => {
            mockState.error = new Error("Unknown error");

            await expect(userQuery.findAll()).rejects.toThrow();
            expect(vi.mocked(persistenceLogger.error)).toHaveBeenCalledWith("Query failed", {
                table: "users",
                operation: "findAll",
                error: "Unknown error"
            });
        });
    });
});
