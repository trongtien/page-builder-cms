---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
feature: redis-connection-layer
---

# Testing Strategy: Redis Connection Layer

## Test Coverage Goals

**Target Coverage:** 100% of all new Redis connection layer code

- **Unit test coverage**: 100% of functions, branches, and lines
- **Integration tests**: All critical paths including connection, operations, and error handling
- **Manual testing**: Redis operations verification with Docker
- **Alignment**: All tests must validate requirements and design acceptance criteria

## Unit Tests

### Component 1: RedisConfigBuilder (config.test.ts)

- [ ] **Test 1.1**: Default configuration values
    - Verify default host is `localhost`
    - Verify default port is `6379`
    - Verify default db is `0`
    - Verify default TLS is `false`

- [ ] **Test 1.2**: Environment variable reading
    - Set `REDIS_HOST`, verify config uses it
    - Set `REDIS_PORT`, verify config uses it
    - Set `REDIS_PASSWORD`, verify config uses it
    - Set `REDIS_DB`, verify config uses it
    - Set `REDIS_TLS=true`, verify config enables TLS

- [ ] **Test 1.3**: Programmatic configuration override
    - Call `setHost()`, verify it overrides env var
    - Call `setPort()`, verify it overrides env var
    - Chain multiple setter calls (fluent API)

- [ ] **Test 1.4**: Configuration validation
    - Valid config returns true
    - Invalid port (negative, > 65535) throws or returns false
    - Invalid host (empty string) throws or returns false

- [ ] **Test 1.5**: Connection string generation
    - Verify format: `redis://host:port/db`
    - Verify password is NOT included in connection string

### Component 2: RedisClient (client.test.ts)

- [ ] **Test 2.1**: Singleton pattern
    - First call to `getInstance()` creates instance
    - Second call to `getInstance()` returns same instance
    - Multiple calls always return same reference

- [ ] **Test 2.2**: Connection lifecycle
    - `connect()` establishes connection (mock ioredis)
    - `isConnected()` returns true after connect
    - `isConnected()` returns false before connect
    - `disconnect()` closes connection gracefully

- [ ] **Test 2.3**: Connection error handling
    - Connection failure logs error
    - Connection failure throws with descriptive message
    - `isConnected()` returns false after connection failure

- [ ] **Test 2.4**: Graceful shutdown
    - Process SIGINT triggers disconnect
    - Process SIGTERM triggers disconnect
    - Shutdown waits for pending operations

- [ ] **Test 2.5**: Client access
    - `getClient()` returns ioredis instance after connect
    - `getClient()` throws if not connected

- [ ] **Test 2.6**: Convenience methods
    - `get(key)` retrieves value
    - `set(key, value)` stores value
    - `del(key)` deletes key
    - `exists(key)` checks existence

### Component 3: Health Check (health.test.ts)

- [ ] **Test 3.1**: Successful health check
    - `checkHealth()` returns connected: true when Redis is up
    - Latency is measured and > 0
    - lastCheck timestamp is recent

- [ ] **Test 3.2**: Failed health check
    - `checkHealth()` returns connected: false when Redis is down
    - Error message is populated
    - Latency is -1 or 0 on failure

- [ ] **Test 3.3**: Latency measurement accuracy
    - Mock PING with delay
    - Verify latency reflects delay (within tolerance)

### Component 4: Pipeline (pipeline.test.ts)

- [ ] **Test 4.1**: Pipeline creation
    - `pipeline()` returns Pipeline instance
    - Pipeline is from ioredis client

- [ ] **Test 4.2**: Pipeline execution
    - Add multiple commands to pipeline
    - Execute pipeline
    - Verify all commands executed atomically

- [ ] **Test 4.3**: Pipeline error handling
    - Add invalid command to pipeline
    - Execute pipeline
    - Verify error is caught and logged

- [ ] **Test 4.4**: Pipeline transaction semantics
    - Set multiple keys in pipeline
    - Verify all or none are set (atomic)

## Integration Tests

### Integration Test Suite (integration.test.ts)

**Setup**: Real Redis instance (Docker or local)

- [ ] **Integration 1**: Full connection lifecycle
    - Start with no connection
    - Call connect()
    - Perform operations
    - Call disconnect()
    - Verify clean shutdown

- [ ] **Integration 2**: Actual Redis operations
    - SET a key with value
    - GET the key, verify value
    - DELETE the key
    - Verify key no longer exists

- [ ] **Integration 3**: Pipeline operations
    - Create pipeline
    - Add 10 SET commands
    - Execute pipeline
    - Verify all keys exist

- [ ] **Integration 4**: Health check with real Redis
    - Connect to Redis
    - Run health check
    - Verify latency < 100ms (local)
    - Verify status is healthy

- [ ] **Integration 5**: Reconnection scenario
    - Connect to Redis
    - Simulate Redis restart (kill container)
    - Verify automatic reconnection
    - Verify operations resume

- [ ] **Integration 6**: Error scenarios
    - Try to connect to non-existent Redis
    - Verify appropriate error
    - Try operation on disconnected client
    - Verify appropriate error

## Test Data

### Test Fixtures

```typescript
const testConfig: RedisConfigOptions = {
    config: {
        host: "localhost",
        port: 6379,
        db: 15 // Use dedicated test DB
    },
    debug: false
};

const mockRedisInstance = {
    ping: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    pipeline: vi.fn(),
    quit: vi.fn()
};
```

### Test Redis Setup

- Use Redis DB 15 for tests (avoid conflicts)
- Flush test DB before each test
- Use Docker: `docker run -d -p 6379:6379 redis:7-alpine`

### Environment Variables for Tests

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=15
```

## Test Reporting & Coverage

### Coverage Commands

```bash
# Run all tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test client.test.ts
```

### Coverage Thresholds

- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

### Coverage Gaps (if any)

_To be filled after initial test run_

| File            | Uncovered Lines | Rationale |
| --------------- | --------------- | --------- |
| (none expected) | -               | -         |

### Test Reports

- Coverage report generated in `coverage/` directory
- HTML report: `coverage/index.html`
- CI/CD will fail if coverage < 100%

## Manual Testing

### Manual Test Checklist

#### Redis Connection

- [ ] Start Redis with `docker run -d -p 6379:6379 redis:7-alpine`
- [ ] Run persistence package with Redis config
- [ ] Verify connection log message appears
- [ ] Check Redis logs for incoming connection

#### Basic Operations

- [ ] Use Redis CLI to verify SET operations: `redis-cli KEYS *`
- [ ] Set a key via code, verify with `redis-cli GET <key>`
- [ ] Delete a key via code, verify with `redis-cli EXISTS <key>`

#### Health Check

- [ ] Call health check endpoint
- [ ] Verify returns healthy status
- [ ] Stop Redis, call health check
- [ ] Verify returns unhealthy status

#### Pipeline Operations

- [ ] Execute pipeline with multiple commands
- [ ] Verify all commands executed with `redis-cli`
- [ ] Check atomicity (all or none)

#### Error Scenarios

- [ ] Stop Redis server
- [ ] Attempt operations
- [ ] Verify appropriate error messages
- [ ] Restart Redis
- [ ] Verify automatic reconnection

### Browser/Device Compatibility

Not applicable - server-side only

### Accessibility

Not applicable - backend service

## Performance Testing

### Performance Benchmarks

- [ ] **Latency Test**: Measure average operation latency
    - Target: < 5ms for local Redis
    - Target: < 50ms for remote Redis

- [ ] **Throughput Test**: Measure operations per second
    - Target: > 10,000 ops/sec for simple GET/SET

- [ ] **Pipeline Performance**: Compare pipeline vs individual commands
    - Pipeline should be 5-10x faster for bulk operations

### Load Testing Approach

```typescript
// Simple load test
const operations = 10000;
const start = Date.now();
for (let i = 0; i < operations; i++) {
    await redis.set(`key:${i}`, `value:${i}`);
}
const duration = Date.now() - start;
console.log(`${operations} operations in ${duration}ms`);
console.log(`${((operations / duration) * 1000).toFixed(2)} ops/sec`);
```

## Bug Tracking

### Issue Tracking Process

1. Log issue in GitHub Issues with label `bug:redis`
2. Include reproduction steps
3. Link to failed test case
4. Assign priority (P0-P3)

### Bug Severity Levels

- **P0 - Critical**: Connection failures, data loss
- **P1 - High**: Performance issues, frequent errors
- **P2 - Medium**: Edge cases, minor errors
- **P3 - Low**: Code quality, minor improvements

### Regression Testing Strategy

- All bug fixes must include regression test
- Add test case that reproduces the bug
- Verify fix resolves issue
- Ensure test prevents future regression

## Test Execution Plan

### Before Implementation

- [ ] Review all test cases with requirements doc
- [ ] Ensure test coverage aligns with success criteria
- [ ] Set up test Redis instance

### During Implementation

- [ ] Write tests before/alongside code (TDD)
- [ ] Run tests frequently during development
- [ ] Verify each component has 100% coverage before moving to next

### After Implementation

- [ ] Run full test suite: `pnpm test`
- [ ] Generate coverage report: `pnpm test --coverage`
- [ ] Review coverage report for gaps
- [ ] Run integration tests with real Redis
- [ ] Perform manual testing checklist
- [ ] Document any deviations from 100% coverage

### Before Commit

- [ ] All tests passing
- [ ] Coverage at 100% (or documented exceptions)
- [ ] No linting errors
- [ ] Manual testing complete
- [ ] Update this document with final test results

## Final Test Sign-Off

_To be completed before commit_

- [ ] All unit tests passing (X/X tests)
- [ ] All integration tests passing (X/X tests)
- [ ] Coverage report reviewed: 100% achieved
- [ ] Manual testing completed successfully
- [ ] No critical or high-priority bugs
- [ ] Ready for commit and push
