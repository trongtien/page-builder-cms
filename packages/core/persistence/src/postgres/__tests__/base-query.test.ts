import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BaseQuery } from "../base-query";
import { DatabaseClient } from "../client";
import { persistenceLogger } from "../../logger";
import type { Knex } from "knex";
import type { BaseModel } from "../postgres.type";

// Mock DatabaseClient
vi.mock("../client", () => ({
    DatabaseClient: {
        getInstance: vi.fn()
    }
}));

// Mock logger
vi.mock("../../logger", () => ({
    persistenceLogger: {
        query: vi.fn(),
        error: vi.fn()
    }
}));

interface TestUser extends BaseModel {
    email: string;
    username: string;
    is_active: boolean;
}

class TestUserQuery extends BaseQuery<TestUser> {
    constructor(softDelete = false) {
        super("users", { softDelete });
    }
}

describe("BaseQuery", () => {
    let mockDbClient: DatabaseClient;
    let mockKnex: Knex;
    let mockQueryBuilder: Knex.QueryBuilder;
    let userQuery: TestUserQuery;

    let mockResults: unknown[];
    let mockError: Error | null;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Default result set and error state
        mockResults = [];
        mockError = null;

        // Create mock query builder with proper thenable implementation
        const createQueryBuilder = (): Knex.QueryBuilder => {
            const qb: Partial<Knex.QueryBuilder> & PromiseLike<unknown> = {
                // Main thenable implementation - used when awaiting the query builder directly
                then: vi.fn().mockImplementation(function (
                    onfulfilled?: ((value: unknown) => unknown) | null,
                    onrejected?: ((reason: unknown) => unknown) | null
                ) {
                    // Check if there's a pending error
                    if (mockError) {
                        return Promise.reject(mockError).then(onfulfilled, onrejected);
                    }
                    return Promise.resolve(mockResults).then(onfulfilled, onrejected);
                })
            };

            qb.where = vi.fn().mockReturnValue(qb);
            qb.whereNull = vi.fn().mockReturnValue(qb);
            qb.whereNotNull = vi.fn().mockReturnValue(qb);
            qb.select = vi.fn().mockReturnValue(qb);
            qb.orderBy = vi.fn().mockReturnValue(qb);
            qb.limit = vi.fn().mockReturnValue(qb);
            qb.offset = vi.fn().mockReturnValue(qb);

            // first() resolves with first element or null
            qb.first = vi.fn().mockImplementation(() => {
                if (mockError) return Promise.reject(mockError);
                return Promise.resolve(mockResults[0] || null);
            });

            // count() returns array with count object
            qb.count = vi.fn().mockImplementation(() => {
                if (mockError) return Promise.reject(mockError);
                return Promise.resolve([{ count: "5" }]);
            });

            qb.insert = vi.fn().mockReturnValue(qb);
            qb.update = vi.fn().mockReturnValue(qb);

            // del() returns number of affected rows
            qb.del = vi.fn().mockImplementation(() => {
                if (mockError) return Promise.reject(mockError);
                return Promise.resolve(1);
            });

            qb.returning = vi.fn().mockReturnValue(qb);
            qb.clearWhere = vi.fn().mockReturnValue(qb);
            qb.from = vi.fn().mockReturnValue(qb);
            qb.toQuery = vi.fn().mockReturnValue("SELECT * FROM users");

            return qb as unknown as Knex.QueryBuilder;
        };

        mockQueryBuilder = createQueryBuilder();

        // Create mock Knex that returns the SAME query builder instance
        mockKnex = vi.fn().mockImplementation(() => mockQueryBuilder) as unknown as Knex;

        // Create mock DatabaseClient
        mockDbClient = {
            connect: vi.fn().mockResolvedValue(undefined),
            getKnexSync: vi.fn().mockReturnValue(mockKnex),
            disconnect: vi.fn().mockResolvedValue(undefined)
        } as unknown as DatabaseClient;

        (DatabaseClient.getInstance as ReturnType<typeof vi.fn>).mockReturnValue(mockDbClient);

        userQuery = new TestUserQuery();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Constructor", () => {
        it("should initialize with table name", () => {
            expect(userQuery["tableName"]).toBe("users");
        });

        it("should get DatabaseClient instance", () => {
            expect(DatabaseClient.getInstance).toHaveBeenCalled();
            expect(mockDbClient).toBeDefined();
        });

        it("should set softDelete to false by default", () => {
            expect(userQuery["softDelete"]).toBe(false);
        });

        it("should set softDelete to true when enabled", () => {
            const softDeleteQuery = new TestUserQuery(true);
            expect(softDeleteQuery["softDelete"]).toBe(true);
        });

        it("should set default deletedAtColumn", () => {
            expect(userQuery["deletedAtColumn"]).toBe("deleted_at");
        });
    });

    describe("getQueryBuilder", () => {
        it("should return query builder for table", () => {
            const _qb = userQuery["getQueryBuilder"]();
            expect(mockKnex).toHaveBeenCalledWith("users");
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
            expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith("deleted_at");
        });

        it("should not filter deleted records when softDelete is disabled", () => {
            userQuery["getQueryBuilder"]();
            expect(mockQueryBuilder.whereNull).not.toHaveBeenCalled();
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
            expect(mockQueryBuilder.select).toHaveBeenCalledWith(["id", "email"]);
        });

        it("should apply orderBy", () => {
            userQuery["applyQueryOptions"](mockQueryBuilder, {
                orderBy: [{ column: "created_at", order: "desc" }]
            });
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("created_at", "desc");
        });

        it("should apply multiple orderBy", () => {
            userQuery["applyQueryOptions"](mockQueryBuilder, {
                orderBy: [
                    { column: "created_at", order: "desc" },
                    { column: "email", order: "asc" }
                ]
            });
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledTimes(2);
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
            expect(mockQueryBuilder.from).toHaveBeenCalledWith("users");
        });
    });

    describe("findAll", () => {
        it("should find all records", async () => {
            mockResults = [{ id: 1, email: "user1@test.com", username: "user1", is_active: true }];

            const results = await userQuery.findAll();

            expect(vi.mocked(mockDbClient.connect)).toHaveBeenCalled();
            expect(results).toEqual(mockResults);
            expect(persistenceLogger.query).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "findAll",
                count: 1
            });
        });

        it("should apply query options", async () => {
            await userQuery.findAll({ limit: 10, orderBy: [{ column: "id", order: "asc" }] });

            expect(vi.mocked(mockQueryBuilder.limit)).toHaveBeenCalledWith(10);
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("id", "asc");
        });

        it("should not connect when transaction provided", async () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;
            await userQuery.findAll(undefined, mockTrx);

            expect(vi.mocked(mockDbClient.connect)).not.toHaveBeenCalled();
        });

        it("should log error on failure", async () => {
            const error = new Error("Query failed");
            mockError = error; // Set error state

            await expect(userQuery.findAll()).rejects.toThrow("Query failed");
            expect(persistenceLogger.error).toHaveBeenCalledWith("Query failed", {
                table: "users",
                operation: "findAll",
                error: "Query failed"
            });
        });
    });

    describe("paginate", () => {
        it("should paginate results", async () => {
            const mockUsers = [{ id: 1, email: "user1@test.com" }];
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsers);
            (mockQueryBuilder.count as ReturnType<typeof vi.fn>).mockResolvedValue([{ count: "25" }]);

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
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            (mockQueryBuilder.count as ReturnType<typeof vi.fn>).mockResolvedValue([{ count: "0" }]);

            const result = await userQuery.paginate({});

            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });

        it("should calculate offset from page", async () => {
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            (mockQueryBuilder.count as ReturnType<typeof vi.fn>).mockResolvedValue([{ count: "0" }]);

            await userQuery.paginate({ page: 3, limit: 10 });

            expect(vi.mocked(mockQueryBuilder.offset)).toHaveBeenCalledWith(20);
        });

        it("should use custom offset", async () => {
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            (mockQueryBuilder.count as ReturnType<typeof vi.fn>).mockResolvedValue([{ count: "0" }]);

            await userQuery.paginate({ page: 1, limit: 10, offset: 15 });

            expect(vi.mocked(mockQueryBuilder.offset)).toHaveBeenCalledWith(15);
        });

        it("should log error on failure", async () => {
            const error = new Error("Pagination failed");
            mockError = error; // Set error state

            await expect(userQuery.paginate({})).rejects.toThrow("Pagination failed");
            expect(persistenceLogger.error).toHaveBeenCalledWith("Pagination query failed", {
                table: "users",
                operation: "paginate",
                error: "Pagination failed"
            });
        });
    });

    describe("findOne", () => {
        it("should find one record by condition", async () => {
            const mockUser = { id: 1, email: "user1@test.com" };
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

            const result = await userQuery.findOne({ email: "user1@test.com" });

            expect(mockQueryBuilder.where).toHaveBeenCalledWith({ email: "user1@test.com" });
            expect(mockQueryBuilder.first).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it("should return null when record not found", async () => {
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            const result = await userQuery.findOne({ email: "notfound@test.com" });

            expect(result).toBeNull();
        });

        it("should apply query options", async () => {
            await userQuery.findOne({ id: 1 }, { fields: ["id", "email"] });

            expect(mockQueryBuilder.select).toHaveBeenCalledWith(["id", "email"]);
        });
    });

    describe("findById", () => {
        it("should find record by numeric id", async () => {
            const mockUser = { id: 1, email: "user1@test.com" };
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

            const result = await userQuery.findById(1);

            expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(mockUser);
        });

        it("should find record by string id", async () => {
            const mockUser = { id: "uuid-123", email: "user1@test.com" };
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

            const result = await userQuery.findById("uuid-123");

            expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: "uuid-123" });
            expect(result).toEqual(mockUser);
        });
    });

    describe("findWhere", () => {
        it("should find records by conditions", async () => {
            const mockUsers = [
                { id: 1, is_active: true },
                { id: 2, is_active: true }
            ];
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(mockUsers);

            const results = await userQuery.findWhere({ is_active: true });

            expect(mockQueryBuilder.where).toHaveBeenCalledWith({ is_active: true });
            expect(results).toEqual(mockUsers);
            expect(persistenceLogger.query).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "findWhere",
                count: 2
            });
        });
    });

    describe("insert", () => {
        it("should insert single record", async () => {
            const newUser = { email: "new@test.com", username: "newuser", is_active: true };
            const createdUser = { id: 1, ...newUser };
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(createdUser);

            const results = await userQuery.insert(newUser);

            expect(vi.mocked(mockQueryBuilder.insert)).toHaveBeenCalledWith(newUser);
            expect(vi.mocked(mockQueryBuilder.returning)).toHaveBeenCalledWith("*");
            expect(results).toEqual([createdUser]);
        });

        it("should insert multiple records", async () => {
            const newUsers = [
                { email: "user1@test.com", username: "user1", is_active: true },
                { email: "user2@test.com", username: "user2", is_active: true }
            ];
            const createdUsers = [
                { id: 1, ...newUsers[0] },
                { id: 2, ...newUsers[1] }
            ];
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(createdUsers);

            const results = await userQuery.insert(newUsers);

            expect(results).toEqual(createdUsers);
            expect(persistenceLogger.query).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "insert",
                count: 2
            });
        });

        it("should connect before insert", async () => {
            await userQuery.insert({ email: "test@test.com" });
            expect(vi.mocked(mockDbClient.connect)).toHaveBeenCalled();
        });
    });

    describe("insertOne", () => {
        it("should insert one record and return it", async () => {
            const newUser = { email: "new@test.com", username: "newuser", is_active: true };
            const createdUser = { id: 1, ...newUser };
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(createdUser);

            const result = await userQuery.insertOne(newUser);

            expect(result).toEqual(createdUser);
        });
    });

    describe("update", () => {
        it("should update records", async () => {
            const updatedUser = { id: 1, email: "updated@test.com" };
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(updatedUser);

            const results = await userQuery.update({ id: 1 }, { email: "updated@test.com" });

            expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
            expect(vi.mocked(mockQueryBuilder.update)).toHaveBeenCalledWith({ email: "updated@test.com" });
            expect(vi.mocked(mockQueryBuilder.returning)).toHaveBeenCalledWith("*");
            expect(results).toEqual([updatedUser]);
        });

        it("should exclude soft-deleted records when updating", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue({});

            await softDeleteQuery.update({ id: 1 }, { email: "updated@test.com" });

            expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith("deleted_at");
        });

        it("should handle array results", async () => {
            const updatedUsers = [
                { id: 1, email: "updated1@test.com" },
                { id: 2, email: "updated2@test.com" }
            ];
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(updatedUsers);

            const results = await userQuery.update({ is_active: true }, { is_active: false });

            expect(results).toEqual(updatedUsers);
        });
    });

    describe("updateById", () => {
        it("should update record by id", async () => {
            const updatedUser = { id: 1, email: "updated@test.com" };
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(updatedUser);

            const result = await userQuery.updateById(1, { email: "updated@test.com" });

            expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
            expect(result).toEqual(updatedUser);
        });

        it("should return null when no record updated", async () => {
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue([]);

            const result = await userQuery.updateById(999, { email: "updated@test.com" });

            expect(result).toBeNull();
        });
    });

    describe("delete", () => {
        it("should hard delete when softDelete is disabled", async () => {
            (mockQueryBuilder.del as ReturnType<typeof vi.fn>).mockResolvedValue(1);

            const affectedRows = await userQuery.delete({ id: 1 });

            expect(vi.mocked(mockQueryBuilder.del)).toHaveBeenCalled();
            expect(affectedRows).toBe(1);
            expect(persistenceLogger.query).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "delete",
                affectedRows: 1
            });
        });

        it("should soft delete when softDelete is enabled", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(1);

            const affectedRows = await softDeleteQuery.delete({ id: 1 });

            expect(vi.mocked(mockQueryBuilder.update)).toHaveBeenCalled();
            expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith("deleted_at");
            expect(affectedRows).toBe(1);
            expect(persistenceLogger.query).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "softDelete",
                affectedRows: 1
            });
        });

        it("should handle array result for soft delete", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue([{}, {}]);

            const affectedRows = await softDeleteQuery.delete({ is_active: false });

            expect(affectedRows).toBe(2);
        });
    });

    describe("deleteById", () => {
        it("should delete record by id and return true", async () => {
            (mockQueryBuilder.del as ReturnType<typeof vi.fn>).mockResolvedValue(1);

            const result = await userQuery.deleteById(1);

            expect(result).toBe(true);
        });

        it("should return false when no record deleted", async () => {
            (mockQueryBuilder.del as ReturnType<typeof vi.fn>).mockResolvedValue(0);

            const result = await userQuery.deleteById(999);

            expect(result).toBe(false);
        });
    });

    describe("forceDelete", () => {
        it("should permanently delete record", async () => {
            const softDeleteQuery = new TestUserQuery(true);
            (mockQueryBuilder.del as ReturnType<typeof vi.fn>).mockResolvedValue(1);

            const affectedRows = await softDeleteQuery.forceDelete({ id: 1 });

            expect(vi.mocked(mockQueryBuilder.del)).toHaveBeenCalled();
            expect(affectedRows).toBe(1);
            expect(persistenceLogger.query).toHaveBeenCalledWith("SELECT * FROM users", {
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
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(restoredUser);

            const results = await softDeleteQuery.restore({ id: 1 });

            expect(mockQueryBuilder.whereNotNull).toHaveBeenCalledWith("deleted_at");
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
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue(restoredUsers);

            const results = await softDeleteQuery.restore({ is_active: true });

            expect(results).toEqual(restoredUsers);
        });
    });

    describe("count", () => {
        it("should count all records", async () => {
            (mockQueryBuilder.count as ReturnType<typeof vi.fn>).mockResolvedValue([{ count: "10" }]);

            const count = await userQuery.count();

            expect(count).toBe(10);
            expect(persistenceLogger.query).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "count",
                count: 10
            });
        });

        it("should count records with condition", async () => {
            (mockQueryBuilder.count as ReturnType<typeof vi.fn>).mockResolvedValue([{ count: "5" }]);

            const count = await userQuery.count({ is_active: true });

            expect(mockQueryBuilder.where).toHaveBeenCalledWith({ is_active: true });
            expect(count).toBe(5);
        });

        it("should handle numeric count", async () => {
            (mockQueryBuilder.count as ReturnType<typeof vi.fn>).mockResolvedValue([{ count: 7 }]);

            const count = await userQuery.count();

            expect(count).toBe(7);
        });
    });

    describe("exists", () => {
        it("should return true when record exists", async () => {
            (mockQueryBuilder.count as ReturnType<typeof vi.fn>).mockResolvedValue([{ count: "1" }]);

            const exists = await userQuery.exists({ email: "user@test.com" });

            expect(exists).toBe(true);
        });

        it("should return false when record does not exist", async () => {
            (mockQueryBuilder.count as ReturnType<typeof vi.fn>).mockResolvedValue([{ count: "0" }]);

            const exists = await userQuery.exists({ email: "notfound@test.com" });

            expect(exists).toBe(false);
        });
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
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue({});

            await userQuery.insert({ email: "test@test.com" }, mockTrx);

            expect(vi.mocked(mockDbClient.connect)).not.toHaveBeenCalled();
        });

        it("should use transaction for update", async () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;
            (mockQueryBuilder.then as ReturnType<typeof vi.fn>).mockResolvedValue({});

            await userQuery.update({ id: 1 }, { email: "updated@test.com" }, mockTrx);

            expect(vi.mocked(mockDbClient.connect)).not.toHaveBeenCalled();
        });

        it("should use transaction for delete", async () => {
            const mockTrx = vi.fn().mockReturnValue(mockQueryBuilder) as unknown as Knex.Transaction;

            await userQuery.delete({ id: 1 }, mockTrx);

            expect(vi.mocked(mockDbClient.connect)).not.toHaveBeenCalled();
        });
    });

    describe("Error handling", () => {
        it("should log and rethrow insert errors", async () => {
            const error = new Error("Insert failed");
            mockError = error; // Set error state

            await expect(userQuery.insert({ email: "test@test.com" })).rejects.toThrow("Insert failed");
            expect(persistenceLogger.error).toHaveBeenCalledWith("Insert failed", {
                table: "users",
                operation: "insert",
                error: "Insert failed"
            });
        });

        it("should log and rethrow update errors", async () => {
            const error = new Error("Update failed");
            mockError = error; // Set error state

            await expect(userQuery.update({ id: 1 }, { email: "test@test.com" })).rejects.toThrow("Update failed");
            expect(persistenceLogger.error).toHaveBeenCalledWith("Update failed", {
                table: "users",
                operation: "update",
                error: "Update failed"
            });
        });

        it("should log and rethrow delete errors", async () => {
            const error = new Error("Delete failed");
            mockError = error; // Set error state

            await expect(userQuery.delete({ id: 1 })).rejects.toThrow("Delete failed");
            expect(persistenceLogger.error).toHaveBeenCalledWith("Delete failed", {
                table: "users",
                operation: "delete",
                error: "Delete failed"
            });
        });

        it("should log and rethrow count errors", async () => {
            const error = new Error("Count failed");
            mockError = error; // Set error state

            await expect(userQuery.count()).rejects.toThrow("Count failed");
            expect(persistenceLogger.error).toHaveBeenCalledWith("Count query failed", {
                table: "users",
                operation: "count",
                error: "Count failed"
            });
        });

        it("should log unknown errors", async () => {
            mockError = new Error("Unknown error"); // Set error state

            await expect(userQuery.findAll()).rejects.toThrow();
            expect(persistenceLogger.error).toHaveBeenCalledWith("Query failed", {
                table: "users",
                operation: "findAll",
                error: "Unknown error"
            });
        });
    });
});
