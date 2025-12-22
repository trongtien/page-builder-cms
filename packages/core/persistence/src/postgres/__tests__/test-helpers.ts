import { vi } from "vitest";
import type { Knex } from "knex";
import { DatabaseClient } from "../client";
import type { BaseModel } from "../postgres.type";

// Mock modules
vi.mock("../client", () => ({
    DatabaseClient: {
        getInstance: vi.fn()
    }
}));

vi.mock("../../logger", () => ({
    persistenceLogger: {
        query: vi.fn(),
        error: vi.fn()
    }
}));

// Test types
export interface TestUser extends BaseModel {
    email: string;
    username: string;
    is_active: boolean;
}

// Mock state interface
export interface MockState {
    results: unknown[];
    error: Error | null;
}

/**
 * Create a mock Knex query builder with proper thenable implementation
 */
export function createMockQueryBuilder(mockState: MockState): Knex.QueryBuilder {
    const qb: Partial<Knex.QueryBuilder> & PromiseLike<unknown> = {
        // Main thenable implementation - used when awaiting the query builder directly
        then: vi.fn().mockImplementation(function (
            onfulfilled?: ((value: unknown) => unknown) | null,
            onrejected?: ((reason: unknown) => unknown) | null
        ) {
            // Check if there's a pending error
            if (mockState.error) {
                return Promise.reject(mockState.error).then(onfulfilled, onrejected);
            }
            return Promise.resolve(mockState.results).then(onfulfilled, onrejected);
        })
    };

    // Query builder methods that return the builder for chaining
    qb.where = vi.fn().mockReturnValue(qb);
    qb.whereNull = vi.fn().mockReturnValue(qb);
    qb.whereNotNull = vi.fn().mockReturnValue(qb);
    qb.select = vi.fn().mockReturnValue(qb);
    qb.orderBy = vi.fn().mockReturnValue(qb);
    qb.limit = vi.fn().mockReturnValue(qb);
    qb.offset = vi.fn().mockReturnValue(qb);
    qb.insert = vi.fn().mockReturnValue(qb);
    qb.update = vi.fn().mockReturnValue(qb);
    qb.returning = vi.fn().mockReturnValue(qb);
    qb.clearWhere = vi.fn().mockReturnValue(qb);
    qb.from = vi.fn().mockReturnValue(qb);

    // Methods that return promises
    qb.first = vi.fn().mockImplementation(() => {
        if (mockState.error) return Promise.reject(mockState.error);
        return Promise.resolve(mockState.results[0] || null);
    });

    qb.count = vi.fn().mockImplementation(() => {
        if (mockState.error) return Promise.reject(mockState.error);
        return Promise.resolve([{ count: "5" }]);
    });

    qb.del = vi.fn().mockImplementation(() => {
        if (mockState.error) return Promise.reject(mockState.error);
        return Promise.resolve(1);
    });

    // Utility methods
    qb.toQuery = vi.fn().mockReturnValue("SELECT * FROM users");

    return qb as unknown as Knex.QueryBuilder;
}

/**
 * Setup test mocks for BaseQuery tests
 */
export function setupTestMocks() {
    const mockState: MockState = {
        results: [],
        error: null
    };

    const mockQueryBuilder = createMockQueryBuilder(mockState);
    const mockKnex = vi.fn().mockImplementation(() => mockQueryBuilder) as unknown as Knex;

    const mockDbClient = {
        connect: vi.fn().mockResolvedValue(undefined),
        getKnexSync: vi.fn().mockReturnValue(mockKnex),
        disconnect: vi.fn().mockResolvedValue(undefined)
    } as unknown as DatabaseClient;

    // Mock DatabaseClient.getInstance before returning
    vi.mocked(DatabaseClient.getInstance).mockReturnValue(mockDbClient);

    return {
        mockState,
        mockQueryBuilder,
        mockKnex,
        mockDbClient
    };
}

/**
 * Reset mock state to default values
 */
export function resetMockState(mockState: MockState) {
    mockState.results = [];
    mockState.error = null;
}
