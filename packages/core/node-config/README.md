# @page-builder/node-config

Centralized configuration management for page-builder-cms monorepo.

## Features

- ✅ **Type-safe configuration** with TypeScript
- ✅ **Standalone** - No framework dependencies
- ✅ **Manual validation** (no external validation libraries)
- ✅ **Environment file support** (.env, .env.local, .env.{NODE_ENV})
- ✅ **Comprehensive testing** with Jest (100% coverage)
- ✅ **Singleton pattern** - Configuration loaded once and cached
- ✅ **File naming conventions**: `{domain}.config.ts`, `{domain}.config.test.ts`

## Installation

```bash
pnpm add @page-builder/node-config
```

## Usage

### 1. Setup .env file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your configuration values:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=mydb
DATABASE_USERNAME=user
DATABASE_PASSWORD=secret

JWT_SECRET=your-very-long-secret-key-at-least-32-chars
JWT_EXPIRES_IN=1h
JWT_ISSUER=page-builder-cms
JWT_AUDIENCE=page-builder-api
```

### 2. Import and use configuration

```typescript
import { config } from "@page-builder/node-config";

// Access database configuration
console.log(config.database.host); // 'localhost'
console.log(config.database.port); // 5432
console.log(config.database.url); // Full connection string

// Access JWT configuration
console.log(config.jwt.secret); // Your secret key
console.log(config.jwt.expiresIn); // '1h'
console.log(config.jwt.algorithm); // 'HS256'

// Access testing configuration
console.log(config.testing.enabled); // true (in test environment)
console.log(config.testing.database); // Test database config
```

### 3. Use in your application

```typescript
// database.service.ts
import { config } from "@page-builder/node-config";
import { createConnection } from "typeorm";

export class DatabaseService {
    async connect() {
        const dbConfig = config.database;

        return createConnection({
            type: "postgres",
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.name,
            username: dbConfig.username,
            password: dbConfig.password,
            ssl: dbConfig.ssl,
            // Or use the full URL
            url: dbConfig.url
        });
    }
}
```

```typescript
// auth.service.ts
import { config } from "@page-builder/node-config";
import jwt from "jsonwebtoken";

export class AuthService {
    generateToken(userId: string) {
        const jwtConfig = config.jwt;

        return jwt.sign({ sub: userId }, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
            algorithm: jwtConfig.algorithm
        });
    }
}
```

### 4. Advanced usage

#### Load environment files manually

```typescript
import { loadEnvFiles } from "@page-builder/node-config";

// Load from custom path
loadEnvFiles("/path/to/env/files");

// Load from current directory (default)
loadEnvFiles();
```

#### Use individual config loaders

```typescript
import { loadDatabaseConfig, loadJwtConfig, loadTestingConfig } from "@page-builder/node-config";

// Load with custom environment
const dbConfig = loadDatabaseConfig({
    DATABASE_HOST: "custom-host",
    DATABASE_PORT: "3306"
    // ... other vars
});
```

#### Reset cached configuration (for testing)

```typescript
import { resetDatabaseConfig, resetJwtConfig, resetTestingConfig } from "@page-builder/node-config";

beforeEach(() => {
    // Reset all cached configs
    resetDatabaseConfig();
    resetJwtConfig();
    resetTestingConfig();
});
```

## Configuration Domains

### Database Configuration

**Environment Variables:**

- `DATABASE_HOST` - Database server hostname (required)
- `DATABASE_PORT` - Database server port (default: 5432)
- `DATABASE_NAME` - Database name (required)
- `DATABASE_USERNAME` - Database username (required)
- `DATABASE_PASSWORD` - Database password (required)
- `DATABASE_SSL` - Enable SSL connection (default: false)
- `DATABASE_URL` - Full connection URL (optional, overrides other fields)

### JWT Configuration

**Environment Variables:**

- `JWT_SECRET` - Secret key (required, min 32 characters)
- `JWT_EXPIRES_IN` - Token expiration (default: 1h, format: 30s, 15m, 1h, 7d)
- `JWT_ISSUER` - Token issuer (required)
- `JWT_AUDIENCE` - Token audience (required)
- `JWT_ALGORITHM` - Signing algorithm (default: HS256, options: HS256, HS384, HS512, RS256)

### Testing Configuration

**Environment Variables:**

- `TEST_ENABLED` - Enable testing mode (auto-enabled when NODE_ENV=test)
- `TEST_DATABASE_HOST` - Test database host (default: localhost)
- `TEST_DATABASE_PORT` - Test database port (default: 5433)
- `TEST_DATABASE_NAME` - Test database name (default: test_db)
- `TEST_MOCK_EXTERNAL` - Mock external services (default: true)
- `TEST_COVERAGE` - Enable coverage collection (default: false)

## File Structure

```
src/
├── config/
│   ├── __tests__/
│   │   ├── database.config.test.ts
│   │   ├── jwt.config.test.ts
│   │   └── testing.config.test.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── testing.config.ts
│   └── index.ts
├── errors/
│   ├── __tests__/
│   │   └── errors.test.ts
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint
```

## License

MIT
