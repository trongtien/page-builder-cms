---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup

**How do we get started?**

### Prerequisites and Dependencies

Required tools and versions:

- Node.js: ≥ 18.0.0
- pnpm: ≥ 8.0.0
- TanStack Start: (check package.json)
- TypeScript: ≥ 5.0.0

### Environment Setup Steps

1. **Install Dependencies**

    ```bash
    pnpm install
    ```

2. **Install New Dependencies for Widget System**

    ```bash
    pnpm add zod @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
    pnpm add embla-carousel-react lucide-react date-fns
    pnpm add -D @types/node
    ```

3. **Setup Mock API (Development)**

    ```bash
    # If using MSW
    pnpm add -D msw
    pnpx msw init public/
    ```

4. **Configure Environment Variables**
   Create `.env.local` in `packages/host-root/`:

    ```env
    # API Configuration
    VITE_API_BASE_URL=http://localhost:3000/api

    # For server-side calls
    API_BASE_URL=http://localhost:3000/api
    ```

5. **Run Development Server**
    ```bash
    pnpm dev
    ```

### Configuration Needed

**TypeScript Config Updates**:
Ensure `packages/host-root/tsconfig.json` includes:

```json
{
    "compilerOptions": {
        "paths": {
            "@/components/*": ["./src/components/*"],
            "@/server/*": ["./src/server/*"],
            "@/lib/*": ["./src/lib/*"],
            "@core/ui": ["../core/ui/src/index.ts"],
            "@core/api-types": ["../core/api-types/src/index.ts"]
        }
    }
}
```

**Tailwind Config for Dark Mode**:
Verify `packages/host-root/tailwind.config.ts`:

```typescript
export default {
    darkMode: "class" // or 'media'
    // ... rest of config
};
```

## Code Structure

**How is the code organized?**

### Directory Structure

```
packages/
├── core/
│   ├── api-types/
│   │   └── src/
│   │       ├── widgets/
│   │       │   ├── schemas.ts         # Zod schemas for all widgets
│   │       │   ├── types.ts           # TypeScript interfaces
│   │       │   └── index.ts           # Re-exports
│   │       └── index.ts
│   └── ui/
│       └── src/
│           └── components/
│               └── forms/
│                   ├── formClasses.ts # Shared Tailwind classes
│                   ├── Input.tsx
│                   ├── Select.tsx
│                   ├── Radio.tsx
│                   ├── Checkbox.tsx
│                   ├── Textarea.tsx
│                   └── index.ts       # Re-exports
└── host-root/
    └── src/
        ├── components/
        │   └── widgets/
        │       ├── WidgetRenderer.tsx
        │       ├── WidgetWrapper.tsx  # Common wrapper for spacing/bg
        │       ├── HeroBanner.tsx
        │       ├── FlashSale.tsx
        │       ├── ProductGrid.tsx
        │       ├── QuickLinks.tsx
        │       └── index.ts
        ├── pages/
        │   ├── $slug.tsx              # Public pages (renders widgets)
        │   └── admin/
        │       └── builder/
        │           ├── $pageId.tsx    # Main builder page
        │           └── components/
        │               ├── BuilderContext.tsx
        │               ├── WidgetPicker.tsx
        │               ├── Canvas.tsx
        │               ├── PropertyEditor.tsx
        │               ├── ToolbarActions.tsx
        │               └── index.ts
        ├── server/
        │   └── widgets.ts             # TanStack Start server functions
        ├── hooks/
        │   ├── useCountdown.ts        # Countdown timer hook
        │   └── useAutoSave.ts         # Auto-save draft hook
        └── lib/
            ├── cn.ts                  # className utility (if not exists)
            └── validators.ts          # Custom validation helpers
```

### Module Organization

**Shared Packages** (`packages/core/`):

- **api-types**: Type definitions and schemas shared between frontend and backend
- **ui**: Reusable UI components (forms, buttons, etc.)

**Application Code** (`packages/host-root/src/`):

- **components/widgets**: Widget rendering logic
- **pages**: Route components
- **server**: Server-side functions (API calls)
- **hooks**: Custom React hooks
- **lib**: Utility functions

### Naming Conventions

- **Components**: PascalCase (e.g., `WidgetRenderer.tsx`, `PropertyEditor.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useCountdown.ts`)
- **Utilities**: camelCase (e.g., `validators.ts`, `formClasses.ts`)
- **Types/Interfaces**: PascalCase (e.g., `Widget`, `PageConfig`)
- **Zod Schemas**: camelCase with `Schema` suffix (e.g., `widgetSchema`, `pageConfigSchema`)
- **Server Functions**: camelCase (e.g., `getPageConfig`, `updatePageConfig`)

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### Feature 1: Base Form Components

**Implementation Approach**:

- Use `React.forwardRef` for all form components to support `react-hook-form` and other form libraries
- Create shared `formClasses.ts` for consistent styling:

```typescript
// packages/core/ui/src/components/forms/formClasses.ts
export const formClasses = {
    label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
    input: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed",
    inputError: "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500",
    helperText: "mt-1 text-sm text-gray-500 dark:text-gray-400",
    errorText: "mt-1 text-sm text-red-600 dark:text-red-400",
    select: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50",
    checkbox: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800",
    radio: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800"
};
```

- **Input Component Pattern**:

```typescript
// packages/core/ui/src/components/forms/Input.tsx
import React from 'react';
import { cn } from '@/lib/cn'; // or your utility location
import { formClasses } from './formClasses';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className={formClasses.label}>{label}</label>}
        <input
          ref={ref}
          className={cn(
            formClasses.input,
            error && formClasses.inputError,
            className
          )}
          {...props}
        />
        {error && <p className={formClasses.errorText}>{error}</p>}
        {!error && helperText && <p className={formClasses.helperText}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

#### Feature 2: Widget Type System with Zod

**Implementation Approach**:

- Define Zod schemas first, infer TypeScript types from them (single source of truth)
- Use discriminated unions for polymorphic widget types

```typescript
// packages/core/api-types/src/widgets/schemas.ts
import { z } from "zod";

// Base schemas
const spacingSchema = z.object({
    top: z.number().int().min(0).max(200).optional(),
    right: z.number().int().min(0).max(200).optional(),
    bottom: z.number().int().min(0).max(200).optional(),
    left: z.number().int().min(0).max(200).optional()
});

const commonPropsSchema = z.object({
    padding: spacingSchema.optional(),
    margin: spacingSchema.optional(),
    backgroundColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
    hidden: z.boolean().optional()
});

const baseWidgetSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(["hero_banner", "flash_sale", "product_grid", "quick_links"]),
    position: z.number().int().min(0),
    commonProps: commonPropsSchema
});

// Specific widget schemas
export const heroBannerSchema = baseWidgetSchema.extend({
    type: z.literal("hero_banner"),
    props: z.object({
        imageUrl: z.string().url(),
        imageAlt: z.string().min(1),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        ctaText: z.string().optional(),
        ctaLink: z.string().url().optional(),
        textPosition: z.enum(["left", "center", "right"]).default("center"),
        overlayOpacity: z.number().min(0).max(100).default(40)
    })
});

export const flashSaleSchema = baseWidgetSchema.extend({
    type: z.literal("flash_sale"),
    props: z.object({
        campaignId: z.string().uuid(),
        countdownEndTime: z.string().datetime(),
        displayStyle: z.enum(["grid", "carousel"]).default("grid"),
        productsPerRow: z.number().int().min(2).max(6).default(4),
        showCountdown: z.boolean().default(true)
    })
});

// ... similar for productGridSchema and quickLinksSchema

// Discriminated union
export const widgetSchema = z.discriminatedUnion("type", [
    heroBannerSchema,
    flashSaleSchema,
    productGridSchema,
    quickLinksSchema
]);

export const pageConfigSchema = z.object({
    id: z.string().uuid(),
    slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
    title: z.string().min(1).max(200),
    status: z.enum(["draft", "published", "archived"]),
    widgets: z.array(widgetSchema),
    metadata: z.object({
        createdBy: z.string(),
        createdAt: z.string().datetime(),
        updatedBy: z.string(),
        updatedAt: z.string().datetime(),
        publishedAt: z.string().datetime().optional(),
        version: z.number().int().min(1)
    })
});

// Export types
export type Widget = z.infer<typeof widgetSchema>;
export type HeroBannerWidget = z.infer<typeof heroBannerSchema>;
export type FlashSaleWidget = z.infer<typeof flashSaleSchema>;
export type ProductGridWidget = z.infer<typeof productGridSchema>;
export type QuickLinksWidget = z.infer<typeof quickLinksSchema>;
export type PageConfig = z.infer<typeof pageConfigSchema>;
```

#### Feature 3: Widget Renderer

**Implementation Approach**:

- Use component mapping object for clean widget type resolution
- Wrap each widget with `WidgetWrapper` to handle common props

```typescript
// packages/host-root/src/components/widgets/WidgetRenderer.tsx
import { Widget } from '@core/api-types';
import { HeroBanner } from './HeroBanner';
import { FlashSale } from './FlashSale';
import { ProductGrid } from './ProductGrid';
import { QuickLinks } from './QuickLinks';
import { ErrorBoundary } from 'react-error-boundary';

const widgetComponents = {
  hero_banner: HeroBanner,
  flash_sale: FlashSale,
  product_grid: ProductGrid,
  quick_links: QuickLinks,
} as const;

interface WidgetRendererProps {
  widgets: Widget[];
}

export function WidgetRenderer({ widgets }: WidgetRendererProps) {
  return (
    <div className="widget-container">
      {widgets
        .filter(w => !w.commonProps.hidden)
        .sort((a, b) => a.position - b.position)
        .map((widget) => {
          const Component = widgetComponents[widget.type];
          return (
            <ErrorBoundary
              key={widget.id}
              fallback={<WidgetError widgetId={widget.id} />}
            >
              <Component widget={widget} />
            </ErrorBoundary>
          );
        })}
    </div>
  );
}

function WidgetError({ widgetId }: { widgetId: string }) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
      <p className="text-red-700 dark:text-red-300">
        Failed to render widget {widgetId}
      </p>
    </div>
  );
}
```

```typescript
// packages/host-root/src/components/widgets/WidgetWrapper.tsx
import { ReactNode } from 'react';
import { Widget } from '@core/api-types';

interface WidgetWrapperProps {
  widget: Widget;
  children: ReactNode;
}

export function WidgetWrapper({ widget, children }: WidgetWrapperProps) {
  const { padding, margin, backgroundColor } = widget.commonProps;

  const style = {
    paddingTop: padding?.top ? `${padding.top}px` : undefined,
    paddingRight: padding?.right ? `${padding.right}px` : undefined,
    paddingBottom: padding?.bottom ? `${padding.bottom}px` : undefined,
    paddingLeft: padding?.left ? `${padding.left}px` : undefined,
    marginTop: margin?.top ? `${margin.top}px` : undefined,
    marginRight: margin?.right ? `${margin.right}px` : undefined,
    marginBottom: margin?.bottom ? `${margin.bottom}px` : undefined,
    marginLeft: margin?.left ? `${margin.left}px` : undefined,
    backgroundColor: backgroundColor || undefined,
  };

  return (
    <div className="widget-wrapper" style={style}>
      {children}
    </div>
  );
}
```

#### Feature 4: TanStack Start Server Functions

**Implementation Approach**:

- Use `createServerFn` for all backend API calls
- Validate responses with Zod schemas
- Handle authentication in server context

```typescript
// packages/host-root/src/server/widgets.ts
import { createServerFn } from "@tanstack/start";
import { pageConfigSchema, PageConfig } from "@core/api-types";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

// Helper to get auth token from session (adjust based on your auth setup)
function getAuthToken() {
    // This is pseudocode - adjust based on your auth implementation
    // Could be from cookies, session, etc.
    return "your-jwt-token";
}

export const getPageConfig = createServerFn("GET", async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/pages/${slug}`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`
        }
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("Page not found");
        }
        throw new Error("Failed to fetch page configuration");
    }

    const data = await response.json();
    // Validate response with Zod
    return pageConfigSchema.parse(data);
});

export const updatePageConfig = createServerFn(
    "POST",
    async ({ pageId, config }: { pageId: string; config: PageConfig }) => {
        // Validate before sending
        const validated = pageConfigSchema.parse(config);

        const response = await fetch(`${API_BASE_URL}/pages/${pageId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(validated)
        });

        if (!response.ok) {
            throw new Error("Failed to update page configuration");
        }

        return response.json();
    }
);

export const createPageConfig = createServerFn("POST", async (config: Omit<PageConfig, "id" | "metadata">) => {
    const response = await fetch(`${API_BASE_URL}/pages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(config)
    });

    if (!response.ok) {
        throw new Error("Failed to create page configuration");
    }

    return pageConfigSchema.parse(await response.json());
});
```

#### Feature 5: Admin Builder Context

**Implementation Approach**:

- Use React Context for builder state
- Implement actions as context methods
- Debounce updates for performance

```typescript
// packages/host-root/src/pages/admin/builder/components/BuilderContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { PageConfig, Widget } from '@core/api-types';
import { v4 as uuidv4 } from 'uuid';

interface BuilderState {
  pageConfig: PageConfig | null;
  selectedWidgetId: string | null;
  isDirty: boolean;
  isSaving: boolean;
}

interface BuilderActions {
  setPageConfig: (config: PageConfig) => void;
  addWidget: (widget: Omit<Widget, 'id' | 'position'>, position?: number) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  deleteWidget: (id: string) => void;
  reorderWidget: (id: string, newPosition: number) => void;
  selectWidget: (id: string | null) => void;
  saveConfig: () => Promise<void>;
  publishConfig: () => Promise<void>;
}

const BuilderContext = createContext<(BuilderState & BuilderActions) | null>(null);

export function BuilderProvider({ children, initialConfig }: {
  children: React.ReactNode;
  initialConfig?: PageConfig;
}) {
  const [pageConfig, setPageConfigState] = useState<PageConfig | null>(initialConfig || null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const setPageConfig = useCallback((config: PageConfig) => {
    setPageConfigState(config);
    setIsDirty(false);
  }, []);

  const addWidget = useCallback((widget: Omit<Widget, 'id' | 'position'>, position?: number) => {
    if (!pageConfig) return;

    const newWidget = {
      ...widget,
      id: uuidv4(),
      position: position ?? pageConfig.widgets.length,
    } as Widget;

    const updatedWidgets = [...pageConfig.widgets];
    if (position !== undefined) {
      updatedWidgets.splice(position, 0, newWidget);
      // Re-calculate positions
      updatedWidgets.forEach((w, idx) => { w.position = idx; });
    } else {
      updatedWidgets.push(newWidget);
    }

    setPageConfigState({
      ...pageConfig,
      widgets: updatedWidgets,
    });
    setIsDirty(true);
  }, [pageConfig]);

  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    if (!pageConfig) return;

    const updatedWidgets = pageConfig.widgets.map(w =>
      w.id === id ? { ...w, ...updates } : w
    );

    setPageConfigState({
      ...pageConfig,
      widgets: updatedWidgets,
    });
    setIsDirty(true);
  }, [pageConfig]);

  const deleteWidget = useCallback((id: string) => {
    if (!pageConfig) return;

    const updatedWidgets = pageConfig.widgets
      .filter(w => w.id !== id)
      .map((w, idx) => ({ ...w, position: idx }));

    setPageConfigState({
      ...pageConfig,
      widgets: updatedWidgets,
    });
    setIsDirty(true);
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
    }
  }, [pageConfig, selectedWidgetId]);

  const reorderWidget = useCallback((id: string, newPosition: number) => {
    if (!pageConfig) return;

    const widgetIndex = pageConfig.widgets.findIndex(w => w.id === id);
    if (widgetIndex === -1) return;

    const updatedWidgets = [...pageConfig.widgets];
    const [widget] = updatedWidgets.splice(widgetIndex, 1);
    updatedWidgets.splice(newPosition, 0, widget);
    updatedWidgets.forEach((w, idx) => { w.position = idx; });

    setPageConfigState({
      ...pageConfig,
      widgets: updatedWidgets,
    });
    setIsDirty(true);
  }, [pageConfig]);

  const selectWidget = useCallback((id: string | null) => {
    setSelectedWidgetId(id);
  }, []);

  const saveConfig = useCallback(async () => {
    if (!pageConfig) return;

    setIsSaving(true);
    try {
      // Call server function
      await updatePageConfig({ pageId: pageConfig.id, config: pageConfig });
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [pageConfig]);

  const publishConfig = useCallback(async () => {
    if (!pageConfig) return;

    const publishedConfig = {
      ...pageConfig,
      status: 'published' as const,
      metadata: {
        ...pageConfig.metadata,
        publishedAt: new Date().toISOString(),
      },
    };

    setIsSaving(true);
    try {
      await updatePageConfig({ pageId: pageConfig.id, config: publishedConfig });
      setPageConfigState(publishedConfig);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to publish config:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [pageConfig]);

  return (
    <BuilderContext.Provider
      value={{
        pageConfig,
        selectedWidgetId,
        isDirty,
        isSaving,
        setPageConfig,
        addWidget,
        updateWidget,
        deleteWidget,
        reorderWidget,
        selectWidget,
        saveConfig,
        publishConfig,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider');
  }
  return context;
}
```

### Patterns & Best Practices

#### Design Patterns Being Used

1. **Server-Driven UI Pattern**: Page layouts defined as JSON configurations
2. **Compound Component Pattern**: Form components with consistent API
3. **Render Props Pattern**: Error boundaries for widget isolation
4. **Provider Pattern**: BuilderContext for state management
5. **Factory Pattern**: Widget component mapping in WidgetRenderer

#### Code Style Guidelines

- **Prefer named exports** over default exports for better refactoring
- **Use TypeScript strict mode**: Enable all strict flags
- **Immutable state updates**: Use spread operators, never mutate directly
- **Early returns**: Fail fast in functions for better readability
- **Composition over inheritance**: Use hooks and composition instead of class inheritance

#### Common Utilities/Helpers

```typescript
// packages/host-root/src/lib/cn.ts (if not exists)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

```typescript
// packages/host-root/src/lib/validators.ts
export function isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
```

## Integration Points

**How do pieces connect?**

### API Integration Details

**Public Page Rendering Flow**:

1. User navigates to `/:slug` (e.g., `/home`)
2. TanStack Start route handler calls `getPageConfig(slug)`
3. Server function fetches config from Golang backend
4. Page config validated with Zod schema
5. `WidgetRenderer` receives validated config
6. Individual widgets fetch additional data if needed (campaigns, products)
7. SSR renders HTML, hydrates on client

**Admin Builder Flow**:

1. User navigates to `/admin/builder/:pageId`
2. `BuilderProvider` calls `getPageConfig(pageId)` on mount
3. User interacts with builder (drag, edit, etc.)
4. State updates in `BuilderContext`
5. User clicks "Save" or "Publish"
6. `saveConfig()` or `publishConfig()` calls `updatePageConfig` server function
7. Server function validates with Zod and sends to backend
8. Success/error feedback shown to user

### Database Connections

Database access is handled by the Golang backend. Frontend only interacts via HTTP API.

**Backend Responsibilities**:

- Store page configurations as JSONB in PostgreSQL
- Validate incoming data with shared schemas
- Handle database transactions
- Implement version history (Phase 2)

### Third-Party Service Setup

**Campaign/Product APIs**:

- Assumed to exist in current backend infrastructure
- Server functions call these APIs to fetch dynamic data
- Cache responses with TanStack Query (staleTime, cacheTime)

## Error Handling

**How do we handle failures?**

### Error Handling Strategy

**Component-Level Errors**:

- Wrap each widget in `ErrorBoundary` to prevent cascade failures
- Display user-friendly error message in place of broken widget

**API Errors**:

- Catch errors in server functions
- Throw with descriptive error messages
- Display toast notifications in UI using toast library (e.g., sonner, react-hot-toast)

**Validation Errors**:

- Zod schema validation errors shown inline in forms
- Format Zod errors for user readability:

```typescript
import { ZodError } from "zod";

export function formatZodError(error: ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};
    error.errors.forEach((err) => {
        const path = err.path.join(".");
        formatted[path] = err.message;
    });
    return formatted;
}
```

### Logging Approach

**Client-Side**:

- Console errors for development
- Integrate with error tracking service (Sentry, LogRocket) in production

**Server-Side**:

- Log errors in server functions
- Include request ID for tracing

```typescript
// In server functions
try {
    // API call
} catch (error) {
    console.error("[getPageConfig] Failed:", error);
    // Send to error tracking service
    throw new Error("Failed to fetch page configuration");
}
```

### Retry/Fallback Mechanisms

**TanStack Query Retry Config**:

```typescript
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 5 * 60 * 1000 // 5 minutes
        }
    }
});
```

**Fallback UI**:

- Show cached data if API fails
- Display skeleton loaders during retry
- Provide "Retry" button for user-initiated retry

## Performance Considerations

**How do we keep it fast?**

### Optimization Strategies

1. **Code Splitting**: Lazy load widget components and admin builder

    ```typescript
    const AdminBuilder = React.lazy(() => import("./pages/admin/builder/$pageId"));
    ```

2. **Image Optimization**: Use next-gen formats (WebP, AVIF), lazy loading

    ```tsx
    <img loading="lazy" src={imageUrl} alt={alt} />
    ```

3. **Debouncing**: Debounce form updates to reduce re-renders

    ```typescript
    const debouncedUpdate = useDebouncedCallback((updates) => {
        updateWidget(selectedWidgetId, updates);
    }, 300);
    ```

4. **Memoization**: Use `React.memo` for expensive components
    ```typescript
    export const PropertyEditor = React.memo(function PropertyEditor({ widget }) {
        // ...
    });
    ```

### Caching Approach

**TanStack Query Caching**:

- Page configs cached for 5 minutes
- Campaign/product data cached for 1 minute
- Invalidate cache on mutations (save, publish)

```typescript
const { data: pageConfig } = useQuery({
    queryKey: ["pageConfig", slug],
    queryFn: () => getPageConfig(slug),
    staleTime: 5 * 60 * 1000
});

// After save
queryClient.invalidateQueries(["pageConfig", slug]);
```

### Query Optimization

**Batch Data Fetching**:

- Fetch all campaign data for Flash Sale widgets in single request
- Use GraphQL or batch endpoint if available

**Pagination**:

- Limit products fetched for Product Grid (default 20)
- Implement "Load More" for large product sets

### Resource Management

**Memory Management**:

- Clean up timers in countdown components
- Unsubscribe from event listeners on unmount
- Limit history size in undo/redo feature (Phase 2)

**Bundle Size**:

- Tree-shake unused code
- Use dynamic imports for heavy libraries (carousel, drag-and-drop)
- Monitor bundle size with `pnpm build --analyze`

## Security Notes

**What security measures are in place?**

### Authentication/Authorization

**Server-Side Enforcement**:

- Validate JWT token on every server function call
- Check user permissions before returning data or accepting mutations
- Never expose API keys to client

**Client-Side UX**:

- Redirect to login if not authenticated
- Hide/disable UI elements based on user role
- Show permission errors clearly

### Input Validation

**Multi-Layer Validation**:

1. **Client-Side**: Instant feedback with Zod schemas in forms
2. **Server Function**: Validate before sending to backend
3. **Backend API**: Final validation in Golang

**XSS Prevention**:

- React automatically escapes user input
- Sanitize any dangerouslySetInnerHTML usage (should be avoided)
- Validate URLs to prevent `javascript:` protocol

```typescript
export function isSafeUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}
```

### Data Encryption

**HTTPS Only**: All API communication over HTTPS
**Sensitive Data**: Never log sensitive data (tokens, passwords)

### Secrets Management

**Environment Variables**:

- Store API keys in `.env.local` (gitignored)
- Use Vercel/hosting platform env vars in production
- Never hardcode secrets in code

**Server-Side Only**:

- Backend API keys stay on server (in server functions)
- Client never sees backend credentials
