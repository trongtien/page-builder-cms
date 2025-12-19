---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide - Shared API Schema

## Development Setup

**How do we get started?**

### Prerequisites

- Node.js and pnpm installed
- Monorepo already initialized
- Existing `ui` and `utils` packages as reference

### Environment Setup Steps

1. Navigate to `packages/core/api-types`
2. Initialize package: `pnpm init` (if needed)
3. Install Zod: `pnpm add zod`
4. Install dev dependencies: `pnpm add -D typescript tsup @types/node`
5. Create directory structure as per design doc

### Configuration Files Needed

- `package.json` - Package metadata and scripts
- `tsconfig.json` - TypeScript compiler options
- `tsup.config.ts` - Build configuration
- `src/index.ts` - Main export barrel

## Code Structure

**How is the code organized?**

### Directory Structure

```
packages/core/api-types/
├── src/
│   ├── index.ts              # Main exports
│   ├── common/               # Shared schemas
│   │   ├── pagination.ts
│   │   ├── response.ts
│   │   ├── error.ts
│   │   └── index.ts
│   ├── auth/                 # Authentication
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── user.ts
│   │   └── index.ts
│   ├── page/                 # Pages
│   │   ├── page.ts
│   │   ├── page-content.ts
│   │   └── index.ts
│   ├── content/              # Content blocks
│   │   ├── block.ts
│   │   └── index.ts
│   ├── media/                # Media management
│   │   ├── media.ts
│   │   ├── upload.ts
│   │   └── index.ts
│   └── utils/                # Utilities
│       ├── validators.ts
│       └── index.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

### Module Organization

- Each domain has its own folder
- Each file exports related schemas and types
- Barrel exports (`index.ts`) in each folder
- Main `src/index.ts` re-exports everything

### Naming Conventions

- **Schemas**: `PascalCase` ending with `Schema` (e.g., `UserSchema`, `LoginRequestSchema`)
- **Types**: `PascalCase` matching schema name without `Schema` suffix (e.g., `User`, `LoginRequest`)
- **Files**: `kebab-case.ts` (e.g., `page-content.ts`)
- **Folders**: `kebab-case` (e.g., `auth`, `page`)

## Implementation Notes

**Key technical details to remember:**

### Core Schema Patterns

#### 1. Request/Response Schema Pattern

```typescript
import { z } from "zod";

// Request schema
export const LoginRequestSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    rememberMe: z.boolean().optional().default(false)
});

// Response schema
export const LoginResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        token: z.string(),
        expiresAt: z.string().datetime(),
        user: z.object({
            id: z.string().uuid(),
            email: z.string().email(),
            name: z.string()
        })
    })
});

// Inferred types
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
```

#### 2. Reusable Schema Primitives

```typescript
// common/primitives.ts
import { z } from "zod";

export const EmailSchema = z.string().email();
export const UuidSchema = z.string().uuid();
export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const UrlSchema = z.string().url();
export const TimestampSchema = z.string().datetime();

// Usage in other schemas
import { EmailSchema, UuidSchema } from "../common/primitives";

export const UserSchema = z.object({
    id: UuidSchema,
    email: EmailSchema
    // ...
});
```

#### 3. Generic Response Wrapper

```typescript
// common/response.ts
import { z } from "zod";

export const createSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.literal(true),
        data: dataSchema
    });

export const ErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.unknown()).optional()
    })
});

// Usage
export const LoginResponseSchema = createSuccessResponseSchema(
    z.object({
        token: z.string(),
        user: UserSchema
    })
);
```

#### 4. Pagination Schema

```typescript
// common/pagination.ts
import { z } from "zod";

export const PaginationParamsSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20)
});

export const PaginationMetaSchema = z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative()
});

export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        success: z.literal(true),
        data: z.array(itemSchema),
        meta: PaginationMetaSchema
    });

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
```

### Validation Utilities

```typescript
// utils/validators.ts
import { z } from "zod";

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: Array<{ path: string; message: string }>;
}

export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return {
        success: false,
        errors: result.error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message
        }))
    };
}

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

export class ValidationError extends Error {
    constructor(public errors: Array<{ path: string; message: string }>) {
        super("Validation failed");
        this.name = "ValidationError";
    }
}

export function validateOrError<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = safeValidate(schema, data);
    if (!result.success) {
        throw new ValidationError(result.errors!);
    }
    return result.data!;
}
```

### Package Configuration

#### package.json

```json
{
    "name": "@repo/api-types",
    "version": "0.0.1",
    "private": true,
    "type": "module",
    "exports": {
        ".": {
            "import": "./dist/index.js",
            "types": "./dist/index.d.ts"
        }
    },
    "scripts": {
        "build": "tsup",
        "dev": "tsup --watch",
        "type-check": "tsc --noEmit",
        "clean": "rm -rf dist"
    },
    "dependencies": {
        "zod": "^3.23.8"
    },
    "devDependencies": {
        "@types/node": "^20.0.0",
        "tsup": "^8.0.0",
        "typescript": "^5.3.0"
    }
}
```

#### tsconfig.json

```json
{
    "extends": "@repo/typescript-config/base.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "declaration": true,
        "declarationMap": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "moduleResolution": "bundler",
        "module": "ESNext",
        "target": "ES2022"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

#### tsup.config.ts

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true
});
```

## Integration Points

**How do pieces connect?**

### In host-root (package.json)

```json
{
    "dependencies": {
        "@repo/api-types": "workspace:*"
    }
}
```

### Usage Example in host-root

```typescript
// src/api/auth.ts
import { LoginRequest, LoginResponseSchema, safeValidate } from "@repo/api-types";

export async function login(credentials: LoginRequest) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();

    // Validate response
    const result = safeValidate(LoginResponseSchema, data);
    if (!result.success) {
        throw new Error("Invalid response from server");
    }

    return result.data;
}
```

### Usage Example in render-root

```typescript
// app/routes/api/auth/login.ts
import { LoginRequestSchema, safeValidate } from "@repo/api-types";

export async function POST({ request }) {
    const body = await request.json();

    const result = safeValidate(LoginRequestSchema, body);
    if (!result.success) {
        return new Response(
            JSON.stringify({
                success: false,
                errors: result.errors
            }),
            { status: 400 }
        );
    }

    const { email, password, rememberMe } = result.data;
    // Process login...
}
```

## Error Handling

**How do we handle failures?**

### Validation Error Strategy

- Use `safeParse()` for non-critical validations
- Use `parse()` for critical validations that should throw
- Provide custom error messages in schemas
- Format errors consistently across the app

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid request data',
    details: {
      email: ['Invalid email format'],
      password: ['Password too short']
    }
  }
}
```

### Logging Approach

- Log validation errors at debug level
- Log unexpected schema mismatches at warn level
- Consumer apps handle logging of business errors

## Performance Considerations

**How do we keep it fast?**

### Optimization Strategies

- Use `z.lazy()` for recursive/circular schemas
- Avoid unnecessary refinements
- Use discriminated unions for better performance
- Tree-shake unused schemas via ESM exports

### Caching Approach

- Zod schemas are defined once at module load
- No runtime schema generation
- Parsed results can be cached by consumer apps

### Resource Management

- Bundle size monitoring (keep under 50KB)
- Minimal runtime overhead (< 1ms per validation)

## Security Notes

**What security measures are in place?**

### Input Validation

- All user input validated against strict schemas
- Email validation prevents injection
- String length limits prevent DoS
- Regex patterns validated and tested

### Data Sanitization

- Use `.trim()` on string inputs where appropriate
- Use `.transform()` for data normalization
- Sanitize before using in queries (in consumer apps)

### Secrets Management

- No secrets in schema definitions
- Token/password schemas don't validate content, only format
