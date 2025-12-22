import type { Knex } from "knex";
import { knexConfig } from "../src/postgres/config";

/**
 * Knex configuration file
 * Used by Knex CLI for migrations and seeds
 */
const baseConfig = knexConfig as Knex.Config;

const config: { [key: string]: Knex.Config } = {
    development: {
        ...baseConfig,
        migrations: {
            directory: "./migrations",
            tableName: "knex_migrations",
            extension: "ts",
            loadExtensions: [".ts"]
        },
        seeds: {
            directory: "./seeds",
            extension: "ts",
            loadExtensions: [".ts"]
        }
    },

    staging: {
        ...baseConfig,
        pool: {
            min: 2,
            max: 10
        }
    },

    production: {
        ...baseConfig,
        pool: {
            min: 5,
            max: 30
        },
        debug: false
    }
};

export default config;
