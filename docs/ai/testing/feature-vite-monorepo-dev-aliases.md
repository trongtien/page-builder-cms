---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
feature: vite-monorepo-dev-aliases
---

# Testing Strategy

## Test Coverage Goals

**What level of testing do we aim for?**

This is a configuration feature, so testing focuses on:

- **Manual functional testing**: Verify HMR works correctly with source resolution
- **Integration testing**: Ensure dev server and production builds work as expected
- **Cross-platform verification**: Confirm path resolution works on Windows (user's OS)
- **Regression testing**: Ensure existing functionality remains intact

**No unit tests required** - this is pure configuration with no testable code logic.

**Coverage target**: 100% of use cases and scenarios validated manually.

## Configuration Verification Tests

### Test Group 1: Path Resolution

**Test 1.1: Verify packagesDir resolves correctly**

- [ ] Add `console.log(packagesDir)` temporarily to vite.config.ts
- [ ] Start dev server
- [ ] Verify logged path ends with `packages` directory
- [ ] Remove console.log
- **Expected**: Absolute path to workspace packages root
- **Status**: ⏳ Pending

**Test 1.2: Verify alias objects are well-formed**

- [ ] Add `console.log(developmentAliases)` temporarily
- [ ] Start dev server in development mode
- [ ] Verify output shows array with 2 objects containing `find` (RegExp) and `replacement` (string)
- [ ] Remove console.log
- **Expected**: Array of alias configurations with correct structure
- **Status**: ⏳ Pending

**Test 1.3: Verify conditional mode application**

- [ ] Start dev server (`pnpm dev`) and check aliases are applied
- [ ] Run production build (`pnpm build`) and verify no source path references in output
- **Expected**: Aliases only active in development
- **Status**: ⏳ Pending

## Hot Module Replacement Tests

### Test Group 2: HMR Functionality (host-root)

**Test 2.1: Edit core-ui component and observe HMR**

- [ ] Start host-root dev server: `pnpm --filter @page-builder/host-root dev`
- [ ] Open browser to localhost:3000
- [ ] Locate a visible UI component from core-ui (e.g., Button)
- [ ] Edit `packages/core/ui/src/common/Button.tsx` - change background color or text
- [ ] Observe browser updates without manual refresh
- [ ] Measure time from file save to visible update
- **Expected**:
    - ✅ Change appears in browser without refresh
    - ✅ Update time < 500ms
    - ✅ No console errors
- **Status**: ⏳ Pending
- **Measured HMR time**: \_\_\_ ms

**Test 2.2: Edit core-utils function and observe HMR**

- [ ] With host-root dev server running
- [ ] Find a utility function used in host-root
- [ ] Edit `packages/core/utils/src/index.ts` or a specific util file
- [ ] Observe browser updates
- **Expected**:
    - ✅ Change reflected immediately
    - ✅ No errors about module not found
- **Status**: ⏳ Pending

**Test 2.3: Test subpath imports**

- [ ] Temporarily add direct subpath import in host-root:
    ```typescript
    import { Button } from "@page-builder/core-ui/common/Button";
    ```
- [ ] Verify dev server resolves the import correctly
- [ ] Edit the Button.tsx file
- [ ] Verify HMR still works
- [ ] Remove the test import
- **Expected**: Subpath imports resolve to source files correctly
- **Status**: ⏳ Pending

### Test Group 3: HMR Functionality (render-root)

**Test 3.1: Edit core-ui component in render-root context**

- [ ] Start render-root dev server: `pnpm --filter @page-builder/render-root dev`
- [ ] Open browser to localhost:4000
- [ ] Locate a visible UI component from core-ui
- [ ] Edit the component source file
- [ ] Observe browser updates without manual refresh
- [ ] Measure time from file save to visible update
- **Expected**:
    - ✅ Change appears in browser without refresh
    - ✅ Update time < 500ms
    - ✅ No console errors
- **Status**: ⏳ Pending
- **Measured HMR time**: \_\_\_ ms

**Test 3.2: Simultaneous multi-app HMR**

- [ ] Start both host-root and render-root dev servers
- [ ] Open localhost:3000 in one browser tab
- [ ] Open localhost:4000 in another browser tab
- [ ] Edit a shared core-ui component
- [ ] Verify both browser tabs update simultaneously
- **Expected**: Changes propagate to all consuming apps via HMR
- **Status**: ⏳ Pending

## Debugging Experience Tests

### Test Group 4: Source Debugging

**Test 4.1: Set breakpoint in workspace package source**

- [ ] Start host-root dev server
- [ ] Open Chrome DevTools
- [ ] Navigate to Sources tab
- [ ] Locate `packages/core/utils/src/` in the file tree
- [ ] Set a breakpoint in a utility function
- [ ] Trigger the function from the app
- [ ] Verify breakpoint hits and shows TypeScript source code
- **Expected**:
    - ✅ Source files appear in DevTools Sources tab
    - ✅ Breakpoints hit correctly
    - ✅ Source code is readable TypeScript, not transpiled
    - ✅ Line numbers match actual source file
- **Status**: ⏳ Pending

**Test 4.2: Step through cross-package code**

- [ ] With breakpoint set in core-utils
- [ ] Step into/over/out using DevTools
- [ ] Verify navigation between host-root and core-utils source is smooth
- [ ] Check stack traces show correct file paths and line numbers
- **Expected**: Debugging experience is seamless across package boundaries
- **Status**: ⏳ Pending

## Production Build Tests

### Test Group 5: Build Integrity

**Test 5.1: host-root production build**

- [ ] Run: `pnpm --filter @page-builder/host-root build`
- [ ] Verify build completes without errors
- [ ] Inspect `packages/host-root/dist/` output
- [ ] Search for any references to `/src/` paths in bundled files
- [ ] Verify chunks only reference dist files or are fully inlined
- **Expected**:
    - ✅ Build succeeds
    - ✅ No source path references in output
    - ✅ Bundle size comparable to before (no significant increase)
- **Status**: ⏳ Pending

**Test 5.2: render-root production build**

- [ ] Run: `pnpm --filter @page-builder/render-root build`
- [ ] Verify build completes without errors
- [ ] Inspect `packages/render-root/dist/` output
- [ ] Search for any references to `/src/` paths in bundled files
- **Expected**:
    - ✅ Build succeeds
    - ✅ No source path references in output
- **Status**: ⏳ Pending

**Test 5.3: Production preview mode**

- [ ] After building host-root, run: `pnpm --filter @page-builder/host-root preview`
- [ ] Open the preview URL
- [ ] Verify app functions correctly
- [ ] Check DevTools console for errors
- **Expected**: Production build runs correctly with no module resolution errors
- **Status**: ⏳ Pending

## Regression Tests

### Test Group 6: Existing Functionality

**Test 6.1: Verify existing aliases still work**

- [ ] Test imports using `@/` alias (e.g., `import X from '@/components/Y'`)
- [ ] Test imports using `@/features`, `@/hooks`, etc.
- [ ] Verify all existing path aliases resolve correctly
- **Expected**: No regressions in existing alias functionality
- **Status**: ⏳ Pending

**Test 6.2: Verify TanStack Router plugin compatibility**

- [ ] Start dev server
- [ ] Navigate between routes
- [ ] Verify route generation still works (`routeTree.gen.ts` is updated)
- [ ] Check that routing functionality is unaffected
- **Expected**: No interference between custom aliases and router plugin
- **Status**: ⏳ Pending

**Test 6.3: Verify CSS imports still work**

- [ ] Ensure `@page-builder/core-ui/dist/index.css` imports are unchanged
- [ ] Start dev server
- [ ] Verify styles are applied correctly
- [ ] Check that no CSS module resolution errors occur
- **Expected**: CSS imports continue to work as before
- **Status**: ⏳ Pending

**Test 6.4: Verify optimizeDeps configuration**

- [ ] Check dev server console on startup
- [ ] Verify pre-bundling behavior (should still exclude @page-builder/core-\*)
- [ ] No new warnings or errors related to dependencies
- **Expected**: optimizeDeps config works harmoniously with aliases
- **Status**: ⏳ Pending

## Test Data

**What data do we use for testing?**

### Test fixtures and mocks:

- No special fixtures required
- Use existing UI components and utilities in the workspace

### Seed data requirements:

- Workspace must be built at least once: `pnpm build`
- Source files must exist in `packages/core/ui/src/` and `packages/core/utils/src/`

### Test environment setup:

```bash
# Ensure clean state
pnpm install

# Build workspace packages once
pnpm --filter "@page-builder/core-*" build

# Ready to test dev servers
pnpm --filter @page-builder/host-root dev
pnpm --filter @page-builder/render-root dev
```

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Coverage commands:

Not applicable (configuration feature, no code coverage)

### Manual test results:

| Test Group        | Total Tests | Passed | Failed | Pending |
| ----------------- | ----------- | ------ | ------ | ------- |
| Path Resolution   | 3           | 0      | 0      | 3       |
| HMR (host-root)   | 3           | 0      | 0      | 3       |
| HMR (render-root) | 2           | 0      | 0      | 2       |
| Source Debugging  | 2           | 0      | 0      | 2       |
| Build Integrity   | 3           | 0      | 0      | 3       |
| Regression        | 4           | 0      | 0      | 4       |
| **TOTAL**         | **17**      | **0**  | **0**  | **17**  |

### Performance benchmarks measured:

- HMR cycle time (host-root): \_\_\_ ms (target: <500ms)
- HMR cycle time (render-root): \_\_\_ ms (target: <500ms)
- Dev server startup time increase: \_\_\_ ms (acceptable if <2s)
- Production build time change: \_\_\_ ms (should be ~0)

### Test sign-off:

- [ ] All functional tests passed
- [ ] No regressions detected
- [ ] Performance targets met
- [ ] Production builds verified safe
- [ ] Documentation updated with results

## Manual Testing Checklist

**What requires human validation?**

### Developer Experience Validation:

- [ ] HMR feels instant when editing workspace packages
- [ ] No noticeable lag or delay in feedback loop
- [ ] Console is free of warnings/errors during development
- [ ] Debugging experience is improved (can see TypeScript source)
- [ ] No workarounds or rebuilds needed during development

### Cross-Platform Validation (Windows):

- [ ] Paths resolve correctly on Windows
- [ ] No path separator issues (`/` vs `\`)
- [ ] No case sensitivity issues
- [ ] File watching works correctly

### Browser Compatibility:

- [ ] Tested in Chrome/Edge (primary)
- [ ] No browser-specific module resolution issues
- [ ] DevTools show source maps correctly

## Bug Tracking

**How do we manage issues?**

### Issue tracking process:

If issues are discovered during testing:

1. Document the issue in this file under "Known Issues" section
2. Determine if it's a blocker or can be addressed post-implementation
3. Create a GitHub issue if it requires follow-up work
4. Update the relevant test status to "Failed" with details

### Bug severity levels:

- **Critical**: Breaks existing functionality or prevents deployment → Must fix before commit
- **High**: Aliases don't work as expected → Must fix before commit
- **Medium**: Edge case or minor issue → Document and address if time allows
- **Low**: Nice-to-have improvement → Document for future enhancement

### Regression testing strategy:

- Run all regression tests (Group 6) before marking feature complete
- If regression found, fix immediately and re-test all affected areas
- Document any workarounds or compromises made

## Known Issues

(This section will be populated during testing)

- None yet

## Test Results Summary

(This section will be updated after testing is complete)

**Overall Status**: ⏳ Testing not yet started

**Ready for production**: ❌ Pending test completion
