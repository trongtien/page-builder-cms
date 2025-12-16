# Contributing to Page Builder CMS

## Development Setup

1. **Fork and Clone**

    ```bash
    git clone https://github.com/yourusername/page-builder-cms.git
    cd page-builder-cms
    ```

2. **Install Dependencies**

    ```bash
    pnpm install
    ```

3. **Create Branch**
    ```bash
    git checkout -b feature/your-feature
    ```

## Code Standards

### TypeScript

- Use strict mode
- Define explicit types
- Avoid `any` type
- Use type guards

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Components**: PascalCase (`UserCard.tsx`)
- **Functions**: camelCase (`formatDate`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Import Order

```typescript
// 1. External dependencies
import React from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal shared packages
import { Button, Card } from "@page-builder/ui";
import { formatDate } from "@page-builder/utils";

// 3. Local imports
import { UserCard } from "./UserCard";
import type { User } from "./types";
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Types
interface Props {
  title: string;
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title }) => {
  // Hooks first
  const [state, setState] = React.useState();

  // Event handlers
  const handleClick = () => {};

  // Render
  return <div>{title}</div>;
};
```

## Testing Changes

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build

# Format
pnpm format
```

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

Example:

```
feat(ui): add loading spinner component

- Add Spinner component with size variants
- Export from main index
- Add TypeScript types
```

## Pull Requests

1. Update documentation
2. Add tests if applicable
3. Ensure all checks pass
4. Reference related issues

## Questions?

Open an issue or discussion on GitHub.
