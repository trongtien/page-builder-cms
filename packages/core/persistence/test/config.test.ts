/**
 * Unit tests for configuration module
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, validateConfig, type DatabaseConfig } from "../src/postgres/config";

describe("loadConfig", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset process.env before each test
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        // Restore original env
        process.env = originalEnv;
    });

    it("should load DATABASE_URL from environment", () => {
        process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

        const config = loadConfig();

        expect(config.databaseUrl).toBe("postgresql://user:password@localhost:5432/testdb");
    });

    it("should throw error when DATABASE_URL is missing", () => {
        delete process.env.DATABASE_URL;

        expect(() => loadConfig()).toThrow("DATABASE_URL environment variable is required");
    });

    it("should apply default values for optional settings", () => {
        process.env.DATABASE_URL = "postgresql://localhost:5432/db";

        const config = loadConfig();

        expect(config.connectionTimeout).toBe(30000);
        expect(config.poolTimeout).toBe(30000);
        expect(config.maxConnections).toBe(10);
        expect(config.minConnections).toBe(2);
    });

    it("should parse custom connection timeout", () => {
        process.env.DATABASE_URL = "postgresql://localhost:5432/db";
        process.env.DB_CONNECTION_TIMEOUT = "60000";

        const config = loadConfig();

        expect(config.connectionTimeout).toBe(60000);
    });

    it("should parse custom pool timeout", () => {
        process.env.DATABASE_URL = "postgresql://localhost:5432/db";
        process.env.DB_POOL_TIMEOUT = "45000";

        const config = loadConfig();

        expect(config.poolTimeout).toBe(45000);
    });

    it("should parse custom max connections", () => {
        process.env.DATABASE_URL = "postgresql://localhost:5432/db";
        process.env.DB_MAX_CONNECTIONS = "20";

        const config = loadConfig();

        expect(config.maxConnections).toBe(20);
    });

    it("should parse custom min connections", () => {
        process.env.DATABASE_URL = "postgresql://localhost:5432/db";
        process.env.DB_MIN_CONNECTIONS = "5";

        const config = loadConfig();

        expect(config.minConnections).toBe(5);
    });

    it("should call validateConfig after loading", () => {
        process.env.DATABASE_URL = "postgresql://localhost:5432/db";

        expect(() => loadConfig()).not.toThrow();
    });
});

describe("validateConfig", () => {
    it("should accept valid PostgreSQL URL with postgresql:// scheme", () => {
        const config: DatabaseConfig = {
            databaseUrl: "postgresql://user:password@localhost:5432/db",
            connectionTimeout: 30000,
            poolTimeout: 30000,
            maxConnections: 10,
            minConnections: 2
        };

        expect(() => validateConfig(config)).not.toThrow();
    });

    it("should accept valid PostgreSQL URL with postgres:// scheme", () => {
        const config: DatabaseConfig = {
            databaseUrl: "postgres://user:password@localhost:5432/db",
            connectionTimeout: 30000,
            poolTimeout: 30000,
            maxConnections: 10,
            minConnections: 2
        };

        expect(() => validateConfig(config)).not.toThrow();
    });

    it("should reject non-PostgreSQL URL", () => {
        const config: DatabaseConfig = {
            databaseUrl: "mysql://localhost:3306/db",
            connectionTimeout: 30000,
            poolTimeout: 30000,
            maxConnections: 10,
            minConnections: 2
        };

        expect(() => validateConfig(config)).toThrow("DATABASE_URL must be a valid PostgreSQL connection string");
    });

    it("should reject when maxConnections < minConnections", () => {
        const config: DatabaseConfig = {
            databaseUrl: "postgresql://localhost:5432/db",
            connectionTimeout: 30000,
            poolTimeout: 30000,
            maxConnections: 5,
            minConnections: 10
        };

        expect(() => validateConfig(config)).toThrow("DB_MAX_CONNECTIONS (5) must be >= DB_MIN_CONNECTIONS (10)");
    });

    it("should reject negative minConnections", () => {
        const config: DatabaseConfig = {
            databaseUrl: "postgresql://localhost:5432/db",
            connectionTimeout: 30000,
            poolTimeout: 30000,
            maxConnections: 10,
            minConnections: -1
        };

        expect(() => validateConfig(config)).toThrow("DB_MIN_CONNECTIONS must be >= 0, got -1");
    });

    it("should reject negative connectionTimeout", () => {
        const config: DatabaseConfig = {
            databaseUrl: "postgresql://localhost:5432/db",
            connectionTimeout: -1000,
            poolTimeout: 30000,
            maxConnections: 10,
            minConnections: 2
        };

        expect(() => validateConfig(config)).toThrow("DB_CONNECTION_TIMEOUT must be >= 0, got -1000");
    });

    it("should reject negative poolTimeout", () => {
        const config: DatabaseConfig = {
            databaseUrl: "postgresql://localhost:5432/db",
            connectionTimeout: 30000,
            poolTimeout: -5000,
            maxConnections: 10,
            minConnections: 2
        };

        expect(() => validateConfig(config)).toThrow("DB_POOL_TIMEOUT must be >= 0, got -5000");
    });

    it("should accept zero minConnections", () => {
        const config: DatabaseConfig = {
            databaseUrl: "postgresql://localhost:5432/db",
            connectionTimeout: 30000,
            poolTimeout: 30000,
            maxConnections: 10,
            minConnections: 0
        };

        expect(() => validateConfig(config)).not.toThrow();
    });

    it("should accept equal min and max connections", () => {
        const config: DatabaseConfig = {
            databaseUrl: "postgresql://localhost:5432/db",
            connectionTimeout: 30000,
            poolTimeout: 30000,
            maxConnections: 5,
            minConnections: 5
        };

        expect(() => validateConfig(config)).not.toThrow();
    });
});
