---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
feature: vite-monorepo-dev-aliases
---

# Implementation Guide

## Development Setup

**How do we get started?**

### Prerequisites and dependencies:

- Node.js and pnpm already installed
- Workspace packages built at least once (tsup has generated dist files)
- VS Code or terminal for editing vite configs

### Environment setup steps:

1. Ensure you're in the project root: `c:\Users\base\Documents\kevid\page-builder-cms`
2. Ensure workspace dependencies are installed: `pnpm install`
3. Build workspace packages once: `pnpm build` (or `pnpm --filter "@page-builder/core-*" build`)

### Configuration needed:

- No environment variables required
- No additional dependencies to install
- Pure configuration change

## Code Structure

**How is the code organized?**

### Files to modify:

```
packages/
├── host-root/
│   └── vite.config.ts      # Update with source aliases
└── render-root/
    └── vite.config.ts      # Update with source aliases
```

### Module organization:

Both configs follow similar patterns:

- Import statements at top
- Configuration object exported via `defineConfig`
- Plugins array
- Resolve section (where aliases go)
- Server/build configurations

## Implementation Notes

**Key technical details to remember:**

### Core Feature: Source Resolution Aliases

#### Step 1: Define packagesDir constant

Add near the top of both vite.config.ts files (after imports):

```typescript
const packagesDir = path.resolve(__dirname, "..", "..");
```

This resolves to the workspace root `packages/` directory regardless of which package's config is running.

#### Step 2: Create alias configuration array

Define aliases using regex patterns for flexible subpath matching:

```typescript
const developmentAliases = [
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

**Pattern explanation:**

- `find`: Regex that matches the package name and captures any subpath in group `$1`
    - `@page-builder/core-ui` matches and `$1 = ''`
    - `@page-builder/core-ui/common/Button` matches and `$1 = '/common/Button'`
- `replacement`: Absolute path to source, appending captured subpath
    - Uses `path.resolve` for cross-platform compatibility
    - `src$1` concatenates 'src' with the captured subpath

#### Step 3: Update resolve.alias configuration

Modify the `defineConfig` to use a function form that receives `{ mode }`:

**For host-root:**

```typescript
export default defineConfig(({ mode }) => ({
    plugins: [
        /* existing plugins */
    ],
    resolve: {
        alias: [
            // Add development aliases first (only in dev mode)
            ...(mode === "development" ? developmentAliases : []),
            // Existing aliases
            {
                find: "@",
                replacement: path.resolve(__dirname, "./src")
            }
            // ... other existing aliases
        ]
    }
    // ... rest of config
}));
```

**For render-root:**

```typescript
export default defineConfig(({ mode }) => ({
    plugins: [
        /* existing plugins */
    ],
    resolve: {
        alias: [
            // Add development aliases first (only in dev mode)
            ...(mode === "development" ? developmentAliases : []),
            // Existing aliases
            {
                find: "@",
                replacement: path.resolve(__dirname, "./app")
            },
            {
                find: "~",
                replacement: path.resolve(__dirname, "./app")
            }
        ]
    }
    // ... rest of config
}));
```

#### Key Implementation Details:

1. **Mode conditional**: `mode === 'development'` ensures aliases only apply during `vite` or `vite dev`, not during `vite build`
2. **Spread operator**: `...(condition ? array : [])` cleanly inserts aliases when in dev mode
3. **Order matters**: Development aliases come first so they take precedence
4. **Preserve existing config**: All other configuration remains unchanged

### Patterns & Best Practices

#### Cross-platform path handling:

```typescript
// ✅ Correct - works on Windows and Unix
path.resolve(packagesDir, "core", "ui", "src$1")
// ❌ Incorrect - breaks on Windows
`${packagesDir}/core/ui/src$1`;
```

#### Regex pattern structure:

```typescript
// ✅ Correct - captures subpath
/^@page-builder\/core-ui(.*)$/

// ❌ Incorrect - doesn't capture subpath
/^@page-builder\/core-ui$/
```

#### Conditional array spreading:

```typescript
// ✅ Correct - empty array when false
...(mode === 'development' ? developmentAliases : [])

// ❌ Incorrect - would insert undefined
...(mode === 'development' ? developmentAliases : undefined)
```

### Common Utilities/Helpers

Since both configs use the same pattern, you could extract to a shared utility if desired:

```typescript
// packages/config/vite/aliases.ts (optional future enhancement)
export const createDevelopmentAliases = (packagesDir: string) => [
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

**For this implementation, inline definitions are sufficient** - extract only if adding more packages in the future.

## Integration Points

**How do pieces connect?**

### Vite Dev Server ↔ Workspace Packages

```
[Browser]
   ↓ (HTTP)
[Vite Dev Server on port 3000/4000]
   ↓ (import resolution)
[Alias Resolution Layer]
   ↓ (resolves to source)
[packages/core/ui/src/index.ts] ← TypeScript source files
   ↓ (esbuild transform)
[Browser] ← Transformed ESM modules
```

### Hot Module Replacement Flow

```
[Developer edits packages/core/ui/src/common/Button.tsx]
   ↓
[Vite watcher detects change]
   ↓
[Alias maps @page-builder/core-ui to source]
   ↓
[Vite transforms only the changed file]
   ↓
[HMR WebSocket pushes update to browser]
   ↓
[React Fast Refresh updates component in <500ms]
```

### Production Build Flow (aliases disabled)

```
[vite build command]
   ↓
[mode = 'production']
   ↓
[developmentAliases NOT applied]
   ↓
[@page-builder/core-ui resolves to dist/index.js]
   ↓
[Rollup bundles pre-built packages normally]
```

## Error Handling

**How do we handle failures?**

### Missing source files

If a source file is missing (e.g., package not set up correctly):

```
Error: Failed to resolve import "@page-builder/core-ui/missing-file"
```

**Solution**: Ensure the source file exists, or the package's `src/` structure is correct

### Path resolution errors (Windows)

If paths use wrong separators:

```
Error: ENOENT: no such file or directory
```

**Solution**: Always use `path.resolve()`, never string concatenation with `/` or `\\`

### TypeScript errors in source files

With source resolution, TypeScript errors in workspace packages will show up in the consuming app's dev server:

```
✘ [ERROR] Type 'X' is not assignable to type 'Y'
  packages/core/ui/src/common/Button.tsx:45:12
```

**This is expected and helpful** - fix the error in the source package

### Fallback strategy

If issues occur, revert by:

1. Remove the development aliases from vite configs
2. Restart dev servers
3. Workspace packages will fall back to using dist files

## Performance Considerations

**How do we keep it fast?**

### Optimization strategies:

- **Source resolution is faster than dist resolution** because Vite can cache and transform individual files
- Regex matching is extremely fast (microseconds)
- No additional file I/O beyond what Vite already does

### Caching approach:

- Vite's internal module cache works with source files
- Browser cache works normally
- No special caching configuration needed

### Query optimization:

Not applicable (no database queries)

### Resource management:

- Development aliases don't increase memory usage
- May slightly increase initial module graph size (more files tracked)
- Net benefit: faster HMR cycles offset any small overhead

### Expected performance improvement:

- **Before**: 3-5 second rebuild cycle when editing workspace packages
- **After**: <500ms HMR cycle (instant feedback)
- **Savings**: ~85-90% reduction in iteration time

## Security Notes

**What security measures are in place?**

### Authentication/authorization:

Not applicable (local development feature)

### Input validation:

- Vite validates import paths
- Regex patterns are hardcoded (no user input)
- No injection vulnerabilities

### Data encryption:

Not applicable (no data transmission)

### Secrets management:

Not applicable (no secrets involved)

### Security considerations:

- Development aliases are never active in production builds
- Source files are never exposed in production artifacts
- No security implications beyond normal development workflow

---

## Quick Reference: Complete Configuration Example

### host-root/vite.config.ts (final structure)

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

const packagesDir = path.resolve(__dirname, "..", "..");

const developmentAliases = [
    {
        find: /^@page-builder\/core-ui(.*)$/,
        replacement: path.resolve(packagesDir, "core", "ui", "src$1")
    },
    {
        find: /^@page-builder\/core-utils(.*)$/,
        replacement: path.resolve(packagesDir, "core", "utils", "src$1")
    }
];

export default defineConfig(({ mode }) => ({
    plugins: [
        tanstackRouter({
            routesDirectory: "./src/routes",
            generatedRouteTree: "./src/routeTree.gen.ts",
            quoteStyle: "single"
        }),
        react()
    ],
    resolve: {
        alias: [
            ...(mode === "development" ? developmentAliases : []),
            { find: "@", replacement: path.resolve(__dirname, "./src") },
            { find: "@/components", replacement: path.resolve(__dirname, "./src/components") },
            { find: "@/features", replacement: path.resolve(__dirname, "./src/features") },
            { find: "@/hooks", replacement: path.resolve(__dirname, "./src/hooks") },
            { find: "@/services", replacement: path.resolve(__dirname, "./src/services") },
            { find: "@/types", replacement: path.resolve(__dirname, "./src/types") },
            { find: "@/routes", replacement: path.resolve(__dirname, "./src/routes") }
        ]
    }
    // ... rest of existing config
}));
```
