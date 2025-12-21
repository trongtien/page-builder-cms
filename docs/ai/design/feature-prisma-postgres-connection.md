---
phase: design
title: System Design & Architecture
description: Define the technical architecture, components, and data models
---

# System Design & Architecture

## Architecture Overview

**What is the high-level system structure?**

```mermaid
graph TD
    App[Application: host-root / render-root]
    PersistenceLib[@page-builder/persistence]
    PrismaClient[Prisma Client]
    ConnPool[Connection Pool]
    PostgresDB[(PostgreSQL Database)]

    App -->|import client| PersistenceLib
    PersistenceLib -->|exports| PrismaClient
    PrismaClient -->|manages| ConnPool
    ConnPool -->|TCP connections| PostgresDB

    App -->|env vars| Config[Environment Config]
    Config -->|DATABASE_URL| PrismaClient

    PersistenceLib -->|exports| Utilities[Transaction Helpers, Health Checks]
    App -->|uses| Utilities
```

**Key components:**

- **Prisma Schema**: Defines database models and configuration
- **Prisma Client**: Auto-generated type-safe database client
- **Connection Pool Manager**: Handles connection lifecycle and pooling
- **Transaction Helpers**: Utility functions for atomic operations
- **Health Check Module**: Database connectivity verification
- **Migration System**: Schema evolution via Prisma Migrate

**Technology stack:**

- **Prisma** (latest): ORM and type-safe client generator
- **PostgreSQL 14+**: Database engine
- **TypeScript**: Type safety and developer experience
- **Tsup**: Package bundling (using base config for Node.js)
- **Vitest**: Testing framework (using base config for Node.js)

**Rationale:**

- Prisma provides excellent TypeScript integration and type safety
- Built-in connection pooling with good defaults
- Schema-first approach with migration tooling
- Large ecosystem and active maintenance

## Data Models

**What data do we need to manage?**

At the persistence layer, we're providing infrastructure, not defining application models. However, we'll include an example schema:

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

// Example model for testing
model HealthCheck {
  id        String   @id @default(uuid())
  timestamp DateTime @default(now())
  status    String
}
```

**Configuration data:**

- Database URL (from environment)
- Connection pool settings (min/max connections, timeout)
- Query timeout limits
- Retry policy configuration

**Data flow:**

1. Application imports Prisma client
2. Client reads DATABASE_URL from environment
3. Connection pool established on first query
4. Queries execute through connection pool
5. Connections recycled after use

## API Design

**How do components communicate?**

### Exported API

```typescript
// Main exports from @page-builder/persistence
export { prisma } from "./postgres/client";
export { withTransaction } from "./postgres/transaction";
export { checkDatabaseHealth } from "./postgres/health";
export type { PrismaClient, Prisma } from "./generated/client";
```

### Internal Interfaces

```typescript
// Connection configuration
interface ConnectionConfig {
    databaseUrl: string;
    connectionTimeout?: number;
    poolTimeout?: number;
    maxConnections?: number;
    minConnections?: number;
}

// Health check result
interface HealthCheckResult {
    status: "healthy" | "unhealthy";
    latency: number;
    timestamp: Date;
    error?: string;
}

// Transaction callback
type TransactionCallback<T> = (tx: PrismaClient) => Promise<T>;
```

### Usage Examples

```typescript
// Simple query
import { prisma } from "@page-builder/persistence";

const users = await prisma.user.findMany();

// Transaction
import { withTransaction } from "@page-builder/persistence";

await withTransaction(async (tx) => {
    await tx.user.create({ data: { email: "test@example.com" } });
    await tx.profile.create({ data: { userId: user.id } });
});

// Health check
import { checkDatabaseHealth } from "@page-builder/persistence";

const health = await checkDatabaseHealth();
if (health.status === "unhealthy") {
    console.error("Database connection failed", health.error);
}
```

## Component Breakdown

**What are the major building blocks?**

### 1. Prisma Schema (`prisma/schema.prisma`)

- Database connection configuration
- Model definitions (initially just test models)
- Generator configuration for TypeScript client

### 2. Client Module (`src/postgres/client.ts`)

- Singleton Prisma client instance
- Connection pool initialization
- Graceful shutdown handling
- Connection event logging

### 3. Transaction Helper (`src/postgres/transaction.ts`)

- Wrapper for Prisma interactive transactions
- Error handling and rollback
- Nested transaction detection

### 4. Health Check Module (`src/postgres/health.ts`)

- Simple query to verify connectivity
- Latency measurement
- Error categorization

### 5. Configuration Module (`src/postgres/config.ts`)

- Environment variable loading
- Connection pool settings
- Validation and defaults

### 6. Package Entry Point (`src/index.ts`)

- Re-exports all public APIs
- Types from generated Prisma client

## Design Decisions

**Why did we choose this approach?**

### Decision 1: Prisma over Other ORMs

- **Rationale**: Best TypeScript support, active development, built-in migration tooling
- **Alternatives**: Drizzle (less mature), TypeORM (decorator-based), raw pg client (no type safety)
- **Trade-offs**: Vendor lock-in, but superior DX

### Decision 2: Singleton Client Pattern

- **Rationale**: Prisma manages connection pool internally, multiple instances waste resources
- **Pattern**: Export single client instance from package
- **Benefits**: Simple API, optimal resource usage

### Decision 3: Environment-Based Configuration

- **Rationale**: Standard practice for database credentials
- **Required**: `DATABASE_URL` environment variable
- **Optional**: Override pool settings via additional env vars

### Decision 4: Prisma Schema in Persistence Package

- **Rationale**: Centralize schema definition, single source of truth
- **Impact**: Applications must define models in this package or extend
- **Future**: May support schema extensions per application

### Decision 5: Connection Pool Defaults

- **Min Connections**: 2 (keep warm connections)
- **Max Connections**: 10 (prevent resource exhaustion)
- **Timeout**: 30 seconds
- **Rationale**: Balanced for typical workloads, configurable if needed

## Non-Functional Requirements

**How should the system perform?**

### Performance

- **Connection establishment**: < 1 second on first query
- **Query overhead**: Prisma adds ~5ms (acceptable for type safety)
- **Connection pool efficiency**: > 95% connection reuse

### Scalability

- Connection pool scales with concurrent requests
- Supports horizontal scaling (each instance has own pool)
- No shared state between application instances

### Security

- Database credentials via environment variables (never hardcoded)
- Use SSL/TLS for database connections (configured via DATABASE_URL)
- Prepared statements (handled by Prisma automatically)
- No sensitive data logged

### Reliability

- **Retry logic**: Exponential backoff on connection failures (3 retries)
- **Circuit breaker**: Fail fast after repeated connection failures
- **Graceful shutdown**: Close connections cleanly on SIGTERM
- **Error handling**: Detailed error messages for debugging

### Monitoring

- Log connection events (established, closed, errors)
- Expose health check endpoint for uptime monitoring
- Prisma query logging in development mode
- Connection pool metrics (if needed in future)
