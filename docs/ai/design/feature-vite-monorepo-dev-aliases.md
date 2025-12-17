---
phase: design
title: System Design & Architecture
description: Define the technical architecture, components, and data models
feature: vite-monorepo-dev-aliases
---

# System Design & Architecture

## Architecture Overview

**What is the high-level system structure?**

```mermaid
graph TD
    A[host-root dev server] -->|imports| B[@page-builder/core-ui]
    A -->|imports| C[@page-builder/core-utils]
    D[render-root dev server] -->|imports| B
    D -->|imports| C

    B -->|Vite alias| E[packages/core/ui/src/**/*.tsx]
    C -->|Vite alias| F[packages/core/utils/src/**/*.ts]

    G[Production Build] -->|uses| H[@page-builder/core-ui/dist]
    G -->|uses| I[@page-builder/core-utils/dist]

    style E fill:#90EE90
    style F fill:#90EE90
    style H fill:#FFB6C1
    style I fill:#FFB6C1
```

**Key components and their responsibilities:**

1. **Vite Resolve Aliases** (both vite configs)
    - Map `@page-builder/core-*` imports to source directories during development
    - Use regex patterns to capture subpath imports (e.g., `@page-builder/core-ui/common/Button`)
    - Apply only in development mode via conditional logic

2. **host-root/vite.config.ts**
    - Add source resolution for all `@page-builder/core-*` packages
    - Maintain existing configuration (TanStack Router, optimizeDeps, etc.)
3. **render-root/vite.config.ts**
    - Mirror the same alias pattern for consistency
    - Keep consistent with host-root approach

**Technology stack choices and rationale:**

- **Vite `resolve.alias`**: Built-in Vite feature, zero dependencies, well-tested
- **Regex patterns**: Follow n8n's approach for maintainability and auto-matching future packages
- **Conditional dev-only aliases**: Ensures production builds remain untouched

## Data Models

Not applicable - this is a build configuration feature with no runtime data models.

## API Design

**How do components communicate?**

This feature modifies the module resolution at build/dev time. The "API" is the import statements:

### Before (current behavior):

```typescript
// In host-root/src/App.tsx
import { Button } from "@page-builder/core-ui";
// Resolves to: packages/core/ui/dist/index.js (bundled, transpiled)
```

### After (with aliases):

```typescript
// In host-root/src/App.tsx
import { Button } from "@page-builder/core-ui";
// Resolves to: packages/core/ui/src/index.ts (source TypeScript)

// Subpath imports also work
import { Button } from "@page-builder/core-ui/common/Button";
// Resolves to: packages/core/ui/src/common/Button.tsx
```

### CSS imports remain explicit:

```typescript
import "@page-builder/core-ui/dist/index.css";
// No alias - continues to use built CSS file
```

## Component Breakdown

**What are the major building blocks?**

### 1. Alias Configuration Object

Located in: `host-root/vite.config.ts` and `render-root/vite.config.ts`

```typescript
const packagesDir = path.resolve(__dirname, "..", "..");

const alias = [
    {
        find: /^@page-builder\/core-ui(.*)$/,
        replacement: path.resolve(packagesDir, "core", "ui", "src$1")
    },
    {
        find: /^@page-builder\/core-utils(.*)$/,
        replacement: path.resolve(packagesDir, "core", "utils", "src$1")
    }
];
```

**Key aspects:**

- `find`: Regex capturing the package name and any subpath (`$1`)
- `replacement`: Absolute path to the source directory, appending the captured subpath
- Uses `path.resolve` for cross-platform compatibility (Windows/Unix)

### 2. Conditional Application

Only apply aliases in development mode:

```typescript
export default defineConfig(({ mode }) => ({
    resolve: {
        alias: mode === "development" ? [...alias, ...existingAliases] : existingAliases
    }
    // ... rest of config
}));
```

### 3. Existing Configurations

Must preserve all existing settings:

- TanStack Router plugin configuration
- React plugin
- Existing path aliases (`@`, `@/components`, etc.)
- optimizeDeps settings
- server/build configurations

## Design Decisions

**Why did we choose this approach?**

### Decision 1: Regex patterns vs. explicit aliases

**Chosen:** Regex patterns (like n8n)
**Rationale:**

- Automatically handles subpath imports without listing every possible path
- More maintainable as packages grow
- Future-proof for new packages matching the pattern
- Single source of truth per package

**Alternative considered:** Explicit aliases for each subpath

- Would require updating config for every new file/folder
- Less maintainable

### Decision 2: Dev-only aliases via mode check

**Chosen:** Conditional based on Vite mode
**Rationale:**

- Production builds must use dist files (ensures optimization, tree-shaking work correctly)
- Source files aren't deployed to production
- Clear separation of concerns

**Alternative considered:** Separate config files for dev/prod

- More complex file structure
- Harder to maintain consistency

### Decision 3: Path resolution approach

**Chosen:** Use `path.resolve` with relative path navigation
**Rationale:**

- Works on both Windows and Unix systems
- Provides absolute paths (required by Vite)
- Mirrors the working n8n implementation

**Alternative considered:** String concatenation

- Fragile across platforms
- Error-prone

### Decision 4: CSS file handling

**Chosen:** Keep explicit imports to `dist/index.css`
**Rationale:**

- CSS files are already processed by the package build (PostCSS, Tailwind)
- No benefit to resolving to source SCSS/CSS
- Simpler mental model

**Alternative considered:** Alias CSS to source

- Would require additional Vite CSS processing configuration
- Unnecessary complexity

## Non-Functional Requirements

**How should the system perform?**

### Performance targets

- **HMR update latency**: < 500ms for source file changes in workspace packages
- **Initial dev server startup**: Should not increase by more than 2 seconds
- **Production build time**: No change (aliases not active)

### Scalability considerations

- Pattern should work for 10+ `@page-builder/*` packages without config changes
- Regex patterns scale better than explicit aliases

### Security requirements

- No security implications (dev-time only feature)
- Source code is already accessible to developers

### Reliability/availability needs

- Must not break existing functionality
- Should degrade gracefully if source file is missing (Vite will show clear error)
- No impact on production stability

## Implementation Approach

### File changes required:

1. `packages/host-root/vite.config.ts` - Add alias configuration
2. `packages/render-root/vite.config.ts` - Add alias configuration

### Configuration structure:

```typescript
// Shared pattern (could be extracted to a util if needed in future)
const createPackageAliases = (packagesDir: string) => [
    {
        find: /^@page-builder\/core-ui(.*)$/,
        replacement: path.resolve(packagesDir, "core", "ui", "src$1")
    },
    {
        find: /^@page-builder\/core-utils(.*)$/,
        replacement: path.resolve(packagesDir, "core", "utils", "src$1")
    }
];
```

### Integration with existing configs:

- Insert aliases before existing alias definitions
- Use spread operator to maintain existing aliases
- Wrap in development mode conditional
