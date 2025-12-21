import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { resolve } from "path";
import { loadEnv, loadEnvOrThrow } from "../env-loader";

describe("loadEnv", () => {
    // Clean up test environment variables after each test
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
            "TEST_VAR",
            "NODE_ENV",
            "VALID_VAR",
            "ANOTHER_VALID",
            "OVERRIDE_VAR",
            "NEW_VAR"
        ];
        testVars.forEach((varName) => {
            delete process.env[varName];
        });
    });

    describe("Basic Functionality", () => {
        it("should load environment variables from custom path (relative)", () => {
            const result = loadEnv({ path: "src/__tests__/fixtures/.env.test" });

            expect(result.success).toBe(true);
            expect(result.path).toContain(".env.test");
            expect(result.error).toBeUndefined();
            expect(result.parsed).toBeDefined();
            expect(process.env.HOST).toBe("testhost");
            expect(process.env.PORT).toBe("4000");
            expect(process.env.TEST_VAR).toBe("test_value");
        });

        it("should load environment variables from custom path (absolute)", () => {
            const absolutePath = resolve(process.cwd(), "src/__tests__/fixtures/.env.test");
            const result = loadEnv({ path: absolutePath });

            expect(result.success).toBe(true);
            expect(result.path).toBe(absolutePath);
            expect(process.env.HOST).toBe("testhost");
        });

        it("should return parsed variables in result", () => {
            const result = loadEnv({ path: "src/__tests__/fixtures/.env.test" });

            expect(result.parsed).toBeDefined();
            expect(result.parsed?.HOST).toBe("testhost");
            expect(result.parsed?.PORT).toBe("4000");
            expect(result.parsed?.TEST_VAR).toBe("test_value");
        });
    });

    describe("File Not Found Scenarios", () => {
        it("should return failure for missing file with required=false (default)", () => {
            const result = loadEnv({ path: "nonexistent.env" });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Environment file not found");
            expect(result.error).toContain("nonexistent.env");
            expect(result.parsed).toBeUndefined();
        });

        it("should return failure for missing file with required=true", () => {
            const result = loadEnv({ path: "missing.env", required: true });

            expect(result.success).toBe(false);
            expect(result.error).toContain("Required environment file not found");
            expect(result.error).toContain("missing.env");
        });

        it("should succeed with empty environment file", () => {
            const result = loadEnv({ path: "src/__tests__/fixtures/.env.empty" });

            expect(result.success).toBe(true);
            expect(result.parsed).toBeDefined();
            expect(Object.keys(result.parsed || {}).length).toBe(0);
        });
    });

    describe("Override Behavior", () => {
        beforeEach(() => {
            // Set original values
            process.env.PORT = "3000";
            process.env.TEST_VAR = "original";
        });

        it("should not override existing process.env by default", () => {
            loadEnv({ path: "src/__tests__/fixtures/.env.test" });

            // Should keep original values
            expect(process.env.PORT).toBe("3000");
            expect(process.env.TEST_VAR).toBe("original");
            // Should add new values
            expect(process.env.HOST).toBe("testhost");
        });

        it("should override existing process.env when override=true", () => {
            loadEnv({ path: "src/__tests__/fixtures/.env.test", override: true });

            // Should override with new values
            expect(process.env.PORT).toBe("4000");
            expect(process.env.TEST_VAR).toBe("test_value");
            expect(process.env.HOST).toBe("testhost");
        });

        it("should handle multiple calls with override behavior", () => {
            // First load
            loadEnv({ path: "src/__tests__/fixtures/.env.test" });
            expect(process.env.PORT).toBe("3000"); // Original value preserved

            // Second load with override
            loadEnv({ path: "src/__tests__/fixtures/.env.override", override: true });
            expect(process.env.PORT).toBe("9999"); // Overridden
            expect(process.env.OVERRIDE_VAR).toBe("overridden_value");
        });
    });

    describe("Error Handling", () => {
        it("should include file path in result on success", () => {
            const result = loadEnv({ path: "src/__tests__/fixtures/.env.test" });

            expect(result.path).toContain("__tests__");
            expect(result.path).toContain(".env.test");
            expect(result.path).toContain(process.cwd());
        });

        it("should include attempted file path in result on failure", () => {
            const result = loadEnv({ path: "missing.env" });

            expect(result.path).toContain("missing.env");
            expect(result.path).toContain(process.cwd());
        });

        it("should handle malformed file gracefully", () => {
            // dotenv actually tolerates invalid lines, so this should succeed
            const result = loadEnv({ path: "src/__tests__/fixtures/.env.malformed" });

            expect(result.success).toBe(true);
            // Valid variables should still be loaded
            expect(process.env.VALID_VAR).toBe("value");
            expect(process.env.ANOTHER_VALID).toBe("another_value");
        });
    });

    describe("Edge Cases", () => {
        it("should be idempotent (multiple calls work correctly)", () => {
            const result1 = loadEnv({ path: "src/__tests__/fixtures/.env.test" });
            const result2 = loadEnv({ path: "src/__tests__/fixtures/.env.test" });

            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
            expect(process.env.HOST).toBe("testhost");
        });

        it("should work with default encoding", () => {
            const result = loadEnv({
                path: "src/__tests__/fixtures/.env.test",
                encoding: "utf8"
            });

            expect(result.success).toBe(true);
            expect(process.env.HOST).toBe("testhost");
        });

        it("should handle relative paths correctly", () => {
            const result = loadEnv({ path: "./src/__tests__/fixtures/.env.test" });

            expect(result.success).toBe(true);
            expect(process.env.HOST).toBe("testhost");
        });
    });
});

describe("loadEnvOrThrow", () => {
    // Clean up test environment variables after each test
    afterEach(() => {
        const testVars = ["HOST", "PORT", "TEST_VAR", "DB_HOST"];
        testVars.forEach((varName) => {
            delete process.env[varName];
        });
    });

    it("should not throw on success", () => {
        expect(() => {
            loadEnvOrThrow({ path: "src/__tests__/fixtures/.env.test" });
        }).not.toThrow();

        expect(process.env.HOST).toBe("testhost");
    });

    it("should throw error for missing file", () => {
        expect(() => {
            loadEnvOrThrow({ path: "missing.env" });
        }).toThrow("Failed to load environment file");
    });

    it("should include file path in error message", () => {
        expect(() => {
            loadEnvOrThrow({ path: "config/.env.production" });
        }).toThrow(/config/);
        expect(() => {
            loadEnvOrThrow({ path: "config/.env.production" });
        }).toThrow(/\.env\.production/);
    });

    it("should throw for required missing file", () => {
        expect(() => {
            loadEnvOrThrow({ path: "missing.env", required: true });
        }).toThrow("Required environment file not found");
    });

    it("should work with valid file", () => {
        loadEnvOrThrow({ path: "src/__tests__/fixtures/.env.test" });

        expect(process.env.HOST).toBe("testhost");
        expect(process.env.PORT).toBe("4000");
        expect(process.env.TEST_VAR).toBe("test_value");
    });
});
