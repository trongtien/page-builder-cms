---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals

**What level of testing do we aim for?**

- **Infrastructure Tests:** Validate Docker build and CI/CD pipeline (100% of new infrastructure code)
- **Integration Tests:** Verify container runtime behavior and connectivity
- **Manual Tests:** Validate deployment workflows and image accessibility
- **Alignment:** All success criteria from requirements must be testable and verified

**Coverage Targets:**

- Dockerfile builds successfully: 100%
- GitHub Actions workflows execute correctly: 100%
- Image tagging strategy works: 100%
- Container runs and serves application: 100%
- Performance benchmarks met: 100%

## Unit Tests

**What individual components need testing?**

### Component 1: Dockerfile Build Process

- [ ] **Test 1.1:** Base stage builds successfully
    - Run: `docker build --target=base -f packages/host-root/Dockerfile .`
    - Expected: Build completes, pnpm installed, workspace files copied
- [ ] **Test 1.2:** Builder stage builds successfully
    - Run: `docker build --target=builder -f packages/host-root/Dockerfile .`
    - Expected: Dependencies installed, host-root built, dist folder created
- [ ] **Test 1.3:** Runtime stage builds successfully
    - Run: `docker build -f packages/host-root/Dockerfile .`
    - Expected: Final image created, only production files included
- [ ] **Test 1.4:** Image size within limits
    - Run: `docker images | grep host-root`
    - Expected: Image size < 200MB (target), < 300MB (max acceptable)
- [ ] **Test 1.5:** Image contains expected files
    - Run: `docker run --rm IMAGE_ID ls -la /app/`
    - Expected: dist folder, package.json, node_modules present

### Component 2: .dockerignore Effectiveness

- [ ] **Test 2.1:** Build context excludes node_modules
    - Run: `docker build --progress=plain . 2>&1 | grep "node_modules"`
    - Expected: node_modules not included in build context
- [ ] **Test 2.2:** Build context excludes documentation
    - Run: Check build logs for excluded files
    - Expected: .md files, docs/ not sent to daemon
- [ ] **Test 2.3:** Build context size is reasonable
    - Run: Check "Sending build context" message
    - Expected: < 50MB build context

### Component 3: Container Runtime

- [ ] **Test 3.1:** Container starts successfully
    - Run: `docker run -d -p 3000:3000 IMAGE_ID`
    - Expected: Container enters "running" state within 10 seconds
- [ ] **Test 3.2:** Application accessible on port 3000
    - Run: `curl http://localhost:3000` or open browser
    - Expected: HTTP 200 response, application loads
- [ ] **Test 3.3:** Container logs show successful startup
    - Run: `docker logs CONTAINER_ID`
    - Expected: No errors, application started message
- [ ] **Test 3.4:** Environment variables work
    - Run: `docker run -e TEST_VAR=value IMAGE_ID env`
    - Expected: TEST_VAR appears in environment
- [ ] **Test 3.5:** Container stops gracefully
    - Run: `docker stop CONTAINER_ID`
    - Expected: Clean shutdown within 10 seconds

### Component 4: GitHub Actions Workflow

- [ ] **Test 4.1:** Workflow syntax is valid
    - Run: Use GitHub Actions workflow validator or yamllint
    - Expected: No syntax errors
- [ ] **Test 4.2:** Workflow triggers on correct events
    - Verify: `on.push.branches` and `on.push.tags` configured
    - Expected: Workflow file has correct trigger conditions
- [ ] **Test 4.3:** PR validation job runs
    - Create PR with workflow changes
    - Expected: `validate-docker` job runs, build succeeds, no push occurs
- [ ] **Test 4.4:** Main push triggers build-and-push
    - Push to main branch
    - Expected: `build-and-push` job runs, image pushed to ghcr.io

## Integration Tests

**How do we test component interactions?**

### Integration Scenario 1: Local Docker Build → Run

- [ ] **Test:** Build image locally and run container

    ```bash
    docker build -t test-host-root -f packages/host-root/Dockerfile .
    docker run -d -p 3000:3000 --name test-container test-host-root
    curl http://localhost:3000
    docker stop test-container
    docker rm test-container
    ```

    - Expected: Full build-run-access-cleanup cycle succeeds

### Integration Scenario 2: GitHub Actions → ghcr.io

- [ ] **Test:** Push code to main, verify image in registry
    - Action: Push commit to main branch
    - Verify: GitHub Actions workflow runs successfully
    - Verify: Image appears in ghcr.io (check Packages tab in GitHub)
    - Expected: Image tagged with `main` or `latest`, build logs available

### Integration Scenario 3: Tagged Release → Versioned Image

- [ ] **Test:** Create git tag, verify semantic version image

    ```bash
    git tag v0.1.0
    git push origin v0.1.0
    ```

    - Verify: GitHub Actions workflow triggered by tag
    - Verify: Image tagged as `v0.1.0` in ghcr.io
    - Verify: `latest` tag also updated
    - Expected: Both version tag and latest tag point to same image

### Integration Scenario 4: Pull Image → Deploy

- [ ] **Test:** Pull image from ghcr.io and run locally

    ```bash
    docker pull ghcr.io/trongtien/page-builder-cms/host-root:latest
    docker run -d -p 3000:3000 ghcr.io/trongtien/page-builder-cms/host-root:latest
    curl http://localhost:3000
    ```

    - Expected: Image downloads, container runs, application accessible

### Integration Scenario 5: Build Caching

- [ ] **Test:** Trigger two consecutive builds
    - Action: Push two commits to main in quick succession
    - Verify: Second build completes faster due to cache
    - Expected: First build ~10 min, second build ~3 min (or faster)

### Integration Scenario 6: PR Workflow (Build Only)

- [ ] **Test:** Create PR, verify build validation without push
    - Action: Create PR with Dockerfile changes
    - Verify: `validate-docker` job runs in GitHub Actions
    - Verify: Build succeeds but no image pushed to ghcr.io
    - Expected: PR checks pass, no new images in registry

## End-to-End Tests

**What user flows need validation?**

### User Flow 1: Developer Workflow

- [ ] **E2E Test:** Developer pushes code change
    1. Modify application code in packages/host-root/src
    2. Commit and push to feature branch
    3. Create PR to main
    4. Verify: PR validation runs, build succeeds
    5. Merge PR to main
    6. Verify: Build-and-push workflow runs
    7. Verify: New image available in ghcr.io with latest tag
    8. Pull and test image locally
    - Expected: Complete flow from code change to deployable image

### User Flow 2: Release Workflow

- [ ] **E2E Test:** Create versioned release
    1. Ensure code is stable on main branch
    2. Create git tag: `git tag v1.0.0`
    3. Push tag: `git push origin v1.0.0`
    4. Verify: GitHub Actions workflow triggered
    5. Verify: Image built and tagged as `v1.0.0` and `latest`
    6. Pull versioned image: `docker pull ghcr.io/.../host-root:v1.0.0`
    7. Run container and verify functionality
    8. Create GitHub Release from tag (optional)
    - Expected: Versioned image available, deployable, documented

### User Flow 3: Deployment Workflow

- [ ] **E2E Test:** DevOps deploys container
    1. Authenticate to ghcr.io: `docker login ghcr.io`
    2. Pull image: `docker pull ghcr.io/.../host-root:v1.0.0`
    3. Stop old container (if running)
    4. Start new container with production env vars
    5. Verify application is accessible
    6. Check container logs for errors
    7. Perform smoke tests on deployed application
    - Expected: Clean deployment with no downtime (in manual deployment scenario)

### User Flow 4: Rollback Workflow

- [ ] **E2E Test:** Rollback to previous version
    1. Note current running version
    2. Pull previous version: `docker pull ghcr.io/.../host-root:v0.9.0`
    3. Stop current container
    4. Start container with previous version
    5. Verify application works with old version
    - Expected: Ability to rollback to any tagged version

## Test Data

**What data do we use for testing?**

### Test Fixtures and Mocks

- **Sample Environment Variables:**

    ```
    NODE_ENV=production
    PORT=3000
    API_URL=https://api.example.com
    ```

- **Test Containers:**
    - Use ephemeral containers for testing (auto-remove with `--rm`)
    - Clean up after tests to avoid resource leaks

- **Mock Registry (Optional):**
    - For local testing, can use local registry: `docker run -d -p 5000:5000 registry:2`

### Seed Data Requirements

- No seed data required (static frontend application)
- Environment variables provided at runtime
- Configuration files bundled in image

### Test Environment Setup

```bash
# Create test environment script
cat > test-docker.sh << 'EOF'
#!/bin/bash
set -e

echo "Building Docker image..."
docker build -t test-host-root:latest -f packages/host-root/Dockerfile .

echo "Checking image size..."
SIZE=$(docker images test-host-root:latest --format "{{.Size}}")
echo "Image size: $SIZE"

echo "Starting container..."
CONTAINER_ID=$(docker run -d -p 3000:3000 test-host-root:latest)
echo "Container ID: $CONTAINER_ID"

echo "Waiting for startup..."
sleep 5

echo "Testing application..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
echo "HTTP response: $HTTP_CODE"

echo "Checking logs..."
docker logs $CONTAINER_ID

echo "Cleaning up..."
docker stop $CONTAINER_ID
docker rm $CONTAINER_ID

if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Tests failed!"
  exit 1
fi
EOF

chmod +x test-docker.sh
```

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Coverage Commands and Thresholds

**Docker Build Tests:**

```bash
# Run all build stages
docker build --target=base -t test:base -f packages/host-root/Dockerfile .
docker build --target=builder -t test:builder -f packages/host-root/Dockerfile .
docker build -t test:runtime -f packages/host-root/Dockerfile .

# Verify each stage succeeded
echo $?  # Should be 0
```

**GitHub Actions Tests:**

- View workflow runs in GitHub Actions tab
- Check status of each job (validate-docker, build-and-push)
- Review build logs for errors or warnings

**Image Quality Tests:**

```bash
# Check image size
docker images test:runtime --format "{{.Repository}}:{{.Tag}} {{.Size}}"

# Analyze layers
docker history test:runtime

# Inspect image metadata
docker inspect test:runtime | jq '.[0].Config.Labels'
```

### Coverage Gaps

**Files/Functions Below Target:**

- N/A (infrastructure code, not application code)

**Rationale:**

- Infrastructure validated through functional testing
- GitHub Actions workflows validated by actual execution
- Dockerfile validated by successful builds

### Test Reports

**Automated Reports:**

- GitHub Actions provides built-in workflow status and logs
- Docker build output captured in Actions logs
- Image metadata visible in ghcr.io Package details

**Manual Test Checklist:**

- Use checklist in this document to track manual tests
- Document results in implementation notes
- Screenshot or log evidence for critical tests

### Links to Test Reports

- **GitHub Actions:** https://github.com/trongtien/page-builder-cms/actions
- **GitHub Packages:** https://github.com/trongtien?tab=packages&repo_name=page-builder-cms
- **Workflow Runs:** Accessible from repository Actions tab

## Manual Testing

**What requires human validation?**

### UI/UX Testing Checklist

- [ ] Application loads in browser at http://localhost:3000
- [ ] All routes accessible and functional
- [ ] Static assets (CSS, JS, images) load correctly
- [ ] No console errors in browser developer tools
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Accessibility: Keyboard navigation works
- [ ] Accessibility: Screen reader compatible (if applicable)

### Functional Testing

- [ ] All features work identically to non-containerized version
- [ ] API calls succeed (if external APIs configured)
- [ ] Environment variables correctly applied
- [ ] Logging output visible in container logs
- [ ] Error handling works as expected

### Browser/Device Compatibility

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### Deployment Validation

- [ ] Image pull succeeds from ghcr.io
- [ ] Container starts without errors
- [ ] Health check endpoint responds (if implemented)
- [ ] Container restarts correctly after failure
- [ ] Container stops gracefully with SIGTERM

## Performance Testing

**How do we validate performance?**

### Build Performance

- [ ] **First Build Time:** Measure with `time docker build`
    - Target: < 10 minutes
    - Acceptable: < 15 minutes
    - Record: **\_** minutes

- [ ] **Cached Build Time:** Rebuild after no changes
    - Target: < 3 minutes
    - Acceptable: < 5 minutes
    - Record: **\_** minutes

- [ ] **CI/CD Total Time:** From push to image available
    - Target: < 12 minutes
    - Acceptable: < 20 minutes
    - Record: **\_** minutes

### Image Size

- [ ] **Final Image Size:** Check with `docker images`
    - Target: < 200MB
    - Acceptable: < 300MB
    - Record: **\_** MB

- [ ] **Size Comparison:** Compare to single-stage build
    - Expected reduction: > 40%
    - Record: **\_** % reduction

### Runtime Performance

- [ ] **Container Startup Time:** Time to "running" state
    - Target: < 5 seconds
    - Acceptable: < 10 seconds
    - Record: **\_** seconds

- [ ] **Application Ready Time:** Time to first HTTP 200
    - Target: < 10 seconds
    - Acceptable: < 20 seconds
    - Record: **\_** seconds

- [ ] **Memory Usage:** Check with `docker stats`
    - Baseline: **\_** MB
    - Under load: **\_** MB

- [ ] **CPU Usage:** Check with `docker stats`
    - Idle: < 5%
    - Under load: Acceptable up to 80%

### Load Testing (Optional)

- [ ] **Concurrent Requests:** Use tool like `ab` or `wrk`

    ```bash
    ab -n 1000 -c 10 http://localhost:3000/
    ```

    - Expected: Handle 10 concurrent users without errors
    - Record: **\_** requests/sec

### Performance Benchmarks

**Success Criteria:**

- ✅ Build time < 10 min (first), < 3 min (cached)
- ✅ Image size < 200MB
- ✅ Startup time < 10 seconds
- ✅ No performance regression vs non-containerized

## Bug Tracking

**How do we manage issues?**

### Issue Tracking Process

- **GitHub Issues:** Use repository Issues tab
- **Labels:**
    - `bug` - Something isn't working
    - `docker` - Docker-related issues
    - `ci/cd` - CI/CD pipeline issues
    - `performance` - Performance problems
    - `documentation` - Docs updates needed

### Bug Severity Levels

**Critical (P0):**

- Docker build completely fails
- GitHub Actions workflow broken
- Image won't start
- Security vulnerability

**High (P1):**

- Image size exceeds acceptable limit
- Build time significantly over target
- Missing required files in image
- Authentication issues with ghcr.io

**Medium (P2):**

- Suboptimal caching
- Minor performance issues
- Documentation gaps
- Non-critical warnings in logs

**Low (P3):**

- Image optimization opportunities
- Nice-to-have features
- Documentation improvements

### Regression Testing Strategy

**On Every Build:**

- Verify Dockerfile builds successfully
- Check image size hasn't increased significantly
- Confirm container starts and runs

**On Every Release:**

- Run full test suite from this document
- Verify all manual tests pass
- Compare performance benchmarks to previous release

**Continuous Monitoring:**

- GitHub Actions workflow success rate
- Average build time trends
- Image size over time
- Container startup time

### Known Issues and Workarounds

**Issue Tracker:**

- Document any discovered issues during testing
- Link to GitHub Issues for tracking
- Provide workarounds in documentation

**Example:**

```markdown
## Known Issues

### Issue 1: Build fails on Windows Docker Desktop

- **Status:** Investigating
- **Workaround:** Use WSL2 backend for Docker Desktop
- **Tracking:** Issue #123
```

## Testing Sign-off

**Final Validation:**

- [ ] All unit tests passed
- [ ] All integration tests passed
- [ ] All E2E tests passed
- [ ] Performance benchmarks met
- [ ] Manual testing complete
- [ ] Documentation updated
- [ ] No critical or high severity bugs

**Tested By:** **\*\***\_**\*\***  
**Date:** **\*\***\_**\*\***  
**Version:** **\*\***\_**\*\***

**Notes:**
