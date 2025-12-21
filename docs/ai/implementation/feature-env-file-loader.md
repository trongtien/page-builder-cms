---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
feature: env-file-loader
---

# Implementation Guide: Environment File Loader

## Development Setup

**How do we get started?**

### Prerequisites

- Node.js 18+ (or version specified in project)
- pnpm package manager
- TypeScript knowledge
- Familiarity with environment variables and .env files

### Environment Setup Steps

1. Navigate to the configurations package:

    ```bash
    cd packages/core/configurations
    ```

2. Install dependencies (after adding dotenv to package.json):

    ```bash
    pnpm install
    ```

3. Verify build works:

    ```bash
    pnpm build
    ```

4. Run tests in watch mode during development:
    ```bash
    pnpm test --watch
    ```

## Code Structure

**How is the code organized?**

```
packages/core/configurations/
├── src/
│   ├── env-loader.ts          # NEW: Main implementation
│   ├── types.ts               # NEW: Type definitions
│   ├── index.ts               # UPDATED: Export new functions
│   ├── host.ts                # UNCHANGED
│   ├── database.ts            # UNCHANGED
│   ├── validate-configuration.ts  # UNCHANGED
│   └── __tests__/
│       ├── env-loader.test.ts      # NEW: Unit tests
│       ├── integration.test.ts     # NEW: Integration tests
│       └── fixtures/               # NEW: Test .env files
│           ├── .env.test
│           ├── .env.empty
│           └── .env.malformed
├── examples/                  # NEW: Usage examples
│   ├── basic-usage.ts
│   ├── custom-path.ts
│   └── required-file.ts
└── package.json               # UPDATED: Add dotenv dependency
```

### Naming Conventions

- **Functions**: camelCase (loadEnv, loadEnvOrThrow)
- **Interfaces**: PascalCase (EnvLoaderOptions, EnvLoaderResult)
- **Constants**: UPPER_SNAKE_CASE (DEFAULT_ENV_PATH)
- **Test files**: \*.test.ts pattern

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### Feature 1: loadEnv Function

**Implementation Approach:**

```typescript
import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

export function loadEnv(options: EnvLoaderOptions = {}): EnvLoaderResult {
    const { path: envPath = ".env", override = false, required = false, encoding = "utf8" } = options;

    // Resolve to absolute path
    const absolutePath = resolve(process.cwd(), envPath);

    // Check file existence if required
    if (required && !existsSync(absolutePath)) {
        return {
            success: false,
            path: absolutePath,
            error: `Required environment file not found: ${absolutePath}`
        };
    }

    // Optional file check
    if (!existsSync(absolutePath)) {
        return {
            success: false,
            path: absolutePath,
            error: `Environment file not found: ${absolutePath}`
        };
    }

    // Load with dotenv
    try {
        const result = config({
            path: absolutePath,
            override,
            encoding
        });

        if (result.error) {
            return {
                success: false,
                path: absolutePath,
                error: result.error.message
            };
        }

        return {
            success: true,
            path: absolutePath,
            parsed: result.parsed || {}
        };
    } catch (error) {
        return {
            success: false,
            path: absolutePath,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
```

**Key Decisions:**

- Always resolve to absolute path for clarity
- Return result object instead of throwing (except for loadEnvOrThrow)
- Distinguish between "file not found" and "parse error"

#### Feature 2: loadEnvOrThrow Function

**Implementation Approach:**

```typescript
export function loadEnvOrThrow(options?: EnvLoaderOptions): void {
    const result = loadEnv(options);

    if (!result.success) {
        throw new Error(`Failed to load environment file: ${result.error}`);
    }
}
```

**Key Decisions:**

- Thin wrapper around loadEnv for convenience
- Clear error message with specific failure reason

#### Feature 3: Type Definitions

**Implementation Approach:**

```typescript
// src/types.ts

/**
 * Options for loading environment files
 */
export interface EnvLoaderOptions {
    /**
     * Path to the environment file to load
     * Can be absolute or relative to process.cwd()
     * @default '.env'
     */
    path?: string;

    /**
     * Whether to override existing environment variables
     * @default false
     */
    override?: boolean;

    /**
     * Whether to throw an error if the file doesn't exist
     * @default false
     */
    required?: boolean;

    /**
     * Encoding of the environment file
     * @default 'utf8'
     */
    encoding?: BufferEncoding;
}

/**
 * Result of loading an environment file
 */
export interface EnvLoaderResult {
    /**
     * Whether the environment file was successfully loaded
     */
    success: boolean;

    /**
     * Path that was attempted to load
     */
    path: string;

    /**
     * Error message if loading failed
     */
    error?: string;

    /**
     * Parsed environment variables (for debugging)
     */
    parsed?: Record<string, string>;
}
```

### Patterns & Best Practices

#### Pattern 1: Path Resolution

Always resolve paths to absolute paths early:

```typescript
const absolutePath = resolve(process.cwd(), envPath);
```

This prevents confusion about relative path resolution and makes error messages clearer.

#### Pattern 2: Graceful Degradation

For optional files, fail gracefully:

```typescript
if (!required && !existsSync(absolutePath)) {
    return {
        success: false,
        path: absolutePath
        // No error thrown, just return failure
    };
}
```

#### Pattern 3: Error Context

Always include context in error messages:

```typescript
error: `Required environment file not found: ${absolutePath}`;
```

Include the file path so users know what went wrong and where.

#### Pattern 4: Don't Log Sensitive Data

Never log or return actual environment variable values in production:

```typescript
// Good: Only return parsed keys in result (for debugging)
parsed: result.parsed;

// Bad: Don't log values
console.log(process.env); // Never do this
```

## Integration Points

**How do pieces connect?**

### Integration 1: With Configuration Classes

Configuration classes remain unchanged and automatically benefit:

```typescript
// In app startup (e.g., apps/host-root/src/main.tsx)
import { loadEnv, HostConfiguration } from "@page-builder/configurations";

// Step 1: Load environment file
loadEnv({ path: ".env.local" });

// Step 2: Initialize configuration (reads from process.env)
const config = new HostConfiguration();
```

### Integration 2: With Different Environments

Use different env files per environment:

```typescript
// Development
loadEnv({ path: ".env.development" });

// Production
loadEnv({ path: ".env.production" });

// CI/CD
loadEnv({ path: ".env.ci", required: true });
```

### Integration 3: With Existing process.env

By default, dotenv doesn't override existing variables:

```typescript
// Process.env takes precedence
process.env.PORT = "3000";

loadEnv({ path: ".env" }); // Won't override PORT

// Explicit override
loadEnv({ path: ".env", override: true }); // Will override PORT
```

## Error Handling

**How do we handle failures?**

### Error Handling Strategy

1. **File Not Found**: Return failure result with clear message
2. **Parse Errors**: Catch and return with dotenv's error message
3. **Permission Errors**: Caught by try-catch, returned as error
4. **Required Files**: Fail fast with descriptive error

### Example Error Handling in Apps

```typescript
// Strict mode: Fail fast
try {
    loadEnvOrThrow({ path: ".env.production", required: true });
} catch (error) {
    console.error("Failed to load configuration:", error);
    process.exit(1);
}

// Graceful mode: Continue with defaults
const result = loadEnv({ path: ".env.local" });
if (!result.success) {
    console.warn(`Could not load ${result.path}, using defaults`);
}
```

### Logging Approach

- Use console.warn for non-critical failures (missing optional files)
- Use console.error for critical failures (missing required files)
- Never log actual environment variable values
- Include file paths in error messages

## Performance Considerations

**How do we keep it fast?**

### Optimization 1: Synchronous Loading

Environment files are loaded synchronously during app startup:

- Acceptable since it happens once at startup
- Simplifies error handling
- Matches dotenv's default behavior

### Optimization 2: No Repeated Loading

Load environment files once at startup, not on every configuration instantiation:

```typescript
// Good: Load once at app start
loadEnv({ path: ".env" });
const config1 = new HostConfiguration();
const config2 = new DatabaseConfiguration();

// Bad: Don't load repeatedly
const config1 = new HostConfiguration();
loadEnv({ path: ".env" }); // Too late!
```

### Optimization 3: File Existence Caching

dotenv handles file reading efficiently. We only add one extra file existence check for the `required` option.

## Security Notes

**What security measures are in place?**

### Security 1: No Sensitive Data in Errors

Error messages include file paths but never variable values:

```typescript
// Good
error: `Required environment file not found: /app/.env.production`;

// Bad - Never do this
error: `Failed to load env file. DB_PASSWORD was not set`;
```

### Security 2: Path Traversal Protection

Use Node.js path.resolve to prevent directory traversal:

```typescript
// Prevents attacks like ../../../../etc/passwd
const absolutePath = resolve(process.cwd(), envPath);
```

### Security 3: File Permissions

Respect Node.js file system permissions. Don't try to bypass OS security.

### Security 4: Secrets Management

This utility loads .env files, but for production:

- Use environment variables directly (set by orchestration)
- Use secret management systems (Vault, AWS Secrets Manager, etc.)
- Never commit .env files to version control (add to .gitignore)

### Security 5: No Defaults for Sensitive Values

Don't provide default values for sensitive configuration:

```typescript
// Bad
const dbPassword = process.env.DB_PASSWORD || "default_password";

// Good
const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) {
    throw new Error("DB_PASSWORD is required");
}
```

## Testing Strategy

**How do we test this?**

### Test Categories

1. **Unit Tests**: Test loadEnv and loadEnvOrThrow in isolation
2. **Integration Tests**: Test with actual HostConfiguration and DatabaseConfiguration
3. **Edge Case Tests**: Missing files, malformed files, permissions

### Test Fixtures

Create test .env files in `src/__tests__/fixtures/`:

```bash
# .env.test
TEST_VAR=test_value
TEST_PORT=3000

# .env.empty
# (empty file)

# .env.malformed
INVALID LINE WITHOUT EQUALS
VALID_VAR=value
```

### Test Cleanup

Clean up process.env after each test:

```typescript
import { afterEach } from "vitest";

afterEach(() => {
    // Clean up test variables
    delete process.env.TEST_VAR;
    delete process.env.TEST_PORT;
});
```

## Development Checklist

Before considering implementation complete:

- [ ] All functions have JSDoc comments
- [ ] All edge cases are handled
- [ ] Error messages are clear and helpful
- [ ] No sensitive data in logs or errors
- [ ] TypeScript types are correct
- [ ] Build succeeds without errors
- [ ] All tests pass with 100% coverage
- [ ] Integration tests verify backward compatibility
- [ ] Examples are clear and runnable
- [ ] README is updated with usage instructions
- [ ] Security considerations are addressed
