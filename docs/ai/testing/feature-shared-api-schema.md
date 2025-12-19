---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy - Shared API Schema

## Test Coverage Goals

**What level of testing do we aim for?**

- **Unit test coverage target**: 100% of all schema definitions and validation utilities
- **Integration test scope**: Verify schemas work correctly when imported in consumer apps (`host-root`, `render-root`)
- **End-to-end test scenarios**: Not applicable (this is a library package)
- **Alignment with requirements**: All schemas defined in design doc must have corresponding tests

## Unit Tests

**What individual components need testing?**

### Common Schemas (common/)

#### Pagination Schema

- [ ] Valid pagination params (page=1, limit=20)
- [ ] Default values applied (no page/limit provided)
- [ ] Invalid page (0, negative, string)
- [ ] Invalid limit (0, negative, > 100)
- [ ] PaginationMeta with all valid fields
- [ ] PaginatedResponse with array of items and meta

#### Response Schemas

- [ ] Success response with valid data
- [ ] Error response with code and message
- [ ] Error response with optional details
- [ ] createSuccessResponseSchema with custom data schema
- [ ] createPaginatedResponseSchema with custom item schema

#### Error Schemas

- [ ] Error with required fields (code, message)
- [ ] Error with optional details object
- [ ] Invalid error (missing required fields)

### Authentication Schemas (auth/)

#### User Schema

- [ ] Valid user with all fields (id, email, name, role, timestamps)
- [ ] User with optional fields missing
- [ ] Invalid UUID format for id
- [ ] Invalid email format
- [ ] Empty or invalid name

#### Login Schemas

- [ ] Valid login request (email, password)
- [ ] Login with rememberMe=true
- [ ] Login with rememberMe=false (default)
- [ ] Invalid email in login request
- [ ] Password too short (< 8 chars)
- [ ] Valid login response with token and user
- [ ] Invalid login response (missing fields)

#### Registration Schemas

- [ ] Valid registration request (email, password, name)
- [ ] Password confirmation matching
- [ ] Password confirmation not matching
- [ ] Email already exists (handled by API, schema validates format)
- [ ] Valid registration response
- [ ] Invalid registration response

#### Password Management Schemas

- [ ] Valid password reset request (email)
- [ ] Valid password reset confirm (token, newPassword)
- [ ] Valid change password (oldPassword, newPassword)
- [ ] New password same as old password (validation)
- [ ] Invalid token format

### Page Management Schemas (page/)

#### Page Schema

- [ ] Valid page with all fields (id, title, slug, status, author, timestamps)
- [ ] Page with optional fields missing
- [ ] Invalid slug format (spaces, special chars)
- [ ] Valid status values (draft, published, archived)
- [ ] Invalid status value

#### Page CRUD Schemas

- [ ] Valid create page request
- [ ] Valid update page request (partial fields)
- [ ] Valid delete page request
- [ ] Get page response with full page data
- [ ] Invalid page ID format

#### Page Content Schema

- [ ] Valid page content with blocks array
- [ ] Empty blocks array
- [ ] Page content with nested block structure
- [ ] Invalid block structure

### Content Block Schemas (content/)

#### Block Base Schema

- [ ] Valid block with id, type, order
- [ ] Invalid block type
- [ ] Negative order value
- [ ] Missing required fields

#### Specific Block Types

- [ ] Valid text block with content
- [ ] Valid image block with url and alt text
- [ ] Valid video block with url
- [ ] Image block with invalid URL
- [ ] Empty content in text block

#### Block Operations

- [ ] Valid add block request
- [ ] Valid update block request
- [ ] Valid remove block request
- [ ] Valid reorder blocks request (array of IDs)

### Media Management Schemas (media/)

#### Media Schema

- [ ] Valid media with all metadata (id, name, url, size, type, timestamps)
- [ ] Valid media types (image/_, video/_, application/pdf)
- [ ] Invalid media type
- [ ] Invalid URL format
- [ ] Negative file size

#### Upload Schemas

- [ ] Valid upload request
- [ ] Valid upload progress (0-100)
- [ ] Upload progress > 100 (invalid)
- [ ] Valid upload complete response
- [ ] Invalid file type for upload

### Validation Utilities (utils/)

#### safeValidate Function

- [ ] Returns success=true with valid data
- [ ] Returns success=false with invalid data
- [ ] Errors array contains path and message
- [ ] Multiple validation errors captured

#### validateOrThrow Function

- [ ] Returns parsed data on success
- [ ] Throws ZodError on failure
- [ ] Error contains validation details

#### validateOrError Function

- [ ] Returns parsed data on success
- [ ] Throws custom ValidationError on failure
- [ ] ValidationError contains formatted errors array

## Integration Tests

**How do we test component interactions?**

### Package Import Tests

- [ ] Can import schemas from @repo/api-types in host-root
- [ ] Can import types from @repo/api-types in host-root
- [ ] Can import schemas from @repo/api-types in render-root
- [ ] Can import utils from @repo/api-types

### Type Inference Tests

- [ ] TypeScript correctly infers types from schemas
- [ ] Inferred types match expected structure
- [ ] Type errors when using incorrect types

### Real-world Validation Tests

- [ ] Validate mock API request in host-root
- [ ] Validate mock API response in host-root
- [ ] Validate request body in render-root endpoint
- [ ] Handle validation errors gracefully

## End-to-End Tests

**What user flows need validation?**

Not applicable for this library package. Consumer apps will have their own E2E tests.

## Test Data

**What data do we use for testing?**

### Valid Test Fixtures

```typescript
// Valid user
const validUser = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
};

// Valid login request
const validLoginRequest = {
    email: "user@example.com",
    password: "password123",
    rememberMe: true
};

// Valid page
const validPage = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "My Page",
    slug: "my-page",
    status: "published",
    authorId: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
};
```

### Invalid Test Fixtures

```typescript
// Invalid email
const invalidEmail = "not-an-email";

// Invalid UUID
const invalidUuid = "not-a-uuid";

// Password too short
const shortPassword = "1234";

// Invalid slug with spaces
const invalidSlug = "my page with spaces";
```

### Mock Data Strategy

- Create reusable fixtures in `__tests__/fixtures/`
- Use factory functions to generate test data
- Separate valid and invalid fixtures

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Coverage Commands

```bash
# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test --watch

# Type check
pnpm type-check
```

### Coverage Thresholds

- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

### Test Configuration (vitest.config.ts)

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.test.ts", "src/**/__tests__/**"],
            thresholds: {
                statements: 100,
                branches: 100,
                functions: 100,
                lines: 100
            }
        }
    }
});
```

### Coverage Gaps

- Initial implementation: TBD
- After implementation: Document any files/functions below 100% and justify

### Test Reports

- HTML coverage report: `coverage/index.html`
- JSON report for CI/CD integration
- Console output for quick feedback

## Manual Testing

**What requires human validation?**

### Developer Experience Testing

- [ ] Import statements work with IDE autocomplete
- [ ] Type inference shows correct types on hover
- [ ] Error messages are clear and helpful
- [ ] Documentation is accurate and up-to-date

### Build & Bundle Testing

- [ ] Package builds without errors
- [ ] Bundle size is acceptable (< 50KB)
- [ ] Tree-shaking works (unused exports not bundled)
- [ ] Source maps generated correctly

### Integration Smoke Tests

- [ ] host-root can import and use schemas
- [ ] render-root can import and use schemas
- [ ] No runtime errors when validating data
- [ ] TypeScript compilation succeeds in all packages

## Performance Testing

**How do we validate performance?**

### Validation Performance Benchmarks

- [ ] Single validation < 1ms for typical request
- [ ] Batch validation of 100 items < 50ms
- [ ] Large nested object validation < 5ms
- [ ] Schema definition overhead minimal

### Performance Test Implementation

```typescript
// __tests__/performance.test.ts
import { describe, it, expect } from "vitest";
import { LoginRequestSchema } from "../auth/login";

describe("Validation Performance", () => {
    it("validates login request in < 1ms", () => {
        const data = {
            email: "test@example.com",
            password: "password123"
        };

        const iterations = 1000;
        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            LoginRequestSchema.parse(data);
        }

        const end = performance.now();
        const avgTime = (end - start) / iterations;

        expect(avgTime).toBeLessThan(1);
    });
});
```

### Bundle Size Monitoring

- Use `size-limit` or similar tool
- Track bundle size in CI/CD
- Alert on significant increases

## Bug Tracking

**How do we manage issues?**

### Issue Tracking Process

- Create GitHub issues for bugs found during testing
- Label issues with `bug`, `api-types`, `testing`
- Link issues to relevant test cases

### Bug Severity Levels

- **Critical**: Schema validation fails for valid data (blocks usage)
- **High**: Type inference incorrect (type safety compromised)
- **Medium**: Poor error messages (usability issue)
- **Low**: Documentation unclear (cosmetic)

### Regression Testing Strategy

- Add test case for every bug found
- Run full test suite before merging
- Include regression tests in CI/CD pipeline
