# Database Seeds

This directory contains seed files for populating the database with initial data.

## Running Seeds

```bash
# Run all seed files
pnpm seed:run
```

## Seed File Structure

Each seed file should export a `seed` function:

```typescript
import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Delete existing entries
    await knex("users").del();

    // Insert seed data
    await knex("users").insert([
        { email: "admin@example.com", name: "Admin User" },
        { email: "user@example.com", name: "Regular User" }
    ]);
}
```

## Best Practices

1. **Idempotent**: Seeds should be safe to run multiple times
2. **Clear Data**: Delete existing data before inserting
3. **Environment-Specific**: Use different seeds for dev/staging/prod
4. **Minimal Data**: Only include essential data
5. **No Production Data**: Never seed production databases
