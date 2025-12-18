import { loadTestingConfig } from "../src/testing.config";
import { ConfigValidationError } from "../src/validate-error";

describe("TestingConfig", () => {
    describe("loadTestingConfig", () => {
        it("should load valid testing configuration", () => {
            const env = {
                NODE_ENV: "test",
                TEST_DATABASE_HOST: "localhost",
                TEST_DATABASE_PORT: "5433",
                TEST_DATABASE_NAME: "test_db",
                TEST_MOCK_EXTERNAL: "true",
                TEST_COVERAGE: "true"
            };

            const config = loadTestingConfig(env);

            expect(config).toEqual({
                enabled: true,
                database: {
                    host: "localhost",
                    port: 5433,
                    name: "test_db"
                },
                mockExternal: true,
                coverage: true
            });
        });

        it("should enable testing when NODE_ENV is test", () => {
            const env = {
                NODE_ENV: "test"
            };

            const config = loadTestingConfig(env);
            expect(config.enabled).toBe(true);
        });

        it("should enable testing when TEST_ENABLED is true", () => {
            const env = {
                NODE_ENV: "development",
                TEST_ENABLED: "true"
            };

            const config = loadTestingConfig(env);
            expect(config.enabled).toBe(true);
        });

        it("should use default values when not provided", () => {
            const env = {
                NODE_ENV: "test"
            };

            const config = loadTestingConfig(env);

            expect(config.database.host).toBe("localhost");
            expect(config.database.port).toBe(5433);
            expect(config.database.name).toBe("test_db");
            expect(config.mockExternal).toBe(true);
            expect(config.coverage).toBe(false);
        });

        it("should validate test database port range", () => {
            const env = {
                NODE_ENV: "test",
                TEST_DATABASE_PORT: "99999"
            };

            expect(() => loadTestingConfig(env)).toThrow(/port must be between/);
        });

        it("should reject negative test port", () => {
            const env = {
                NODE_ENV: "test",
                TEST_DATABASE_PORT: "-1"
            };

            expect(() => loadTestingConfig(env)).toThrow(/port must be between/);
        });

        it("should disable mock external when explicitly set to false", () => {
            const env = {
                NODE_ENV: "test",
                TEST_MOCK_EXTERNAL: "false"
            };

            const config = loadTestingConfig(env);
            expect(config.mockExternal).toBe(false);
        });

        it("should enable coverage when set to true", () => {
            const env = {
                NODE_ENV: "test",
                TEST_COVERAGE: "true"
            };

            const config = loadTestingConfig(env);
            expect(config.coverage).toBe(true);
        });

        it("should trim whitespace from database host", () => {
            const env = {
                NODE_ENV: "test",
                TEST_DATABASE_HOST: "  testhost  "
            };

            const config = loadTestingConfig(env);
            expect(config.database.host).toBe("testhost");
        });

        it("should handle invalid port gracefully", () => {
            const env = {
                NODE_ENV: "test",
                TEST_DATABASE_PORT: "invalid"
            };

            expect(() => loadTestingConfig(env)).toThrow(ConfigValidationError);
        });

        it("should not enable testing in production", () => {
            const env = {
                NODE_ENV: "production"
            };

            const config = loadTestingConfig(env);
            expect(config.enabled).toBe(false);
        });

        it("should allow custom test database configuration", () => {
            const env = {
                NODE_ENV: "test",
                TEST_DATABASE_HOST: "test-server",
                TEST_DATABASE_PORT: "3306",
                TEST_DATABASE_NAME: "my_test_db"
            };

            const config = loadTestingConfig(env);

            expect(config.database.host).toBe("test-server");
            expect(config.database.port).toBe(3306);
            expect(config.database.name).toBe("my_test_db");
        });
    });
});
