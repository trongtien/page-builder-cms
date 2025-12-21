import { describe, it, expect, afterEach } from "vitest";
import { loadEnv } from "../env-loader";
import { resolve } from "path";

describe("Example Environment File", () => {
    afterEach(() => {
        // Clean up test environment variables
        const vars = [
            "HOST",
            "PORT",
            "DB_HOST",
            "DB_PORT",
            "DB_NAME",
            "DB_SCHEMA",
            "DB_USERNAME",
            "DB_PASSWORD",
            "NODE_ENV"
        ];
        vars.forEach((v) => delete process.env[v]);
    });

    it("should load from root example.env file", () => {
        // Path from package to root example.env
        const exampleEnvPath = resolve(process.cwd(), "../../../example.env");

        const result = loadEnv({ path: exampleEnvPath });

        expect(result.success).toBe(true);
        expect(result.path).toBe(exampleEnvPath);

        // Verify expected variables are loaded
        expect(process.env.HOST).toBe("localhost");
        expect(process.env.PORT).toBe("3000");
        expect(process.env.DB_HOST).toBe("localhost");
        expect(process.env.DB_PORT).toBe("5432");
        expect(process.env.DB_NAME).toBe("pagebuilder");
        // NODE_ENV may be set by test environment, so just check it exists
        expect(process.env.NODE_ENV).toBeDefined();
    });

    it("should work with relative path to example.env", () => {
        const result = loadEnv({ path: "../../../example.env" });

        expect(result.success).toBe(true);
        expect(process.env.HOST).toBe("localhost");
        expect(process.env.DB_NAME).toBe("pagebuilder");
    });
});
