import { loadDatabaseConfig } from "../src/database.config";
import { ConfigValidationError } from "../src/validate-error";

describe("DatabaseConfig", () => {
    describe("loadDatabaseConfig", () => {
        it("should load valid database configuration", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "5432",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123",
                DATABASE_SSL: "true"
            };

            const config = loadDatabaseConfig(env);

            expect(config).toEqual({
                host: "localhost",
                port: 5432,
                name: "mydb",
                username: "user",
                password: "pass123",
                ssl: true,
                url: expect.stringContaining("postgresql://")
            });
        });

        it("should use default port 5432 when not provided", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            const config = loadDatabaseConfig(env);
            expect(config.port).toBe(5432);
        });

        it("should default SSL to false", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            const config = loadDatabaseConfig(env);
            expect(config.ssl).toBe(false);
        });

        it("should throw error when host is missing", () => {
            const env = {
                DATABASE_PORT: "5432",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            expect(() => loadDatabaseConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadDatabaseConfig(env)).toThrow(/DATABASE_HOST/);
        });

        it("should throw error when password is missing", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user"
            };

            expect(() => loadDatabaseConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadDatabaseConfig(env)).toThrow(/DATABASE_PASSWORD/);
        });

        it("should throw error when database name is missing", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            expect(() => loadDatabaseConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadDatabaseConfig(env)).toThrow(/DATABASE_NAME/);
        });

        it("should throw error when username is missing", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_NAME: "mydb",
                DATABASE_PASSWORD: "pass123"
            };

            expect(() => loadDatabaseConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadDatabaseConfig(env)).toThrow(/DATABASE_USERNAME/);
        });

        it("should validate port range", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "99999",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            expect(() => loadDatabaseConfig(env)).toThrow(/port must be between/);
        });

        it("should reject negative port", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "-1",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            expect(() => loadDatabaseConfig(env)).toThrow(/port must be between/);
        });

        it("should construct URL when not provided", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "5432",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123",
                DATABASE_SSL: "false"
            };

            const config = loadDatabaseConfig(env);
            expect(config.url).toBe("postgres://user:pass123@localhost:5432/mydb");
        });

        it("should construct URL with SSL when enabled", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "5432",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123",
                DATABASE_SSL: "true"
            };

            const config = loadDatabaseConfig(env);
            expect(config.url).toContain("postgresql://");
            expect(config.url).toContain("sslmode=require");
        });

        it("should use provided DATABASE_URL", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "5432",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123",
                DATABASE_URL: "postgresql://custom-url:5432/db"
            };

            const config = loadDatabaseConfig(env);
            expect(config.url).toBe("postgresql://custom-url:5432/db");
        });

        it("should trim whitespace from host", () => {
            const env = {
                DATABASE_HOST: "  localhost  ",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            const config = loadDatabaseConfig(env);
            expect(config.host).toBe("localhost");
        });

        it("should throw multiple validation errors", () => {
            const env = {
                DATABASE_PORT: "invalid"
            };

            try {
                loadDatabaseConfig(env);
                fail("Should have thrown ConfigValidationError");
            } catch (error) {
                expect(error).toBeInstanceOf(ConfigValidationError);
                const configError = error as ConfigValidationError;
                expect(configError.errors.length).toBeGreaterThan(1);
            }
        });
    });
});
