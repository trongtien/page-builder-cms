---
phase: planning
title: Project Plan & Task Breakdown
description: Break down the project into manageable tasks with estimates
feature: docker-containerization
---

# Project Plan: Docker Containerization

## Task Breakdown

### Phase 1: Foundation & Setup

**Duration:** 2-3 hours

#### Task 1.1: Create Docker Directory Structure

- **Priority:** High
- **Estimated Time:** 15 minutes
- **Dependencies:** None
- **Description:** Create `.containers/` directory with dev/prod subdirectories

**Acceptance Criteria:**

- [ ] `.containers/dev/` directory created
- [ ] `.containers/prod/` directory created
- [ ] `.containers/dev/frontend/` subdirectory created
- [ ] `.containers/dev/database/` subdirectory created
- [ ] `.containers/dev/database/init/` subdirectory created
- [ ] `.containers/prod/host-root/` subdirectory created
- [ ] `.containers/prod/render-root/` subdirectory created
- [ ] `.containers/prod/nginx/` subdirectory created
- [ ] `.dockerignore` file created in project root

**Implementation Steps:**

1. Create directory structure using mkdir commands
2. Create `.dockerignore` file with standard patterns (node_modules, .git, etc.)

---

#### Task 1.2: Create Development Frontend Dockerfile

- **Priority:** High
- **Estimated Time:** 30 minutes
- **Dependencies:** Task 1.1
- **Description:** Create shared Dockerfile for development mode

**Acceptance Criteria:**

- [ ] `.containers/dev/frontend/Dockerfile.dev` created
- [ ] Uses `node:18-alpine` as base image
- [ ] Installs pnpm globally
- [ ] Copies package files for dependency installation
- [ ] Runs `pnpm install --frozen-lockfile`
- [ ] Exposes port 3000
- [ ] Includes comments explaining each step

**Implementation Steps:**

1. Create Dockerfile.dev in `.containers/dev/frontend/`
2. Add FROM, RUN, WORKDIR, COPY, EXPOSE, CMD instructions
3. Test build: `docker build -f .containers/dev/frontend/Dockerfile.dev .`

---

#### Task 1.3: Create Database Dockerfile & Init Scripts

- **Priority:** High
- **Estimated Time:** 45 minutes
- **Dependencies:** Task 1.1
- **Description:** Set up PostgreSQL 18 container with initialization

**Acceptance Criteria:**

- [ ] `.containers/dev/database/Dockerfile` created
- [ ] Uses `postgres:18-alpine` as base image
- [ ] Copies init scripts to `/docker-entrypoint-initdb.d/`
- [ ] Sets default environment variables
- [ ] Includes health check
- [ ] `01-init-schema.sql` created with basic schema

**Implementation Steps:**

1. Create Dockerfile in `.containers/dev/database/`
2. Create `01-init-schema.sql` with UUID extension and pages table
3. Add health check using `pg_isready`
4. Test: `docker build -f .containers/dev/database/Dockerfile .`

---

#### Task 1.4: Create Development Docker Compose

- **Priority:** High
- **Estimated Time:** 1 hour
- **Dependencies:** Tasks 1.2, 1.3
- **Description:** Orchestrate all development services

**Acceptance Criteria:**

- [ ] `.containers/dev/docker-compose.yml` created
- [ ] Database service configured with volume persistence
- [ ] host-root service configured with hot-reload
- [ ] render-root service configured with hot-reload
- [ ] Custom network `pagebuilder-network` defined
- [ ] Service dependencies configured (frontends depend on database)
- [ ] Environment variables properly set
- [ ] Health checks implemented

**Implementation Steps:**

1. Create docker-compose.yml in `.containers/dev/`
2. Define services: database, host-root, render-root
3. Configure volumes for source code and database data
4. Set up networking and port mappings
5. Add health checks and dependencies
6. Test: `cd .containers/dev && docker-compose up`

---

### Phase 2: Development Environment Validation

**Duration:** 1-2 hours

#### Task 2.1: Test Development Environment

- **Priority:** High
- **Estimated Time:** 30 minutes
- **Dependencies:** Task 1.4
- **Description:** Verify all services start and communicate

**Acceptance Criteria:**

- [ ] All services start without errors
- [ ] Database is accessible from host (localhost:5432)
- [ ] host-root is accessible from browser (localhost:3000)
- [ ] render-root is accessible from browser (localhost:3001)
- [ ] Hot-reload works (change file, see update without rebuild)
- [ ] Frontend can connect to database
- [ ] Logs are visible via `docker-compose logs`

**Implementation Steps:**

1. Run `docker-compose up` in `.containers/dev/`
2. Check service health: `docker-compose ps`
3. Test hot-reload by editing a React component
4. Test database connection with psql or database client
5. Verify logs: `docker-compose logs -f`

---

#### Task 2.2: Add npm Scripts for Docker Commands

- **Priority:** Medium
- **Estimated Time:** 15 minutes
- **Dependencies:** Task 2.1
- **Description:** Add convenience scripts to root package.json

**Acceptance Criteria:**

- [ ] `docker:dev:up` script added (starts dev environment)
- [ ] `docker:dev:down` script added (stops dev environment)
- [ ] `docker:dev:logs` script added (follows logs)
- [ ] `docker:dev:clean` script added (removes volumes)
- [ ] Scripts documented in README

**Implementation Steps:**

1. Edit root `package.json`
2. Add scripts in `scripts` section:
    ```json
    "docker:dev:up": "cd .containers/dev && docker-compose up -d",
    "docker:dev:down": "cd .containers/dev && docker-compose down",
    "docker:dev:logs": "cd .containers/dev && docker-compose logs -f",
    "docker:dev:clean": "cd .containers/dev && docker-compose down -v"
    ```

---

#### Task 2.3: Update Development Documentation

- **Priority:** Medium
- **Estimated Time:** 30 minutes
- **Dependencies:** Task 2.2
- **Description:** Document Docker development workflow

**Acceptance Criteria:**

- [ ] README.md or SETUP.md updated with Docker instructions
- [ ] Prerequisites listed (Docker 24.0+, Docker Compose)
- [ ] Quick start commands documented
- [ ] Troubleshooting section added
- [ ] Environment variable configuration explained

**Implementation Steps:**

1. Edit README.md or SETUP.md
2. Add "Docker Development Setup" section
3. Include prerequisites, installation, and usage instructions
4. Add common troubleshooting tips

---

### Phase 3: Production Configuration

**Duration:** 2-3 hours

#### Task 3.1: Create Production Dockerfiles for Frontends

- **Priority:** High
- **Estimated Time:** 1 hour
- **Dependencies:** Task 1.4
- **Description:** Multi-stage Dockerfiles for optimized production builds

**Acceptance Criteria:**

- [ ] `.containers/prod/host-root/Dockerfile` created
- [ ] `.containers/prod/render-root/Dockerfile` created
- [ ] Both use multi-stage builds (builder + runtime)
- [ ] Builder stage installs dependencies and builds app
- [ ] Runtime stage uses nginx:alpine
- [ ] Health checks included
- [ ] Image size < 50MB per frontend

**Implementation Steps:**

1. Create Dockerfile for host-root with:
    - Stage 1: Build (node:18-alpine, pnpm install, pnpm build)
    - Stage 2: Runtime (nginx:alpine, copy dist files)
2. Create Dockerfile for render-root (same structure)
3. Test builds:
    ```bash
    docker build -f .containers/prod/host-root/Dockerfile -t host-root:prod .
    docker build -f .containers/prod/render-root/Dockerfile -t render-root:prod .
    ```
4. Check image sizes: `docker images`

---

#### Task 3.2: Create nginx Configuration

- **Priority:** High
- **Estimated Time:** 30 minutes
- **Dependencies:** Task 3.1
- **Description:** Configure nginx for SPA routing and optimization

**Acceptance Criteria:**

- [ ] `.containers/prod/nginx/nginx.conf` created
- [ ] SPA routing configured (fallback to index.html)
- [ ] Gzip compression enabled
- [ ] Cache headers set for static assets
- [ ] Health check endpoint configured
- [ ] Security headers added

**Implementation Steps:**

1. Create nginx.conf in `.containers/prod/nginx/`
2. Configure server block with SPA routing
3. Enable gzip compression
4. Add cache control headers
5. Add security headers (X-Frame-Options, X-Content-Type-Options)

---

#### Task 3.3: Create Production Docker Compose (Optional)

- **Priority:** Low
- **Estimated Time:** 45 minutes
- **Dependencies:** Tasks 3.1, 3.2
- **Description:** Production orchestration for testing

**Acceptance Criteria:**

- [ ] `.containers/prod/docker-compose.yml` created (optional)
- [ ] Uses production Dockerfiles
- [ ] No source code volumes
- [ ] Production environment variables
- [ ] External database connection configured

**Implementation Steps:**

1. Create docker-compose.yml in `.containers/prod/`
2. Reference production Dockerfiles
3. Configure production environment variables
4. Set up networking (no host port mappings except load balancer)

---

### Phase 4: CI/CD Integration

**Duration:** 2-3 hours

#### Task 4.1: Create GitHub Actions Workflow for Image Builds

- **Priority:** Medium
- **Estimated Time:** 1 hour
- **Dependencies:** Task 3.1
- **Description:** Automate Docker image builds on CI

**Acceptance Criteria:**

- [ ] `.github/workflows/docker-build.yml` created
- [ ] Builds images on push to main/develop
- [ ] Tags images with commit SHA and branch name
- [ ] Pushes to GitHub Container Registry (GHCR)
- [ ] Runs on pull requests (build only, no push)
- [ ] Includes image scanning (Trivy/Snyk)

**Implementation Steps:**

1. Create `docker-build.yml` in `.github/workflows/`
2. Set up triggers (push, pull_request)
3. Add jobs for building host-root and render-root
4. Configure GHCR authentication
5. Add image tagging strategy
6. Add vulnerability scanning step

---

#### Task 4.2: Create Deployment Documentation

- **Priority:** Medium
- **Estimated Time:** 45 minutes
- **Dependencies:** Task 4.1
- **Description:** Document deployment process

**Acceptance Criteria:**

- [ ] `docs/ai/deployment/README.md` updated
- [ ] Docker image deployment process documented
- [ ] Environment variable configuration explained
- [ ] Database migration strategy outlined
- [ ] Rollback procedure documented

**Implementation Steps:**

1. Edit `docs/ai/deployment/README.md`
2. Add Docker deployment section
3. Document image pulling and running
4. Explain environment configuration
5. Add rollback instructions

---

#### Task 4.3: Test Production Builds Locally

- **Priority:** High
- **Estimated Time:** 30 minutes
- **Dependencies:** Tasks 3.1, 3.2
- **Description:** Validate production images work correctly

**Acceptance Criteria:**

- [ ] Production images build successfully
- [ ] Images run without errors
- [ ] Frontend apps serve correctly via nginx
- [ ] Health checks pass
- [ ] Image sizes are reasonable (< 50MB each)

**Implementation Steps:**

1. Build production images
2. Run containers locally
3. Test frontend apps in browser
4. Verify health check endpoints
5. Check image sizes and layers

---

### Phase 5: Testing & Documentation

**Duration:** 1-2 hours

#### Task 5.1: Create Docker Testing Documentation

- **Priority:** Medium
- **Estimated Time:** 30 minutes
- **Dependencies:** Task 2.1
- **Description:** Document testing approach for Docker setup

**Acceptance Criteria:**

- [ ] `docs/ai/testing/feature-docker-containerization.md` created
- [ ] Test scenarios documented
- [ ] Validation steps listed
- [ ] Performance benchmarks recorded

**Implementation Steps:**

1. Create testing documentation
2. Document test scenarios (cold start, hot-reload, etc.)
3. Add validation steps
4. Record performance metrics

---

#### Task 5.2: Create Troubleshooting Guide

- **Priority:** Medium
- **Estimated Time:** 30 minutes
- **Dependencies:** Task 2.3
- **Description:** Document common issues and solutions

**Acceptance Criteria:**

- [ ] Troubleshooting section in README
- [ ] Common errors documented (port conflicts, permission issues, etc.)
- [ ] Solutions provided for each issue
- [ ] Links to Docker documentation

**Implementation Steps:**

1. Add troubleshooting section to README/SETUP
2. List common issues:
    - Port already in use
    - Permission denied
    - Volume mount issues on Windows
    - Database connection failures
3. Provide solutions for each

---

#### Task 5.3: Update Project Documentation

- **Priority:** Low
- **Estimated Time:** 30 minutes
- **Dependencies:** All previous tasks
- **Description:** Ensure all documentation is up-to-date

**Acceptance Criteria:**

- [ ] README.md updated with Docker setup
- [ ] SETUP.md updated with Docker instructions
- [ ] CONTRIBUTING.md updated with Docker workflow
- [ ] ARCHITECTURE.md updated with container architecture

**Implementation Steps:**

1. Review and update README.md
2. Review and update SETUP.md
3. Update CONTRIBUTING.md with Docker development workflow
4. Update ARCHITECTURE.md with container architecture diagram

---

## Milestones

### Milestone 1: Development Environment Ready

**Target Date:** End of Phase 2
**Deliverables:**

- [x] All development Dockerfiles created
- [x] Docker Compose for development working
- [x] Hot-reload functioning
- [x] Database connected
- [x] Documentation updated

**Success Criteria:**

- Developer can run `pnpm docker:dev:up` and start coding within 2 minutes
- Changes to code reflect immediately in browser
- Database persists data between restarts

---

### Milestone 2: Production Build Pipeline

**Target Date:** End of Phase 3
**Deliverables:**

- [ ] Production Dockerfiles created
- [ ] Multi-stage builds optimized
- [ ] nginx configured
- [ ] Images tested locally

**Success Criteria:**

- Production images build successfully
- Images are < 50MB each
- Apps run correctly with nginx
- Health checks pass

---

### Milestone 3: CI/CD Integration

**Target Date:** End of Phase 4
**Deliverables:**

- [ ] GitHub Actions workflow created
- [ ] Images automatically built on CI
- [ ] Images pushed to GHCR
- [ ] Deployment documented

**Success Criteria:**

- CI builds images on every push
- Images are tagged correctly
- Images pass vulnerability scanning
- Deployment process documented

---

### Milestone 4: Complete & Tested

**Target Date:** End of Phase 5
**Deliverables:**

- [ ] All documentation complete
- [ ] Testing documentation created
- [ ] Troubleshooting guide available
- [ ] Team trained on Docker workflow

**Success Criteria:**

- New developers can set up environment in < 5 minutes
- All documentation accurate and comprehensive
- No critical issues remaining

---

## Resource Requirements

### Human Resources

- **Developer Time:** 8-13 hours total
- **Review Time:** 1-2 hours
- **Testing Time:** 2-3 hours

### Infrastructure

- **Local Development:**
    - Docker Desktop 24.0+
    - 8GB RAM minimum, 16GB recommended
    - 20GB free disk space
- **CI/CD:**
    - GitHub Actions minutes
    - GitHub Container Registry storage

### Tools & Software

- Docker Desktop
- Docker Compose
- Code editor (VS Code)
- Database client (optional)

---

## Risk Assessment

### Risk 1: Performance on Windows/WSL2

**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:**

- Test on Windows early
- Use WSL2 if needed
- Document Windows-specific issues
- Consider Docker Desktop settings optimization

---

### Risk 2: Image Size Too Large

**Likelihood:** Low  
**Impact:** Medium  
**Mitigation:**

- Use Alpine base images
- Multi-stage builds
- .dockerignore file
- Regular size audits

---

### Risk 3: Hot-Reload Not Working

**Likelihood:** Medium  
**Impact:** High  
**Mitigation:**

- Test with different file systems
- Configure Vite polling if needed
- Document known issues
- Provide workarounds

---

### Risk 4: Database Data Loss

**Likelihood:** Low  
**Impact:** High  
**Mitigation:**

- Use named volumes (not anonymous)
- Document backup procedures
- Test data persistence
- Provide recovery instructions

---

## Dependencies

### External Dependencies

- Docker 24.0+
- Docker Compose v2
- Node.js 18+ (for building)
- pnpm (installed in containers)

### Internal Dependencies

- Working Vite configuration
- Environment variable loader (completed)
- Existing package.json scripts

---

## Acceptance Criteria Summary

✅ **Phase 1 Complete When:**

- All directories and base Dockerfiles created
- Development docker-compose.yml working
- Can run `docker-compose up` successfully

✅ **Phase 2 Complete When:**

- Hot-reload works in development
- Database persists data
- npm scripts added
- Basic documentation complete

✅ **Phase 3 Complete When:**

- Production Dockerfiles build successfully
- Images are optimized (< 50MB)
- nginx serves SPAs correctly
- Local production testing passes

✅ **Phase 4 Complete When:**

- GitHub Actions builds images
- Images pushed to GHCR automatically
- Deployment process documented
- Image scanning passes

✅ **Phase 5 Complete When:**

- All documentation complete
- Troubleshooting guide available
- Testing documentation created
- No critical issues outstanding

---

## Timeline Summary

| Phase                      | Duration  | Cumulative |
| -------------------------- | --------- | ---------- |
| Phase 1: Foundation        | 2-3 hours | 2-3 hours  |
| Phase 2: Dev Validation    | 1-2 hours | 3-5 hours  |
| Phase 3: Production Config | 2-3 hours | 5-8 hours  |
| Phase 4: CI/CD Integration | 2-3 hours | 7-11 hours |
| Phase 5: Testing & Docs    | 1-2 hours | 8-13 hours |

**Total Estimated Time:** 8-13 hours

**Recommended Approach:**

- Complete Phase 1-2 in first session (half day)
- Complete Phase 3-4 in second session (half day)
- Complete Phase 5 as refinement (1-2 hours)
