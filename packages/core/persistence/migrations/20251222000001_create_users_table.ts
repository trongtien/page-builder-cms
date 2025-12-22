import type { Knex } from "knex";

/**
 * Example migration: Create users table
 *
 * Run: pnpm migrate:latest
 * Rollback: pnpm migrate:rollback
 */
export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table.string("email", 255).unique().notNullable();
        table.string("name", 255).notNullable();
        table.string("password_hash", 255);
        table.enum("role", ["admin", "user", "guest"]).defaultTo("user");
        table.boolean("is_active").defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.timestamp("deleted_at").nullable();

        // Indexes
        table.index("email");
        table.index("created_at");
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("users");
}
