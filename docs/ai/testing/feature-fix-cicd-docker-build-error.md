---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals

**What level of testing do we aim for?**

This is primarily a **build configuration fix**, not a feature addition. Testing focuses on:

- ✅ Build process validation (100% coverage)
- ✅ Integration with existing development workflow
- ✅ CI/CD pipeline verification
- ✅ No regression in functionality

**Success Criteria:**

- All builds (local, Docker, CI/CD) pass
- Development workflow unchanged
- No TypeScript or runtime errors
- HMR continues to work correctly

## Build Tests

**Core build process validation:**

### Test Suite 1: Local Package Builds

- [x] **Test 1.1**: Build core-ui package
    - **Command**: `cd packages/core/ui && pnpm run build`
    - **Expected**: Exit code 0, dist/index.js and dist/index.d.ts created
    - **Coverage**: Verifies tsup configuration works correctly
    - **Status**: ✅ Passing (verified before documentation)

- [x] **Test 1.2**: Build core-utils package (if exists)
    - **Command**: `cd packages/core/utils && pnpm run build`
    - **Expected**: Exit code 0, build artifacts created
    - **Coverage**: Ensures all core packages build

- [x] **Test 1.3**: Build host-root application
    - **Command**: `cd packages/host-root && pnpm run build`
    - **Expected**: Exit code 0, TypeScript passes, Vite builds successfully
    - **Coverage**: Verifies consumer application can build with packaged dependencies
    - **Status**: ✅ Passing (verified before documentation)

- [ ] **Test 1.4**: Build render-root application
    - **Command**: `cd packages/render-root && pnpm run build`
    - **Expected**: Exit code 0, successful build
    - **Coverage**: Ensures both consumer applications work

### Test Suite 2: TypeScript Type Checking

- [ ] **Test 2.1**: Type check core-ui in isolation
    - **Command**: `cd packages/core/ui && pnpm run type-check`
    - **Expected**: No TypeScript errors
    - **Coverage**: Validates internal types are correct

- [ ] **Test 2.2**: Type check host-root
    - **Command**: `cd packages/host-root && pnpm run type-check`
    - **Expected**: Can resolve types from @page-builder/core-ui
    - **Coverage**: Ensures type definitions are exported correctly

- [ ] **Test 2.3**: Type check all packages
    - **Command**: `pnpm run type-check` (from root)
    - **Expected**: All packages pass type checking
    - **Coverage**: Full workspace validation

### Test Suite 3: Docker Builds

- [ ] **Test 3.1**: Build host-root Docker image
    - **Command**: `docker build -f packages/host-root/Dockerfile . -t test-host-root`
    - **Expected**: Build completes without exit code 2 error
    - **Coverage**: Validates fix resolves CI/CD issue
    - **Notes**: Requires Docker Desktop running

- [ ] **Test 3.2**: Build render-root Docker image
    - **Command**: `docker build -f packages/render-root/Dockerfile . -t test-render-root`
    - **Expected**: Build completes successfully
    - **Coverage**: Ensures both applications work in Docker context

- [ ] **Test 3.3**: Run built Docker image
    - **Command**: `docker run -p 8080:80 test-host-root`
    - **Expected**: Container starts, nginx serves the application
    - **Coverage**: Runtime validation
    - **Manual Check**: Navigate to http://localhost:8080, verify app loads

## Integration Tests

**How do we test component interactions?**

### Integration Suite 1: Development Workflow

- [ ] **Test 4.1**: Development server starts
    - **Command**: `cd packages/host-root && pnpm run dev`
    - **Expected**: Server starts on port 3000 without errors
    - **Coverage**: Validates Vite config with dev aliases still works

- [ ] **Test 4.2**: HMR works with source files
    - **Steps**:
        1. Start dev server
        2. Edit `packages/core/ui/src/common/Button.tsx`
        3. Save file
    - **Expected**: Browser console shows HMR update with /@fs/ path
    - **Coverage**: Ensures development aliases resolve to source files

- [ ] **Test 4.3**: Import from core-ui works
    - **File**: Any component in host-root importing from `@page-builder/core-ui`
    - **Expected**: No module resolution errors
    - **Coverage**: Workspace dependency resolution

### Integration Suite 2: CI/CD Pipeline

- [ ] **Test 5.1**: Pull Request validation workflow
    - **Trigger**: Create PR with changes
    - **Expected**: `validate-docker` job succeeds
    - **Coverage**: Pre-merge validation
    - **URL**: GitHub Actions tab

- [ ] **Test 5.2**: Build and push workflow (main branch)
    - **Trigger**: Merge to main or create tag
    - **Expected**: Image built and pushed to ghcr.io
    - **Coverage**: Production deployment pipeline
    - **Verification**: Check container registry for new image

## Manual Testing

**What requires human validation?**

### Manual Test Checklist

- [ ] **MT-1**: Visual inspection of built application
    - Open browser to running app
    - Verify layout and UI components render correctly
    - Check for console errors

- [ ] **MT-2**: Component functionality
    - Test Button component interactions
    - Test Card component display
    - Test sidebar menu behavior
    - Verify all imported components work

- [ ] **MT-3**: Development experience
    - Make changes to core-ui component
    - Verify changes appear instantly in browser
    - Confirm no page reload needed (HMR working)

- [ ] **MT-4**: Build artifacts inspection
    - Check `packages/core/ui/dist/index.js`
    - Verify no relative import paths (`../`) in bundled code
    - Confirm tree-shaking worked (reasonable bundle size)

- [ ] **MT-5**: CI/CD logs review
    - Check GitHub Actions workflow output
    - Verify all steps completed
    - Confirm no warnings or suspicious messages

## Test Data

**Configuration files being tested:**

**Before changes:**

```typescript
// packages/core/ui/tsup.config.ts
esbuildOptions(options) {
    options.banner = { js: '"use client"' };
    options.alias = { "@": "./src" };  // ← To be removed
}
```

**After changes:**

```typescript
// packages/core/ui/tsup.config.ts
esbuildOptions(options) {
    options.banner = { js: '"use client"' };
    // Removed unused alias
}
```

**Test fixtures:**

- No additional test data needed
- Uses existing source files
- Real package dependencies

## Test Reporting & Coverage

**Build Process Coverage:**

| Test Area      | Test Count | Status | Notes                          |
| -------------- | ---------- | ------ | ------------------------------ |
| Local Builds   | 4          | 2/4 ✅ | core-ui and host-root verified |
| Type Checking  | 3          | 0/3 ⏳ | To be run after fix            |
| Docker Builds  | 3          | 0/3 ⏳ | Requires Docker Desktop        |
| Dev Workflow   | 3          | 1/3 ✅ | HMR verified previously        |
| CI/CD Pipeline | 2          | 0/2 ⏳ | Requires push to GitHub        |
| Manual Tests   | 5          | 0/5 ⏳ | To be done after fix           |

**Coverage gaps:**

- No unit tests needed (config change, not code)
- No E2E tests needed (existing functionality unchanged)
- Focus is on build validation, not runtime behavior

**Commands for validation:**

```bash
# Full workspace build test
pnpm install
pnpm run build  # From root, builds all packages

# Type check everything
pnpm run type-check

# Docker build test (if Docker available)
docker build -f packages/host-root/Dockerfile .
docker build -f packages/render-root/Dockerfile .
```

## Performance Testing

**Build Performance:**

No performance changes expected, but we should verify:

- [ ] **PT-1**: Local build time comparison
    - Measure: Time to run `pnpm build` before and after
    - Expected: No significant change (within ±10%)
    - Baseline: ~8-10 seconds for host-root
- [ ] **PT-2**: Docker build time comparison
    - Measure: Total Docker build time
    - Expected: Same as previous successful builds
    - Baseline: ~3-5 minutes in CI

- [ ] **PT-3**: HMR update speed
    - Measure: Time from file save to browser update
    - Expected: <1 second (unchanged)
    - Baseline: Instant updates

## Regression Testing

**Areas that must not break:**

- [ ] **RT-1**: Existing features in host-root work
    - Dashboard page renders
    - Navigation works
    - All routes accessible

- [ ] **RT-2**: Existing features in render-root work
    - Application starts
    - No runtime errors

- [ ] **RT-3**: Other packages unaffected
    - config packages still work
    - utils packages still work
    - No breaking changes to shared packages

## Bug Tracking

**Issue management:**

**Primary Issue:**

- **Issue**: CI/CD Docker build fails with exit code 2
- **Severity**: Critical (blocks deployment)
- **Root Cause**: Unused tsup alias configuration
- **Fix**: Remove unused alias from tsup.config.ts
- **Status**: In progress

**Potential Follow-up Issues:**

- If fix doesn't resolve: Deep dive into TypeScript module resolution
- If Docker-specific: Add Docker build debugging
- If CI-only: Investigate environment differences

**Regression Prevention:**

- Document the fix in implementation notes
- Add comments in tsup.config.ts about why no alias needed
- Consider adding Docker build to local pre-commit hooks

## Test Execution Order

**Recommended sequence:**

1. **Phase 1 - Local Tests** (5-10 min)
    - Run Test 1.1 - 1.4 (package builds)
    - Run Test 2.1 - 2.3 (type checking)
    - If any fail: Stop and debug

2. **Phase 2 - Development Tests** (5 min)
    - Run Test 4.1 - 4.3 (dev server and HMR)
    - Run MT-2, MT-3 (manual dev testing)
    - Verify no regression

3. **Phase 3 - Docker Tests** (10-15 min, optional if Docker unavailable)
    - Run Test 3.1 - 3.3 (Docker builds)
    - Run MT-4 (build artifacts inspection)
    - If fails: Check logs, proceed to CI anyway

4. **Phase 4 - CI/CD Tests** (15-20 min)
    - Commit and push changes
    - Run Test 5.1 (PR validation)
    - Run MT-5 (CI logs review)
    - If fails: Investigate actual error messages

## Sign-off Criteria

**Ready to merge when:**

- ✅ All local builds pass
- ✅ Type checking passes
- ✅ Development workflow works (HMR verified)
- ✅ Docker build succeeds OR CI/CD build succeeds
- ✅ No console errors in running application
- ✅ Manual testing checklist complete
- ✅ Documentation updated
- ✅ No breaking changes

**Acceptable to merge with:**

- ⚠️ Docker tests skipped (if Docker not available locally, rely on CI)
- ⚠️ Minor warnings in build output (if not blocking)

**Must not merge if:**

- ❌ CI/CD pipeline fails
- ❌ Type checking errors
- ❌ Development workflow broken
- ❌ Runtime errors in application
