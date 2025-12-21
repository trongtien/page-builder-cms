---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup

**How do we get started?**

### Prerequisites:

- Node.js 18+ installed
- PostgreSQL 14+ running locally or accessible via network
- pnpm 8+ installed
- Environment variables configured

### Environment setup:

1. Copy `example.env` to `.env` in project root
2. Add PostgreSQL connection string:
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
    ```
3. Install dependencies: `pnpm install`
4. Generate Prisma client: `pnpm --filter @page-builder/persistence prisma generate`

### Configuration needed:

- Database URL with credentials
- Connection pool settings (optional, defaults provided)
- Test database for integration tests

## Code Structure

**How is the code organized?**

```
packages/core/persistence/
├── prisma/
│   ├── schema.prisma          # Prisma schema definition
│   └── migrations/            # Migration history
├── src/
│   ├── index.ts               # Package entry point
│   ├── postgres/
│   │   ├── client.ts          # Prisma client singleton
│   │   ├── config.ts          # Configuration loader
│   │   ├── transaction.ts     # Transaction helper
│   │   └── health.ts          # Health check utility
│   └── generated/
│       └── client/            # Generated Prisma client (gitignored)
├── package.json               # Package configuration
├── tsconfig.json              # TypeScript config
├── tsup.config.ts             # Build config
└── vitest.config.ts           # Test config
```

### Module organization:

- **prisma/**: Schema and migrations (source of truth)
- **src/postgres/**: Core connection and utility modules
- **src/generated/**: Prisma-generated client (not in git)
- **src/index.ts**: Public API exports

### Naming conventions:

- Use kebab-case for file names: `health-check.ts`
- Use PascalCase for types/interfaces: `HealthCheckResult`
- Use camelCase for functions/variables: `checkDatabaseHealth`
- Prisma models: PascalCase singular: `User`, `HealthCheck`

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### Feature 1: Prisma Client Singleton

```typescript
// src/postgres/client.ts
import { PrismaClient } from "../generated/client";
import { loadConfig } from "./config";

let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
    if (!prisma) {
        const config = loadConfig();

        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: config.databaseUrl
                }
            },
            log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"]
        });

        // Graceful shutdown
        const cleanup = async () => {
            if (prisma) {
                await prisma.$disconnect();
                prisma = null;
            }
        };

        process.on("SIGINT", cleanup);
        process.on("SIGTERM", cleanup);
    }

    return prisma;
}

// Export singleton instance
export const prisma = getPrismaClient();
```

**Key points:**

- Lazy initialization on first access
- Single instance shared across imports
- Graceful cleanup on process termination
- Development-only query logging

#### Feature 2: Configuration Management

```typescript
// src/postgres/config.ts
interface DatabaseConfig {
    databaseUrl: string;
    connectionTimeout?: number;
    poolTimeout?: number;
    maxConnections?: number;
    minConnections?: number;
}

export function loadConfig(): DatabaseConfig {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is required. " + "Please set it in your .env file.");
    }

    return {
        databaseUrl,
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT ?? "30000"),
        poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT ?? "30000"),
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS ?? "10"),
        minConnections: parseInt(process.env.DB_MIN_CONNECTIONS ?? "2")
    };
}

export function validateConfig(config: DatabaseConfig): void {
    if (!config.databaseUrl.startsWith("postgresql://")) {
        throw new Error("DATABASE_URL must be a valid PostgreSQL connection string");
    }

    if (config.maxConnections! < config.minConnections!) {
        throw new Error("DB_MAX_CONNECTIONS must be >= DB_MIN_CONNECTIONS");
    }
}
```

**Key points:**

- Required DATABASE_URL with clear error message
- Optional overrides with sensible defaults
- Validation before use
- Type-safe configuration object

#### Feature 3: Transaction Helper

```typescript
// src/postgres/transaction.ts
import { PrismaClient } from "../generated/client";
import { prisma } from "./client";

export async function withTransaction<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T> {
    try {
        return await prisma.$transaction(async (tx) => {
            return await callback(tx as PrismaClient);
        });
    } catch (error) {
        // Log error (use proper logger in production)
        console.error("Transaction failed:", error);
        throw error; // Re-throw to allow caller to handle
    }
}
```

**Usage:**

```typescript
import { withTransaction } from "@page-builder/persistence";

const result = await withTransaction(async (tx) => {
    const user = await tx.user.create({ data: { email: "test@example.com" } });
    await tx.profile.create({ data: { userId: user.id, name: "Test User" } });
    return user;
});
```

**Key points:**

- Automatic rollback on error
- Type-safe transaction context
- Simple callback-based API
- Error propagation to caller

#### Feature 4: Health Check

```typescript
// src/postgres/health.ts
import { prisma } from "./client";

export interface HealthCheckResult {
    status: "healthy" | "unhealthy";
    latency: number;
    timestamp: Date;
    error?: string;
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timestamp = new Date();

    try {
        // Simple query to verify connectivity
        await prisma.$queryRaw`SELECT 1`;

        const latency = Date.now() - startTime;

        return {
            status: "healthy",
            latency,
            timestamp
        };
    } catch (error) {
        const latency = Date.now() - startTime;

        return {
            status: "unhealthy",
            latency,
            timestamp,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
```

**Key points:**

- Lightweight connectivity check
- Measures query latency
- Returns structured result
- No side effects on database

### Patterns & Best Practices

#### Prisma Schema Organization

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models organized by domain
// Example: User management
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Example: Health check for testing
model HealthCheck {
  id        String   @id @default(uuid())
  timestamp DateTime @default(now())
  status    String
}
```

#### Package Exports Configuration

```json
{
    "name": "@page-builder/persistence",
    "exports": {
        ".": {
            "import": "./dist/index.js",
            "types": "./dist/index.d.ts"
        },
        "./postgres": {
            "import": "./dist/postgres/client.js",
            "types": "./dist/postgres/client.d.ts"
        }
    }
}
```

#### Code Style Guidelines

- Always use `await` with Prisma operations (they're async)
- Prefer named exports over default exports
- Add JSDoc comments for public APIs
- Use TypeScript strict mode
- Handle errors explicitly (no silent failures)

## Integration Points

**How do pieces connect?**

### Application Integration

```typescript
// In host-root or render-root app
import { prisma, withTransaction, checkDatabaseHealth } from "@page-builder/persistence";

// On app startup
const health = await checkDatabaseHealth();
if (health.status === "unhealthy") {
    console.error("Database not ready:", health.error);
    process.exit(1);
}

// In API handlers
const users = await prisma.user.findMany();

// In service layer
await withTransaction(async (tx) => {
    // Multi-step operation
});
```

### Environment Configuration

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# Optional (overrides defaults)
DB_CONNECTION_TIMEOUT=30000
DB_POOL_TIMEOUT=30000
DB_MAX_CONNECTIONS=10
DB_MIN_CONNECTIONS=2
```

### Build Integration

```json
{
    "scripts": {
        "build": "pnpm prisma generate && tsup",
        "dev": "pnpm prisma generate && tsup --watch",
        "prisma:generate": "prisma generate",
        "prisma:migrate:dev": "prisma migrate dev",
        "prisma:migrate:deploy": "prisma migrate deploy",
        "prisma:studio": "prisma studio"
    }
}
```

## Error Handling

**How do we handle failures?**

### Error Handling Strategy

- **Configuration errors**: Fail fast on startup with clear message
- **Connection errors**: Log error, attempt retry, fail gracefully
- **Query errors**: Propagate to caller with context
- **Transaction errors**: Automatic rollback, propagate error

### Logging Approach

```typescript
// Development: Verbose logging
const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"]
});

// Production: Error-only logging
const prisma = new PrismaClient({
    log: ["error"]
});
```

### Retry/Fallback Mechanisms

```typescript
// Connection with retry (example)
async function connectWithRetry(maxRetries = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await prisma.$connect();
            console.log("Database connected");
            return;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = Math.pow(2, i) * 1000; // Exponential backoff
            console.log(`Connection failed, retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}
```

## Performance Considerations

**How do we keep it fast?**

### Optimization Strategies

- Use Prisma's connection pooling (built-in)
- Select only needed fields: `select: { id: true, email: true }`
- Use indexes in schema for frequently queried columns
- Batch queries when possible: `findMany()` instead of multiple `findUnique()`
- Use transactions for multi-step operations to reduce round trips

### Caching Approach

- Prisma doesn't cache queries (by design)
- Implement application-level caching if needed
- Consider Redis for frequently accessed data

### Query Optimization

```typescript
// Good: Select specific fields
const users = await prisma.user.findMany({
    select: { id: true, email: true }
});

// Good: Use where with indexed fields
const user = await prisma.user.findUnique({
    where: { email: "test@example.com" }
});

// Good: Batch operations
const users = await prisma.user.createMany({
    data: [{ email: "user1@example.com" }, { email: "user2@example.com" }]
});
```

### Resource Management

- Connection pool manages connections automatically
- Close client on shutdown: `await prisma.$disconnect()`
- Monitor connection pool metrics if performance issues arise

## Security Notes

**What security measures are in place?**

### Authentication/Authorization

- Database credentials via environment variables only
- Never commit credentials to version control
- Use different credentials per environment

### Input Validation

- Prisma uses prepared statements (prevents SQL injection)
- Validate user input before passing to Prisma
- Use Zod or similar for input validation in API layer

### Data Encryption

- Use SSL/TLS for database connections (configure in DATABASE_URL)
- Example: `DATABASE_URL="postgresql://user:password@localhost:5432/db?sslmode=require"`
- Encrypt sensitive fields at application layer if needed

### Secrets Management

- Store DATABASE_URL in secure secret manager (production)
- Use environment-specific .env files (never commit)
- Rotate credentials regularly
- Use least-privilege database users
