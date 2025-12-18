import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import type { DatabaseConfig } from "./database.config";
import type { JwtConfig } from "./jwt.config";
import type { TestingConfig } from "./testing.config";
import { getDatabaseConfig } from "./database.config";
import { getJwtConfig } from "./jwt.config";
import { getTestingConfig } from "./testing.config";

export function loadEnvFiles(basePath: string = process.cwd()): void {
    const env = process.env.NODE_ENV || "development";
    const envFiles = [`.env.${env}.local`, `.env.${env}`, ".env.local", ".env"];

    for (const file of envFiles) {
        const filePath = resolve(basePath, file);
        if (existsSync(filePath)) {
            dotenvConfig({ path: filePath, override: false });
        }
    }
}

export const config = {
    get database(): DatabaseConfig {
        return getDatabaseConfig();
    },

    get jwt(): JwtConfig {
        return getJwtConfig();
    },

    get testing(): TestingConfig {
        return getTestingConfig();
    }
};

if (process.env.SKIP_ENV_LOAD !== "true") {
    loadEnvFiles();
}
