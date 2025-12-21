# @page-builder/persistence

Database persistence layer with Prisma and PostgreSQL connection pooling for the page-builder monorepo.

## Features

- ✅ **Prisma 7.2** - Latest Prisma ORM with type-safe database access
- ✅ **PostgreSQL** - Optimized for PostgreSQL 14+
- ✅ **Connection Pooling** - Automatic connection management and pooling
- ✅ **Transaction Helpers** - Convenient wrappers for atomic operations
- ✅ **Health Checks** - Database connectivity monitoring
- ✅ **Environment Config** - Easy configuration via environment variables
- ✅ **Type Safety** - Full TypeScript support with generated types
- ✅ **Graceful Shutdown** - Automatic cleanup on process termination

## Installation

This package is part of the monorepo and uses workspace references:

```bash
pnpm install
```

## Setup

### 1. Configure Environment Variables

Create a `.env` file in your project root (or add to existing):

```env
# Required: PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# Optional: Connection pool configuration (defaults shown)
DB_CONNECTION_TIMEOUT=30000
DB_POOL_TIMEOUT=30000
DB_MAX_CONNECTIONS=10
DB_MIN_CONNECTIONS=2
```

### 2. Generate Prisma Client

```bash
pnpm --filter @page-builder/persistence prisma:generate
```

### 3. Run Database Migrations

```bash
# Development: Create and apply migrations
pnpm --filter @page-builder/persistence prisma:migrate:dev

# Production: Apply existing migrations
pnpm --filter @page-builder/persistence prisma:migrate:deploy
```

## Usage

### Basic Queries

```typescript
import { prisma } from "@page-builder/persistence";

// Find all users
const users = await prisma.user.findMany();

// Find single user
const user = await prisma.user.findUnique({
    where: { email: "test@example.com" }
});

// Create user
const newUser = await prisma.user.create({
    data: {
        email: "new@example.com",
        name: "New User"
    }
});

// Update user
const updated = await prisma.user.update({
    where: { id: userId },
    data: { name: "Updated Name" }
});

// Delete user
await prisma.user.delete({
    where: { id: userId }
});
```

### Transactions

Use `withTransaction` for atomic multi-step operations:

```typescript
import { withTransaction } from "@page-builder/persistence";

const result = await withTransaction(async (tx) => {
    // All operations within this callback are part of the same transaction
    const user = await tx.user.create({
        data: { email: "test@example.com" }
    });

    await tx.profile.create({
        data: {
            userId: user.id,
            bio: "Test bio"
        }
    });

    // Return value becomes the result
    return user;
});

// If any operation fails, the entire transaction is rolled back
```

### Transaction with Timeout

```typescript
import { withTransactionTimeout } from "@page-builder/persistence";

// Transaction with 10-second timeout
const result = await withTransactionTimeout(async (tx) => {
    // Your operations here
}, 10000);
```

### Health Checks

Perfect for health check endpoints and startup validation:

```typescript
import { checkDatabaseHealth, isDatabaseReady, waitForDatabase } from "@page-builder/persistence";

// Detailed health check
const health = await checkDatabaseHealth();
console.log(health);
// {
//   status: 'healthy',
//   latency: 15,
//   timestamp: 2025-12-21T10:30:00.000Z
// }

// Simple boolean check
const isReady = await isDatabaseReady();
if (!isReady) {
    console.error("Database not available");
}

// Wait for database on startup
const ready = await waitForDatabase(5, 2000); // 5 retries, 2s delay
if (!ready) {
    process.exit(1);
}
```

### Configuration

Access and validate database configuration:

```typescript
import { loadConfig, validateConfig } from "@page-builder/persistence";

const config = loadConfig();
console.log(config);
// {
//   databaseUrl: 'postgresql://...',
//   connectionTimeout: 30000,
//   poolTimeout: 30000,
//   maxConnections: 10,
//   minConnections: 2
// }
```

## Migration Workflow

### Development

1. **Create migration**:

    ```bash
    pnpm --filter @page-builder/persistence prisma:migrate:dev --name add_users_table
    ```

2. **Prisma Studio** (visual database editor):

    ```bash
    pnpm --filter @page-builder/persistence prisma:studio
    ```

3. **Format schema**:
    ```bash
    pnpm --filter @page-builder/persistence prisma:format
    ```

### Production

```bash
# Apply migrations
pnpm --filter @page-builder/persistence prisma:migrate:deploy

# Generate client (if needed)
pnpm --filter @page-builder/persistence prisma:generate
```

## Schema Definition

The Prisma schema is located at `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

## API Reference

### Exports

```typescript
// Prisma client singleton
export { prisma, getPrismaClient } from "@page-builder/persistence";

// Transaction helpers
export { withTransaction, withTransactionTimeout } from "@page-builder/persistence";

// Health checks
export { checkDatabaseHealth, isDatabaseReady, waitForDatabase } from "@page-builder/persistence";

// Configuration
export { loadConfig, validateConfig } from "@page-builder/persistence";

// Types
export type {
    PrismaClient,
    Prisma,
    DatabaseConfig,
    HealthCheckResult,
    TransactionCallback
} from "@page-builder/persistence";
```

### Direct Postgres Access

You can also import the postgres module directly:

```typescript
import { prisma } from "@page-builder/persistence/postgres";
```

## Development

### Build

```bash
pnpm --filter @page-builder/persistence build
```

### Watch Mode

```bash
pnpm --filter @page-builder/persistence dev
```

### Type Check

```bash
pnpm --filter @page-builder/persistence type-check
```

### Lint

```bash
pnpm --filter @page-builder/persistence lint
pnpm --filter @page-builder/persistence lint:fix
```

### Tests

```bash
# Run tests
pnpm --filter @page-builder/persistence test

# Run tests once
pnpm --filter @page-builder/persistence test:run

# Coverage
pnpm --filter @page-builder/persistence test:coverage
```

## Troubleshooting

### DATABASE_URL not set

```
Error: DATABASE_URL environment variable is required.
```

**Solution**: Add `DATABASE_URL` to your `.env` file.

### Connection refused

```
Error: Can't reach database server at `localhost:5432`
```

**Solution**: Ensure PostgreSQL is running and accessible.

### Generated client not found

```
Error: Cannot find module '../generated/client'
```

**Solution**: Run `pnpm prisma:generate` to generate the Prisma client.

### Migration conflicts

```
Error: Schema migrations table is outdated
```

**Solution**:

- Development: `pnpm prisma:migrate:reset` (⚠️ deletes all data)
- Production: Resolve migration conflicts manually

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Check database health** on application startup
3. **Use TypeScript types** from generated client
4. **Keep schema organized** with `@@map()` for table names
5. **Index frequently queried fields** for performance
6. **Use environment variables** for all configuration
7. **Test database operations** with integration tests

## Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Feature Requirements](../../../docs/ai/requirements/feature-prisma-postgres-connection.md)
- [Feature Design](../../../docs/ai/design/feature-prisma-postgres-connection.md)
- [Implementation Guide](../../../docs/ai/implementation/feature-prisma-postgres-connection.md)
- [Testing Strategy](../../../docs/ai/testing/feature-prisma-postgres-connection.md)

## License

ISC
