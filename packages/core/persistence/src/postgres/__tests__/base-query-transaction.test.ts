import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseQuery } from "../base-query";
import type { Knex } from "knex";
import { setupTestMocks, resetMockState, type TestUser } from "./test-helpers";

class TestUserQuery extends BaseQuery<TestUser> {
    constructor(softDelete = false) {
        super("users", { softDelete });
    }
}

describe("BaseQuery - Transaction & Query", () => {
    let userQuery: TestUserQuery;
    let mockState: ReturnType<typeof setupTestMocks>["mockState"];
    let mockQueryBuilder: ReturnType<typeof setupTestMocks>["mockQueryBuilder"];
    let mockDbClient: ReturnType<typeof setupTestMocks>["mockDbClient"];

    beforeEach(() => {
        vi.clearAllMocks();
        const mocks = setupTestMocks();
        mockState = mocks.mockState;
        mockQueryBuilder = mocks.mockQueryBuilder;
        mockDbClient = mocks.mockDbClient;
        userQuery = new TestUserQuery();
    });

    describe("query", () => {
        it("should return query builder", async () => {
            const qb = (await userQuery.query()) as Knex.QueryBuilder;

            expect(qb).toBe(mockQueryBuilder);
        });

        it("should use transaction when provided", async () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;
            await userQuery.query(mockTrx);

            expect(vi.mocked(mockDbClient.getKnexSync)).not.toHaveBeenCalled();
        });
    });

    describe("Transaction handling", () => {
        it("should use transaction for findAll", async () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;
            await userQuery.findAll(undefined, mockTrx);

            expect(vi.mocked(mockDbClient.connect)).not.toHaveBeenCalled();
        });

        it("should use transaction for insert", async () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;
            mockState.results = [{ id: 1, email: "test@test.com" }];

            await userQuery.insert({ email: "test@test.com" }, mockTrx);

            expect(vi.mocked(mockDbClient.connect)).not.toHaveBeenCalled();
        });

        it("should use transaction for update", async () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;
            mockState.results = [{ id: 1, email: "updated@test.com" }];

            await userQuery.update({ id: 1 }, { email: "updated@test.com" }, mockTrx);

            expect(vi.mocked(mockDbClient.connect)).not.toHaveBeenCalled();
        });

        it("should use transaction for delete", async () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;
            vi.mocked(mockQueryBuilder.del).mockResolvedValue(1);

            await userQuery.delete({ id: 1 }, mockTrx);

            expect(vi.mocked(mockDbClient.connect)).not.toHaveBeenCalled();
        });
    });
});
