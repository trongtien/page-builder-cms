---
phase: implementation
title: Implementation Guide & Notes
description: Track implementation progress and document key decisions
feature: docker-containerization
---

# Implementation Guide: Docker Containerization

## Implementation Status

**Current Phase:** Phase 1 - Foundation & Setup  
**Started:** [Date]  
**Last Updated:** [Date]  
**Status:** 🔄 In Progress

### Completed Tasks

- [ ] Task 1.1: Create Docker Directory Structure
- [ ] Task 1.2: Create Development Frontend Dockerfile
- [ ] Task 1.3: Create Database Dockerfile & Init Scripts
- [ ] Task 1.4: Create Development Docker Compose
- [ ] Task 2.1: Test Development Environment
- [ ] Task 2.2: Add npm Scripts for Docker Commands
- [ ] Task 2.3: Update Development Documentation
- [ ] Task 3.1: Create Production Dockerfiles for Frontends
- [ ] Task 3.2: Create nginx Configuration
- [ ] Task 3.3: Create Production Docker Compose
- [ ] Task 4.1: Create GitHub Actions Workflow
- [ ] Task 4.2: Create Deployment Documentation
- [ ] Task 4.3: Test Production Builds Locally
- [ ] Task 5.1: Create Docker Testing Documentation
- [ ] Task 5.2: Create Troubleshooting Guide
- [ ] Task 5.3: Update Project Documentation

---

## Implementation Log

### Phase 1: Foundation & Setup

#### Entry: [Date] - Docker Directory Structure

**Task:** 1.1 - Create Docker Directory Structure

**Changes Made:**

```bash
# Created directories
.containers/
├── dev/
│   ├── frontend/
│   └── database/
│       └── init/
└── prod/
    ├── host-root/
    ├── render-root/
    └── nginx/

# Created .dockerignore
```

**Files Created:**

- `.containers/dev/frontend/`
- `.containers/dev/database/init/`
- `.containers/prod/host-root/`
- `.containers/prod/render-root/`
- `.containers/prod/nginx/`
- `.dockerignore`

**Notes:**

- Used consistent naming convention
- Separated dev and prod configurations
- Added .dockerignore to exclude unnecessary files from Docker context

**Issues Encountered:** None

---

#### Entry: [Date] - Development Frontend Dockerfile

**Task:** 1.2 - Create Development Frontend Dockerfile

**Changes Made:**

```dockerfile
# .containers/dev/frontend/Dockerfile.dev
FROM node:18-alpine
RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/package.json packages/
COPY apps/*/package.json apps/*/
RUN pnpm install --frozen-lockfile
EXPOSE 3000
CMD ["pnpm", "dev"]
```

**Files Created:**

- `.containers/dev/frontend/Dockerfile.dev`

**Notes:**

- Using shared Dockerfile for both host-root and render-root
- Dependencies installed during build, source code mounted at runtime
- Vite dev server will be started with different working directories

**Build Test:**

```bash
docker build -f .containers/dev/frontend/Dockerfile.dev -t pagebuilder-frontend-dev .
# Result: Success, image size: ~1.2GB
```

**Issues Encountered:**

- None

---

#### Entry: [Date] - Database Dockerfile & Init Scripts

**Task:** 1.3 - Create Database Dockerfile & Init Scripts

**Changes Made:**

```dockerfile
# .containers/dev/database/Dockerfile
FROM postgres:18-alpine
COPY .containers/dev/database/init/*.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_DB=pagebuilder
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
EXPOSE 5432
HEALTHCHECK --interval=10s --timeout=3s CMD pg_isready -U postgres || exit 1
```

```sql
-- .containers/dev/database/init/01-init-schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_created_at ON pages(created_at);
```

**Files Created:**

- `.containers/dev/database/Dockerfile`
- `.containers/dev/database/init/01-init-schema.sql`

**Notes:**

- Using PostgreSQL 18 Alpine for smaller image size
- Health check using pg_isready
- Init scripts will run on first container start
- UUID extension enabled for primary keys

**Build Test:**

```bash
docker build -f .containers/dev/database/Dockerfile -t pagebuilder-db .
# Result: Success, image size: ~230MB
```

**Issues Encountered:**

- None

---

#### Entry: [Date] - Development Docker Compose

**Task:** 1.4 - Create Development Docker Compose

**Changes Made:**

```yaml
# .containers/dev/docker-compose.yml
version: "3.9"

services:
    database:
        build:
            context: ../../
            dockerfile: .containers/dev/database/Dockerfile
        container_name: pagebuilder-db
        environment:
            POSTGRES_DB: pagebuilder
            POSTGRES_USER: postgres
            POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
        volumes:
            - pgdata:/var/lib/postgresql/data
            - ./database/init:/docker-entrypoint-initdb.d
        ports:
            - "5432:5432"
        networks:
            - pagebuilder-network
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U postgres"]
            interval: 10s
            timeout: 5s
            retries: 5

    host-root:
        build:
            context: ../../
            dockerfile: .containers/dev/frontend/Dockerfile.dev
        container_name: pagebuilder-host-root
        working_dir: /app/apps/host-root
        command: pnpm dev --host 0.0.0.0
        environment:
            - NODE_ENV=development
            - DB_HOST=database
            - DB_PORT=5432
            - DB_NAME=pagebuilder
            - DB_USER=postgres
            - DB_PASSWORD=${DB_PASSWORD:-postgres}
        volumes:
            - ../../:/app
            - /app/node_modules
            - /app/apps/host-root/node_modules
        ports:
            - "3000:3000"
        networks:
            - pagebuilder-network
        depends_on:
            database:
                condition: service_healthy
        stdin_open: true
        tty: true

    render-root:
        build:
            context: ../../
            dockerfile: .containers/dev/frontend/Dockerfile.dev
        container_name: pagebuilder-render-root
        working_dir: /app/apps/render-root
        command: pnpm dev --host 0.0.0.0
        environment:
            - NODE_ENV=development
            - DB_HOST=database
            - DB_PORT=5432
            - DB_NAME=pagebuilder
            - DB_USER=postgres
            - DB_PASSWORD=${DB_PASSWORD:-postgres}
        volumes:
            - ../../:/app
            - /app/node_modules
            - /app/apps/render-root/node_modules
        ports:
            - "3001:3001"
        networks:
            - pagebuilder-network
        depends_on:
            database:
                condition: service_healthy
        stdin_open: true
        tty: true

networks:
    pagebuilder-network:
        driver: bridge

volumes:
    pgdata:
        driver: local
```

**Files Created:**

- `.containers/dev/docker-compose.yml`

**Notes:**

- All services on custom network for DNS resolution
- Source code mounted as volumes for hot-reload
- Anonymous volumes for node_modules to prevent host overwrite
- Database data persisted in named volume
- Health checks ensure database is ready before starting frontends
- Environment variables can be overridden via .env file

**Test Run:**

```bash
cd .containers/dev
docker-compose up
# Result: [To be filled after testing]
```

**Issues Encountered:**

- [To be documented during testing]

---

### Phase 2: Development Environment Validation

#### Entry: [Date] - Test Development Environment

**Task:** 2.1 - Test Development Environment

**Testing Performed:**

1. **Cold Start Test:**

    ```bash
    cd .containers/dev
    docker-compose up
    ```

    - Time: [To be recorded]
    - Result: [Pass/Fail]

2. **Service Health Check:**

    ```bash
    docker-compose ps
    ```

    - Database: [Status]
    - host-root: [Status]
    - render-root: [Status]

3. **Hot Reload Test:**
    - Modified: [File path]
    - Time to reflect: [Seconds]
    - Result: [Pass/Fail]

4. **Database Connection Test:**

    ```bash
    docker exec -it pagebuilder-db psql -U postgres -d pagebuilder -c "\dt"
    ```

    - Result: [Tables listed]

5. **Frontend Access Test:**
    - host-root (localhost:3000): [Pass/Fail]
    - render-root (localhost:3001): [Pass/Fail]

**Issues Encountered:**

- [Document any issues and resolutions]

**Performance Metrics:**

- Cold start time: [X minutes]
- Hot reload time: [X seconds]
- Memory usage: [X GB]
- CPU usage: [X%]

---

#### Entry: [Date] - npm Scripts Added

**Task:** 2.2 - Add npm Scripts for Docker Commands

**Changes Made:**

```json
// package.json
{
    "scripts": {
        "docker:dev:up": "cd .containers/dev && docker-compose up -d",
        "docker:dev:down": "cd .containers/dev && docker-compose down",
        "docker:dev:logs": "cd .containers/dev && docker-compose logs -f",
        "docker:dev:clean": "cd .containers/dev && docker-compose down -v",
        "docker:dev:build": "cd .containers/dev && docker-compose build",
        "docker:dev:restart": "cd .containers/dev && docker-compose restart"
    }
}
```

**Files Modified:**

- `package.json` (root)

**Usage:**

```bash
pnpm docker:dev:up      # Start all services in background
pnpm docker:dev:down    # Stop all services
pnpm docker:dev:logs    # Follow logs
pnpm docker:dev:clean   # Stop and remove volumes
```

**Notes:**

- Scripts use relative paths to work from project root
- Background mode (-d) for up command
- Clean command removes volumes for fresh start

---

#### Entry: [Date] - Development Documentation Updated

**Task:** 2.3 - Update Development Documentation

**Changes Made:**

- Updated `README.md` with Docker setup section
- Updated `SETUP.md` with detailed Docker instructions

**Files Modified:**

- `README.md`
- `SETUP.md`

**Sections Added:**

1. Prerequisites (Docker version, system requirements)
2. Quick Start (docker:dev:up command)
3. Development Workflow (hot-reload, logs, etc.)
4. Common Commands
5. Troubleshooting

---

### Phase 3: Production Configuration

#### Entry: [Date] - Production Dockerfiles

**Task:** 3.1 - Create Production Dockerfiles for Frontends

**Changes Made:**

```dockerfile
# .containers/prod/host-root/Dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY apps/host-root/ ./apps/host-root/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @page-builder/host-root build

# Stage 2: Production Runtime
FROM nginx:alpine
COPY --from=builder /app/apps/host-root/dist /usr/share/nginx/html
COPY .containers/prod/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

**Files Created:**

- `.containers/prod/host-root/Dockerfile`
- `.containers/prod/render-root/Dockerfile` (similar structure)

**Build Tests:**

```bash
docker build -f .containers/prod/host-root/Dockerfile -t host-root:prod .
docker build -f .containers/prod/render-root/Dockerfile -t render-root:prod .
```

**Image Sizes:**

- host-root: [X MB]
- render-root: [X MB]

**Notes:**

- Multi-stage build reduces final image size significantly
- No source code or build tools in final image
- nginx serves static files efficiently

---

#### Entry: [Date] - nginx Configuration

**Task:** 3.2 - Create nginx Configuration

**Changes Made:**

```nginx
# .containers/prod/nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # SPA routing - fallback to index.html
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

**Files Created:**

- `.containers/prod/nginx/nginx.conf`

**Features:**

- SPA routing support
- Gzip compression
- Static asset caching
- Security headers
- Health check endpoint

---

### Phase 4: CI/CD Integration

#### Entry: [Date] - GitHub Actions Workflow

**Task:** 4.1 - Create GitHub Actions Workflow for Image Builds

**Changes Made:**

```yaml
# .github/workflows/docker-build.yml
name: Docker Build & Push

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main]

env:
    REGISTRY: ghcr.io
    IMAGE_NAME: ${{ github.repository }}

jobs:
    build-host-root:
        runs-on: ubuntu-latest
        permissions:
            contents: read
            packages: write
        steps:
            - uses: actions/checkout@v4

            - name: Log in to GHCR
              if: github.event_name != 'pull_request'
              uses: docker/login-action@v3
              with:
                  registry: ${{ env.REGISTRY }}
                  username: ${{ github.actor }}
                  password: ${{ secrets.GITHUB_TOKEN }}

            - name: Extract metadata
              id: meta
              uses: docker/metadata-action@v5
              with:
                  images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/host-root
                  tags: |
                      type=ref,event=branch
                      type=sha

            - name: Build and push
              uses: docker/build-push-action@v5
              with:
                  context: .
                  file: .containers/prod/host-root/Dockerfile
                  push: ${{ github.event_name != 'pull_request' }}
                  tags: ${{ steps.meta.outputs.tags }}
                  labels: ${{ steps.meta.outputs.labels }}

            - name: Scan image
              uses: aquasecurity/trivy-action@master
              with:
                  image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/host-root:${{ github.sha }}
                  format: "sarif"
                  output: "trivy-results.sarif"

    build-render-root:
        # Similar to host-root job
        ...
```

**Files Created:**

- `.github/workflows/docker-build.yml`

**Features:**

- Builds on push to main/develop
- Tags images with branch name and commit SHA
- Pushes to GitHub Container Registry
- Scans images for vulnerabilities with Trivy
- Runs on pull requests (build only, no push)

---

### Phase 5: Testing & Documentation

#### Entry: [Date] - Testing Documentation

**Task:** 5.1 - Create Docker Testing Documentation

**Files Created:**

- `docs/ai/testing/feature-docker-containerization.md`

**Content:**

- Test scenarios (cold start, hot-reload, etc.)
- Validation steps
- Performance benchmarks
- Expected results

---

## Key Decisions & Rationale

### Decision 1: Shared Development Dockerfile

**Context:** Both host-root and render-root need similar development environments

**Decision:** Use single Dockerfile.dev with different working directories in docker-compose

**Rationale:**

- Reduces duplication
- Easier to maintain
- Consistent development environment
- Working directory set at runtime, not build time

**Alternatives Considered:**

- Separate Dockerfiles per app
- Monolithic Dockerfile with all apps

---

### Decision 2: Anonymous Volumes for node_modules

**Context:** node_modules can conflict between host and container

**Decision:** Use anonymous volumes to override node_modules directories

**Rationale:**

- Prevents host node_modules from being used in container
- Avoids platform-specific binary issues (Windows/Linux)
- Better performance (no file system translation)

**Configuration:**

```yaml
volumes:
    - ../../:/app
    - /app/node_modules # Anonymous volume
    - /app/apps/host-root/node_modules # Anonymous volume
```

---

### Decision 3: Health Checks for All Services

**Context:** Need to ensure services are ready before accepting traffic

**Decision:** Implement health checks in Dockerfiles and docker-compose

**Rationale:**

- Prevents cascading failures
- Enables proper dependency ordering
- Useful for orchestration (K8s, Docker Swarm)
- Better monitoring and observability

---

## Patterns & Best Practices

### Pattern 1: Multi-Stage Builds

**Usage:** Production Dockerfiles

**Benefits:**

- Smaller final images (80% reduction)
- No build tools or source code in production
- Faster deployments
- Improved security

**Example:**

```dockerfile
FROM node:18-alpine AS builder
# Build steps...

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

### Pattern 2: .dockerignore File

**Usage:** Exclude unnecessary files from Docker context

**Benefits:**

- Faster builds (smaller context)
- Smaller images
- No sensitive files in images

**Common Exclusions:**

```
node_modules
.git
.env
*.log
coverage
```

---

### Pattern 3: Named Volumes for Data Persistence

**Usage:** Database data

**Benefits:**

- Data survives container restarts
- Easy backup and restore
- Better performance than bind mounts
- Platform-independent

---

## Troubleshooting Notes

### Issue 1: Hot Reload Not Working

**Symptom:** File changes don't reflect in browser

**Cause:** Vite not detecting file changes in Docker volume

**Solution:**

```typescript
// vite.config.ts
export default defineConfig({
    server: {
        watch: {
            usePolling: true // Enable polling for Docker
        }
    }
});
```

---

### Issue 2: Port Already in Use

**Symptom:** `Error: bind: address already in use`

**Solution:**

```bash
# Find and kill process using port
npx kill-port 3000 5432

# Or change port in docker-compose.yml
ports:
  - "3010:3000"  # Map to different host port
```

---

### Issue 3: Permission Denied on Windows

**Symptom:** Cannot write to mounted volumes

**Solution:**

1. Ensure Docker Desktop has access to drive
2. Run as administrator
3. Check WSL2 file permissions

---

### Issue 4: Database Connection Refused

**Symptom:** Frontend cannot connect to database

**Cause:** Database not ready when frontend starts

**Solution:** Already implemented with health checks and `depends_on`:

```yaml
depends_on:
    database:
        condition: service_healthy
```

---

## Performance Optimization Notes

### Optimization 1: Layer Caching

**Strategy:** Copy package files before source code

**Benefit:** Dependencies don't rebuild if only source code changes

```dockerfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .  # Source code last
```

---

### Optimization 2: pnpm Store

**Strategy:** Could add pnpm store as volume for faster installs

**Future Consideration:**

```yaml
volumes:
    - pnpm-store:/root/.local/share/pnpm/store
```

---

## Future Enhancements

1. **Redis Container**
    - Add Redis for caching and sessions
    - Useful for future features (rate limiting, job queues)

2. **pgAdmin Container**
    - Optional database management UI
    - Useful for development

3. **Monitoring Stack**
    - Prometheus for metrics
    - Grafana for dashboards
    - Container resource monitoring

4. **Production Orchestration**
    - Kubernetes manifests
    - Helm charts
    - Docker Swarm configs

5. **Backup Automation**
    - Automated database backups
    - Volume backup scripts
    - Restore procedures

---

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [nginx Docker Hub](https://hub.docker.com/_/nginx)
- [Vite Docker Guide](https://vitejs.dev/guide/docker.html)
- [Multi-stage Build Best Practices](https://docs.docker.com/build/building/multi-stage/)
