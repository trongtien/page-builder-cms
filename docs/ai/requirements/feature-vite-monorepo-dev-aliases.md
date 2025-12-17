---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
feature: vite-monorepo-dev-aliases
---

# Requirements & Problem Understanding

## Problem Statement

**What problem are we solving?**

Currently, the Vite configurations in `host-root` and `render-root` do not properly resolve monorepo workspace packages (`@page-builder/*`) to their source files during local development. This creates several issues:

- **Slow HMR (Hot Module Replacement)**: Changes to workspace packages like `@page-builder/core-ui` or `@page-builder/core-utils` require a full rebuild before the consuming apps see the updates
- **Poor debugging experience**: Developers cannot step through TypeScript source code when debugging; instead they're forced to debug transpiled/bundled dist files
- **Inconsistent development workflow**: The current setup with `optimizeDeps.exclude` and watch ignored patterns is incomplete and doesn't provide the smooth DX expected in a monorepo

**Who is affected by this problem?**

All developers working on this monorepo locally, particularly those:

- Making simultaneous changes to shared packages and consuming apps
- Debugging issues that span multiple packages
- Developing new UI components in `@page-builder/core-ui`
- Adding utility functions in `@page-builder/core-utils`

**What is the current situation/workaround?**

Current workaround involves:

1. Making changes to a workspace package (e.g., `core-ui`)
2. Waiting for the package to rebuild (via `tsup --watch`)
3. Triggering a manual refresh or waiting for Vite to detect the dist file change
4. This creates a multi-second delay and breaks the instant feedback loop

## Goals & Objectives

**What do we want to achieve?**

### Primary goals

- Configure Vite to resolve all `@page-builder/*` packages to their TypeScript source files (`src/`) instead of built dist files during development
- Enable instant HMR when making changes to any workspace package
- Allow direct debugging of TypeScript source code across package boundaries
- Follow industry best practices (as demonstrated by n8n's monorepo setup)

### Secondary goals

- Maintain production build integrity (source aliases only in dev mode)
- Keep the configuration maintainable and easy to extend for new packages
- Document the pattern for future package additions

### Non-goals (what's explicitly out of scope)

- Modifying the build/production behavior (aliases are dev-only)
- Changing the package build process (tsup, etc.)
- Altering the workspace structure or package naming conventions
- Affecting external dependencies (only internal `@page-builder/*` packages)

## User Stories & Use Cases

**How will users interact with the solution?**

1. **As a developer**, I want changes in `@page-builder/core-ui` source files to hot-reload instantly in `host-root` without rebuilding, so I can iterate faster on UI components

2. **As a developer**, I want to set breakpoints and debug into the TypeScript source of `@page-builder/core-utils` directly from `host-root`, so I can trace issues across package boundaries

3. **As a developer**, I want consistent behavior where all internal packages resolve to their `src` folders during development, so I don't need to think about build steps while coding

4. **As a developer**, I want to add a new `@page-builder/core-*` package and have it automatically work with HMR through the existing Vite configuration pattern

### Key workflows and scenarios

- **Workflow 1**: Developer opens `host-root` in dev mode, edits a button component in `core-ui/src`, sees changes instantly in the browser
- **Workflow 2**: Developer encounters a bug, sets breakpoint in `host-root`, steps into a utility function in `core-utils/src/index.ts` and sees readable TS source
- **Workflow 3**: Developer works on both `render-root` and `core-ui` simultaneously with two browser tabs open, both receiving instant HMR updates

### Edge cases to consider

- Packages with CSS/style exports (`core-ui` exports `dist/index.css`)
- Packages with multiple entry points or exports
- Config packages that might not have a `src` folder (e.g., `@page-builder/config-*`)
- Ensuring TypeScript path mapping doesn't conflict with Vite resolve aliases

## Success Criteria

**How will we know when we're done?**

### Measurable outcomes

- [ ] HMR cycle time for workspace package changes < 500ms (currently several seconds)
- [ ] Debugger shows TypeScript source files with correct line numbers for all `@page-builder/*` imports
- [ ] Both `host-root` and `render-root` vite configs include source resolution aliases
- [ ] No console errors or warnings related to module resolution
- [ ] Production builds remain unchanged (use dist files as before)

### Acceptance criteria

- [ ] Edit a component in `packages/core/ui/src/common/Button.tsx`
- [ ] See the change reflected in `host-root` browser without manual rebuild
- [ ] Set breakpoint in `host-root`, step into `@page-builder/core-utils` function, view source code
- [ ] Run `pnpm build` successfully with no resolution errors
- [ ] Verify built output uses dist files, not source files

### Performance benchmarks

- HMR update time: Target < 500ms (currently 3-5 seconds with rebuild)
- Initial dev server startup time: Should not increase significantly (acceptable if < 2s increase)

## Constraints & Assumptions

**What limitations do we need to work within?**

### Technical constraints

- Must work with existing pnpm workspace setup
- Must not break production builds
- Must be compatible with existing Vite plugins (TanStack Router, React, etc.)
- Must work on Windows (user's current OS)
- TypeScript path resolution and Vite resolution must be compatible

### Business constraints

- Zero downtime for ongoing development work
- Must be implementable without major refactoring

### Time/budget constraints

- Should be implementable in a single development session
- No external dependencies or tools required

### Assumptions we're making

- All `@page-builder/core-*` packages follow the convention of having TypeScript source in `src/`
- Config packages (`@page-builder/config-*`) don't need source resolution (they export configs directly)
- The pattern from n8n's monorepo is directly applicable to this project structure
- tsup/build processes will continue to work independently

## Questions & Open Items

**What do we still need to clarify?**

### Unresolved questions

- ~~Should config packages also be aliased to source?~~ → No, they're not actively developed in the same way
- ~~Do we need regex patterns or explicit aliases?~~ → Use regex patterns like n8n for scalability
- How do we handle CSS file imports from `@page-builder/core-ui/dist/index.css`? → Keep explicit for styles

### Items requiring stakeholder input

- None at this time (developer-driven improvement)

### Research needed

- [ ] Test if Vite's `resolve.alias` with regex works identically on Windows and Unix paths
- [ ] Verify that TanStack Router plugin doesn't interfere with custom resolve aliases
- [ ] Check if any special handling needed for `.css` file imports
