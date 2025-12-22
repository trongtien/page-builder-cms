import type { Knex } from "knex";

/**
 * Example seed: Insert sample users
 *
 * Run: pnpm seed:run
 */
export async function seed(knex: Knex): Promise<void> {
    // Delete existing entries
    await knex("users").del();

    // Insert seed data
    await knex("users").insert([
        {
            email: "admin@pagebuilder.com",
            name: "Admin User",
            role: "admin",
            is_active: true
        },
        {
            email: "user@pagebuilder.com",
            name: "Regular User",
            role: "user",
            is_active: true
        },
        {
            email: "guest@pagebuilder.com",
            name: "Guest User",
            role: "guest",
            is_active: true
        }
    ]);
}
