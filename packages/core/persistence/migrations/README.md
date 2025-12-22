# Knex Migrations

This directory contains database migration files for managing schema changes.

## Creating Migrations

```bash
# Create a new migration
pnpm migrate:make create_users_table

# Run pending migrations
pnpm migrate:latest

# Rollback last migration batch
pnpm migrate:rollback
```

## Migration File Structure

Each migration file should export two functions:

```typescript
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Apply changes
    await knex.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table.string("email").unique().notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    // Revert changes
    await knex.schema.dropTableIfExists("users");
}
```

## Best Practices

1. **Atomic Changes**: Each migration should contain related changes
2. **Reversible**: Always implement both `up` and `down` functions
3. **No Data Logic**: Keep migrations focused on schema changes
4. **Test Rollbacks**: Verify that `down` properly reverses `up`
5. **Sequential**: Migrations run in order based on timestamp prefix
