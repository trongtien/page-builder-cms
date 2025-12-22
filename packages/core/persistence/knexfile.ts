import { initKnexFileConfig } from "./src/postgres/knex-file-config";

/**
 * Knex configuration file
 * Used by Knex CLI for migrations and seeds
 *
 * This file can be easily copied to any package in the monorepo.
 * Just install @page-builder/persistence and import initKnexFileConfig:
 *
 * @example
 * ```ts
 * import { initKnexFileConfig } from "@page-builder/persistence";
 *
 * export default initKnexFileConfig({
 *   migrationsDir: "./db/migrations",
 *   seedsDir: "./db/seeds"
 * });
 * ```
 */
export default initKnexFileConfig({
    migrationsDir: "./migrations",
    seedsDir: "./seeds",
    migrationsTableName: "knex_migrations"
});
