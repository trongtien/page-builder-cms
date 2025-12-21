import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { loadEnv } from "../env-loader";
import { HostConfiguration } from "../host";
import { DatabaseConfiguration } from "../database";

describe("Integration Tests", () => {
    // Clean up test environment variables
    afterEach(() => {
        const testVars = [
            "HOST",
            "PORT",
            "DB_HOST",
            "DB_PORT",
            "DB_NAME",
            "DB_SCHEMA",
            "DB_USERNAME",
            "DB_PASSWORD",
            "USERNAME",
            "PASSWORD"
        ];
        testVars.forEach((varName) => {
            delete process.env[varName];
        });
    });

    describe("HostConfiguration Integration", () => {
        it("should load env file and initialize HostConfiguration correctly", () => {
            // Load environment file
            const result = loadEnv({ path: "src/__tests__/fixtures/.env.test" });
            expect(result.success).toBe(true);

            // Create HostConfiguration
            const config = new HostConfiguration();

            // Verify values from loaded env file
            expect(config.host).toBe("testhost");
            expect(config.port).toBe(4000);
        });

        it("should work without calling loadEnv (backward compatibility)", () => {
            // Set environment variables directly
            process.env.HOST = "localhost";
            process.env.PORT = "3000";

            // Create configuration without loadEnv
            const config = new HostConfiguration();

            expect(config.host).toBe("localhost");
            expect(config.port).toBe(3000);
        });
    });

    describe("DatabaseConfiguration Integration", () => {
        it("should load env file and initialize DatabaseConfiguration correctly", () => {
            // Load environment file
            const result = loadEnv({ path: "src/__tests__/fixtures/.env.test" });
            expect(result.success).toBe(true);

            // Create DatabaseConfiguration
            const config = new DatabaseConfiguration();

            // Verify values from loaded env file
            expect(config.host).toBe("testdb.local");
            expect(config.port).toBe(5433);
            expect(config.dbName).toBe("testdatabase");
            expect(config.dbSchema).toBe("test_schema");
            expect(config.username).toBe("testuser");
            expect(config.password).toBe("testpass123");
        });
    });

    describe("Multiple Configuration Classes", () => {
        it("should work with both HostConfiguration and DatabaseConfiguration", () => {
            // Load environment file once
            loadEnv({ path: "src/__tests__/fixtures/.env.test" });

            // Create both configurations
            const hostConfig = new HostConfiguration();
            const dbConfig = new DatabaseConfiguration();

            // Both should have correct values
            expect(hostConfig.host).toBe("testhost");
            expect(hostConfig.port).toBe(4000);
            expect(dbConfig.host).toBe("testdb.local");
            expect(dbConfig.dbName).toBe("testdatabase");
        });
    });

    describe("Multiple Environment Files", () => {
        it("should load multiple env files in sequence", () => {
            // Load base environment
            loadEnv({ path: "src/__tests__/fixtures/.env.test" });
            expect(process.env.PORT).toBe("4000");

            // Load override environment
            loadEnv({ path: "src/__tests__/fixtures/.env.override", override: true });
            expect(process.env.PORT).toBe("9999"); // Overridden

            // Create configuration with final values
            const config = new HostConfiguration();
            expect(config.port).toBe(9999);
        });
    });

    describe("Real-World Scenarios", () => {
        it("should simulate development workflow", () => {
            // Developer loads local env file
            loadEnv({ path: "src/__tests__/fixtures/.env.test" });

            // App initializes configurations
            const hostConfig = new HostConfiguration();
            const dbConfig = new DatabaseConfiguration();

            // Configurations have correct local values
            expect(hostConfig.host).toBe("testhost");
            expect(dbConfig.host).toBe("testdb.local");
            expect(dbConfig.dbName).toBe("testdatabase");
        });

        it("should simulate CI/CD workflow without loadEnv", () => {
            // CI sets environment variables directly (no .env file)
            process.env.HOST = "ci-host";
            process.env.PORT = "8080";
            process.env.DB_HOST = "ci-db";
            process.env.DB_PORT = "5432";
            process.env.DB_NAME = "ci_db";
            process.env.DB_SCHEMA = "public";
            process.env.DB_USERNAME = "ci_user";
            process.env.DB_PASSWORD = "ci_pass";
            process.env.USERNAME = "ci_user";
            process.env.PASSWORD = "ci_pass";

            // Configurations work without loadEnv
            const hostConfig = new HostConfiguration();
            const dbConfig = new DatabaseConfiguration();

            expect(hostConfig.host).toBe("ci-host");
            expect(dbConfig.dbName).toBe("ci_db");
        });
    });

    describe("Error Handling Integration", () => {
        it("should handle missing env file gracefully in development", () => {
            // Try to load optional env file
            const result = loadEnv({ path: ".env.local" });

            if (!result.success) {
                // Fall back to default values or other env vars
                process.env.HOST = "localhost";
                process.env.PORT = "3000";
            }

            // Configuration should still work
            const config = new HostConfiguration();
            expect(config.host).toBe("localhost");
            expect(config.port).toBe(3000);
        });
    });
});
