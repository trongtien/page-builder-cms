import type { ValidationError } from "./node-config.type";
import { ConfigValidationError } from "./validate-error";

/**
 * Testing configuration interface
 * Manages test database and mock settings
 */
export interface TestingConfig {
    enabled: boolean;
    database: {
        host: string;
        port: number;
        name: string;
    };
    mockExternal: boolean;
    coverage: boolean;
}

/**
 * Load and validate testing configuration
 */
export function loadTestingConfig(env: Record<string, string | undefined>): TestingConfig {
    const errors: ValidationError[] = [];

    // Check if testing is enabled
    const enabled = env.NODE_ENV === "test" || env.TEST_ENABLED?.toLowerCase() === "true";

    // Test database host with fallback
    const host = env.TEST_DATABASE_HOST?.trim() || "localhost";

    // Test database port with fallback
    const portStr = env.TEST_DATABASE_PORT || "5433";
    const port = parseInt(portStr, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
        errors.push({
            field: "TEST_DATABASE_PORT",
            message: `Test database port must be between 1 and 65535, got: ${portStr}`
        });
    }

    // Test database name with fallback
    const name = env.TEST_DATABASE_NAME?.trim() || "test_db";

    // Mock external services in test
    const mockExternal = env.TEST_MOCK_EXTERNAL?.toLowerCase() !== "false";

    // Enable coverage collection
    const coverage = env.TEST_COVERAGE?.toLowerCase() === "true";

    if (errors.length > 0) {
        throw new ConfigValidationError("Testing configuration invalid", errors, env);
    }

    return {
        enabled,
        database: {
            host,
            port,
            name
        },
        mockExternal,
        coverage
    };
}

/**
 * Testing configuration singleton
 * Loads configuration on first access
 */
let cachedTestingConfig: TestingConfig | null = null;

export function getTestingConfig(): TestingConfig {
    if (!cachedTestingConfig) {
        cachedTestingConfig = loadTestingConfig(process.env);
    }
    return cachedTestingConfig;
}

/**
 * Reset cached configuration (useful for testing)
 */
export function resetTestingConfig(): void {
    cachedTestingConfig = null;
}
