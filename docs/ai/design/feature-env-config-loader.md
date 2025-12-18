---
phase: design
title: System Design & Architecture
description: Define the technical architecture, components, and data models
---

# System Design & Architecture

## Architecture Overview

**What is the high-level system structure?**

````mermaid
graph TD
    A[Application Startup] --> B[loadEnvFiles Function]
    B --> C[dotenv Loader]
    C --> D[.env Files]
    C --> E[process.env]

    F[config.database] --> G[getDatabaseConfig]
    H[config.jwt] --> I[getJwtConfig]
    J[config.testing] --> K[getTestingConfig]

    G --> L[loadDatabaseConfig]
    I --> M[loadJwtConfig]
    K --> N[loadTestingConfig]

    L --> O[Parse & Validate]
    M --> O
    N --> O

    O --> P{Valid?}
    P -->|Yes| Q[Cached Config Object]
    P -->|No| R[Throw ConfigValidationError]

    Q --> S[Return to Application]

    style Q fill:#90EE90
    style R fill:#FFB6C6
    - Applies precedence rules (files → env → defaults)
    - Integrates with dotenv for `.env` file parsing

2. **Config Schema** (`src/schemas/`)
    - Defines TypeScript interfaces for each configuration domain
    - Defines validation rules and parsing logic
    - Documents required vs optional variables with default values

3. **Parser & Validator** (`src/parser.ts`)
    - Parses raw environment data and coerces types (string → number/boolean)
    - Validates required fields and value constraints
    - Generates helpful error messages on validation failure

4. **Config Exporter** (`src/index.ts`)
    - Main entry point for the package
    - Exports validated configuration object
    - Caches loaded config (singleton pattern)

**Technology stack choices:**

- **dotenv**: Industry standard for `.env` file parsing, well-maintained
- **TypeScript**: Full type safety with strict mode enabled
- **Manual validation**: No external validation libraries (no Zod, Yup, Joi)
- **Standalone**: No framework dependencies (no NestJS, Express, etc.)
- **Singleton pattern**: Configuration loaded once and cached per domain
- **Jest**: Testing with ts-jest, targeting 100% coverage

## Data Models

**What data do we need to manage?**

### Core Configuration Schema Structure

```typescript
// Base structure for all configuration
interface AppConfig {
    env: "development" | "production" | "test" | "staging";
    nodeEnv: string;
    port: number;
    host: string;

    database: DatabaseConfig;
    jwt: JwtConfig;
    api: ApiConfig;
    features: FeatureFlags;
    logging: LoggingConfig;
    testing: TestingConfig;
}

interface DatabaseConfig {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
    url: string; // Full connection URL
}

interface JwtConfig {
    secret: string;
    expiresIn: string;
    issuer: string;
    audience: string;
    algorithm: "HS256" | "HS384" | "HS512" | "RS256";
}

interface ApiConfig {
    baseUrl: string;
    timeout: number;
    apiKey?: string;
    rateLimitPerMinute: number;
}

interface FeatureFlags {
    enableAuth: boolean;
    enableAnalytics: boolean;
    maintenanceMode: boolean;
}

interface LoggingConfig {
    level: "debug" | "info" | "warn" | "error";
    pretty: boolean;
    destination?: string;
}

interface TestingConfig {
    enabled: boolean;
    database: {
        host: string;
        port: number;
        name: string;
    };
    mockExternal: boolean;
    coverage: boolean;
}
````

### Environment Variable Mapping

```
NODE_ENV                    → config.nodeEnv
APP_ENV                     → config.env
PORT                        → config.port
HOST                        → config.host

DATABASE_HOST               → config.database.host
DATABASE_PORT               → config.database.port
DATABASE_NAME               → config.database.name
DATABASE_USERNAME           → config.database.username
DATABASE_PASSWORD           → config.database.password
DATABASE_SSL                → config.database.ssl
DATABASE_URL                → config.database.url

JWT_SECRET                  → config.jwt.secret
JWT_EXPIRES_IN              → config.jwt.expiresIn
JWT_ISSUER                  → config.jwt.issuer
JWT_AUDIENCE                → config.jwt.audience
JWT_ALGORITHM               → config.jwt.algorithm

API_BASE_URL                → config.api.baseUrl
API_TIMEOUT                 → config.api.timeout
API_KEY                     → config.api.apiKey
API_RATE_LIMIT              → config.api.rateLimitPerMinute

FEATURE_AUTH                → config.features.enableAuth
FEATURE_ANALYTICS           → config.features.enableAnalytics
MAINTENANCE_MODE            → config.features.maintenanceMode

LOG_LEVEL                   → config.logging.level
LOG_PRETTY                  → config.logging.pretty
LOG_DESTINATION             → config.logging.destination

TEST_ENABLED                → config.testing.enabled
TEST_DATABASE_HOST          → config.testing.database.host
TEST_DATABASE_PORT          → config.testing.database.port
TEST_DATABASE_NAME          → config.testing.database.name
TEST_MOCK_EXTERNAL          → config.testing.mockExternal
TEST_COVERAGE               → config.testing.coverage
```

### Data Flow

1. **Raw Environment Variables** (strings) →
2. **Parsed by dotenv** (merged with process.env) →
3. **Manual parsing & type coercion** (string → number/boolean with validation) →
4. **Typed Configuration Object** (strongly typed via TypeScript interfaces)

## API Design

**How do components communicate?**

### Public API

```typescript
// Main module export for NestJS
import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, jwtConfig, testingConfig]
        })
    ],
    exports: [NestConfigModule]
})
export class ConfigModule {}

// Configuration loader functions
export function databaseConfig() {
    return {
        database: loadDatabaseConfig(process.env)
    };
}

export function jwtConfig() {
    return {
        jwt: loadJwtConfig(process.env)
    };
}

export function testingConfig() {
    return {
        testing: loadTestingConfig(process.env)
    };
}

// Injectable service for type-safe config access
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
    constructor(private configService: ConfigService) {}

    get database() {
        return this.configService.get<DatabaseConfig>("database");
    }

    get jwt() {
        return this.configService.get<JwtConfig>("jwt");
    }

    get testing() {
        return this.configService.get<TestingConfig>("testing");
    }
}

// Export types for consuming packages
export type { AppConfig, DatabaseConfig, JwtConfig, ApiConfig, FeatureFlags, LoggingConfig, TestingConfig };

// Get specific config section
export function getConfigSection<K extends keyof AppConfig>(section: K): AppConfig[K];
```

### Internal API

```typescript
// Load environment variables from files
function loadEnvFiles(basePath: string, env: string): Record<string, string>;

// Merge environment sources with precedence
function mergeEnvSources(...sources: Record<string, string>[]): Record<string, string>;

// Parse and validate configuration
function parseConfig(env: Record<string, string | undefined>): AppConfig;

// Coerce string values to appropriate types
function coerceValue(value: string | undefined, type: "string" | "number" | "boolean"): any;

// Format validation errors for display
function formatValidationError(errors: ValidationError[]): string;
```

### Error Handling

```typescript
// Validation error interface
interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

// Custom error class for configuration errors
export class ConfigValidationError extends Error {
    constructor(
        message: string,
        public readonly errors: ValidationError[],
        public readonly rawConfig: unknown
    ) {
        super(message);
        this.name = "ConfigValidationError";
    }
}

// Example error output:
/*
ConfigValidationError: Configuration validation failed

Missing required variables:
  - DATABASE_PASSWORD: Required database password not provided
  - API_KEY: Required API key not provided

Invalid values:
  - PORT: Expected number, received "invalid"
  - DATABASE_SSL: Expected boolean, received "maybe"

Please check your .env file or environment variables.
*/
```

## Component Breakdown

**What are the major building blocks?**

### 1. Config Files (`src/config/`)

**Purpose**: Define TypeScript interfaces and loading functions for configuration

**Naming Convention**: `{domain}.config.ts` (NestJS standard)

**Files**:

- `base.config.ts` - Core app configuration (port, host, env)
- `database.config.ts` - Database connection configuration (1 file for all database config)
- `jwt.config.ts` - JWT authentication configuration (1 file for JWT)
- `api.config.ts` - External API configuration
- `features.config.ts` - Feature flag configuration
- `logging.config.ts` - Logging configuration
- `testing.config.ts` - Testing environment configuration
- `index.ts` - Re-exports all config loaders

**Test Files** (in `src/config/__tests__/`):

- `database.config.test.ts` - Tests for database config
- `jwt.config.test.ts` - Tests for JWT config
- `testing.config.test.ts` - Tests for testing config

#### Example 1: Database Configuration (database.config.ts)

**Complete file for loading database config with host, port, and URL:**

```typescript
// src/config/database.config.ts
import { registerAs } from "@nestjs/config";
import { ValidationError } from "../types";
import { ConfigValidationError } from "../errors";

/**
 * Database configuration interface
 * Single file handles all database-related configuration
 */
export interface DatabaseConfig {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
    url: string; // Full connection URL (constructed or from env)
}

/**
 * Load and validate database configuration
 * Handles both individual fields and full URL
 */
export function loadDatabaseConfig(env: Record<string, string | undefined>): DatabaseConfig {
    const errors: ValidationError[] = [];

    // Validate host
    const host = env.DATABASE_HOST?.trim();
    if (!host) {
        errors.push({ field: "DATABASE_HOST", message: "Database host is required" });
    }

    // Validate port with default
    const portStr = env.DATABASE_PORT || "5432";
    const port = parseInt(portStr, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
        errors.push({
            field: "DATABASE_PORT",
            message: `Database port must be between 1 and 65535, got: ${portStr}`
        });
    }

    // Validate database name
    const name = env.DATABASE_NAME?.trim();
    if (!name) {
        errors.push({ field: "DATABASE_NAME", message: "Database name is required" });
    }

    // Validate username
    const username = env.DATABASE_USERNAME?.trim();
    if (!username) {
        errors.push({ field: "DATABASE_USERNAME", message: "Database username is required" });
    }

    // Validate password
    const password = env.DATABASE_PASSWORD;
    if (!password) {
        errors.push({ field: "DATABASE_PASSWORD", message: "Database password is required" });
    }

    // Parse SSL with default false
    const ssl = env.DATABASE_SSL?.toLowerCase() === "true";

    // Throw if validation errors exist
    if (errors.length > 0) {
        throw new ConfigValidationError("Database configuration invalid", errors, env);
    }

    // Build connection URL if not provided
    let url = env.DATABASE_URL;
    if (!url) {
        const protocol = ssl ? "postgresql" : "postgres";
        url = `${protocol}://${username}:${password}@${host}:${port}/${name}`;
        if (ssl) {
            url += "?sslmode=require";
        }
    }

    return {
        host: host!,
        port,
        name: name!,
        username: username!,
        password: password!,
        ssl,
        url
    };
}
```

#### Example 2: JWT Configuration (jwt.config.ts)

**Complete file for loading JWT authentication config:**

```typescript
// src/config/jwt.config.ts
import { registerAs } from "@nestjs/config";
import { ValidationError } from "../types";
import { ConfigValidationError } from "../errors";

/**
 * JWT configuration interface
 * Single file handles all JWT-related configuration
 */
export interface JwtConfig {
    secret: string;
    expiresIn: string;
    issuer: string;
    audience: string;
    algorithm: "HS256" | "HS384" | "HS512" | "RS256";
}

/**
 * Load and validate JWT configuration
 */
export function loadJwtConfig(env: Record<string, string | undefined>): JwtConfig {
    const errors: ValidationError[] = [];

    // Validate JWT secret
    const secret = env.JWT_SECRET;
    if (!secret) {
        errors.push({ field: "JWT_SECRET", message: "JWT secret is required" });
    } else if (secret.length < 32) {
        errors.push({
            field: "JWT_SECRET",
            message: "JWT secret must be at least 32 characters for security"
        });
    }

    // Validate expiration time with default
    const expiresIn = env.JWT_EXPIRES_IN || "1h";
    const validExpiresPattern = /^\d+[smhd]$/;
    if (!validExpiresPattern.test(expiresIn)) {
        errors.push({
            field: "JWT_EXPIRES_IN",
            message: "JWT expires must be in format: 30s, 15m, 1h, 7d"
        });
    }

    // Validate issuer
    const issuer = env.JWT_ISSUER?.trim();
    if (!issuer) {
        errors.push({ field: "JWT_ISSUER", message: "JWT issuer is required" });
    }

    // Validate audience
    const audience = env.JWT_AUDIENCE?.trim();
    if (!audience) {
        errors.push({ field: "JWT_AUDIENCE", message: "JWT audience is required" });
    }

    // Validate algorithm with default
    const algorithm = (env.JWT_ALGORITHM || "HS256") as JwtConfig["algorithm"];
    const validAlgorithms: JwtConfig["algorithm"][] = ["HS256", "HS384", "HS512", "RS256"];
    if (!validAlgorithms.includes(algorithm)) {
        errors.push({
            field: "JWT_ALGORITHM",
            message: `JWT algorithm must be one of: ${validAlgorithms.join(", ")}`
        });
    }

    if (errors.length > 0) {
        throw new ConfigValidationError("JWT configuration invalid", errors, env);
    }

    return {
        secret: secret!,
        expiresIn,
        issuer: issuer!,
        audience: audience!,
        algorithm
    };
}
```

#### Example 3: Testing Configuration (testing.config.ts)

**Complete file for loading test environment config:**

```typescript
// src/config/testing.config.ts
import { registerAs } from "@nestjs/config";
import { ValidationError } from "../types";
import { ConfigValidationError } from "../errors";

/**
 * Testing configuration interface
 * Manages test database and mock settings
 */
export interface TestingConfig {
    enabled: boolean;
    database: {
        host: string;
        port: number;
        name: string;
    };
    mockExternal: boolean;
    coverage: boolean;
}

/**
 * Load and validate testing configuration
 */
export function loadTestingConfig(env: Record<string, string | undefined>): TestingConfig {
    const errors: ValidationError[] = [];

    // Check if testing is enabled
    const enabled = env.NODE_ENV === "test" || env.TEST_ENABLED?.toLowerCase() === "true";

    // Test database host with fallback
    const host = env.TEST_DATABASE_HOST?.trim() || "localhost";

    // Test database port with fallback
    const portStr = env.TEST_DATABASE_PORT || "5433";
    const port = parseInt(portStr, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
        errors.push({
            field: "TEST_DATABASE_PORT",
            message: `Test database port must be between 1 and 65535, got: ${portStr}`
        });
    }

    // Test database name with fallback
    const name = env.TEST_DATABASE_NAME?.trim() || "test_db";

    // Mock external services in test
    const mockExternal = env.TEST_MOCK_EXTERNAL?.toLowerCase() !== "false";

    // Enable coverage collection
    const coverage = env.TEST_COVERAGE?.toLowerCase() === "true";

    if (errors.length > 0) {
        throw new ConfigValidationError("Testing configuration invalid", errors, env);
    }

    return {
        enabled,
        database: {
            host,
            port,
            name
        },
        mockExternal,
        coverage
    };
}
```

#### Example 4: Database Config Tests (database.config.test.ts)

**Complete Jest test file for database configuration:**

```typescript
// src/config/__tests__/database.config.test.ts
import { loadDatabaseConfig } from "../database.config";
import { ConfigValidationError } from "../../errors";

describe("DatabaseConfig", () => {
    describe("loadDatabaseConfig", () => {
        it("should load valid database configuration", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "5432",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123",
                DATABASE_SSL: "true"
            };

            const config = loadDatabaseConfig(env);

            expect(config).toEqual({
                host: "localhost",
                port: 5432,
                name: "mydb",
                username: "user",
                password: "pass123",
                ssl: true,
                url: expect.stringContaining("postgresql://")
            });
        });

        it("should use default port 5432 when not provided", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            const config = loadDatabaseConfig(env);
            expect(config.port).toBe(5432);
        });

        it("should throw error when host is missing", () => {
            const env = {
                DATABASE_PORT: "5432",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            expect(() => loadDatabaseConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadDatabaseConfig(env)).toThrow(/DATABASE_HOST/);
        });

        it("should throw error when password is missing", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user"
            };

            expect(() => loadDatabaseConfig(env)).toThrow(ConfigValidationError);
            expect(() => loadDatabaseConfig(env)).toThrow(/DATABASE_PASSWORD/);
        });

        it("should validate port range", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "99999",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123"
            };

            expect(() => loadDatabaseConfig(env)).toThrow(/port must be between/);
        });

        it("should construct URL when not provided", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "5432",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123",
                DATABASE_SSL: "false"
            };

            const config = loadDatabaseConfig(env);
            expect(config.url).toBe("postgres://user:pass123@localhost:5432/mydb");
        });

        it("should use provided DATABASE_URL", () => {
            const env = {
                DATABASE_HOST: "localhost",
                DATABASE_PORT: "5432",
                DATABASE_NAME: "mydb",
                DATABASE_USERNAME: "user",
                DATABASE_PASSWORD: "pass123",
                DATABASE_URL: "postgresql://custom-url:5432/db"
            };

            const config = loadDatabaseConfig(env);
            expect(config.url).toBe("postgresql://custom-url:5432/db");
        });
    });
});
```

### 2. Environment Loader (`src/loader.ts`)

**Purpose**: Load environment variables from multiple sources with proper precedence

**Responsibilities**:

- Load `.env` files using dotenv
- Handle environment-specific overrides (`.env.local`, `.env.production`)
- Merge with process.env
- Return unified environment object

**Precedence** (highest to lowest):

1. `process.env` (runtime environment variables)
2. `.env.[NODE_ENV].local` (e.g., `.env.production.local`)
3. `.env.local`
4. `.env.[NODE_ENV]` (e.g., `.env.production`)
5. `.env`

### 3. Parser & Validator (`src/parser.ts`)

**Purpose**: Parse, validate and transform raw environment data

**Responsibilities**:

- Parse raw environment object using schema-specific parsers
- Apply type coercion (string → number/boolean)
- Collect and format validation errors
- Return typed configuration object

### 4. Main Entry Point (`src/index.ts`)

**Purpose**: Public API and singleton config export

**Responsibilities**:

- Export loadConfig function
- Export cached config singleton
- Export types and utilities
- Handle initialization errors gracefully

### 5. Utilities (`src/utils/`)

**Purpose**: Helper functions for common tasks

**Files**:

- `env-parser.ts` - Parse environment-specific variable names
- `error-formatter.ts` - Format validation errors for display
- `type-coercion.ts` - Type coercion utilities (string → number/boolean)
- `logger.ts` - Internal logging for debugging

## Design Decisions

**Why did we choose this approach?**

### 1. **Manual Validation (No External Library)**

- **Decision**: Implement manual validation instead of using validation libraries (Zod, Joi, Yup)
- **Rationale**:
    - Zero external dependencies beyond dotenv (minimal bundle size)
    - Full control over validation logic and error messages
    - No learning curve for additional libraries
    - Simple, explicit TypeScript interfaces
- **Trade-offs**: More manual code to write, but provides maximum flexibility and minimal dependencies

### 2. **Singleton Pattern for Config Export**

- **Decision**: Export a pre-loaded `config` object in addition to `loadConfig()` function
- **Rationale**:
    - Simplifies usage: `import { config } from '@page-builder/node-config'`
    - Ensures configuration loaded once (performance)
    - Prevents multiple validation runs
- **Trade-offs**: Less flexible for testing, but we provide `loadConfig()` for custom scenarios

### 3. **Fail-Fast on Validation Errors**

- **Decision**: Throw errors immediately on invalid configuration
- **Rationale**:
    - Prevents running application with invalid state
    - Makes debugging easier (fail at startup, not runtime)
    - Forces developers to fix configuration issues
- **Trade-offs**: App won't start with invalid config, but this is desired behavior

### 4. **Nested Configuration Structure**

- **Decision**: Use nested objects (config.database.host) instead of flat (config.databaseHost)
- **Rationale**:
    - Better organization for large config schemas
    - Clear grouping of related settings
    - Easier to extend with new domains
- **Trade-offs**: More typing required, but improved maintainability

### 5. **Environment Variable Naming Convention**

- **Decision**: Use `SCREAMING_SNAKE_CASE` with domain prefixes (DATABASE*, API*)
- **Rationale**:
    - Standard Unix convention for environment variables
    - Prefix clearly indicates configuration domain
    - Prevents naming collisions
- **Trade-offs**: More verbose, but clearer and safer

## Non-Functional Requirements

**How should the system perform?**

### Performance Targets

- Configuration loading: < 100ms (including file I/O and validation)
- No impact on application hot-reload time
- Singleton config access: O(1) constant time
- Memory footprint: < 1MB for config object

### Scalability Considerations

- Support for 100+ configuration variables without performance degradation
- Efficient manual validation (simple type checks and coercion)
- Lazy loading of config sections (if needed in future)

### Security Requirements

- **Never log secrets**: Redact sensitive fields (passwords, API keys) in error messages
- **No secrets in source code**: All sensitive values from environment
- **Validate input**: Prevent injection attacks through strict schema validation
- **Secure defaults**: Conservative default values (e.g., SSL enabled by default)

### Reliability/Availability Needs

- **Zero runtime failures**: All validation happens at startup
- **Clear error messages**: Developers can quickly identify and fix issues
- **Graceful degradation**: Optional config with defaults allows partial functionality
- **Type safety**: TypeScript prevents incorrect usage at compile time

### Maintainability

- **Schema co-location**: Each domain's schema and parser in separate file
- **Self-documenting**: TypeScript interfaces and parsing functions serve as configuration documentation
- **Extensible**: Easy to add new configuration domains or variables
- **Testable**: Pure functions, easy to unit test
