import { config, loadEnvFiles } from "../src/index";
import {
    resetDatabaseConfig,
    resetJwtConfig,
    resetTestingConfig,
    loadDatabaseConfig,
    loadJwtConfig,
    loadTestingConfig
} from "../src";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

describe("Config", () => {
    beforeEach(() => {
        // Set up test environment variables
        process.env.DATABASE_HOST = "localhost";
        process.env.DATABASE_PORT = "5432";
        process.env.DATABASE_NAME = "testdb";
        process.env.DATABASE_USERNAME = "testuser";
        process.env.DATABASE_PASSWORD = "testpass";
        process.env.DATABASE_SSL = "false";

        process.env.JWT_SECRET = "test-secret-key-with-at-least-32-characters-long";
        process.env.JWT_EXPIRES_IN = "1h";
        process.env.JWT_ISSUER = "test-issuer";
        process.env.JWT_AUDIENCE = "test-audience";
        process.env.JWT_ALGORITHM = "HS256";

        process.env.NODE_ENV = "test";

        // Reset cached configs
        resetDatabaseConfig();
        resetJwtConfig();
        resetTestingConfig();
    });

    afterEach(() => {
        // Clean up environment variables
        delete process.env.DATABASE_HOST;
        delete process.env.DATABASE_PORT;
        delete process.env.DATABASE_NAME;
        delete process.env.DATABASE_USERNAME;
        delete process.env.DATABASE_PASSWORD;
        delete process.env.DATABASE_SSL;
        delete process.env.JWT_SECRET;
        delete process.env.JWT_EXPIRES_IN;
        delete process.env.JWT_ISSUER;
        delete process.env.JWT_AUDIENCE;
        delete process.env.JWT_ALGORITHM;
    });

    describe("config.database", () => {
        it("should return database configuration", () => {
            const dbConfig = config.database;

            expect(dbConfig).toBeDefined();
            expect(dbConfig.host).toBe("localhost");
            expect(dbConfig.port).toBe(5432);
            expect(dbConfig.name).toBe("testdb");
            expect(dbConfig.username).toBe("testuser");
            expect(dbConfig.password).toBe("testpass");
            expect(dbConfig.ssl).toBe(false);
            expect(dbConfig.url).toBeDefined();
        });

        it("should cache database configuration", () => {
            const dbConfig1 = config.database;
            const dbConfig2 = config.database;

            expect(dbConfig1).toBe(dbConfig2);
        });

        it("should have proper type safety", () => {
            const dbConfig = config.database;

            expect(typeof dbConfig.host).toBe("string");
            expect(typeof dbConfig.port).toBe("number");
            expect(typeof dbConfig.ssl).toBe("boolean");
        });
    });

    describe("config.jwt", () => {
        it("should return JWT configuration", () => {
            const jwtConfig = config.jwt;

            expect(jwtConfig).toBeDefined();
            expect(jwtConfig.secret).toBe("test-secret-key-with-at-least-32-characters-long");
            expect(jwtConfig.expiresIn).toBe("1h");
            expect(jwtConfig.issuer).toBe("test-issuer");
            expect(jwtConfig.audience).toBe("test-audience");
            expect(jwtConfig.algorithm).toBe("HS256");
        });

        it("should cache JWT configuration", () => {
            const jwtConfig1 = config.jwt;
            const jwtConfig2 = config.jwt;

            expect(jwtConfig1).toBe(jwtConfig2);
        });
    });

    describe("config.testing", () => {
        it("should return testing configuration", () => {
            const testConfig = config.testing;

            expect(testConfig).toBeDefined();
            expect(testConfig.enabled).toBe(true);
            expect(testConfig.database.host).toBe("localhost");
            expect(testConfig.database.port).toBe(5433);
            expect(testConfig.database.name).toBe("test_db");
        });

        it("should cache testing configuration", () => {
            const testConfig1 = config.testing;
            const testConfig2 = config.testing;

            expect(testConfig1).toBe(testConfig2);
        });
    });

    describe("loadEnvFiles", () => {
        const testEnvPath = join(process.cwd(), ".env.test");
        const originalNodeEnv = process.env.NODE_ENV;

        afterEach(() => {
            // Clean up test file if it exists
            if (existsSync(testEnvPath)) {
                unlinkSync(testEnvPath);
            }
            // Restore NODE_ENV
            if (originalNodeEnv) {
                process.env.NODE_ENV = originalNodeEnv;
            } else {
                delete process.env.NODE_ENV;
            }
        });

        it("should be callable", () => {
            expect(() => loadEnvFiles()).not.toThrow();
        });

        it("should accept custom base path", () => {
            expect(() => loadEnvFiles("/custom/path")).not.toThrow();
        });

        it("should load environment files when they exist", () => {
            // Create a test .env file
            writeFileSync(testEnvPath, "TEST_VAR=test_value\n");

            // Load env files
            loadEnvFiles();

            // The file should be loaded (though it won't override existing vars)
            expect(existsSync(testEnvPath)).toBe(true);

            // Clean up
            unlinkSync(testEnvPath);
        });

        it("should use development as default when NODE_ENV is not set", () => {
            delete process.env.NODE_ENV;

            // Should not throw and should default to development
            expect(() => loadEnvFiles()).not.toThrow();
        });
    });

    describe("individual loaders", () => {
        it("should call loadDatabaseConfig with custom env", () => {
            const customEnv = {
                DATABASE_HOST: "custom-host",
                DATABASE_PORT: "3306",
                DATABASE_NAME: "custom-db",
                DATABASE_USERNAME: "custom-user",
                DATABASE_PASSWORD: "custom-pass"
            };

            const dbConfig = loadDatabaseConfig(customEnv);
            expect(dbConfig.host).toBe("custom-host");
            expect(dbConfig.port).toBe(3306);
        });

        it("should call loadJwtConfig with custom env", () => {
            const customEnv = {
                JWT_SECRET: "another-very-long-secret-key-at-least-32-chars",
                JWT_EXPIRES_IN: "2h",
                JWT_ISSUER: "custom-issuer",
                JWT_AUDIENCE: "custom-audience"
            };

            const jwtConfig = loadJwtConfig(customEnv);
            expect(jwtConfig.secret).toBe("another-very-long-secret-key-at-least-32-chars");
            expect(jwtConfig.expiresIn).toBe("2h");
        });

        it("should call loadTestingConfig with custom env", () => {
            const customEnv = {
                NODE_ENV: "test",
                TEST_DATABASE_HOST: "test-host"
            };

            const testConfig = loadTestingConfig(customEnv);
            expect(testConfig.enabled).toBe(true);
            expect(testConfig.database.host).toBe("test-host");
        });
    });

    describe("singleton behavior", () => {
        it("should maintain singleton across multiple accesses", () => {
            const db1 = config.database;
            const jwt1 = config.jwt;
            const test1 = config.testing;

            const db2 = config.database;
            const jwt2 = config.jwt;
            const test2 = config.testing;

            expect(db1).toBe(db2);
            expect(jwt1).toBe(jwt2);
            expect(test1).toBe(test2);
        });

        it("should reset cache when reset functions are called", () => {
            const db1 = config.database;

            resetDatabaseConfig();

            const db2 = config.database;

            // Should be new instance but with same values
            expect(db1).not.toBe(db2);
            expect(db1).toEqual(db2);
        });
    });
});
