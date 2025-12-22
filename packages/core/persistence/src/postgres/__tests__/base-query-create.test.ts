import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseQuery } from "../base-query";
import { persistenceLogger } from "../../logger";
import { setupTestMocks, resetMockState, type TestUser } from "./test-helpers";

class TestUserQuery extends BaseQuery<TestUser> {
    constructor(softDelete = false) {
        super("users", { softDelete });
    }
}

describe("BaseQuery - Create Operations", () => {
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

    describe("insert", () => {
        it("should insert single record", async () => {
            const newUser = { email: "new@test.com", username: "newuser", is_active: true };
            const createdUser = { id: 1, ...newUser };
            mockState.results = [createdUser];

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
            mockState.results = createdUsers;

            const results = await userQuery.insert(newUsers);

            expect(results).toEqual(createdUsers);
            expect(vi.mocked(persistenceLogger.query)).toHaveBeenCalledWith("SELECT * FROM users", {
                table: "users",
                operation: "insert",
                count: 2
            });
        });

        it("should connect before insert", async () => {
            mockState.results = [{ id: 1, email: "test@test.com" }];
            await userQuery.insert({ email: "test@test.com" });
            expect(vi.mocked(mockDbClient.connect)).toHaveBeenCalled();
        });
    });

    describe("insertOne", () => {
        it("should insert one record and return it", async () => {
            const newUser = { email: "new@test.com", username: "newuser", is_active: true };
            const createdUser = { id: 1, ...newUser };
            mockState.results = [createdUser];

            const result = await userQuery.insertOne(newUser);

            expect(result).toEqual(createdUser);
        });
    });
});
