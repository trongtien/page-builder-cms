# Project Architecture Overview

## 🎯 Vision & Goals

Enterprise-grade monorepo for building scalable CMS applications with:
- Clean, maintainable code architecture
- Shared utilities to avoid code duplication
- Type-safe development experience
- Fast build times with intelligent caching
- Developer productivity tools

## 🏗️ Architecture Layers

### 1. **Shared Packages Layer** (`packages/`)

#### @page-builder/utils
**Purpose**: Common utility functions used across the monorepo

**Why?**: Eliminates code duplication, ensures consistency, single source of truth

**What it contains**:
- Date manipulation (formatting, relative time)
- String operations (truncate, capitalize, slugify)
- Async utilities (debounce, throttle, retry)
- Object manipulation (deep clone, merge, pick, omit)
- Array helpers (unique, groupBy, chunk, shuffle)
- Validation (email, URL, type guards)

**Usage Example**:
```typescript
import { formatDate, debounce, isValidEmail } from '@page-builder/utils';
```

#### @page-builder/ui
**Purpose**: Reusable React UI components

**Why?**: Consistent design system, reusable across apps, single source of truth for UI

**What it contains**:
- Button (variants, sizes, loading states)
- Card (with title, hoverable)
- Loading/Spinner (with sizes)
- Future: Input, Select, Modal, etc.

**Usage Example**:
```typescript
import { Button, Card, Loading } from '@page-builder/ui';
```

#### @page-builder/tsconfig
**Purpose**: Shared TypeScript configurations

**Why?**: Consistent TS settings, easier maintenance, type-safe across packages

**Configs**:
- `base.json` - Base TypeScript config
- `react.json` - React-specific (JSX, DOM libs)
- `node.json` - Node.js specific

### 2. **Application Layer** (`packages/app/`)

#### Clean Architecture Structure

```
src/
├── components/        # Presentation Layer
│   ├── ui/           # Basic UI (buttons, cards) - RE-EXPORTED from @page-builder/ui
│   └── common/       # App-specific common components
│
├── features/         # Domain/Business Logic Layer
│   └── [feature]/    # Feature modules (users, posts, etc.)
│       ├── components/    # Feature-specific UI
│       ├── hooks/         # Feature-specific React hooks
│       ├── services/      # Feature API calls
│       ├── types/         # Feature types
│       └── index.ts       # Public API
│
├── services/         # Infrastructure Layer
│   └── api.service.ts    # HTTP client abstraction
│
├── hooks/            # Shared Hooks
│   ├── useDebounce.ts
│   └── useAsync.ts
│
├── routes/           # Router Layer
│   ├── __root.tsx    # Root layout
│   ├── index.tsx     # Home page
│   └── [page].tsx    # Other pages
│
└── types/            # Global Types
    └── index.ts
```

#### Why This Structure?

1. **Separation of Concerns**: Each folder has a clear responsibility
2. **Feature-First**: Features are self-contained modules
3. **Dependency Flow**: Dependencies point inward (UI → Features → Services)
4. **Testability**: Easy to test each layer independently
5. **Scalability**: Add new features without touching existing code

## 🔄 Data Flow

```
User Interaction
    ↓
Component (Presentation)
    ↓
Hook (State Management)
    ↓
Service (API Layer)
    ↓
API Server
```

Example:
```typescript
// 1. Component uses hook
const { users, loading } = useUsers();

// 2. Hook calls service
const data = await userService.getUsers();

// 3. Service makes API request
return apiService.get<User[]>('/users');
```

## 🛠️ Development Tools

### Turborepo
**Why?**: Fast builds, intelligent caching, parallel execution

**Pipeline**:
- `build`: Builds packages in dependency order
- `dev`: Runs development servers (no caching)
- `lint`: Lints all packages
- `type-check`: Type checks all packages

**Benefits**:
- Caches build outputs (faster subsequent builds)
- Runs tasks in parallel when possible
- Only rebuilds changed packages

### pnpm Workspaces
**Why?**: Fast, efficient, strict dependency management

**Benefits**:
- Saves disk space (content-addressable storage)
- Faster installs (parallel downloads)
- Strict node_modules (prevents phantom dependencies)

### TypeScript
**Why?**: Type safety, better DX, catches errors early

**Configuration Strategy**:
- Shared configs in `@page-builder/tsconfig`
- Apps extend shared configs
- Path aliases for cleaner imports

### ESLint + Prettier
**Why?**: Consistent code style, catch errors early

**Benefits**:
- Auto-format on save
- Catch common mistakes
- Enforce best practices

## 📦 Package Dependencies

```
@page-builder/app
├── @page-builder/ui (workspace)
├── @page-builder/utils (workspace)
├── @page-builder/tsconfig (workspace)
└── react, tanstack-router, vite...

@page-builder/ui
├── @page-builder/tsconfig (workspace)
└── react (peer)

@page-builder/utils
├── @page-builder/tsconfig (workspace)
└── (no runtime dependencies)
```

## 🎨 Design Patterns

### 1. **Composition over Inheritance**
```typescript
// ✅ Good - Composable components
<Card>
  <Button variant="primary">Click me</Button>
</Card>

// ❌ Bad - Complex inheritance
class ClickableCard extends Card { }
```

### 2. **Custom Hooks for Logic Reuse**
```typescript
// ✅ Good - Reusable logic
const { data, loading, error } = useUsers();

// ❌ Bad - Logic in component
const [users, setUsers] = useState([]);
useEffect(() => { /* fetch logic */ }, []);
```

### 3. **Service Layer for API Calls**
```typescript
// ✅ Good - Centralized API logic
userService.getUsers()

// ❌ Bad - API calls in components
fetch('/api/users')
```

### 4. **Type-First Development**
```typescript
// ✅ Good - Define types first
interface User {
  id: string;
  name: string;
}

// ❌ Bad - Implicit any
const user = {}; // any type
```

## 🚀 Scaling Strategy

### Adding New Features
1. Create feature folder in `src/features/[feature]`
2. Create types, services, hooks, components
3. Export from feature `index.ts`
4. Use in routes

### Adding New Apps
1. Create new package in `packages/[app]`
2. Use shared packages (`@page-builder/ui`, `@page-builder/utils`)
3. Configure in `turbo.json` pipeline
4. Run with `pnpm --filter @page-builder/[app] dev`

### Adding New Shared Packages
1. Create in `packages/[package]`
2. Configure build (tsup/vite)
3. Export from `index.ts`
4. Use workspace protocol in dependent packages

## 📊 Performance Optimization

### Build Time
- ✅ Turborepo caching
- ✅ Parallel builds
- ✅ Only rebuild changed packages

### Bundle Size
- ✅ Tree-shaking (import only what you need)
- ✅ Code splitting (route-based)
- ✅ No duplicate dependencies

### Runtime
- ✅ React 18 features (Suspense, Concurrent)
- ✅ Vite HMR (instant feedback)
- ✅ Lazy loading routes

## 🔐 Best Practices

1. **DRY (Don't Repeat Yourself)**
   - Use shared utilities from `@page-builder/utils`
   - Create reusable components in `@page-builder/ui`

2. **Type Safety**
   - Define types for all data structures
   - Use type guards for runtime checks
   - Avoid `any` type

3. **Clean Code**
   - Small, focused functions
   - Self-documenting variable names
   - JSDoc comments for public APIs

4. **Testing**
   - Test utilities independently
   - Test components in isolation
   - Integration tests for features

5. **Documentation**
   - README for each package
   - JSDoc for functions
   - Architecture docs (this file)

## 🎓 Learning Resources

- **Turborepo**: https://turbo.build/repo/docs
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **React Patterns**: https://reactpatterns.com/
- **TypeScript**: https://www.typescriptlang.org/docs/

## 📈 Future Enhancements

- [ ] Add testing setup (Vitest)
- [ ] Add E2E testing (Playwright)
- [ ] Add CI/CD pipeline
- [ ] Add Storybook for UI components
- [ ] Add API documentation generator
- [ ] Add performance monitoring
- [ ] Add error tracking (Sentry)
- [ ] Add analytics
