import type { Knex } from "knex";
import { knexConfig } from "./config";

export interface KnexFileConfigOptions {
    migrationsDir?: string;
    seedsDir?: string;
    migrationsTableName?: string;
    developmentPool?: { min?: number; max?: number };
    stagingPool?: { min?: number; max?: number };
    productionPool?: { min?: number; max?: number };
    baseConfigOverrides?: Partial<Knex.Config>;
}
export function initKnexFileConfig(options: KnexFileConfigOptions = {}): {
    [key: string]: Knex.Config;
} {
    const {
        migrationsDir = "./migrations",
        seedsDir = "./seeds",
        migrationsTableName = "knex_migrations",
        developmentPool,
        stagingPool = { min: 2, max: 10 },
        productionPool = { min: 5, max: 30 },
        baseConfigOverrides = {}
    } = options;

    const baseConfig = { ...knexConfig, ...baseConfigOverrides } as Knex.Config;

    const config: { [key: string]: Knex.Config } = {
        development: {
            ...baseConfig,
            migrations: {
                directory: migrationsDir,
                tableName: migrationsTableName,
                extension: "ts",
                loadExtensions: [".ts"]
            },
            seeds: {
                directory: seedsDir,
                extension: "ts",
                loadExtensions: [".ts"]
            },
            ...(developmentPool && { pool: developmentPool })
        },

        staging: {
            ...baseConfig,
            pool: stagingPool
        },

        production: {
            ...baseConfig,
            pool: productionPool,
            debug: false
        }
    };

    return config;
}

export function createDefaultKnexFileConfig(): { [key: string]: Knex.Config } {
    return initKnexFileConfig();
}
