# 🚀 Getting Started Guide

Welcome to Page Builder CMS! This guide will help you get up and running quickly.

## Quick Start (3 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Open browser
# http://localhost:3000
```

That's it! You're ready to start developing.

## What You'll See

- **Home Page** (`/`) - Landing page with feature cards
- **About Page** (`/about`) - Project structure overview
- **Dashboard** (`/dashboard`) - Interactive counter example

## Project Structure Overview

```
page-builder-cms/
├── packages/
│   ├── app/              # 🎨 Main React app (what you'll work in most)
│   ├── ui/               # 🧩 Shared components (Button, Card, etc.)
│   ├── utils/            # 🔧 Shared utilities (formatDate, debounce, etc.)
│   └── tsconfig/         # ⚙️  TypeScript configs
├── turbo.json            # Turborepo configuration
└── package.json          # Root scripts
```

## Common Tasks

### 1. Add a New Page

Create a file in `packages/app/src/routes/`:

```typescript
// packages/app/src/routes/blog.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/blog')({
  component: BlogPage,
});

function BlogPage() {
  return <h1>Blog</h1>;
}
```

Route is automatically available at `/blog`!

### 2. Use Shared Components

```typescript
import { Button, Card } from '@page-builder/ui';

function MyComponent() {
  return (
    <Card title="Hello">
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

### 3. Use Shared Utilities

```typescript
import { formatDate, debounce, slugify } from '@page-builder/utils';

const today = formatDate(new Date()); // "December 16, 2025"
const slug = slugify('My Blog Post'); // "my-blog-post"
const debouncedFn = debounce(myFunction, 300);
```

### 4. Create a New Feature

```bash
# Create feature structure
mkdir -p packages/app/src/features/blog/{components,hooks,services,types}

# Create files
touch packages/app/src/features/blog/index.ts
touch packages/app/src/features/blog/types/blog.types.ts
touch packages/app/src/features/blog/services/blog.service.ts
touch packages/app/src/features/blog/hooks/useBlog.ts
touch packages/app/src/features/blog/components/BlogCard.tsx
```

Follow the pattern in `features/users/` for examples.

### 5. Add Shared Utility

Edit `packages/utils/src/index.ts` and add your utility:

```typescript
// packages/utils/src/custom.ts
export const myUtility = (input: string) => {
  return input.toUpperCase();
};

// packages/utils/src/index.ts
export * from './custom';
```

Rebuild utils:
```bash
pnpm --filter @page-builder/utils build
```

### 6. Run Specific Package

```bash
# Dev mode
pnpm --filter @page-builder/app dev

# Build specific package
pnpm --filter @page-builder/utils build

# Type check
pnpm --filter @page-builder/app type-check
```

## Development Workflow

1. **Make changes** in `packages/app/src/`
2. **Hot reload** happens automatically (thanks to Vite)
3. **Lint & format** before committing:
   ```bash
   pnpm lint
   pnpm format
   ```

## Key Concepts

### 1. Workspace Packages
Packages in this monorepo can depend on each other:

```json
{
  "dependencies": {
    "@page-builder/ui": "workspace:*",
    "@page-builder/utils": "workspace:*"
  }
}
```

### 2. Shared Utilities (No Code Duplication!)
Instead of copying utility functions, use shared packages:

```typescript
// ❌ Don't do this
const formatDate = (date) => { /* ... */ };

// ✅ Do this
import { formatDate } from '@page-builder/utils';
```

### 3. Clean Architecture
Organize code by domain/feature:

```
features/users/
├── components/     # UI components
├── hooks/          # React hooks
├── services/       # API calls
├── types/          # TypeScript types
└── index.ts        # Public exports
```

### 4. TanStack Router
File-based routing:
- Create `src/routes/about.tsx` → Route at `/about`
- Type-safe navigation and params
- Automatic code splitting

## Available Scripts

```bash
# Development
pnpm dev              # Start all packages
pnpm dev --filter app # Start only app

# Building
pnpm build            # Build all packages
pnpm build --filter utils # Build only utils

# Code Quality
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript check
pnpm format           # Format with Prettier

# Cleaning
pnpm clean            # Remove build artifacts
```

## Turborepo Benefits

1. **Fast Builds**: Caches previous builds, only rebuilds what changed
2. **Parallel Execution**: Runs tasks in parallel when possible
3. **Smart Scheduling**: Builds dependencies first automatically

Example: Building utils automatically triggers before building app (because app depends on utils).

## Tips & Tricks

### 1. Clear Cache
If you see weird build issues:
```bash
rm -rf .turbo node_modules packages/*/node_modules
pnpm install
```

### 2. Add Dependencies
Always run from root:
```bash
# Add to specific package
pnpm --filter @page-builder/app add react-query

# Add to utils
pnpm --filter @page-builder/utils add -D some-dev-tool
```

### 3. Path Aliases
Use clean imports:
```typescript
// ✅ Good
import { Button } from '@/components/ui';
import { UserService } from '@/services/user.service';

// ❌ Avoid
import { Button } from '../../../components/ui/Button';
```

### 4. TypeScript Errors
Check which package has the error:
```bash
pnpm --filter @page-builder/app type-check
```

## Next Steps

1. ✅ Read [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the design
2. ✅ Read [CONTRIBUTING.md](./CONTRIBUTING.md) - Learn code standards
3. ✅ Check package READMEs:
   - [App README](./packages/app/README.md)
   - [Utils README](./packages/utils/README.md)
4. ✅ Start building features!

## Need Help?

- **Architecture questions**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Code standards**: Read [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Turborepo**: https://turbo.build/repo/docs
- **TanStack Router**: https://tanstack.com/router

## Example: Adding a Blog Feature (Step-by-Step)

```typescript
// 1. Create types
// packages/app/src/features/blog/types/blog.types.ts
export interface Post {
  id: string;
  title: string;
  content: string;
}

// 2. Create service
// packages/app/src/features/blog/services/blog.service.ts
import { apiService } from '@/services/api.service';
import type { Post } from '../types/blog.types';

class BlogService {
  async getPosts() {
    return apiService.get<Post[]>('/posts');
  }
}

export const blogService = new BlogService();

// 3. Create hook
// packages/app/src/features/blog/hooks/usePosts.ts
import { useState, useEffect } from 'react';
import { blogService } from '../services/blog.service';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getPosts().then(setPosts).finally(() => setLoading(false));
  }, []);

  return { posts, loading };
}

// 4. Create component
// packages/app/src/features/blog/components/PostCard.tsx
import { Card } from '@page-builder/ui';
import type { Post } from '../types/blog.types';

export const PostCard = ({ post }: { post: Post }) => (
  <Card title={post.title}>
    <p>{post.content}</p>
  </Card>
);

// 5. Create route
// packages/app/src/routes/blog.tsx
import { createFileRoute } from '@tanstack/react-router';
import { usePosts } from '@/features/blog/hooks/usePosts';
import { PostCard } from '@/features/blog/components/PostCard';

export const Route = createFileRoute('/blog')({
  component: BlogPage,
});

function BlogPage() {
  const { posts, loading } = usePosts();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Blog</h1>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

That's it! You now have a complete blog feature with clean architecture.

---

Happy coding! 🚀
