---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide: Visual Page Builder with Drag-and-Drop

## Development Setup

**How do we get started?**

### Prerequisites

- Node.js 18+ and pnpm installed
- Existing monorepo setup with Turborepo
- Familiarity with React 18, TypeScript, and Tailwind CSS

### Install Dependencies

```bash
# Navigate to editor-builder package
cd packages/core/editor-builder

# Install dnd-kit dependencies
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Install dev dependencies (if needed)
pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

### Environment Setup

- Ensure `@repo/api-types`, `@repo/ui`, and `@repo/utils` are available
- Configure TypeScript paths for package imports
- Verify Tailwind CSS configuration is inherited from shared config

### Initial Verification

```bash
# From monorepo root
pnpm build

# Run dev server for host-root to test integration
pnpm --filter @repo/host-root dev
```

## Code Structure

**How is the code organized?**

```
packages/core/editor-builder/src/
├── components/
│   ├── PageBuilder/
│   │   ├── PageBuilder.tsx           # Root component
│   │   ├── Canvas.tsx                 # Widget canvas area
│   │   ├── CanvasWidget.tsx           # Individual widget wrapper
│   │   ├── DropZone.tsx               # Visual drop indicator
│   │   ├── EmptyCanvas.tsx            # Empty state
│   │   ├── WidgetPalette.tsx          # Widget library
│   │   ├── WidgetCard.tsx             # Individual widget in palette
│   │   ├── PropertyEditor.tsx         # Widget property editor
│   │   ├── SchemaFormGenerator.tsx    # Dynamic form from Zod schema
│   │   └── index.ts                   # Barrel export
│   │
│   ├── WidgetRenderer/
│   │   ├── WidgetRenderer.tsx         # Factory component
│   │   ├── HeroBannerWidget.tsx       # Hero banner preview
│   │   ├── FlashSaleWidget.tsx        # Flash sale preview
│   │   ├── ProductGridWidget.tsx      # Product grid preview
│   │   ├── QuickLinksWidget.tsx       # Quick links preview
│   │   └── index.ts
│   │
│   └── PropertyFields/
│       ├── TextField.tsx
│       ├── NumberField.tsx
│       ├── ColorField.tsx
│       ├── SpacingField.tsx
│       ├── CheckboxField.tsx
│       ├── SelectField.tsx
│       └── index.ts
│
├── hooks/
│   ├── usePageEditor.ts               # Main state management hook
│   ├── useDragAndDrop.ts              # DnD integration
│   ├── useAutoSave.ts                 # Auto-save to localStorage
│   └── index.ts
│
├── api/
│   ├── pages.ts                       # API client for page CRUD
│   └── index.ts
│
├── types/
│   ├── editor.ts                      # Editor-specific types
│   ├── widgets.ts                     # Widget definitions
│   └── index.ts
│
├── utils/
│   ├── widget-helpers.ts              # Widget manipulation utilities
│   ├── validation.ts                  # Validation helpers
│   └── index.ts
│
└── index.ts                           # Main export
```

### Module Organization

- **components/**: All React components
- **hooks/**: Custom React hooks for logic reuse
- **api/**: API client functions
- **types/**: TypeScript interfaces and types
- **utils/**: Pure utility functions

### Naming Conventions

- **Components**: PascalCase (e.g., `PageBuilder.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePageEditor.ts`)
- **Utilities**: camelCase (e.g., `widget-helpers.ts`)
- **Types**: PascalCase for interfaces/types (e.g., `EditorState`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_WIDGETS`)

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### 1. PageBuilder Component

**File**: `components/PageBuilder/PageBuilder.tsx`

```typescript
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { usePageEditor } from '../../hooks/usePageEditor';
import { Canvas } from './Canvas';
import { WidgetPalette } from './WidgetPalette';
import { PropertyEditor } from './PropertyEditor';

interface PageBuilderProps {
  pageId?: string;
  onSave?: (page: PageConfig) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export function PageBuilder({ pageId, onSave, onCancel, readOnly }: PageBuilderProps) {
  const {
    page,
    selectedWidgetId,
    isDirty,
    isSaving,
    actions
  } = usePageEditor(pageId);

  const handleDragStart = (event: DragStartEvent) => {
    // Track what's being dragged
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Determine if it's a new widget from palette or reorder
    if (active.data.current?.type === 'palette-widget') {
      // Add new widget
      actions.addWidget(/* ... */);
    } else if (active.data.current?.type === 'canvas-widget') {
      // Reorder existing widget
      actions.reorderWidget(/* ... */);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen">
        {/* Canvas - Left Side */}
        <div className="flex-1 p-4 bg-gray-50">
          <Canvas
            widgets={page?.widgets ?? []}
            selectedWidgetId={selectedWidgetId}
            onWidgetSelect={actions.selectWidget}
            onWidgetRemove={actions.removeWidget}
          />
        </div>

        {/* Widget Palette - Right Side */}
        <div className="w-80 border-l bg-white">
          <WidgetPalette />
        </div>

        {/* Property Editor - Overlay or Side Panel */}
        {selectedWidgetId && (
          <PropertyEditor
            widget={page?.widgets.find(w => w.id === selectedWidgetId) ?? null}
            onPropertyChange={actions.updateWidget}
            onClose={() => actions.selectWidget(null)}
          />
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {/* Render dragged widget preview */}
      </DragOverlay>
    </DndContext>
  );
}
```

**Key Points**:

- Use `DndContext` from dnd-kit as root wrapper
- Separate palette drops from reordering using `active.data.current`
- Manage editor state through `usePageEditor` hook
- Conditional rendering for property editor

#### 2. Canvas Component

**File**: `components/PageBuilder/Canvas.tsx`

```typescript
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CanvasWidget } from './CanvasWidget';
import { EmptyCanvas } from './EmptyCanvas';

interface CanvasProps {
  widgets: BaseWidget[];
  selectedWidgetId: string | null;
  onWidgetSelect: (id: string) => void;
  onWidgetRemove: (id: string) => void;
}

export function Canvas({ widgets, selectedWidgetId, onWidgetSelect, onWidgetRemove }: CanvasProps) {
  const { setNodeRef } = useDroppable({ id: 'canvas' });

  if (widgets.length === 0) {
    return <EmptyCanvas />;
  }

  return (
    <div ref={setNodeRef} className="min-h-full p-4">
      <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
        {widgets.map((widget) => (
          <CanvasWidget
            key={widget.id}
            widget={widget}
            isSelected={widget.id === selectedWidgetId}
            onSelect={() => onWidgetSelect(widget.id)}
            onRemove={() => onWidgetRemove(widget.id)}
          />
        ))}
      </SortableContext>
    </div>
  );
}
```

**Key Points**:

- Use `useDroppable` for the canvas container
- Use `SortableContext` with `verticalListSortingStrategy` for reordering
- Pass widget IDs as items to `SortableContext`
- Handle empty state gracefully

#### 3. WidgetPalette Component

**File**: `components/PageBuilder/WidgetPalette.tsx`

```typescript
import { useDraggable } from '@dnd-kit/core';

const AVAILABLE_WIDGETS = [
  { type: 'hero_banner', label: 'Hero Banner', category: 'Promotional', icon: '🎨' },
  { type: 'flash_sale', label: 'Flash Sale', category: 'Promotional', icon: '⚡' },
  { type: 'product_grid', label: 'Product Grid', category: 'Content', icon: '📦' },
  { type: 'quick_links', label: 'Quick Links', category: 'Content', icon: '🔗' },
];

export function WidgetPalette() {
  const groupedWidgets = AVAILABLE_WIDGETS.reduce((acc, widget) => {
    if (!acc[widget.category]) acc[widget.category] = [];
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_WIDGETS>);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Widgets</h2>
      {Object.entries(groupedWidgets).map(([category, widgets]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">{category}</h3>
          <div className="space-y-2">
            {widgets.map((widget) => (
              <WidgetCard key={widget.type} widget={widget} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WidgetCard({ widget }: { widget: typeof AVAILABLE_WIDGETS[0] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${widget.type}`,
    data: { type: 'palette-widget', widgetType: widget.type }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 border rounded-lg cursor-move hover:bg-gray-50 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span className="mr-2">{widget.icon}</span>
      <span className="text-sm font-medium">{widget.label}</span>
    </div>
  );
}
```

**Key Points**:

- Group widgets by category
- Use `useDraggable` for each widget card
- Include widget type in `data` for identification
- Visual feedback during drag

#### 4. PropertyEditor Component

**File**: `components/PageBuilder/PropertyEditor.tsx`

```typescript
import { SchemaFormGenerator } from './SchemaFormGenerator';
import { widgetSchemas } from '@repo/api-types';

interface PropertyEditorProps {
  widget: BaseWidget | null;
  onPropertyChange: (widgetId: string, updates: Partial<BaseWidget>) => void;
  onClose: () => void;
}

export function PropertyEditor({ widget, onPropertyChange, onClose }: PropertyEditorProps) {
  if (!widget) return null;

  const schema = widgetSchemas[widget.type]; // Get schema for widget type

  const handleChange = (field: string, value: any) => {
    onPropertyChange(widget.id, {
      ...widget,
      props: { ...widget.props, [field]: value }
    });
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold">Edit Widget</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-600">Widget Type</label>
          <p className="text-sm">{widget.type}</p>
        </div>

        <SchemaFormGenerator
          schema={schema}
          values={widget.props}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
```

**Key Points**:

- Side panel or modal for property editing
- Dynamically generate form based on widget schema
- Update widget props on change
- Show widget type for context

### Patterns & Best Practices

#### State Management Pattern

Use a reducer pattern with `useReducer` for complex state:

```typescript
type EditorAction =
    | { type: "ADD_WIDGET"; payload: { widget: BaseWidget; position: number } }
    | { type: "REMOVE_WIDGET"; payload: { widgetId: string } }
    | { type: "REORDER_WIDGET"; payload: { widgetId: string; newPosition: number } }
    | { type: "UPDATE_WIDGET"; payload: { widgetId: string; updates: Partial<BaseWidget> } }
    | { type: "SELECT_WIDGET"; payload: { widgetId: string | null } };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case "ADD_WIDGET": {
            const { widget, position } = action.payload;
            const newWidgets = [...state.page.widgets];
            newWidgets.splice(position, 0, widget);
            // Recalculate positions
            newWidgets.forEach((w, idx) => {
                w.position = idx;
            });
            return { ...state, page: { ...state.page, widgets: newWidgets }, isDirty: true };
        }
        // ... other cases
        default:
            return state;
    }
}
```

#### Widget Position Management

Always keep widget positions synchronized with array index:

```typescript
function recalculatePositions(widgets: BaseWidget[]): BaseWidget[] {
    return widgets.map((widget, index) => ({
        ...widget,
        position: index
    }));
}
```

#### Validation Pattern

Validate before state updates:

```typescript
function addWidget(widgetData: Partial<BaseWidget>): boolean {
    try {
        const validated = baseWidgetSchema.parse(widgetData);
        dispatch({ type: "ADD_WIDGET", payload: { widget: validated, position: 0 } });
        return true;
    } catch (error) {
        if (error instanceof z.ZodError) {
            showError(error.errors);
        }
        return false;
    }
}
```

## Integration Points

**How do pieces connect?**

### API Integration

**File**: `api/pages.ts`

```typescript
import { PageConfig, pageConfigSchema } from "@repo/api-types";

const API_BASE = "/api"; // Configure based on environment

export async function fetchPage(pageId: string): Promise<PageConfig> {
    const response = await fetch(`${API_BASE}/pages/${pageId}`);
    if (!response.ok) throw new Error("Failed to fetch page");
    const data = await response.json();
    return pageConfigSchema.parse(data);
}

export async function savePage(page: PageConfig): Promise<PageConfig> {
    const response = await fetch(`${API_BASE}/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page)
    });
    if (!response.ok) throw new Error("Failed to save page");
    const data = await response.json();
    return pageConfigSchema.parse(data);
}

export async function createPage(pageData: Partial<PageConfig>): Promise<PageConfig> {
    const response = await fetch(`${API_BASE}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData)
    });
    if (!response.ok) throw new Error("Failed to create page");
    const data = await response.json();
    return pageConfigSchema.parse(data);
}
```

### Widget Schema Integration

Import and use existing schemas from `@repo/api-types`:

```typescript
import { baseWidgetSchema, heroBannerSchema /* ... */ } from "@repo/api-types/widgets/schemas";

const widgetSchemas = {
    hero_banner: heroBannerSchema,
    flash_sale: flashSaleSchema,
    product_grid: productGridSchema,
    quick_links: quickLinksSchema
};
```

### UI Component Integration

Use shared components from `@repo/ui`:

```typescript
import { Button, Input, Select, ColorPicker } from "@repo/ui";
```

## Error Handling

**How do we handle failures?**

### Error Handling Strategy

1. **API Errors**: Try-catch with user-friendly messages
2. **Validation Errors**: Show inline validation feedback
3. **DnD Errors**: Gracefully cancel drag operations
4. **State Errors**: Error boundaries for component crashes

### Example Error Handling

```typescript
async function handleSave() {
    setIsSaving(true);
    try {
        const validated = pageConfigSchema.parse(page);
        const saved = await savePage(validated);
        setPage(saved);
        setIsDirty(false);
        showSuccess("Page saved successfully");
    } catch (error) {
        if (error instanceof z.ZodError) {
            showError("Validation failed: " + error.errors.map((e) => e.message).join(", "));
        } else {
            showError("Failed to save page. Please try again.");
            console.error(error);
        }
    } finally {
        setIsSaving(false);
    }
}
```

### Logging Approach

- Use `console.error` for errors in development
- Integrate with error tracking service (e.g., Sentry) in production
- Log drag-and-drop events for debugging
- Track performance metrics

## Performance Considerations

**How do we keep it fast?**

### Optimization Strategies

1. **React.memo**: Memoize widget components to prevent unnecessary re-renders
2. **useMemo**: Memoize widget list transformations
3. **useCallback**: Memoize event handlers
4. **Key props**: Use stable widget IDs as keys
5. **Debounce**: Debounce property changes and auto-save

### Example Optimizations

```typescript
// Memoize widget component
const CanvasWidget = React.memo(
    ({ widget, isSelected, onSelect, onRemove }) => {
        // Component implementation
    },
    (prevProps, nextProps) => {
        // Custom comparison for better performance
        return prevProps.widget.id === nextProps.widget.id && prevProps.isSelected === nextProps.isSelected;
    }
);

// Memoize sorted widgets
const sortedWidgets = useMemo(() => {
    return [...widgets].sort((a, b) => a.position - b.position);
}, [widgets]);

// Debounce auto-save
const debouncedSave = useMemo(
    () =>
        debounce((page: PageConfig) => {
            savePage(page);
        }, 2000),
    []
);
```

### Caching Approach

- Cache widget definitions (palette)
- Cache fetched pages in memory
- Use browser cache for API responses (with proper cache headers)

### Query Optimization

- Fetch only necessary page data
- Lazy load widget previews if needed
- Paginate widget palette for very large libraries

## Security Notes

**What security measures are in place?**

### Input Validation

- Validate all widget data against Zod schemas before saving
- Sanitize text inputs to prevent XSS
- Validate color values (hex format)
- Validate URLs (for images, links)

### Authentication/Authorization

- Check user permissions before allowing page edits
- Include auth token in API requests
- Handle 401/403 responses appropriately

### Data Encryption

- Use HTTPS for all API calls
- Store auth tokens securely (httpOnly cookies)
- Do not store sensitive data in localStorage

### Secrets Management

- Store API base URL in environment variables
- Use environment-specific configurations
- Never commit credentials to version control

---

## Implementation Checklist

- [ ] All components follow naming conventions
- [ ] TypeScript strict mode enabled
- [ ] All props interfaces documented with JSDoc
- [ ] Error boundaries in place
- [ ] Accessibility attributes added (ARIA)
- [ ] Performance optimizations applied
- [ ] Input validation implemented
- [ ] API error handling in place
- [ ] Tests written for all components and hooks
- [ ] Documentation updated
