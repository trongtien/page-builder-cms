import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseQuery } from "../base-query";
import { setupTestMocks, resetMockState, type TestUser } from "./test-helpers";

class TestUserQuery extends BaseQuery<TestUser> {
    constructor(softDelete = false) {
        super("users", { softDelete });
    }
}

describe("BaseQuery - Update Operations", () => {
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

    describe("update", () => {
        it("should update records", async () => {
            const updatedUser = { id: 1, email: "updated@test.com" };
            mockState.results = [updatedUser];

            const results = await userQuery.update({ id: 1 }, { email: "updated@test.com" });

            expect(vi.mocked(mockQueryBuilder.where)).toHaveBeenCalledWith({ id: 1 });
            expect(vi.mocked(mockQueryBuilder.update)).toHaveBeenCalledWith({ email: "updated@test.com" });
            expect(vi.mocked(mockQueryBuilder.returning)).toHaveBeenCalledWith("*");
            expect(results).toEqual([updatedUser]);
        });

        it("should exclude soft-deleted records when updating", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            mockState.results = [{}];

            await softDeleteQuery.update({ id: 1 }, { email: "updated@test.com" });

            expect(vi.mocked(mockQueryBuilder.whereNull)).toHaveBeenCalledWith("deleted_at");
        });

        it("should handle array results", async () => {
            const updatedUsers = [
                { id: 1, email: "updated1@test.com" },
                { id: 2, email: "updated2@test.com" }
            ];
            mockState.results = updatedUsers;

            const results = await userQuery.update({ is_active: true }, { is_active: false });

            expect(results).toEqual(updatedUsers);
        });
    });

    describe("updateById", () => {
        it("should update record by id", async () => {
            const updatedUser = { id: 1, email: "updated@test.com" };
            mockState.results = [updatedUser];

            const result = await userQuery.updateById(1, { email: "updated@test.com" });

            expect(vi.mocked(mockQueryBuilder.where)).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(updatedUser);
        });

        it("should return null when no record updated", async () => {
            mockState.results = [];

            const result = await userQuery.updateById(999, { email: "updated@test.com" });

            expect(result).toBeNull();
        });
    });
});
