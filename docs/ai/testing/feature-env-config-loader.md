---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals

**What level of testing do we aim for?**

- **Unit test coverage target**: 100% of all code (functions, branches, statements)
- **Integration test scope**: Full config loading pipeline, precedence rules, error scenarios
- **End-to-end test scenarios**: Real-world usage patterns from consuming packages
- **Alignment with requirements**: Every success criterion in requirements doc must be testable

## Unit Tests

**What individual components need testing?**

### Loader Module (`src/loader.ts`)

- [ ] **Test: Load single .env file**
    - Given: `.env` file exists
    - When: `loadEnvFiles()` called
    - Then: Variables from file returned

- [ ] **Test: Load with .env.local override**
    - Given: Both `.env` and `.env.local` exist with overlapping vars
    - When: `loadEnvFiles()` called
    - Then: `.env.local` values take precedence

- [ ] **Test: Load environment-specific file**
    - Given: `.env.production` exists, NODE_ENV=production
    - When: `loadEnvFiles()` called
    - Then: Production-specific values loaded

- [ ] **Test: Process.env takes highest precedence**
    - Given: Variable defined in `.env` and `process.env`
    - When: `loadEnvFiles()` called
    - Then: `process.env` value returned

- [ ] **Test: Gracefully handle missing files**
    - Given: No `.env` files exist
    - When: `loadEnvFiles()` called
    - Then: Returns empty object without errors

- [ ] **Test: Handle malformed .env file**
    - Given: `.env` file has invalid syntax
    - When: `loadEnvFiles()` called
    - Then: Throws clear error message

### Validator Module (`src/validator.ts`)

- [ ] **Test: Valid config passes validation**
    - Given: All required fields present and valid
    - When: `validateConfig()` called
    - Then: Returns typed config object

- [ ] **Test: Missing required field throws error**
    - Given: Required field missing from input
    - When: `validateConfig()` called
    - Then: Throws `ConfigValidationError` with details

- [ ] **Test: Invalid type throws error**
    - Given: String provided for number field
    - When: `validateConfig()` called
    - Then: Throws error indicating type mismatch

- [ ] **Test: Type coercion works**
    - Given: String "3000" for number field
    - When: `validateConfig()` called
    - Then: Returns number 3000

- [ ] **Test: Boolean coercion handles multiple formats**
    - Given: Various boolean string values ("true", "false", "1", "0")
    - When: `validateConfig()` called
    - Then: Correctly converts to boolean

- [ ] **Test: Custom error formatting**
    - Given: Multiple validation errors
    - When: `validateConfig()` called
    - Then: Error message groups missing/invalid fields

### Base Schema (`src/schemas/base.schema.ts`)

- [ ] **Test: Valid base config**
    - Given: Valid env, nodeEnv, port, host
    - When: Schema parses input
    - Then: Returns typed config

- [ ] **Test: Port defaults to 3000**
    - Given: PORT not provided
    - When: Schema parses input
    - Then: Returns port=3000

- [ ] **Test: Env must be valid enum value**
    - Given: Invalid env value "invalid"
    - When: Schema parses input
    - Then: Throws validation error

- [ ] **Test: Port must be positive integer**
    - Given: PORT="-100"
    - When: Schema parses input
    - Then: Throws validation error

### Database Schema (`src/schemas/database.schema.ts`)

- [ ] **Test: Valid database config**
    - Given: All required database fields
    - When: Schema parses input
    - Then: Returns typed database config

- [ ] **Test: Port defaults to 5432**
    - Given: DATABASE_PORT not provided
    - When: Schema parses input
    - Then: Returns port=5432

- [ ] **Test: SSL defaults to false**
    - Given: DATABASE_SSL not provided
    - When: Schema parses input
    - Then: Returns ssl=false

- [ ] **Test: Missing password throws error**
    - Given: DATABASE_PASSWORD not provided
    - When: Schema parses input
    - Then: Throws validation error

- [ ] **Test: Empty string not allowed for required fields**
    - Given: DATABASE_HOST=""
    - When: Schema parses input
    - Then: Throws validation error

### API Schema (`src/schemas/api.schema.ts`)

- [ ] **Test: Valid API config**
    - Given: Valid baseUrl, timeout, apiKey
    - When: Schema parses input
    - Then: Returns typed API config

- [ ] **Test: BaseUrl must be valid URL**
    - Given: API_BASE_URL="not-a-url"
    - When: Schema parses input
    - Then: Throws validation error

- [ ] **Test: Timeout defaults to 5000**
    - Given: API_TIMEOUT not provided
    - When: Schema parses input
    - Then: Returns timeout=5000

- [ ] **Test: ApiKey is optional**
    - Given: API_KEY not provided
    - When: Schema parses input
    - Then: Returns apiKey=undefined

- [ ] **Test: Rate limit must be positive**
    - Given: API_RATE_LIMIT="0"
    - When: Schema parses input
    - Then: Throws validation error

### Feature Flags Schema (`src/schemas/features.schema.ts`)

- [ ] **Test: All flags default to false**
    - Given: No feature flags provided
    - When: Schema parses input
    - Then: All flags are false

- [ ] **Test: Flags accept boolean strings**
    - Given: FEATURE_AUTH="true"
    - When: Schema parses input
    - Then: Returns enableAuth=true

- [ ] **Test: Invalid flag value throws error**
    - Given: FEATURE_AUTH="maybe"
    - When: Schema parses input
    - Then: Throws validation error

### Logging Schema (`src/schemas/logging.schema.ts`)

- [ ] **Test: Valid logging config**
    - Given: Valid log level, pretty, destination
    - When: Schema parses input
    - Then: Returns typed logging config

- [ ] **Test: Log level must be valid enum**
    - Given: LOG_LEVEL="verbose"
    - When: Schema parses input
    - Then: Throws validation error

- [ ] **Test: Log level defaults to 'info'**
    - Given: LOG_LEVEL not provided
    - When: Schema parses input
    - Then: Returns level='info'

- [ ] **Test: Pretty defaults to false in production**
    - Given: LOG_PRETTY not provided, NODE_ENV=production
    - When: Schema parses input
    - Then: Returns pretty=false

### Combined Schema (`src/schemas/index.ts`)

- [ ] **Test: Full config with all sections**
    - Given: Valid values for all config sections
    - When: Master schema parses input
    - Then: Returns complete typed config

- [ ] **Test: Nested validation errors**
    - Given: Invalid database config in larger config
    - When: Master schema parses input
    - Then: Error indicates database section issue

### Error Formatter (`src/utils/error-formatter.ts`)

- [ ] **Test: Format missing field error**
    - Given: ZodError for missing required field
    - When: `formatValidationError()` called
    - Then: Returns message listing missing field

- [ ] **Test: Format invalid type error**
    - Given: ZodError for type mismatch
    - When: `formatValidationError()` called
    - Then: Returns message listing invalid field with expected type

- [ ] **Test: Format multiple errors grouped**
    - Given: ZodError with missing and invalid fields
    - When: `formatValidationError()` called
    - Then: Returns message with grouped sections

- [ ] **Test: Error message includes path for nested fields**
    - Given: ZodError for nested field (database.port)
    - When: `formatValidationError()` called
    - Then: Message includes full path "database.port"

### Main Entry Point (`src/index.ts`)

- [ ] **Test: loadConfig() returns valid config**
    - Given: Valid environment setup
    - When: `loadConfig()` called
    - Then: Returns typed config object

- [ ] **Test: loadConfig() with custom options**
    - Given: Custom envPath option
    - When: `loadConfig()` called
    - Then: Loads from custom path

- [ ] **Test: loadConfig() skipEnvFiles option**
    - Given: skipEnvFiles=true
    - When: `loadConfig()` called
    - Then: Only uses process.env

- [ ] **Test: Singleton config is cached**
    - Given: Import config twice
    - When: Compare references
    - Then: Same object reference (cached)

- [ ] **Test: Singleton config throws on invalid env**
    - Given: Missing required env vars
    - When: Module imported
    - Then: Throws ConfigValidationError

## Integration Tests

**How do we test component interactions?**

- [ ] **Integration: Full config loading pipeline**
    - Given: Complete .env file setup with all variables
    - When: `loadConfig()` called
    - Then: Successfully loads, validates, and returns full config
    - Validates: End-to-end flow from files to typed object

- [ ] **Integration: Precedence rules in action**
    - Given: Same variable in `.env`, `.env.local`, and `process.env`
    - When: `loadConfig()` called
    - Then: `process.env` value used
    - Validates: Correct precedence ordering

- [ ] **Integration: Environment-specific configs**
    - Given: `.env.development` and `.env.production` files
    - When: `loadConfig()` called with different NODE_ENV values
    - Then: Correct environment file loaded
    - Validates: Environment switching works

- [ ] **Integration: Error recovery scenarios**
    - Given: Invalid config in .env file
    - When: `loadConfig()` called
    - Then: Clear error thrown with actionable message
    - Validates: Error handling through full stack

- [ ] **Integration: Default values applied**
    - Given: Only required variables provided
    - When: `loadConfig()` called
    - Then: Optional fields populated with defaults
    - Validates: Default value logic works end-to-end

- [ ] **Integration: Type coercion pipeline**
    - Given: All values as strings in .env
    - When: `loadConfig()` called
    - Then: Numbers and booleans correctly typed
    - Validates: Type transformation works

- [ ] **Integration: Multiple package imports**
    - Given: Config imported in multiple modules
    - When: Access config from different locations
    - Then: Same config instance used everywhere
    - Validates: Singleton behavior across modules

- [ ] **Integration: Real-world .env.example**
    - Given: .env.example file provided with project
    - When: Copy to .env and fill required values
    - Then: Config loads successfully
    - Validates: Documentation matches implementation

## End-to-End Tests

**What user flows need validation?**

- [ ] **E2E: New developer onboarding**
    - User story: Developer clones repo, sets up env, runs app
    - Steps:
        1. Clone repository
        2. Copy `.env.example` to `.env`
        3. Fill in required values
        4. Run `pnpm install`
        5. Run `pnpm dev`
    - Expected: App starts successfully with config loaded
    - Validates: Complete developer workflow

- [ ] **E2E: Adding new config variable**
    - User story: Developer needs to add new API endpoint URL
    - Steps:
        1. Add field to API schema
        2. Update `.env.example`
        3. Add to local `.env`
        4. Import and use in code
        5. Run tests
    - Expected: TypeScript types updated, validation works
    - Validates: Extensibility and type safety

- [ ] **E2E: Production deployment**
    - User story: DevOps deploys to production environment
    - Steps:
        1. Set environment variables in deployment platform
        2. Build application
        3. Start application
        4. Verify config loaded from env vars (not files)
    - Expected: App uses production config, no .env files needed
    - Validates: Production deployment scenario

- [ ] **E2E: Configuration validation failure**
    - User story: Developer forgets required env var
    - Steps:
        1. Remove required variable from .env
        2. Try to start application
        3. Read error message
        4. Add missing variable
        5. Restart application
    - Expected: Clear error → fix → success
    - Validates: Error messages guide user to resolution

## Test Data

**What data do we use for testing?**

### Test Fixtures

```typescript
// tests/fixtures/test-configs.ts

export const validBaseEnv = {
    NODE_ENV: "test",
    APP_ENV: "development",
    PORT: "3000",
    HOST: "localhost"
};

export const validDatabaseEnv = {
    DATABASE_HOST: "localhost",
    DATABASE_PORT: "5432",
    DATABASE_NAME: "testdb",
    DATABASE_USERNAME: "testuser",
    DATABASE_PASSWORD: "testpass",
    DATABASE_SSL: "false"
};

export const validApiEnv = {
    API_BASE_URL: "https://api.example.com",
    API_TIMEOUT: "5000",
    API_KEY: "test-api-key",
    API_RATE_LIMIT: "100"
};

export const validFeatureEnv = {
    FEATURE_AUTH: "true",
    FEATURE_ANALYTICS: "false",
    MAINTENANCE_MODE: "false"
};

export const validLoggingEnv = {
    LOG_LEVEL: "info",
    LOG_PRETTY: "true"
};

export const completeValidEnv = {
    ...validBaseEnv,
    ...validDatabaseEnv,
    ...validApiEnv,
    ...validFeatureEnv,
    ...validLoggingEnv
};
```

### Test .env Files

```bash
# tests/fixtures/.env.test
NODE_ENV=test
PORT=4000
DATABASE_HOST=test-db
DATABASE_PASSWORD=test-secret
```

```bash
# tests/fixtures/.env.test.local
PORT=4001
DATABASE_HOST=localhost
```

### Seed Data Requirements

- Create fixture .env files for each test scenario
- Mock process.env in tests using vitest's env mocking
- Restore process.env after each test
- Use temporary directories for file-based tests

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Coverage Commands

```bash
# Run tests with coverage
pnpm test -- --coverage

# Run tests in watch mode (development)
pnpm test -- --watch

# Run tests with UI
pnpm test -- --ui

# Check coverage thresholds
pnpm test -- --coverage --reporter=json --reporter=text
```

### Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
    test: {
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            lines: 100,
            branches: 100,
            functions: 100,
            statements: 100,
            exclude: ["tests/**", "*.config.ts", "examples/**"]
        }
    }
});
```

### Coverage Gaps

**Target: 100% coverage for all new code**

Expected exclusions:

- Test files themselves (`tests/**`)
- Configuration files (`*.config.ts`)
- Example files (`examples/**`)
- Type-only files (no runtime code to test)

If coverage < 100%:

- [ ] Document reason (e.g., defensive code, type guards)
- [ ] Create issue to address gap if possible
- [ ] Get approval from reviewer

### Test Reports

- **Console output**: Summary after each test run
- **HTML report**: Generated in `coverage/` directory
- **CI integration**: Coverage report posted to PR as comment
- **Trend tracking**: Compare coverage with main branch

## Manual Testing

**What requires human validation?**

### Developer Experience Checklist

- [ ] **Error messages are helpful**
    - Manually trigger common errors
    - Verify messages clearly indicate problem and solution
    - Check that file paths and variable names are correct

- [ ] **TypeScript IntelliSense works**
    - Import config in consuming package
    - Verify autocomplete shows all config fields
    - Verify types are correct (no `any`)
    - Test that invalid access shows TypeScript error

- [ ] **.env.example is complete**
    - Compare with actual schema definitions
    - Verify all required variables documented
    - Check descriptions are clear
    - Verify examples are valid

- [ ] **README documentation is clear**
    - Follow installation steps as new developer
    - Run all example code snippets
    - Verify troubleshooting section covers common issues

### Integration Checklist

- [ ] **host-root package integration**
    - Replace process.env calls with config imports
    - Verify app still functions correctly
    - Check that types work across package boundary

- [ ] **render-root package integration**
    - Replace process.env calls with config imports
    - Verify app still functions correctly
    - Check build process includes config

- [ ] **CI/CD pipeline**
    - Verify tests pass in CI
    - Check that coverage reports generated
    - Ensure no .env files committed

### Edge Case Manual Tests

- [ ] Test with extremely long env var values (>1000 chars)
- [ ] Test with special characters in values (quotes, newlines)
- [ ] Test with many env files (10+) to check performance
- [ ] Test with empty .env file
- [ ] Test with .env file containing comments

## Performance Testing

**How do we validate performance?**

### Load Testing Scenarios

```typescript
// tests/performance/load.test.ts

describe("Performance", () => {
    it("loads config in < 100ms", () => {
        const start = performance.now();
        const config = loadConfig();
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(100);
    });

    it("handles large config (100+ variables)", () => {
        const largeEnv = generateLargeEnv(100);

        const start = performance.now();
        const config = loadConfig({ skipEnvFiles: true });
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(200);
    });

    it("singleton access is O(1)", () => {
        const iterations = 1000;

        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            const port = config.port;
        }
        const duration = performance.now() - start;

        // Should be < 1ms for 1000 accesses
        expect(duration).toBeLessThan(1);
    });
});
```

### Performance Benchmarks

- **Config loading**: < 100ms (target: < 50ms)
- **Validation**: < 50ms for typical config
- **File I/O**: < 20ms for .env file reading
- **Memory**: < 1MB for loaded config object

### Profiling

```bash
# Run with Node profiler
node --prof node_modules/.bin/vitest run

# Analyze profile
node --prof-process isolate-*.log > profile.txt
```

## Bug Tracking

**How do we manage issues?**

### Issue Tracking Process

1. **Discover bug** → Create issue in GitHub/GitLab
2. **Triage** → Assign severity and priority
3. **Reproduce** → Write failing test case
4. **Fix** → Implement fix and verify test passes
5. **Regression** → Add to regression test suite
6. **Close** → Verify fix in deployed environment

### Bug Severity Levels

- **Critical**: App cannot start, config validation broken
    - Example: Required validation not working
    - Fix: Immediately
- **High**: Important feature broken, but workaround exists
    - Example: Type coercion fails for common case
    - Fix: Within 1 day
- **Medium**: Non-critical feature broken
    - Example: Error message formatting unclear
    - Fix: Within 1 week
- **Low**: Nice-to-have improvement
    - Example: Performance could be 10% faster
    - Fix: Backlog

### Regression Testing Strategy

- **Every bug fix gets a test**: Prevent reoccurrence
- **Test matrix**: Run tests against Node 18, 20, 22
- **Integration tests**: Cover all package combinations
- **Smoke tests**: Quick verification after deployment

### Common Issues & Tests

| Issue                   | Test Added                  | Status     |
| ----------------------- | --------------------------- | ---------- |
| Missing var not caught  | Test missing required field | ✅ Covered |
| Boolean "false" → true  | Test boolean coercion       | ✅ Covered |
| Nested field path wrong | Test error message paths    | ✅ Covered |
| .env.local ignored      | Test precedence rules       | ✅ Covered |

---

## Test Execution Plan

### Phase 1: Unit Tests (Est: 2 hours)

Write and run all unit tests for individual modules. Target 100% coverage.

### Phase 2: Integration Tests (Est: 1 hour)

Write and run integration tests for full pipeline. Verify all components work together.

### Phase 3: Manual Testing (Est: 1 hour)

Perform manual verification of developer experience and edge cases.

### Phase 4: Performance Testing (Est: 30 min)

Run benchmarks and verify performance targets met.

### Phase 5: Test Review (Est: 30 min)

Review test coverage report, address any gaps, document exclusions.

**Total Testing Time: 5 hours**
