import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseQuery } from "../base-query";
import { persistenceLogger } from "../../logger";
import type { Knex } from "knex";
import { setupTestMocks, resetMockState, type TestUser } from "./test-helpers";

class TestUserQuery extends BaseQuery<TestUser> {
    constructor(softDelete = false) {
        super("users", { softDelete });
    }
}

describe("BaseQuery - Read Operations", () => {
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

    describe("getQueryBuilder", () => {
        it("should return query builder for table", () => {
            const _qb = userQuery["getQueryBuilder"]();
            expect(_qb).toBeDefined();
        });

        it("should use transaction when provided", () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;
            const result = userQuery["getQueryBuilder"](mockTrx);
            expect(result).toBeDefined();
            expect(vi.mocked(mockDbClient.getKnexSync)).not.toHaveBeenCalled();
        });

        it("should exclude soft-deleted records when softDelete is enabled", () => {
            const softDeleteQuery = new TestUserQuery(true);
            softDeleteQuery["getQueryBuilder"]();
            expect(vi.mocked(mockQueryBuilder.whereNull)).toHaveBeenCalledWith("deleted_at");
        });

        it("should not filter deleted records when softDelete is disabled", () => {
            userQuery["getQueryBuilder"]();
            expect(vi.mocked(mockQueryBuilder.whereNull)).not.toHaveBeenCalled();
        });
    });

    describe("applyQueryOptions", () => {
        it("should return query unchanged when no options provided", () => {
            const result = userQuery["applyQueryOptions"](mockQueryBuilder);
            expect(result).toBe(mockQueryBuilder);
        });

        it("should apply select fields", () => {
            userQuery["applyQueryOptions"](mockQueryBuilder, {
                fields: ["id", "email"]
            });
            expect(vi.mocked(mockQueryBuilder.select)).toHaveBeenCalledWith(["id", "email"]);
        });

        it("should apply orderBy", () => {
            userQuery["applyQueryOptions"](mockQueryBuilder, {
                orderBy: [{ column: "created_at", order: "desc" }]
            });
            expect(vi.mocked(mockQueryBuilder.orderBy)).toHaveBeenCalledWith("created_at", "desc");
        });

        it("should apply multiple orderBy", () => {
            userQuery["applyQueryOptions"](mockQueryBuilder, {
                orderBy: [
                    { column: "created_at", order: "desc" },
                    { column: "email", order: "asc" }
                ]
            });
            expect(vi.mocked(mockQueryBuilder.orderBy)).toHaveBeenCalledTimes(2);
        });

        it("should apply limit", () => {
            userQuery["applyQueryOptions"](mockQueryBuilder, { limit: 10 });
            expect(vi.mocked(mockQueryBuilder.limit)).toHaveBeenCalledWith(10);
        });

        it("should apply offset", () => {
            userQuery["applyQueryOptions"](mockQueryBuilder, { offset: 20 });
            expect(vi.mocked(mockQueryBuilder.offset)).toHaveBeenCalledWith(20);
        });

        it("should include deleted records when withDeleted is true", () => {
            const softDeleteQuery = new TestUserQuery(true);
            softDeleteQuery["applyQueryOptions"](mockQueryBuilder, { withDeleted: true });
            expect(vi.mocked(mockQueryBuilder.clearWhere)).toHaveBeenCalled();
            expect(vi.mocked(mockQueryBuilder.from)).toHaveBeenCalledWith("users");
        });
    });

    describe("findAll", () => {
        it("should find all records", async () => {
            mockState.results = [{ id: 1, email: "user1@test.com", username: "user1", is_active: true }];

            const results = await userQuery.findAll();

            expect(vi.mocked(mockDbClient.connect)).toHaveBeenCalled();
            expect(results).toEqual(mockState.results);
            expect(vi.mocked(persistenceLogger.query)).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "findAll",
                count: 1
            });
        });

        it("should apply query options", async () => {
            await userQuery.findAll({ limit: 10, orderBy: [{ column: "id", order: "asc" }] });

            expect(vi.mocked(mockQueryBuilder.limit)).toHaveBeenCalledWith(10);
            expect(vi.mocked(mockQueryBuilder.orderBy)).toHaveBeenCalledWith("id", "asc");
        });

        it("should not connect when transaction provided", async () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;
            await userQuery.findAll(undefined, mockTrx);

            expect(vi.mocked(mockDbClient.connect)).not.toHaveBeenCalled();
        });
    });

    describe("paginate", () => {
        it("should paginate results", async () => {
            const mockUsers = [{ id: 1, email: "user1@test.com" }];
            vi.mocked(mockQueryBuilder.then).mockResolvedValue(mockUsers);
            vi.mocked(mockQueryBuilder.count).mockResolvedValue([{ count: "25" }]);

            const result = await userQuery.paginate({ page: 1, limit: 10 });

            expect(result.data).toEqual(mockUsers);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 25,
                totalPages: 3,
                hasNext: true,
                hasPrev: false
            });
        });

        it("should use default page and limit", async () => {
            vi.mocked(mockQueryBuilder.then).mockResolvedValue([]);
            vi.mocked(mockQueryBuilder.count).mockResolvedValue([{ count: "0" }]);

            const result = await userQuery.paginate({});

            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });

        it("should calculate offset from page", async () => {
            vi.mocked(mockQueryBuilder.then).mockResolvedValue([]);
            vi.mocked(mockQueryBuilder.count).mockResolvedValue([{ count: "0" }]);

            await userQuery.paginate({ page: 3, limit: 10 });

            expect(vi.mocked(mockQueryBuilder.offset)).toHaveBeenCalledWith(20);
        });

        it("should use custom offset", async () => {
            vi.mocked(mockQueryBuilder.then).mockResolvedValue([]);
            vi.mocked(mockQueryBuilder.count).mockResolvedValue([{ count: "0" }]);

            await userQuery.paginate({ page: 1, limit: 10, offset: 15 });

            expect(vi.mocked(mockQueryBuilder.offset)).toHaveBeenCalledWith(15);
        });
    });

    describe("findOne", () => {
        it("should find one record by condition", async () => {
            const mockUser = { id: 1, email: "user1@test.com" };
            vi.mocked(mockQueryBuilder.first).mockResolvedValue(mockUser);

            const result = await userQuery.findOne({ email: "user1@test.com" });

            expect(vi.mocked(mockQueryBuilder.where)).toHaveBeenCalledWith({ email: "user1@test.com" });
            expect(vi.mocked(mockQueryBuilder.first)).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it("should return null when record not found", async () => {
            vi.mocked(mockQueryBuilder.first).mockResolvedValue(undefined);

            const result = await userQuery.findOne({ email: "notfound@test.com" });

            expect(result).toBeNull();
        });

        it("should apply query options", async () => {
            await userQuery.findOne({ id: 1 }, { fields: ["id", "email"] });

            expect(vi.mocked(mockQueryBuilder.select)).toHaveBeenCalledWith(["id", "email"]);
        });
    });

    describe("findById", () => {
        it("should find record by numeric id", async () => {
            const mockUser = { id: 1, email: "user1@test.com" };
            vi.mocked(mockQueryBuilder.first).mockResolvedValue(mockUser);

            const result = await userQuery.findById(1);

            expect(vi.mocked(mockQueryBuilder.where)).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(mockUser);
        });

        it("should find record by string id", async () => {
            const mockUser = { id: "uuid-123", email: "user1@test.com" };
            vi.mocked(mockQueryBuilder.first).mockResolvedValue(mockUser);

            const result = await userQuery.findById("uuid-123");

            expect(vi.mocked(mockQueryBuilder.where)).toHaveBeenCalledWith({ id: "uuid-123" });
            expect(result).toEqual(mockUser);
        });
    });

    describe("findWhere", () => {
        it("should find records by conditions", async () => {
            const mockUsers = [
                { id: 1, is_active: true },
                { id: 2, is_active: true }
            ];
            mockState.results = mockUsers;

            const results = await userQuery.findWhere({ is_active: true });

            expect(vi.mocked(mockQueryBuilder.where)).toHaveBeenCalledWith({ is_active: true });
            expect(results).toEqual(mockUsers);
            expect(vi.mocked(persistenceLogger.query)).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "findWhere",
                count: 2
            });
        });
    });

    describe("count", () => {
        it("should count all records", async () => {
            vi.mocked(mockQueryBuilder.count).mockResolvedValue([{ count: "10" }]);

            const count = await userQuery.count();

            expect(count).toBe(10);
            expect(vi.mocked(persistenceLogger.query)).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "count",
                count: 10
            });
        });

        it("should count records with condition", async () => {
            vi.mocked(mockQueryBuilder.count).mockResolvedValue([{ count: "5" }]);

            const count = await userQuery.count({ is_active: true });

            expect(vi.mocked(mockQueryBuilder.where)).toHaveBeenCalledWith({ is_active: true });
            expect(count).toBe(5);
        });

        it("should handle numeric count", async () => {
            vi.mocked(mockQueryBuilder.count).mockResolvedValue([{ count: 7 }]);

            const count = await userQuery.count();

            expect(count).toBe(7);
        });
    });

    describe("exists", () => {
        it("should return true when record exists", async () => {
            vi.mocked(mockQueryBuilder.count).mockResolvedValue([{ count: "1" }]);

            const exists = await userQuery.exists({ email: "user@test.com" });

            expect(exists).toBe(true);
        });

        it("should return false when record does not exist", async () => {
            vi.mocked(mockQueryBuilder.count).mockResolvedValue([{ count: "0" }]);

            const exists = await userQuery.exists({ email: "notfound@test.com" });

            expect(exists).toBe(false);
        });
    });
});
