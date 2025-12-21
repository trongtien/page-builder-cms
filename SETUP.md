# Setup Instructions

## Docker Development Setup (Recommended)

### Prerequisites

- **Docker Desktop 24.0+** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Docker Compose v2** (included with Docker Desktop)
- **8GB RAM minimum** (16GB recommended)
- **20GB free disk space**

### Quick Start with Docker

The easiest way to get started is using Docker:

```powershell
# Start all services (database, host-root, render-root)
pnpm docker:dev:up

# View logs
pnpm docker:dev:logs

# Stop all services
pnpm docker:dev:down

# Clean up (removes volumes - fresh start)
pnpm docker:dev:clean
```

**Access the applications:**

- Host Root: http://localhost:3000
- Render Root: http://localhost:3001
- PostgreSQL: localhost:5432 (user: postgres, password: postgres)

**Features:**

- ✅ Hot-reload for both frontends
- ✅ PostgreSQL 18 database with sample data
- ✅ All dependencies pre-installed in containers
- ✅ Automatic database initialization
- ✅ Isolated development environment

### Docker Commands

| Command                   | Description                               |
| ------------------------- | ----------------------------------------- |
| `pnpm docker:dev:up`      | Start all services in background          |
| `pnpm docker:dev:down`    | Stop all services                         |
| `pnpm docker:dev:logs`    | Follow logs from all services             |
| `pnpm docker:dev:clean`   | Stop and remove all volumes (fresh start) |
| `pnpm docker:dev:build`   | Rebuild Docker images                     |
| `pnpm docker:dev:restart` | Restart all services                      |

### Troubleshooting Docker

**Port Already in Use:**

```powershell
# Stop containers using the ports
npx kill-port 3000 3001 5432
# Or change ports in .containers/dev/docker-compose.yml
```

**Hot Reload Not Working on Windows:**

- Ensure Docker Desktop has access to your drive
- If using WSL2, run from WSL2 terminal
- Files must be in a location Docker can access

**Database Connection Issues:**

- Wait for database health check to pass (~30 seconds)
- Check logs: `pnpm docker:dev:logs database`
- Connect manually: `docker exec -it pagebuilder-db psql -U postgres -d pagebuilder`

## What Has Been Created

### ✅ Turborepo Monorepo Structure

```
page-builder-cms/
├── packages/
│   ├── app/              # React application with TanStack Router
│   ├── ui/               # Shared UI components (Button, Card, Loading)
│   ├── utils/            # Shared utilities (60+ functions)
│   └── tsconfig/         # Shared TypeScript configurations
├── turbo.json            # Turborepo pipeline config
├── pnpm-workspace.yaml   # Workspace configuration
├── .prettierrc           # Code formatting rules
├── .eslintrc.json        # Linting rules
└── Documentation files
```

### ✅ Shared Packages (Eliminating Code Duplication)

**@page-builder/utils** - Comprehensive utility library:

- ✅ Date utilities (formatDate, formatRelativeTime)
- ✅ String utilities (truncate, capitalize, slugify, camelCase, kebabCase)
- ✅ Async utilities (delay, debounce, throttle, retry)
- ✅ Object utilities (deepClone, deepMerge, pick, omit)
- ✅ Array utilities (unique, groupBy, chunk, shuffle)
- ✅ Number utilities (uuid, clamp, randomNumber, roundTo)
- ✅ Validation utilities (isValidEmail, isValidUrl, isEmpty)

**@page-builder/ui** - Shared component library:

- ✅ Button (variants: primary, secondary, danger, ghost)
- ✅ Card (with title, subtitle, hoverable)
- ✅ Loading/Spinner (with size variants)

**@page-builder/tsconfig** - Shared TypeScript configs:

- ✅ base.json (base configuration)
- ✅ react.json (React-specific)
- ✅ node.json (Node.js-specific)

### ✅ App Structure (Clean Architecture)

```
packages/app/src/
├── components/
│   ├── ui/              # Re-exports from @page-builder/ui
│   └── common/          # App-specific components
├── features/
│   └── users/           # Example feature module
│       ├── components/  # UserCard
│       ├── hooks/       # useUsers
│       ├── services/    # userService
│       └── types/       # User types
├── hooks/               # Shared hooks (useDebounce, useAsync)
├── routes/              # TanStack Router pages
├── services/            # API service layer
└── types/               # Global types
```

### ✅ Configuration Files

- ✅ Turborepo pipeline (build, dev, lint, type-check)
- ✅ ESLint (TypeScript rules)
- ✅ Prettier (code formatting)
- ✅ TypeScript (strict mode, path aliases)
- ✅ Vite (React, HMR, path resolution)
- ✅ VS Code settings (recommended extensions, format on save)

### ✅ Documentation

- ✅ README.md (comprehensive project overview)
- ✅ ARCHITECTURE.md (detailed architecture explanation)
- ✅ GETTING_STARTED.md (quick start guide)
- ✅ CONTRIBUTING.md (development guidelines)

## 🚀 Installation Steps

### Step 1: Install Dependencies

```powershell
# Make sure you're in the project root
cd c:\Users\base\Documents\kevid\page-builder-cms

# Install all dependencies
pnpm install
```

This will:

- Install all dependencies for all packages
- Link workspace packages together
- Set up Turborepo cache

### Step 2: Build Shared Packages

```powershell
# Build utils and ui packages
pnpm build
```

This builds:

- @page-builder/utils → `packages/utils/dist/`
- @page-builder/ui → `packages/ui/dist/`
- @page-builder/app → `packages/app/dist/`

### Step 3: Start Development

```powershell
# Start the app in dev mode
pnpm dev
```

This will:

- Start Vite dev server on http://localhost:3000
- Enable hot module replacement
- Watch for file changes

### Step 4: Open Browser

Open http://localhost:3000

You should see:

- ✅ Home page with feature cards
- ✅ Navigation (Home, About, Dashboard)
- ✅ TanStack Router DevTools (bottom right)

## 🧪 Verify Setup

Run these commands to ensure everything works:

```powershell
# Type check all packages
pnpm type-check

# Lint all packages
pnpm lint

# Build all packages
pnpm build

# Format code
pnpm format
```

All commands should complete without errors.

## 📦 Package Structure

### How Shared Packages Work

1. **@page-builder/utils** is imported in **@page-builder/app**:

    ```typescript
    // packages/app/src/utils/helpers.ts
    export { formatDate, debounce } from "@page-builder/utils";
    ```

2. **@page-builder/ui** is imported in **@page-builder/app**:

    ```typescript
    // packages/app/src/components/ui/Button.tsx
    export { Button } from "@page-builder/ui";
    ```

3. **No code duplication** - utilities are centralized!

## 🎯 Key Benefits

### 1. No Code Duplication

All common utilities are in `@page-builder/utils`:

```typescript
// ❌ Before: Duplicate code in each file
const formatDate = (date) => {
    /* ... */
};

// ✅ After: Single source of truth
import { formatDate } from "@page-builder/utils";
```

### 2. Fast Builds with Turborepo

- Caches build outputs
- Only rebuilds changed packages
- Parallel execution

### 3. Type Safety

- Full TypeScript coverage
- Shared type definitions
- Path aliases for clean imports

### 4. Scalable Architecture

- Feature-based organization
- Clean separation of concerns
- Easy to add new features

## 📚 Next Steps

1. **Read Documentation**:
    - [GETTING_STARTED.md](./GETTING_STARTED.md) - Quick start
    - [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
    - [CONTRIBUTING.md](./CONTRIBUTING.md) - Code standards

2. **Explore Packages**:
    - Check `packages/utils/src/` for available utilities
    - Check `packages/ui/src/` for available components
    - Check `packages/app/src/features/users/` for feature example

3. **Create Your First Feature**:
    - Follow the pattern in `features/users/`
    - Create types, services, hooks, components
    - Export from feature index

4. **Add More Shared Components**:
    - Add to `packages/ui/src/`
    - Export from `packages/ui/src/index.ts`
    - Rebuild: `pnpm --filter @page-builder/ui build`
    - Use in app

## 🛠️ Troubleshooting

### Issue: "Module not found"

**Solution**: Build the packages first

```powershell
pnpm build
```

### Issue: TypeScript errors

**Solution**: Check type errors in specific package

```powershell
pnpm --filter @page-builder/app type-check
```

### Issue: Weird build behavior

**Solution**: Clear cache and reinstall

```powershell
rm -rf .turbo node_modules packages/*/node_modules
pnpm install
pnpm build
```

### Issue: Port 3000 already in use

**Solution**: Change port in `packages/app/vite.config.ts`

```typescript
server: {
  port: 3001, // Change to available port
}
```

## 📊 Project Statistics

- **Packages**: 4 (app, ui, utils, tsconfig)
- **Shared Utilities**: 60+ functions
- **Shared Components**: 3 (Button, Card, Loading)
- **Routes**: 4 (root, home, about, dashboard)
- **Feature Modules**: 1 example (users)

## 🎓 Learning Resources

- **Turborepo**: https://turbo.build/repo/docs
- **pnpm Workspaces**: https://pnpm.io/workspaces
- **TanStack Router**: https://tanstack.com/router
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

## ✅ Success Checklist

- [ ] `pnpm install` completed successfully
- [ ] `pnpm build` completed without errors
- [ ] `pnpm dev` starts the dev server
- [ ] Browser opens at http://localhost:3000
- [ ] Can navigate between pages
- [ ] Hot reload works (edit a file and see changes)
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` passes

## 🎉 You're All Set!

Your enterprise-grade Turborepo monorepo is ready. Start building amazing features!

Key principles to remember:

1. **Use shared utilities** from `@page-builder/utils`
2. **Use shared components** from `@page-builder/ui`
3. **Follow clean architecture** (features, components, services)
4. **Keep code DRY** (Don't Repeat Yourself)
5. **Type everything** with TypeScript

Happy coding! 🚀
