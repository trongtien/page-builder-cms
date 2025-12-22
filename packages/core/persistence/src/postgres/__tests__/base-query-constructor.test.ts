import { describe, it, expect, beforeEach, vi } from "vitest";
import { BaseQuery } from "../base-query";
import { DatabaseClient } from "../client";
import { setupTestMocks, resetMockState, type TestUser } from "./test-helpers";

class TestUserQuery extends BaseQuery<TestUser> {
    constructor(softDelete = false) {
        super("users", { softDelete });
    }
}

describe("BaseQuery - Constructor", () => {
    let userQuery: TestUserQuery;
    let mockDbClient: ReturnType<typeof setupTestMocks>["mockDbClient"];

    beforeEach(() => {
        vi.clearAllMocks();
        const mocks = setupTestMocks();
        mockDbClient = mocks.mockDbClient;
        resetMockState(mocks.mockState);
        userQuery = new TestUserQuery();
    });

    it("should initialize with table name", () => {
        expect(userQuery["tableName"]).toBe("users");
    });

    it("should get DatabaseClient instance", () => {
        expect(vi.mocked(DatabaseClient.getInstance)).toHaveBeenCalled();
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
