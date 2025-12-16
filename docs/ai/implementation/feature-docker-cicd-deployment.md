---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup

**How do we get started?**

### Prerequisites

- Docker Desktop or Docker Engine installed (version 20.10+)
- Docker Compose (optional, for local testing)
- Git with repository access
- GitHub account with push permissions
- Node.js 24.x (for local development verification)
- pnpm 10.x (monorepo package manager)

### Environment Setup

```bash
# Verify Docker installation
docker --version
docker compose version

# Clone repository (if not already)
git clone https://github.com/trongtien/page-builder-cms.git
cd page-builder-cms

# Verify pnpm and dependencies
pnpm install

# Build host-root locally to verify
pnpm --filter @page-builder/host-root build
```

### Configuration Needed

**GitHub Repository Settings:**

1. Go to repository Settings → Actions → General
2. Set "Workflow permissions" to "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests" (optional)

**ghcr.io Access:**

- GITHUB_TOKEN is automatically available in Actions
- No manual secret configuration needed
- Image visibility set in workflow metadata

## Code Structure

**How is the code organized?**

```
page-builder-cms/
├── .github/
│   └── workflows/
│       └── docker-build.yml          # GitHub Actions CI/CD workflow
├── packages/
│   └── host-root/
│       ├── Dockerfile                 # Multi-stage Docker build
│       ├── .dockerignore              # Exclude files from build context
│       ├── docker-compose.example.yml # Local testing example (optional)
│       └── src/                       # Application source code
└── docs/
    └── ai/
        ├── requirements/
        │   └── feature-docker-cicd-deployment.md
        ├── design/
        │   └── feature-docker-cicd-deployment.md
        ├── planning/
        │   └── feature-docker-cicd-deployment.md
        ├── implementation/
        │   └── feature-docker-cicd-deployment.md   # This file
        └── deployment/
            └── README.md              # To be updated with deployment guide
```

### Module Organization

**Docker Configuration (packages/host-root/)**

- `Dockerfile` - Multi-stage container build definition
- `.dockerignore` - Build context exclusions

**CI/CD Configuration (.github/workflows/)**

- `docker-build.yml` - Automated build and push workflow

**Documentation (docs/ai/)**

- Feature-specific documentation in each phase folder
- Deployment guide in deployment folder

### Naming Conventions

**Docker Image:**

- Registry: `ghcr.io`
- Organization: `trongtien` (GitHub username)
- Repository: `page-builder-cms/host-root`
- Full name: `ghcr.io/trongtien/page-builder-cms/host-root`

**Tags:**

- Latest: `latest`
- Semantic version: `v1.2.3`, `v0.1.0`
- Git SHA (optional): `sha-abc1234`

**Workflow:**

- Name: `Docker Build and Push`
- File: `docker-build.yml`
- Jobs: `validate-docker`, `build-and-push`

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### Feature 1: Multi-stage Dockerfile

**Implementation approach:**

```dockerfile
# Stage 1: Base - Setup pnpm and workspace
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/config ./packages/config
COPY packages/core ./packages/core
COPY packages/host-root/package.json ./packages/host-root/

# Stage 2: Builder - Install deps and build
FROM base AS builder
RUN pnpm install --frozen-lockfile
COPY packages/host-root ./packages/host-root
RUN pnpm --filter @page-builder/host-root build

# Stage 3: Runtime - Minimal production image
FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/packages/host-root/dist ./dist
COPY --from=builder /app/packages/host-root/package.json ./
RUN npm install --production --ignore-scripts
EXPOSE 3000
CMD ["node", "dist/index.js"]  # Or appropriate start command
```

**Key decisions:**

- Use `corepack` to install pnpm in container
- Copy workspace files to respect monorepo structure
- Use `--frozen-lockfile` for reproducible builds
- Only copy `dist` folder to runtime stage
- Production-only dependencies in runtime

#### Feature 2: GitHub Actions Workflow

**Implementation approach:**

```yaml
name: Docker Build and Push

on:
    push:
        branches: [main]
        tags: ["v*"]
    pull_request:
        branches: [main]

env:
    REGISTRY: ghcr.io
    IMAGE_NAME: ${{ github.repository }}/host-root

jobs:
    validate-docker:
        runs-on: ubuntu-latest
        if: github.event_name == 'pull_request'
        steps:
            - uses: actions/checkout@v4
            - name: Build Docker image (validation)
              run: docker build -f packages/host-root/Dockerfile .

    build-and-push:
        runs-on: ubuntu-latest
        if: github.event_name != 'pull_request'
        permissions:
            contents: read
            packages: write
        steps:
            - uses: actions/checkout@v4

            - name: Set up Docker Buildx
              uses: docker/setup-buildx-action@v3

            - name: Log in to Container registry
              uses: docker/login-action@v3
              with:
                  registry: ${{ env.REGISTRY }}
                  username: ${{ github.actor }}
                  password: ${{ secrets.GITHUB_TOKEN }}

            - name: Extract metadata
              id: meta
              uses: docker/metadata-action@v5
              with:
                  images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
                  tags: |
                      type=ref,event=branch
                      type=semver,pattern={{version}}
                      type=semver,pattern={{major}}.{{minor}}
                      type=sha

            - name: Build and push
              uses: docker/build-push-action@v5
              with:
                  context: .
                  file: packages/host-root/Dockerfile
                  push: true
                  tags: ${{ steps.meta.outputs.tags }}
                  labels: ${{ steps.meta.outputs.labels }}
                  cache-from: type=gha
                  cache-to: type=gha,mode=max
```

**Key decisions:**

- Separate validation job for PRs (no push)
- Build-and-push only on main and tags
- Use official GitHub Actions for Docker
- Leverage GitHub Actions cache for layers
- Automatic tag extraction from git metadata

#### Feature 3: .dockerignore Configuration

**Implementation approach:**

```
# Dependencies
node_modules
**/node_modules
pnpm-lock.yaml

# Build outputs
dist
**/dist
.next
.turbo
build

# Development
.env.local
.env.development
*.local

# Git
.git
.github
.gitignore
.gitattributes

# Documentation
*.md
docs/
README.md

# Tests
**/__tests__
**/*.test.ts
**/*.spec.ts
coverage
.nyc_output

# IDE
.vscode
.idea
*.swp
*.swo

# CI/CD
.github/workflows

# Misc
.DS_Store
.editorconfig
.eslintrc*
.prettierrc
tsconfig.json
```

**Key decisions:**

- Exclude node_modules (installed in container)
- Exclude all documentation to reduce context
- Keep necessary config files for build
- Remove test files from production image

### Patterns & Best Practices

**Docker Best Practices:**

1. **Layer Caching:** Order Dockerfile commands from least to most frequently changed
2. **Multi-stage Builds:** Separate build and runtime stages for smaller images
3. **Minimal Base:** Use Alpine Linux for smaller footprint
4. **Non-root User:** Run container as non-root for security (if applicable)
5. **Health Checks:** Add HEALTHCHECK instruction for container orchestration
6. **Label Everything:** Use OCI labels for metadata

**CI/CD Best Practices:**

1. **Fail Fast:** Validate on PRs before merging
2. **Cache Aggressively:** Use GitHub Actions cache for Docker layers
3. **Immutable Tags:** Never overwrite existing version tags
4. **Semantic Versioning:** Follow semver for release tags
5. **Audit Logs:** GitHub Actions provides full build history

**Monorepo Build Patterns:**

1. **Workspace Filtering:** Use `pnpm --filter` to build only needed packages
2. **Dependency Graph:** Respect package dependencies in build order
3. **Shared Configs:** Copy workspace config packages before build
4. **Frozen Lockfile:** Ensure reproducible builds across environments

## Integration Points

**How do pieces connect?**

### GitHub Actions → Docker Build

**Trigger Flow:**

```
Git Push/Tag → GitHub Webhook → Actions Workflow → Docker Buildx → Build Image
```

**Configuration:**

- Workflow file: `.github/workflows/docker-build.yml`
- Trigger: `on.push.branches` and `on.push.tags`
- Context path: `.` (repository root)
- Dockerfile path: `packages/host-root/Dockerfile`

### Docker Build → ghcr.io

**Push Flow:**

```
Build Image → Tag Image → Authenticate (GITHUB_TOKEN) → Push to Registry
```

**Authentication:**

```yaml
- name: Log in to Container registry
  uses: docker/login-action@v3
  with:
      registry: ghcr.io
      username: ${{ github.actor }}
      password: ${{ secrets.GITHUB_TOKEN }}
```

### ghcr.io → Manual Deployment

**Pull and Run:**

```bash
# Authenticate
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull latest
docker pull ghcr.io/trongtien/page-builder-cms/host-root:latest

# Run with environment variables
docker run -d \
  --name host-root \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e API_URL=https://api.example.com \
  ghcr.io/trongtien/page-builder-cms/host-root:latest

# Check logs
docker logs host-root

# Stop/remove
docker stop host-root
docker rm host-root
```

## Error Handling

**How do we handle failures?**

### Build Errors

**Dockerfile Build Failure:**

```bash
# Debug locally
docker build --progress=plain --no-cache -f packages/host-root/Dockerfile .

# Check specific stage
docker build --target=builder -f packages/host-root/Dockerfile .

# Inspect layers
docker history IMAGE_ID
```

**Common issues:**

- Missing files in build context → Check .dockerignore
- pnpm install fails → Verify pnpm-lock.yaml is copied
- Build command fails → Test locally first
- Workspace dependencies not found → Copy workspace structure

### CI/CD Errors

**GitHub Actions Workflow Failure:**

```yaml
# Add debugging step
- name: Debug info
  run: |
      echo "Event: ${{ github.event_name }}"
      echo "Ref: ${{ github.ref }}"
      ls -la packages/host-root/
```

**Common issues:**

- Permission denied → Check workflow permissions in settings
- Cache errors → Clear cache and retry
- Registry push fails → Verify authentication
- Workflow not triggering → Check branch/tag patterns

### Runtime Errors

**Container Startup Failure:**

```bash
# Check container logs
docker logs CONTAINER_ID

# Inspect container
docker inspect CONTAINER_ID

# Access container shell
docker exec -it CONTAINER_ID sh

# Check environment
docker exec CONTAINER_ID env
```

**Common issues:**

- Port already in use → Change `-p` mapping
- Missing environment variables → Add `-e` flags
- File permissions → Check file ownership
- Application crashes → Review logs for errors

### Logging Approach

**Build Logs:**

- GitHub Actions provides full build logs
- Access via Actions tab in repository
- Logs retained for 90 days

**Runtime Logs:**

- Docker logs via `docker logs`
- Forward to logging service if needed
- Application-level logging to stdout/stderr

### Retry/Fallback Mechanisms

**GitHub Actions Retry:**

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
      # ... config ...
  timeout-minutes: 30
  continue-on-error: false # Fail workflow if build fails
```

**Manual Intervention:**

- Failed builds require code fix and re-trigger
- Can manually re-run failed workflow from GitHub UI
- Tag can be deleted and recreated if needed

## Performance Considerations

**How do we keep it fast?**

### Optimization Strategies

**1. Docker Layer Caching:**

```dockerfile
# Copy dependency files first (changes less frequently)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Install dependencies (cached layer)
RUN pnpm install --frozen-lockfile

# Copy source code last (changes most frequently)
COPY packages/host-root ./packages/host-root
```

**2. Multi-stage Build Size Reduction:**

```dockerfile
# Builder stage: ~800MB (includes build tools)
FROM node:24-alpine AS builder
# ... build steps ...

# Runtime stage: ~150MB (only production files)
FROM node:24-alpine AS runtime
COPY --from=builder /app/dist ./dist
```

**3. pnpm Workspace Filtering:**

```bash
# Only build host-root and its dependencies
pnpm --filter @page-builder/host-root build

# Skip unrelated packages
# Faster than building entire monorepo
```

### Caching Approach

**GitHub Actions Cache:**

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**Benefits:**

- Reuses Docker layers between builds
- Dramatically reduces build time (10min → 3min)
- Automatic cache management by GitHub

**Cache Invalidation:**

- New dependencies → pnpm-lock.yaml changes → cache miss
- Source code changes → Only affected layers rebuild
- Base image update → Full rebuild required

### Build Time Optimization

**Target Metrics:**

- First build: < 10 minutes
- Cached build: < 3 minutes
- Total CI/CD: < 12 minutes

**Techniques:**

- Parallelize independent steps where possible
- Use BuildKit for improved caching (default in Buildx)
- Minimize layers (combine RUN commands where appropriate)
- Use .dockerignore to reduce build context size

## Security Notes

**What security measures are in place?**

### Authentication/Authorization

**Registry Access:**

- GitHub Container Registry uses GitHub authentication
- GITHUB_TOKEN automatically provided to Actions
- Personal Access Token (PAT) needed for local pulls (if private)

**Permissions:**

```yaml
permissions:
    contents: read # Read repository code
    packages: write # Push to ghcr.io
```

### Input Validation

**Dockerfile:**

- Use specific base image versions (not `latest`)
- Verify checksums of downloaded packages (via pnpm)
- No arbitrary code execution from external sources

**Workflow:**

- Only trigger on specific branches/tags
- No external inputs accepted
- All secrets managed by GitHub

### Data Encryption

**In Transit:**

- HTTPS for all git operations
- TLS for Docker registry communication
- Encrypted connections to ghcr.io

**At Rest:**

- Container images stored securely in ghcr.io
- GitHub encrypts stored secrets
- No sensitive data in images

### Secrets Management

**Best Practices:**

- Never hardcode secrets in Dockerfile
- Use environment variables for runtime config
- GitHub Secrets for CI/CD credentials
- GITHUB_TOKEN auto-expires after workflow

**Example:**

```yaml
# DON'T DO THIS
ENV API_KEY=abc123

# DO THIS
# Pass at runtime:
docker run -e API_KEY=$API_KEY ...
```

**Runtime Configuration:**

```bash
# Use environment variables file
docker run --env-file .env.production ghcr.io/.../host-root:latest
```

### Container Security

**Measures:**

1. **Minimal Base Image:** Alpine Linux reduces attack surface
2. **Non-root User:** (To be implemented if needed)
    ```dockerfile
    RUN addgroup -g 1001 -S nodejs && \
        adduser -S nextjs -u 1001
    USER nodejs
    ```
3. **No Unnecessary Packages:** Only production dependencies in runtime
4. **Regular Updates:** Rebuild with updated base images periodically
5. **Vulnerability Scanning:** GitHub Advanced Security (if enabled)

**Image Signing (Future Enhancement):**

```bash
# Sign images with Cosign
cosign sign ghcr.io/trongtien/page-builder-cms/host-root:v1.0.0
```
