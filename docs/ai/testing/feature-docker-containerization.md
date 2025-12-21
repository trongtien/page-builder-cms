---
phase: testing
title: Testing Strategy & Test Cases
description: Define test approach, scenarios, and validation criteria
feature: docker-containerization
---

# Testing Strategy: Docker Containerization

## Testing Overview

**Testing Goals:**

- Verify all Docker containers build and run successfully
- Validate development hot-reload functionality
- Ensure production builds are optimized
- Confirm database persistence and connectivity
- Validate cross-platform compatibility

**Testing Scope:**

- Development environment (docker-compose.yml)
- Production images (Dockerfiles)
- Database initialization and persistence
- Hot-reload and development workflow
- CI/CD image builds

---

## Test Environment Setup

### Prerequisites

- Docker Desktop 24.0+ installed
- Docker Compose v2
- 8GB RAM available
- 20GB free disk space
- Project repository cloned

### Test Data Requirements

- Sample page data for database
- Test environment variables
- Mock API responses (if applicable)

---

## Test Strategy

### 1. Unit Testing (Container Level)

**Objective:** Verify each container builds and runs independently

| Test ID | Test Case                                | Expected Result                                  | Status     |
| ------- | ---------------------------------------- | ------------------------------------------------ | ---------- |
| CT-01   | Build development frontend Dockerfile    | Image builds successfully, no errors             | ⬜ Not Run |
| CT-02   | Build database Dockerfile                | Image builds successfully, includes init scripts | ⬜ Not Run |
| CT-03   | Build production host-root Dockerfile    | Multi-stage build succeeds, image < 50MB         | ⬜ Not Run |
| CT-04   | Build production render-root Dockerfile  | Multi-stage build succeeds, image < 50MB         | ⬜ Not Run |
| CT-05   | Run database container standalone        | Container starts, health check passes            | ⬜ Not Run |
| CT-06   | Run host-root dev container standalone   | Container starts, Vite dev server running        | ⬜ Not Run |
| CT-07   | Run render-root dev container standalone | Container starts, Vite dev server running        | ⬜ Not Run |

---

### 2. Integration Testing (Multi-Container)

**Objective:** Verify containers work together via docker-compose

| Test ID | Test Case                                     | Expected Result                                    | Status     |
| ------- | --------------------------------------------- | -------------------------------------------------- | ---------- |
| IT-01   | Start all dev services with docker-compose    | All services start without errors                  | ⬜ Not Run |
| IT-02   | Verify service health checks                  | All health checks pass within 30 seconds           | ⬜ Not Run |
| IT-03   | Verify database connectivity from host-root   | Frontend can connect to database                   | ⬜ Not Run |
| IT-04   | Verify database connectivity from render-root | Frontend can connect to database                   | ⬜ Not Run |
| IT-05   | Verify inter-service networking               | Containers can reach each other by service name    | ⬜ Not Run |
| IT-06   | Test service startup order                    | Database starts before frontends                   | ⬜ Not Run |
| IT-07   | Test service restart                          | Services recover after restart                     | ⬜ Not Run |
| IT-08   | Test graceful shutdown                        | All services stop cleanly with docker-compose down | ⬜ Not Run |

---

### 3. Functional Testing (User Workflows)

**Objective:** Validate real-world development and production scenarios

| Test ID | Test Case                          | Expected Result                              | Status     |
| ------- | ---------------------------------- | -------------------------------------------- | ---------- |
| FT-01   | Cold start development environment | Services start within 2 minutes              | ⬜ Not Run |
| FT-02   | Hot-reload: Edit React component   | Changes reflect in < 3 seconds               | ⬜ Not Run |
| FT-03   | Hot-reload: Edit TypeScript file   | Changes reflect with HMR                     | ⬜ Not Run |
| FT-04   | Hot-reload: Edit CSS/Tailwind      | Styles update immediately                    | ⬜ Not Run |
| FT-05   | Create database record             | Data persists after container restart        | ⬜ Not Run |
| FT-06   | Delete and recreate containers     | Named volume data persists                   | ⬜ Not Run |
| FT-07   | Access frontend apps from host     | localhost:3000 and localhost:3001 accessible | ⬜ Not Run |
| FT-08   | Access database from host          | psql connection to localhost:5432 works      | ⬜ Not Run |
| FT-09   | Run production build locally       | Images build and serve correctly             | ⬜ Not Run |
| FT-10   | Test production nginx routing      | SPA routing works (refresh on any route)     | ⬜ Not Run |

---

### 4. Performance Testing

**Objective:** Ensure acceptable performance metrics

| Test ID | Test Case                            | Metric | Target      | Actual | Status     |
| ------- | ------------------------------------ | ------ | ----------- | ------ | ---------- |
| PT-01   | Cold start time (all services)       | Time   | < 2 minutes | -      | ⬜ Not Run |
| PT-02   | Hot reload time (React component)    | Time   | < 3 seconds | -      | ⬜ Not Run |
| PT-03   | Hot reload time (TypeScript)         | Time   | < 5 seconds | -      | ⬜ Not Run |
| PT-04   | Development image build time         | Time   | < 5 minutes | -      | ⬜ Not Run |
| PT-05   | Production image build time          | Time   | < 5 minutes | -      | ⬜ Not Run |
| PT-06   | Production image size (host-root)    | Size   | < 50MB      | -      | ⬜ Not Run |
| PT-07   | Production image size (render-root)  | Size   | < 50MB      | -      | ⬜ Not Run |
| PT-08   | Memory usage (all dev containers)    | Memory | < 4GB       | -      | ⬜ Not Run |
| PT-09   | Memory usage (single prod container) | Memory | < 512MB     | -      | ⬜ Not Run |
| PT-10   | Database query response time         | Time   | < 100ms     | -      | ⬜ Not Run |

---

### 5. Cross-Platform Testing

**Objective:** Verify Docker setup works on all supported platforms

| Test ID | Platform                    | Test Case                   | Expected Result             | Status     |
| ------- | --------------------------- | --------------------------- | --------------------------- | ---------- |
| XP-01   | Windows 10/11               | Run development environment | All services start and work | ⬜ Not Run |
| XP-02   | Windows WSL2                | Run development environment | All services start and work | ⬜ Not Run |
| XP-03   | macOS Intel                 | Run development environment | All services start and work | ⬜ Not Run |
| XP-04   | macOS Apple Silicon (M1/M2) | Run development environment | All services start and work | ⬜ Not Run |
| XP-05   | Linux (Ubuntu 22.04)        | Run development environment | All services start and work | ⬜ Not Run |
| XP-06   | Windows                     | Hot-reload functionality    | File changes detected       | ⬜ Not Run |
| XP-07   | macOS                       | Hot-reload functionality    | File changes detected       | ⬜ Not Run |
| XP-08   | Linux                       | Hot-reload functionality    | File changes detected       | ⬜ Not Run |

---

### 6. Security Testing

**Objective:** Identify and mitigate security vulnerabilities

| Test ID | Test Case                               | Expected Result                             | Status     |
| ------- | --------------------------------------- | ------------------------------------------- | ---------- |
| ST-01   | Scan production images with Trivy       | No HIGH or CRITICAL vulnerabilities         | ⬜ Not Run |
| ST-02   | Verify no secrets in images             | No .env files or passwords in layers        | ⬜ Not Run |
| ST-03   | Check for latest base image versions    | Using latest stable versions                | ⬜ Not Run |
| ST-04   | Verify nginx security headers           | X-Frame-Options, X-Content-Type-Options set | ⬜ Not Run |
| ST-05   | Test database password protection       | Cannot connect without password             | ⬜ Not Run |
| ST-06   | Verify non-root user (where applicable) | Services don't run as root                  | ⬜ Not Run |

---

### 7. CI/CD Testing

**Objective:** Validate automated build and deployment pipeline

| Test ID | Test Case                            | Expected Result                               | Status     |
| ------- | ------------------------------------ | --------------------------------------------- | ---------- |
| CI-01   | GitHub Actions workflow runs on push | Workflow completes successfully               | ⬜ Not Run |
| CI-02   | Images build successfully in CI      | Both host-root and render-root build          | ⬜ Not Run |
| CI-03   | Images tagged correctly              | Tags include branch name and commit SHA       | ⬜ Not Run |
| CI-04   | Images pushed to GHCR                | Images available in GitHub Container Registry | ⬜ Not Run |
| CI-05   | Image scanning in CI                 | Trivy scan runs and reports                   | ⬜ Not Run |
| CI-06   | PR builds images without pushing     | Build succeeds, no push on PR                 | ⬜ Not Run |

---

## Detailed Test Cases

### Test Case: CT-01 - Build Development Frontend Dockerfile

**Objective:** Verify development frontend Dockerfile builds successfully

**Steps:**

1. Navigate to project root
2. Run build command:
    ```bash
    docker build -f .containers/dev/frontend/Dockerfile.dev -t pagebuilder-frontend-dev .
    ```
3. Check build output for errors
4. Verify image exists:
    ```bash
    docker images | grep pagebuilder-frontend-dev
    ```

**Expected Results:**

- Build completes without errors
- Image is created with tag `pagebuilder-frontend-dev:latest`
- Image size is reasonable (~1-1.5GB)

**Actual Results:**

- [To be filled during testing]

**Status:** ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes:**

- [Any observations or issues]

---

### Test Case: IT-01 - Start All Dev Services

**Objective:** Verify all development services start correctly with docker-compose

**Prerequisites:**

- Docker daemon running
- No port conflicts (3000, 3001, 5432)

**Steps:**

1. Navigate to `.containers/dev/`
2. Start services:
    ```bash
    docker-compose up -d
    ```
3. Wait 30 seconds
4. Check service status:
    ```bash
    docker-compose ps
    ```
5. Check logs:
    ```bash
    docker-compose logs
    ```

**Expected Results:**

- All three services (database, host-root, render-root) start
- All services show status "Up"
- No error messages in logs
- Health checks pass

**Actual Results:**

- [To be filled during testing]

**Status:** ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes:**

- [Any observations or issues]

---

### Test Case: FT-02 - Hot-Reload React Component

**Objective:** Verify hot-reload works for React component changes

**Prerequisites:**

- Development environment running
- Browser open to localhost:3000

**Steps:**

1. Start development environment:
    ```bash
    cd .containers/dev && docker-compose up
    ```
2. Open browser to http://localhost:3000
3. Note current component appearance
4. Edit a React component file (e.g., `apps/host-root/src/App.tsx`)
5. Change visible text (e.g., heading text)
6. Save file
7. Observe browser

**Expected Results:**

- Browser updates within 3 seconds
- Changes are visible without manual refresh
- No console errors
- HMR overlay shows "Updated successfully" (or similar)

**Actual Results:**

- Time to update: [X seconds]
- Status: [Pass/Fail]

**Status:** ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes:**

- [Any observations or issues]

---

### Test Case: FT-05 - Database Persistence

**Objective:** Verify database data persists after container restart

**Prerequisites:**

- Development environment running

**Steps:**

1. Start development environment
2. Connect to database:
    ```bash
    docker exec -it pagebuilder-db psql -U postgres -d pagebuilder
    ```
3. Insert test record:
    ```sql
    INSERT INTO pages (title, slug, content)
    VALUES ('Test Page', 'test-page', '{"content": "test"}');
    ```
4. Verify record exists:
    ```sql
    SELECT * FROM pages WHERE slug = 'test-page';
    ```
5. Stop containers:
    ```bash
    docker-compose down
    ```
6. Start containers again:
    ```bash
    docker-compose up -d
    ```
7. Reconnect to database and query:
    ```sql
    SELECT * FROM pages WHERE slug = 'test-page';
    ```

**Expected Results:**

- Record persists after container restart
- Data is identical
- No data loss

**Actual Results:**

- [To be filled during testing]

**Status:** ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes:**

- [Any observations or issues]

---

### Test Case: PT-01 - Cold Start Time

**Objective:** Measure time to start all services from scratch

**Prerequisites:**

- No containers running
- Images already built (not measuring build time)

**Steps:**

1. Ensure no containers running:
    ```bash
    docker-compose down -v
    ```
2. Start timer
3. Start services:
    ```bash
    docker-compose up -d
    ```
4. Wait for all health checks to pass:
    ```bash
    docker-compose ps
    ```
5. Stop timer when all services are "healthy"

**Expected Results:**

- All services start within 2 minutes
- All health checks pass

**Actual Results:**

- Time: [X minutes Y seconds]

**Status:** ⬜ Not Run | ✅ Pass | ❌ Fail

**Performance Data:**
| Service | Start Time | Health Check Time | Total Time |
|---------|-----------|-------------------|------------|
| Database | [X seconds] | [X seconds] | [X seconds] |
| host-root | [X seconds] | [X seconds] | [X seconds] |
| render-root | [X seconds] | [X seconds] | [X seconds] |

---

### Test Case: XP-01 - Windows Compatibility

**Objective:** Verify Docker setup works on Windows

**Prerequisites:**

- Windows 10/11
- Docker Desktop installed
- WSL2 enabled (if applicable)

**Steps:**

1. Clone repository on Windows
2. Navigate to `.containers/dev/`
3. Run:
    ```bash
    docker-compose up
    ```
4. Test hot-reload (edit file, check browser)
5. Test database connection
6. Check resource usage in Docker Desktop

**Expected Results:**

- All services start successfully
- Hot-reload works
- Database accessible
- No file permission errors
- Reasonable resource usage

**Actual Results:**

- [To be filled during testing]

**Status:** ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes:**

- OS version: [e.g., Windows 11 22H2]
- Docker Desktop version: [e.g., 4.25.0]
- WSL2 version (if applicable): [e.g., 2.0.0.0]
- Issues encountered: [e.g., File watching issues]

---

## Test Execution Log

### Test Run 1: [Date]

**Environment:**

- OS: [e.g., macOS 14.0]
- Docker: [e.g., 24.0.6]
- Docker Compose: [e.g., v2.23.0]
- RAM: [e.g., 16GB]

**Tests Executed:**

- CT-01: ✅ Pass
- CT-02: ✅ Pass
- IT-01: ❌ Fail (reason: port conflict)
- [Continue for all tests]

**Summary:**

- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Skipped: [X]

**Issues Found:**

1. [Issue description]
    - Severity: [High/Medium/Low]
    - Resolution: [How it was fixed]

---

## Test Coverage Summary

### Current Coverage

| Test Category          | Total Tests | Passed | Failed | Not Run | Coverage % |
| ---------------------- | ----------- | ------ | ------ | ------- | ---------- |
| Unit Testing           | 7           | 0      | 0      | 7       | 0%         |
| Integration Testing    | 8           | 0      | 0      | 8       | 0%         |
| Functional Testing     | 10          | 0      | 0      | 10      | 0%         |
| Performance Testing    | 10          | 0      | 0      | 10      | 0%         |
| Cross-Platform Testing | 8           | 0      | 0      | 8       | 0%         |
| Security Testing       | 6           | 0      | 0      | 6       | 0%         |
| CI/CD Testing          | 6           | 0      | 0      | 6       | 0%         |
| **TOTAL**              | **55**      | **0**  | **0**  | **55**  | **0%**     |

**Target Coverage:** 100% of all test cases

---

## Known Issues & Limitations

### Issue 1: Hot-Reload on Windows

**Status:** Known limitation  
**Severity:** Medium  
**Description:** File watching may not work reliably on Windows without WSL2  
**Workaround:** Enable Vite polling in vite.config.ts:

```typescript
server: {
  watch: {
    usePolling: true,
  },
}
```

---

### Issue 2: Large Image Sizes in Development

**Status:** Expected behavior  
**Severity:** Low  
**Description:** Development images are large (~1.5GB) due to all dependencies  
**Mitigation:** Production images are much smaller (~20-50MB)

---

## Regression Testing

**When to Run:**

- Before merging to main branch
- After any Docker configuration changes
- Before release

**Critical Test Cases for Regression:**

- IT-01: Start all dev services
- FT-02: Hot-reload functionality
- FT-05: Database persistence
- PT-01: Cold start time
- ST-01: Image security scan

---

## Test Automation

### Automated Tests

**Implemented:**

- CI/CD builds images automatically
- Security scans run in CI

**Future Automation:**

- Integration tests in CI (docker-compose up, health checks)
- Performance benchmarks in CI
- Cross-platform testing matrix

### Manual Tests

**Must be Manual:**

- Hot-reload user experience
- Browser testing
- Cross-platform validation (requires different OS)

---

## Success Criteria

✅ **Feature Ready for Production When:**

- [ ] All unit tests pass (7/7)
- [ ] All integration tests pass (8/8)
- [ ] All functional tests pass (10/10)
- [ ] Performance targets met (10/10)
- [ ] At least 2 platforms tested (2/5)
- [ ] No HIGH/CRITICAL security vulnerabilities
- [ ] CI/CD pipeline working (6/6)
- [ ] Documentation complete and accurate

**Current Status:** 🔴 Not Ready (0/55 tests passed)

---

## Performance Benchmarks

### Target Benchmarks

| Metric                | Target      | Critical Threshold |
| --------------------- | ----------- | ------------------ |
| Cold start time       | < 2 minutes | < 3 minutes        |
| Hot reload time       | < 3 seconds | < 5 seconds        |
| Image build time      | < 5 minutes | < 10 minutes       |
| Production image size | < 50MB      | < 100MB            |
| Memory usage (dev)    | < 4GB       | < 6GB              |
| Memory usage (prod)   | < 512MB     | < 1GB              |

### Actual Benchmarks

| Metric                | Actual | Status          |
| --------------------- | ------ | --------------- |
| Cold start time       | [TBD]  | ⬜ Not Measured |
| Hot reload time       | [TBD]  | ⬜ Not Measured |
| Image build time      | [TBD]  | ⬜ Not Measured |
| Production image size | [TBD]  | ⬜ Not Measured |
| Memory usage (dev)    | [TBD]  | ⬜ Not Measured |
| Memory usage (prod)   | [TBD]  | ⬜ Not Measured |

---

## Test Data Cleanup

**After Each Test Run:**

```bash
# Stop all services
docker-compose down

# Remove volumes (for clean state)
docker-compose down -v

# Remove images (if needed)
docker rmi pagebuilder-frontend-dev pagebuilder-db

# Prune system (caution: removes all unused Docker resources)
docker system prune -a --volumes
```

---

## References

- [Docker Testing Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Container Testing Strategies](https://testcontainers.org/)
- [Trivy Image Scanning](https://github.com/aquasecurity/trivy)
- Project Requirements: [feature-docker-containerization.md](../requirements/feature-docker-containerization.md)
- Project Design: [feature-docker-containerization.md](../design/feature-docker-containerization.md)
