---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
feature: redis-connection-layer
---

# Implementation Guide: Redis Connection Layer

## Development Setup

**Prerequisites:**

- Node.js 18+ and pnpm installed
- Redis server available (local or Docker)
- VS Code with TypeScript support

**Setup Steps:**

1. Install dependencies: `pnpm install`
2. Start Redis (Docker): `docker run -d -p 6379:6379 redis:7-alpine`
3. Copy `.env.example` and configure Redis variables
4. Build package: `pnpm build`
5. Run tests: `pnpm test`

## Code Structure

**Directory Organization:**

```
packages/core/persistence/src/redis/
├── client.ts          # RedisClient singleton (main entry point)
├── config.ts          # RedisConfigBuilder (configuration management)
├── health.ts          # Health check utilities
├── pipeline.ts        # Pipeline/transaction wrapper
├── redis.type.ts      # TypeScript interfaces
├── index.ts           # Public API exports
└── __tests__/
    ├── client.test.ts
    ├── config.test.ts
    ├── health.test.ts
    └── pipeline.test.ts
```

## Implementation Notes

### Core Features

#### 1. RedisConfigBuilder (config.ts)

**Pattern:** Builder pattern with environment variable fallbacks

```typescript
// Key implementation details:
- Read from process.env with defaults
- Fluent API for programmatic configuration
- Validation before building config
- Connection string generation (for logging, without password)
- Support TLS configuration
```

**Environment Variables:**

- `REDIS_HOST` → defaults to `localhost`
- `REDIS_PORT` → defaults to `6379`
- `REDIS_PASSWORD` → optional
- `REDIS_DB` → defaults to `0`
- `REDIS_TLS` → defaults to `false`

#### 2. RedisClient (client.ts)

**Pattern:** Singleton with lazy initialization

```typescript
// Key implementation details:
- Private constructor to enforce singleton
- getInstance() static method
- Lazy connection (connect on first use)
- Graceful shutdown with process signal handlers
- Error logging with winston
- Expose underlying ioredis client for advanced use
```

**Connection Lifecycle:**

1. `getInstance()` - Creates or returns singleton
2. `connect()` - Establishes Redis connection
3. Operations via `getClient()` or convenience methods
4. `disconnect()` - Closes connection gracefully

#### 3. Health Check (health.ts)

**Pattern:** Simple function returning status object

```typescript
// Implementation:
- Execute PING command
- Measure response time
- Return structured health status
- Handle errors gracefully
```

#### 4. Pipeline Support (pipeline.ts)

**Pattern:** Wrapper around ioredis pipeline

```typescript
// Implementation:
- Thin wrapper around ioredis.Pipeline
- Add error handling
- Log pipeline execution
- Support atomic operations
```

### Patterns & Best Practices

#### Singleton Pattern

```typescript
private static instance: RedisClient;

public static getInstance(options?: RedisConfigOptions): RedisClient {
    if (!RedisClient.instance) {
        RedisClient.instance = new RedisClient(options);
    }
    return RedisClient.instance;
}
```

#### Builder Pattern

```typescript
class RedisConfigBuilder {
    setHost(host: string): this {
        this.host = host;
        return this;
    }
    // ... other setters
    build(): RedisConfig {
        return { host: this.host, ... };
    }
}
```

#### Error Handling

```typescript
try {
    await this.redisInstance.ping();
} catch (error) {
    persistenceLogger.error("redis-ping-failed", {
        error: error instanceof Error ? error.message : "unknown"
    });
    throw error;
}
```

#### Graceful Shutdown

```typescript
private setupGracefulShutdown(): void {
    const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
    signals.forEach((signal) => {
        process.on(signal, async () => {
            await this.disconnect();
            process.exit(0);
        });
    });
}
```

### Naming Conventions

- Classes: PascalCase (e.g., `RedisClient`, `RedisConfigBuilder`)
- Methods: camelCase (e.g., `connect()`, `checkHealth()`)
- Interfaces: PascalCase with descriptive names (e.g., `RedisConfig`, `RedisHealthStatus`)
- Private members: camelCase with underscore prefix for truly private (e.g., `_redisInstance`)

## Integration Points

### With Logger

```typescript
import { persistenceLogger } from "../logger";

// Usage:
persistenceLogger.connection("redis-connect", {
    host: config.host,
    port: config.port,
    message: "Redis connection established"
});
```

### With ioredis

```typescript
import Redis from "ioredis";

// Create client:
this.redisInstance = new Redis({
    host: config.host,
    port: config.port,
    password: config.password
    // ... other options
});
```

### Package Exports

```typescript
// In src/redis/index.ts
export { RedisClient } from "./client";
export { RedisConfigBuilder } from "./config";
export { checkRedisHealth } from "./health";
export * from "./redis.type";

// In package.json
"exports": {
    "./redis": {
        "types": "./dist/redis/index.d.ts",
        "import": "./dist/redis/index.js"
    }
}
```

## Error Handling

**Strategy:** Log and propagate errors to caller

### Connection Errors

```typescript
catch (error) {
    this.isConnected = false;
    persistenceLogger.error("redis-connection-failed", {
        host: config.host,
        error: error instanceof Error ? error.message : "unknown"
    });
    throw new Error(`Failed to connect to Redis: ${error}`);
}
```

### Operation Errors

```typescript
async get(key: string): Promise<string | null> {
    try {
        return await this.redisInstance?.get(key) ?? null;
    } catch (error) {
        persistenceLogger.error("redis-get-failed", { key, error });
        throw error;
    }
}
```

### Reconnection

- ioredis handles reconnection automatically
- Configure retry strategy in config
- Log reconnection attempts

## Performance Considerations

### Connection Pooling

- ioredis maintains internal connection pool
- No manual pool management needed
- Configure max connections if needed

### Pipeline Usage

```typescript
// Instead of:
await redis.set("key1", "value1");
await redis.set("key2", "value2");

// Use pipeline:
const pipeline = redis.pipeline();
pipeline.set("key1", "value1");
pipeline.set("key2", "value2");
await pipeline.exec();
```

### Key Naming

- Use consistent key prefixes
- Support key prefix in config
- Example: `myapp:users:123`

## Security Notes

### Password Management

- Never log passwords
- Use environment variables
- Support empty password (local dev)

### TLS Configuration

```typescript
const tls = config.tls
    ? {
          rejectUnauthorized: process.env.NODE_ENV === "production"
      }
    : undefined;
```

### Connection String Logging

```typescript
// Safe logging (no password):
getConnectionString(): string {
    return `redis://${this.host}:${this.port}/${this.db}`;
}
```

## Testing Strategy

### Unit Tests

- Mock ioredis with vitest
- Test configuration building
- Test error scenarios
- Test singleton behavior

### Integration Tests

- Use real Redis instance
- Test actual operations
- Test reconnection
- Clean up after tests

### Test Utilities

```typescript
// In test setup:
beforeAll(async () => {
    await startTestRedis();
});

afterAll(async () => {
    await stopTestRedis();
});

afterEach(async () => {
    await flushRedisDb();
});
```
