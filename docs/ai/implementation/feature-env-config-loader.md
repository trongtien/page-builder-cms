---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup

**How do we get started?**

### Prerequisites

- Node.js 18+ installed
- pnpm 8+ installed
- TypeScript 5+ knowledge
- Familiarity with Zod validation library

### Environment Setup Steps

1. **Ensure monorepo is initialized**:

    ```bash
    pnpm install
    ```

2. **Navigate to the node-config package**:

    ```bash
    cd packages/core/node-config
    ```

3. **Install package dependencies** (will be done via workspace):

    ```bash
    pnpm install
    ```

4. **Verify TypeScript compilation**:

    ```bash
    pnpm build
    ```

5. **Run tests in watch mode during development**:
    ```bash
    pnpm test --watch
    ```

### Configuration Needed

- Ensure `packages/core/node-config/tsconfig.json` extends workspace config
- Verify exports in `package.json` point to correct build outputs
- Confirm workspace linking: `pnpm list @page-builder/node-config`

## Code Structure

**How is the code organized?**

```
packages/core/node-config/
├── src/
│   ├── index.ts                    # Main entry point, exports public API
│   ├── loader.ts                   # Environment file loading logic
│   ├── validator.ts                # Zod validation wrapper
│   ├── schemas/
│   │   ├── index.ts                # Combined schema and exports
│   │   ├── base.schema.ts          # Core app config (port, host, env)
│   │   ├── database.schema.ts      # Database connection config
│   │   ├── api.schema.ts           # External API config
│   │   ├── features.schema.ts      # Feature flags
│   │   └── logging.schema.ts       # Logging config
│   └── utils/
│       ├── error-formatter.ts      # Format Zod errors for display
│       ├── env-parser.ts           # Environment variable parsing helpers
│       └── logger.ts               # Internal debugging logger
├── tests/
│   ├── unit/
│   │   ├── loader.test.ts
│   │   ├── validator.test.ts
│   │   ├── schemas/
│   │   │   ├── base.test.ts
│   │   │   ├── database.test.ts
│   │   │   └── ...
│   │   └── utils/
│   │       ├── error-formatter.test.ts
│   │       └── ...
│   ├── integration/
│   │   ├── config-loading.test.ts
│   │   └── precedence.test.ts
│   └── fixtures/
│       ├── .env.test
│       ├── .env.test.local
│       └── test-configs.ts
├── examples/
│   ├── basic-usage.ts
│   ├── custom-options.ts
│   └── testing-with-config.ts
├── .env.example                    # Template for environment variables
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Module Organization

- **Public API** (`index.ts`): Only exports necessary functions and types
- **Core Logic** (`loader.ts`, `validator.ts`): Pure functions, easy to test
- **Schemas** (`schemas/`): One schema per configuration domain
- **Utils** (`utils/`): Reusable helper functions
- **Tests**: Mirror src structure, 1-to-1 mapping

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `error-formatter.ts`)
- **Classes**: `PascalCase` (e.g., `ConfigValidationError`)
- **Functions**: `camelCase` (e.g., `loadConfig`, `validateSchema`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_PORT`)
- **Types/Interfaces**: `PascalCase` (e.g., `AppConfig`, `LoadConfigOptions`)
- **Environment Variables**: `SCREAMING_SNAKE_CASE` with prefixes (e.g., `DATABASE_HOST`)

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### 1. Environment File Loading (`loader.ts`)

**Implementation approach:**

```typescript
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

export function loadEnvFiles(basePath: string, env: string): Record<string, string> {
    const files = [".env", ".env.local", `.env.${env}`, `.env.${env}.local`];

    const merged: Record<string, string> = {};

    // Load files in order, later files override earlier ones
    for (const file of files) {
        const filePath = path.join(basePath, file);
        if (fs.existsSync(filePath)) {
            const parsed = dotenv.parse(fs.readFileSync(filePath));
            Object.assign(merged, parsed);
        }
    }

    // process.env takes highest precedence
    return { ...merged, ...process.env };
}
```

**Key considerations:**

- Check file existence before attempting to parse
- Gracefully handle missing files (not an error)
- Maintain precedence order: `.env` → `.env.local` → `.env.[env]` → `.env.[env].local` → `process.env`
- Return merged object without mutating process.env

#### 2. Schema Validation (`validator.ts`)

**Implementation approach:**

```typescript
import { ZodError, ZodSchema } from "zod";
import { formatValidationError } from "./utils/error-formatter";

export class ConfigValidationError extends Error {
    constructor(
        message: string,
        public readonly errors: ZodError,
        public readonly rawConfig: unknown
    ) {
        super(message);
        this.name = "ConfigValidationError";
    }
}

export function validateConfig<T>(schema: ZodSchema<T>, data: unknown): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof ZodError) {
            const formatted = formatValidationError(error);
            throw new ConfigValidationError(`Configuration validation failed:\n\n${formatted}`, error, data);
        }
        throw error;
    }
}
```

**Key considerations:**

- Use `schema.parse()` not `schema.safeParse()` to throw on error
- Wrap ZodError in custom error class for better debugging
- Include both formatted message and raw error for different use cases
- Preserve stack trace

#### 3. Schema Definitions (Example: `database.schema.ts`)

**Implementation approach:**

```typescript
import { z } from "zod";

/**
 * Database configuration schema
 *
 * Environment variables:
 * - DATABASE_HOST: Database server hostname (required)
 * - DATABASE_PORT: Database server port (default: 5432)
 * - DATABASE_NAME: Database name (required)
 * - DATABASE_USERNAME: Database username (required)
 * - DATABASE_PASSWORD: Database password (required)
 * - DATABASE_SSL: Enable SSL connection (default: false)
 */
export const databaseSchema = z.object({
    host: z.string().min(1, "Database host is required"),
    port: z.coerce.number().int().positive().default(5432),
    name: z.string().min(1, "Database name is required"),
    username: z.string().min(1, "Database username is required"),
    password: z.string().min(1, "Database password is required"),
    ssl: z.coerce.boolean().default(false)
});

export type DatabaseConfig = z.infer<typeof databaseSchema>;

/**
 * Parse database configuration from environment variables
 */
export function parseDatabaseConfig(env: Record<string, string | undefined>): unknown {
    return {
        host: env.DATABASE_HOST,
        port: env.DATABASE_PORT,
        name: env.DATABASE_NAME,
        username: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD,
        ssl: env.DATABASE_SSL
    };
}
```

**Key considerations:**

- Use `z.coerce.number()` for numeric env vars (strings → numbers)
- Use `z.coerce.boolean()` for boolean env vars (handles "true"/"false"/"1"/"0")
- Add descriptive error messages for required fields
- Document which env vars map to which schema fields
- Export both schema and inferred type
- Create parser function to map env vars to schema shape

#### 4. Main Entry Point (`index.ts`)

**Implementation approach:**

```typescript
import { loadEnvFiles } from "./loader";
import { validateConfig } from "./validator";
import { appConfigSchema, AppConfig } from "./schemas";

export interface LoadConfigOptions {
    envPath?: string;
    environment?: string;
    skipEnvFiles?: boolean;
}

let cachedConfig: AppConfig | null = null;

export function loadConfig(options: LoadConfigOptions = {}): AppConfig {
    const {
        envPath = process.cwd(),
        environment = process.env.NODE_ENV || "development",
        skipEnvFiles = false
    } = options;

    // Load environment variables
    const env = skipEnvFiles ? process.env : loadEnvFiles(envPath, environment);

    // Parse to schema shape
    const rawConfig = parseAppConfig(env);

    // Validate and return
    return validateConfig(appConfigSchema, rawConfig);
}

// Singleton config export
export const config: AppConfig = (() => {
    if (!cachedConfig) {
        cachedConfig = loadConfig();
    }
    return cachedConfig;
})();

// Re-export types and utilities
export type { AppConfig, DatabaseConfig, ApiConfig, FeatureFlags, LoggingConfig } from "./schemas";
export { ConfigValidationError } from "./validator";
```

**Key considerations:**

- Lazy-load singleton config (IIFE pattern)
- Allow custom options for testing scenarios
- Re-export all public types
- Cache config to avoid re-validation
- Provide both function and direct export

### Patterns & Best Practices

#### Type Coercion Pattern

```typescript
// ✅ GOOD: Use z.coerce for type conversion
z.object({
    port: z.coerce.number().int().positive(),
    enabled: z.coerce.boolean()
});

// ❌ BAD: Don't manually parse
z.object({
    port: z.string().transform((val) => parseInt(val, 10)),
    enabled: z.string().transform((val) => val === "true")
});
```

#### Default Values Pattern

```typescript
// ✅ GOOD: Use .default() for optional with defaults
z.object({
    port: z.coerce.number().default(3000),
    timeout: z.coerce.number().default(5000)
});

// ✅ GOOD: Use .optional() for truly optional
z.object({
    apiKey: z.string().optional()
});

// ❌ BAD: Don't use undefined defaults
z.object({
    port: z.coerce.number().default(undefined)
});
```

#### Error Message Pattern

```typescript
// ✅ GOOD: Descriptive error messages
z.string().min(1, "API key is required");
z.string().url("Must be a valid URL");
z.number().positive("Port must be positive");

// ❌ BAD: Generic messages
z.string().min(1);
z.string().url();
```

#### Schema Composition Pattern

```typescript
// ✅ GOOD: Compose schemas for reusability
const baseSchema = z.object({
    env: z.enum(["development", "production", "test"]),
    nodeEnv: z.string()
});

export const appConfigSchema = baseSchema.extend({
    database: databaseSchema,
    api: apiSchema
    // ...
});
```

## Integration Points

**How do pieces connect?**

### Package Consumption

```typescript
// In consuming package (e.g., host-root/src/server.ts)
import { config } from "@page-builder/node-config";

const server = express();
server.listen(config.port, config.host, () => {
    console.log(`Server running on ${config.host}:${config.port}`);
});

// Database connection
const db = createConnection({
    host: config.database.host,
    port: config.database.port
    // ...
});
```

### Testing Integration

```typescript
// In test files
import { loadConfig } from "@page-builder/node-config";

describe("MyFeature", () => {
    it("should work with custom config", () => {
        const testConfig = loadConfig({
            skipEnvFiles: true
            // process.env will be used
        });

        // Override process.env for test
        process.env.DATABASE_HOST = "localhost";
        process.env.DATABASE_PORT = "5432";

        // ... test code
    });
});
```

### Monorepo Workspace

```json
// In consuming package's package.json
{
    "dependencies": {
        "@page-builder/node-config": "workspace:*"
    }
}
```

## Error Handling

**How do we handle failures?**

### Error Handling Strategy

1. **Fail fast**: Throw errors immediately on invalid configuration
2. **Clear messages**: Provide actionable error messages
3. **Detailed context**: Include which variables are missing/invalid
4. **Safe logging**: Never log sensitive values in errors

### Error Formatting

```typescript
// src/utils/error-formatter.ts
import { ZodError } from "zod";

export function formatValidationError(error: ZodError): string {
    const issues = error.issues;

    const missing = issues
        .filter((i) => i.code === "invalid_type" && i.received === "undefined")
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`);

    const invalid = issues
        .filter((i) => i.code !== "invalid_type" || i.received !== "undefined")
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`);

    let message = "";

    if (missing.length > 0) {
        message += "Missing required variables:\n" + missing.join("\n") + "\n\n";
    }

    if (invalid.length > 0) {
        message += "Invalid values:\n" + invalid.join("\n") + "\n\n";
    }

    message += "Please check your .env file or environment variables.";

    return message;
}
```

### Logging Approach

```typescript
// Internal debugging only - never log secrets
function debugLog(message: string, data?: unknown) {
    if (process.env.DEBUG_CONFIG === "true") {
        console.log(`[config] ${message}`, data);
    }
}

// Redact sensitive fields
function redactSecrets(obj: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ["password", "apiKey", "secret", "token"];
    const redacted = { ...obj };

    for (const key of Object.keys(redacted)) {
        if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
            redacted[key] = "***REDACTED***";
        }
    }

    return redacted;
}
```

## Performance Considerations

**How do we keep it fast?**

### Optimization Strategies

1. **Lazy loading**: Config loaded only once on first access
2. **Caching**: Singleton pattern prevents re-validation
3. **Efficient file I/O**: Load files sequentially, parse once
4. **Minimal dependencies**: Only zod and dotenv (both lightweight)

### Caching Approach

```typescript
// Singleton pattern with lazy initialization
let cachedConfig: AppConfig | null = null;

export const config: AppConfig = (() => {
    if (!cachedConfig) {
        cachedConfig = loadConfig();
    }
    return cachedConfig;
})();

// For testing: clear cache
export function clearConfigCache(): void {
    cachedConfig = null;
}
```

### Resource Management

- **Memory**: Config object typically < 1KB
- **CPU**: Validation runs once at startup
- **I/O**: File reads minimized with existence checks
- **Network**: No network calls (all local)

## Security Notes

**What security measures are in place?**

### Authentication/Authorization

- Not applicable (configuration loading only)
- Consumers responsible for securing their config usage

### Input Validation

- All input validated through Zod schemas
- Type coercion prevents injection attacks
- String length validation prevents buffer overflows

### Data Encryption

- Secrets stored as environment variables (not in code)
- No encryption at rest (handled by deployment platform)
- Never log or display sensitive values

### Secrets Management

```typescript
// ✅ GOOD: Secrets from environment
const apiKey = config.api.apiKey;

// ❌ BAD: Hardcoded secrets
const apiKey = "sk-1234567890";

// ✅ GOOD: Redact in logs
console.log("Config loaded:", redactSecrets(config));

// ❌ BAD: Log secrets
console.log("Config loaded:", config);
```

### Security Best Practices

1. **Never commit .env files**: Add to .gitignore
2. **Use .env.example**: Template without actual secrets
3. **Validate input strictly**: Whitelist valid values with enums
4. **Fail closed**: Require explicit opt-in for permissive settings
5. **Document security implications**: Comment on security-sensitive config
