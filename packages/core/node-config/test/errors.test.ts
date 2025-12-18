import { ConfigValidationError } from "../src/validate-error";
import type { ValidationError } from "../src/node-config.type";

describe("ConfigValidationError", () => {
    it("should create error with message and errors", () => {
        const errors: ValidationError[] = [{ field: "TEST_FIELD", message: "Test field is required" }];

        const error = new ConfigValidationError("Test error", errors, {});

        expect(error.message).toContain("Test error");
        expect(error.message).toContain("TEST_FIELD");
        expect(error.errors).toEqual(errors);
        expect(error.name).toBe("ConfigValidationError");
    });

    it("should format errors with missing fields", () => {
        const errors: ValidationError[] = [
            { field: "FIELD1", message: "Field 1 is required" },
            { field: "FIELD2", message: "Field 2 is required" }
        ];

        const error = new ConfigValidationError("Config invalid", errors, {});
        const formatted = error.formatErrors();

        expect(formatted).toContain("Missing required variables");
        expect(formatted).toContain("FIELD1");
        expect(formatted).toContain("FIELD2");
    });

    it("should format errors with invalid values", () => {
        const errors: ValidationError[] = [
            { field: "PORT", message: "Port must be a number" },
            { field: "TIMEOUT", message: "Timeout must be positive" }
        ];

        const error = new ConfigValidationError("Config invalid", errors, {});
        const formatted = error.formatErrors();

        expect(formatted).toContain("Invalid values");
        expect(formatted).toContain("PORT");
        expect(formatted).toContain("TIMEOUT");
    });

    it("should format errors with both missing and invalid fields", () => {
        const errors: ValidationError[] = [
            { field: "REQUIRED_FIELD", message: "This field is required" },
            { field: "INVALID_FIELD", message: "This field must be a number" }
        ];

        const error = new ConfigValidationError("Config invalid", errors, {});
        const formatted = error.formatErrors();

        expect(formatted).toContain("Missing required variables");
        expect(formatted).toContain("REQUIRED_FIELD");
        expect(formatted).toContain("Invalid values");
        expect(formatted).toContain("INVALID_FIELD");
    });

    it("should include guidance message", () => {
        const errors: ValidationError[] = [{ field: "TEST", message: "Test error" }];

        const error = new ConfigValidationError("Config invalid", errors, {});
        const formatted = error.formatErrors();

        expect(formatted).toContain("Please check your .env file");
    });

    it("should store raw config", () => {
        const errors: ValidationError[] = [];
        const rawConfig = { TEST: "value" };

        const error = new ConfigValidationError("Test", errors, rawConfig);

        expect(error.rawConfig).toEqual(rawConfig);
    });

    it("should have stack trace", () => {
        const errors: ValidationError[] = [];
        const error = new ConfigValidationError("Test", errors, {});

        expect(error.stack).toBeDefined();
    });
});
