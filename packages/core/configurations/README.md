# @page-builder/configurations

Configuration management utilities for the Page Builder CMS monorepo.

## Features

- 🔐 **Environment File Loading**: Load environment variables from custom `.env` file paths using dotenv
- ✅ **Type-Safe Configuration**: TypeScript-based configuration classes with validation
- 🔄 **Flexible Loading**: Support for absolute/relative paths and optional/required files
- 🛡️ **Validation**: Built-in validation to ensure required configuration is present
- 🔁 **Backward Compatible**: Works with existing code that uses `process.env` directly

## Installation

This package is part of the monorepo and uses workspace dependencies:

```bash
pnpm add @page-builder/configurations
```

## Usage

### Basic Environment File Loading

Load environment variables from a `.env` file before initializing configuration classes:

```typescript
import { loadEnv, HostConfiguration } from "@page-builder/configurations";

// Load environment file
loadEnv({ path: ".env.local" });

// Initialize configuration
const config = new HostConfiguration();
console.log(config.host); // 'localhost'
console.log(config.port); // 3000
```

### Configuration Classes

#### HostConfiguration

Manages host and port configuration:

```typescript
import { HostConfiguration } from "@page-builder/configurations";

const config = new HostConfiguration();
// Reads from process.env.HOST and process.env.PORT
```

#### DatabaseConfiguration

Manages database connection configuration:

```typescript
import { DatabaseConfiguration } from "@page-builder/configurations";

const config = new DatabaseConfiguration();
// Reads from:
// - process.env.DB_HOST
// - process.env.DB_PORT
// - process.env.DB_NAME
// - process.env.DB_SCHEMA
// - process.env.DB_USERNAME
// - process.env.DB_PASSWORD
```

### Environment File Loading API

#### `loadEnv(options?: EnvLoaderOptions): EnvLoaderResult`

Load environment variables from a file with detailed result information.

**Options:**

```typescript
interface EnvLoaderOptions {
    // Path to the environment file (default: '.env')
    path?: string;

    // Whether to override existing environment variables (default: false)
    override?: boolean;

    // Whether the file must exist (default: false)
    required?: boolean;

    // File encoding (default: 'utf8')
    encoding?: BufferEncoding;
}
```

**Result:**

```typescript
interface EnvLoaderResult {
    // Whether the file was successfully loaded
    success: boolean;

    // Absolute path that was attempted
    path: string;

    // Error message if loading failed
    error?: string;

    // Parsed environment variables (for debugging)
    parsed?: Record<string, string>;
}
```

**Examples:**

```typescript
// Load from default .env file
const result = loadEnv();
if (!result.success) {
    console.warn(`Failed to load .env: ${result.error}`);
}

// Load from custom path
loadEnv({ path: "./config/.env.production" });

// Load with override (replace existing env vars)
loadEnv({ path: ".env.local", override: true });

// Require file to exist
const result = loadEnv({ path: ".env.production", required: true });
if (!result.success) {
    console.error(result.error);
    process.exit(1);
}
```

#### `loadEnvOrThrow(options?: EnvLoaderOptions): void`

Convenience function that throws an error if loading fails.

```typescript
import { loadEnvOrThrow } from "@page-builder/configurations";

try {
    loadEnvOrThrow({ path: ".env.production" });
} catch (error) {
    console.error("Failed to load configuration:", error);
    process.exit(1);
}
```

## Environment File Format

Environment files should follow the standard `.env` format:

```bash
# example.env
HOST=localhost
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=pagebuilder
DB_SCHEMA=public
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
```

## Common Patterns

### Development Environment

```typescript
// Load local overrides if they exist
const result = loadEnv({ path: ".env.local" });
if (!result.success) {
    console.log("No .env.local found, using defaults");
}

// Initialize configurations
const hostConfig = new HostConfiguration();
const dbConfig = new DatabaseConfiguration();
```

### Production Environment

```typescript
// Require production env file
loadEnvOrThrow({
    path: ".env.production",
    required: true
});

// Initialize configurations
const config = new HostConfiguration();
```

### Multiple Environments

```typescript
// Load base configuration
loadEnv({ path: ".env" });

// Load environment-specific overrides
const env = process.env.NODE_ENV || "development";
loadEnv({
    path: `.env.${env}`,
    override: true
});
```

### CI/CD Without Environment Files

Configuration classes work without `loadEnv()` if environment variables are set directly:

```typescript
// CI/CD sets these directly
process.env.HOST = "production-host";
process.env.PORT = "8080";

// Works without loadEnv
const config = new HostConfiguration();
```

## Error Handling

All configuration classes validate required fields during initialization. If validation fails, an error is thrown:

```typescript
try {
    const config = new HostConfiguration();
} catch (error) {
    console.error("Configuration validation failed:", error);
    // Error: Configuration load empty
}
```

Ensure all required environment variables are set before initializing configuration classes.

## Security Best Practices

1. **Never commit `.env` files**: They're already in `.gitignore`
2. **Use different files per environment**: `.env.development`, `.env.production`, etc.
3. **Keep sensitive data out of code**: Use environment variables for secrets
4. **Use secret management in production**: Don't rely on `.env` files in production; use AWS Secrets Manager, HashiCorp Vault, etc.

## Testing

The package includes comprehensive unit and integration tests:

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run tests in watch mode
pnpm test -- --watch
```

## Development

```bash
# Build the package
pnpm build

# Run type checking
pnpm type-check

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## API Reference

### Classes

- **`HostConfiguration`**: Manages host and port configuration
- **`DatabaseConfiguration`**: Manages database connection configuration
- **`ValidateConfiguration`**: Base class for configuration validation

### Functions

- **`loadEnv(options?)`**: Load environment variables from a file
- **`loadEnvOrThrow(options?)`**: Load environment variables or throw on failure

### Types

- **`EnvLoaderOptions`**: Options for loading environment files
- **`EnvLoaderResult`**: Result of environment file loading

## License

ISC

## Contributing

This package is part of the Page Builder CMS monorepo. See the root [CONTRIBUTING.md](../../../CONTRIBUTING.md) for contribution guidelines.
