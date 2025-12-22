import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseQuery } from "../base-query";
import { persistenceLogger } from "../../logger";
import { setupTestMocks, resetMockState, type TestUser } from "./test-helpers";

class TestUserQuery extends BaseQuery<TestUser> {
    constructor(softDelete = false) {
        super("users", { softDelete });
    }
}

describe("BaseQuery - Delete Operations", () => {
    let userQuery: TestUserQuery;
    let mockState: ReturnType<typeof setupTestMocks>["mockState"];
    let mockQueryBuilder: ReturnType<typeof setupTestMocks>["mockQueryBuilder"];

    beforeEach(() => {
        vi.clearAllMocks();
        const mocks = setupTestMocks();
        mockState = mocks.mockState;
        mockQueryBuilder = mocks.mockQueryBuilder;
        userQuery = new TestUserQuery();
    });

    describe("delete", () => {
        it("should hard delete when softDelete is disabled", async () => {
            vi.mocked(mockQueryBuilder.del).mockResolvedValue(1);

            const affectedRows = await userQuery.delete({ id: 1 });

            expect(vi.mocked(mockQueryBuilder.del)).toHaveBeenCalled();
            expect(affectedRows).toBe(1);
            expect(vi.mocked(persistenceLogger.query)).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "delete",
                affectedRows: 1
            });
        });

        it("should soft delete when softDelete is enabled", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            mockState.results = [1];

            const affectedRows = await softDeleteQuery.delete({ id: 1 });

            expect(vi.mocked(mockQueryBuilder.update)).toHaveBeenCalled();
            expect(vi.mocked(mockQueryBuilder.whereNull)).toHaveBeenCalledWith("deleted_at");
            expect(affectedRows).toBe(1);
            expect(vi.mocked(persistenceLogger.query)).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "softDelete",
                affectedRows: 1
            });
        });

        it("should handle array result for soft delete", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            mockState.results = [{}, {}];

            const affectedRows = await softDeleteQuery.delete({ is_active: false });

            expect(affectedRows).toBe(2);
        });
    });

    describe("deleteById", () => {
        it("should delete record by id and return true", async () => {
            vi.mocked(mockQueryBuilder.del).mockResolvedValue(1);

            const result = await userQuery.deleteById(1);

            expect(result).toBe(true);
        });

        it("should return false when no record deleted", async () => {
            vi.mocked(mockQueryBuilder.del).mockResolvedValue(0);

            const result = await userQuery.deleteById(999);

            expect(result).toBe(false);
        });
    });

    describe("forceDelete", () => {
        it("should permanently delete record", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            vi.mocked(mockQueryBuilder.del).mockResolvedValue(1);

            const affectedRows = await softDeleteQuery.forceDelete({ id: 1 });

            expect(vi.mocked(mockQueryBuilder.del)).toHaveBeenCalled();
            expect(affectedRows).toBe(1);
            expect(vi.mocked(persistenceLogger.query)).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "forceDelete",
                affectedRows: 1
            });
        });
    });

    describe("restore", () => {
        it("should restore soft-deleted record", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            const restoredUser = { id: 1, email: "restored@test.com", deleted_at: null };
            mockState.results = [restoredUser];

            const results = await softDeleteQuery.restore({ id: 1 });

            expect(vi.mocked(mockQueryBuilder.whereNotNull)).toHaveBeenCalledWith("deleted_at");
            expect(vi.mocked(mockQueryBuilder.update)).toHaveBeenCalledWith({ deleted_at: null });
            expect(results).toEqual([restoredUser]);
        });

        it("should throw error when softDelete is disabled", async () => {
            await expect(userQuery.restore({ id: 1 })).rejects.toThrow(
                "Restore is only available for tables with soft delete enabled"
            );
        });

        it("should handle array results", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            const restoredUsers = [{ id: 1 }, { id: 2 }];
            mockState.results = restoredUsers;

            const results = await softDeleteQuery.restore({ is_active: true });

            expect(results).toEqual(restoredUsers);
        });
    });
});
