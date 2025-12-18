import { loadJwtConfig } from "../src/jwt.config";
import { ConfigValidationError } from "../src/validate-error";

describe("JwtConfig", () => {
    describe("loadJwtConfig", () => {
        it("should load valid JWT configuration", () => {
            const env = {
                JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                JWT_EXPIRES_IN: "1h",
                JWT_ISSUER: "page-builder-cms",
                JWT_AUDIENCE: "page-builder-api",
                JWT_ALGORITHM: "HS256"
            };

            const config = loadJwtConfig(env);

            expect(config).toEqual({
                secret: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                expiresIn: "1h",
                issuer: "page-builder-cms",
                audience: "page-builder-api",
                algorithm: "HS256"
            });
        });

        it("should use default expiresIn when not provided", () => {
            const env = {
                JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                JWT_ISSUER: "page-builder-cms",
                JWT_AUDIENCE: "page-builder-api"
            };

            const config = loadJwtConfig(env);
            expect(config.expiresIn).toBe("1h");
        });

        it("should use default algorithm when not provided", () => {
            const env = {
                JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                JWT_ISSUER: "page-builder-cms",
                JWT_AUDIENCE: "page-builder-api"
            };

            const config = loadJwtConfig(env);
            expect(config.algorithm).toBe("HS256");
        });

        it("should throw error when secret is missing", () => {
            const env = {
                JWT_ISSUER: "page-builder-cms",
                JWT_AUDIENCE: "page-builder-api"
            };

            expect(() => loadJwtConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadJwtConfig(env)).toThrow(/JWT_SECRET/);
        });

        it("should throw error when secret is too short", () => {
            const env = {
                JWT_SECRET: "short",
                JWT_ISSUER: "page-builder-cms",
                JWT_AUDIENCE: "page-builder-api"
            };

            expect(() => loadJwtConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadJwtConfig(env)).toThrow(/at least 32 characters/);
        });

        it("should throw error when issuer is missing", () => {
            const env = {
                JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                JWT_AUDIENCE: "page-builder-api"
            };

            expect(() => loadJwtConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadJwtConfig(env)).toThrow(/JWT_ISSUER/);
        });

        it("should throw error when audience is missing", () => {
            const env = {
                JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                JWT_ISSUER: "page-builder-cms"
            };

            expect(() => loadJwtConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadJwtConfig(env)).toThrow(/JWT_AUDIENCE/);
        });

        it("should validate expiresIn format", () => {
            const env = {
                JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                JWT_EXPIRES_IN: "invalid",
                JWT_ISSUER: "page-builder-cms",
                JWT_AUDIENCE: "page-builder-api"
            };

            expect(() => loadJwtConfig(env)).toThrow(/format: 30s, 15m, 1h, 7d/);
        });

        it("should accept valid time formats", () => {
            const validFormats = ["30s", "15m", "1h", "7d", "365d"];

            validFormats.forEach((format) => {
                const env = {
                    JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                    JWT_EXPIRES_IN: format,
                    JWT_ISSUER: "page-builder-cms",
                    JWT_AUDIENCE: "page-builder-api"
                };

                const config = loadJwtConfig(env);
                expect(config.expiresIn).toBe(format);
            });
        });

        it("should validate algorithm", () => {
            const env = {
                JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                JWT_ISSUER: "page-builder-cms",
                JWT_AUDIENCE: "page-builder-api",
                JWT_ALGORITHM: "INVALID"
            };

            expect(() => loadJwtConfig(env)).toThrow(/must be one of/);
        });

        it("should accept valid algorithms", () => {
            const validAlgorithms = ["HS256", "HS384", "HS512", "RS256"];

            validAlgorithms.forEach((algorithm) => {
                const env = {
                    JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                    JWT_ISSUER: "page-builder-cms",
                    JWT_AUDIENCE: "page-builder-api",
                    JWT_ALGORITHM: algorithm
                };

                const config = loadJwtConfig(env);
                expect(config.algorithm).toBe(algorithm);
            });
        });

        it("should trim whitespace from issuer and audience", () => {
            const env = {
                JWT_SECRET: "this-is-a-very-long-secret-key-with-at-least-32-characters",
                JWT_ISSUER: "  page-builder-cms  ",
                JWT_AUDIENCE: "  page-builder-api  "
            };

            const config = loadJwtConfig(env);
            expect(config.issuer).toBe("page-builder-cms");
            expect(config.audience).toBe("page-builder-api");
        });
    });
});
