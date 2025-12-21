import { describe, it, expect } from "vitest";
import { truncate, capitalize, toCamelCase, toKebabCase, toSnakeCase, slugify } from "./string";

describe("String Utils", () => {
    describe("truncate", () => {
        it("should truncate long text with default suffix", () => {
            expect(truncate("Hello World", 8)).toBe("Hello...");
        });

        it("should not truncate short text", () => {
            expect(truncate("Hello", 10)).toBe("Hello");
        });

        it("should use custom suffix", () => {
            expect(truncate("Hello World", 8, "...")).toBe("Hello...");
        });
    });

    describe("capitalize", () => {
        it("should capitalize first letter", () => {
            expect(capitalize("hello")).toBe("Hello");
        });

        it("should handle empty string", () => {
            expect(capitalize("")).toBe("");
        });

        it("should lowercase rest of string", () => {
            expect(capitalize("hELLO")).toBe("Hello");
        });
    });

    describe("toCamelCase", () => {
        it("should convert to camel case", () => {
            expect(toCamelCase("hello world")).toBe("helloWorld");
        });

        it("should handle multiple words", () => {
            expect(toCamelCase("hello world foo bar")).toBe("helloWorldFooBar");
        });
    });

    describe("toKebabCase", () => {
        it("should convert to kebab case", () => {
            expect(toKebabCase("helloWorld")).toBe("hello-world");
        });

        it("should handle spaces", () => {
            expect(toKebabCase("hello world")).toBe("hello-world");
        });
    });

    describe("toSnakeCase", () => {
        it("should convert to snake case", () => {
            expect(toSnakeCase("helloWorld")).toBe("hello_world");
        });

        it("should handle spaces", () => {
            expect(toSnakeCase("hello world")).toBe("hello_world");
        });
    });

    describe("slugify", () => {
        it("should create slug from text", () => {
            expect(slugify("Hello World!")).toBe("hello-world");
        });

        it("should remove special characters", () => {
            expect(slugify("Hello @World #123")).toBe("hello-world-123");
        });

        it("should handle multiple spaces", () => {
            expect(slugify("hello   world")).toBe("hello-world");
        });
    });
});
