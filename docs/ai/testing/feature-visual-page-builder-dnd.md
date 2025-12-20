---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy: Visual Page Builder with Drag-and-Drop

## Test Coverage Goals

**What level of testing do we aim for?**

- **Unit test coverage target**: 100% of new/changed code (hooks, utilities, reducers)
- **Integration test scope**: Critical user paths (drag from palette, reorder, edit properties, save)
- **End-to-end test scenarios**: Complete page building workflow from empty to saved
- **Alignment**: All acceptance criteria from requirements must have corresponding tests

### Coverage Measurement

```bash
# Run tests with coverage
pnpm test --coverage

# Coverage thresholds in jest.config.js
{
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
}
```

## Unit Tests

**What individual components need testing?**

### Hook: usePageEditor

**File**: `hooks/usePageEditor.test.ts`

- [ ] **Test: Initialize with empty state**: Verify initial state when no pageId provided
- [ ] **Test: Load page by ID**: Mock fetchPage API and verify state populated correctly
- [ ] **Test: Add widget**: Dispatch ADD_WIDGET action, verify widget added to array with correct position
- [ ] **Test: Add widget at specific position**: Add widget at position 2, verify positions recalculated
- [ ] **Test: Remove widget**: Dispatch REMOVE_WIDGET, verify widget removed and positions updated
- [ ] **Test: Reorder widget**: Move widget from position 0 to 2, verify order updated
- [ ] **Test: Update widget properties**: Update widget props, verify state updated and isDirty set
- [ ] **Test: Select widget**: Select widget by ID, verify selectedWidgetId updated
- [ ] **Test: Clear selection**: Set selectedWidgetId to null, verify cleared
- [ ] **Test: Mark as dirty on changes**: Verify isDirty flag set after add/remove/update operations
- [ ] **Test: Handle validation errors**: Attempt to add invalid widget, verify error handled
- [ ] **Test: Save page**: Mock savePage API, verify success updates state and clears isDirty

**Coverage**: State management logic, all reducer actions, API integration

### Hook: useDragAndDrop

**File**: `hooks/useDragAndDrop.test.ts`

- [ ] **Test: Handle palette widget drag start**: Verify drag state updated with widget type
- [ ] **Test: Handle canvas widget drag start**: Verify drag state updated with widget ID
- [ ] **Test: Handle drop on canvas**: Verify onWidgetAdd callback invoked with correct data
- [ ] **Test: Handle drop for reorder**: Verify onWidgetReorder callback invoked
- [ ] **Test: Handle drop outside canvas**: Verify drag cancelled, no callbacks invoked
- [ ] **Test: Handle drag cancel**: Verify drag state reset
- [ ] **Test: Collision detection**: Test closest center strategy for valid drops

**Coverage**: DnD event handling, collision detection logic

### Hook: useAutoSave

**File**: `hooks/useAutoSave.test.ts`

- [ ] **Test: Save to localStorage on change**: Verify debounced save triggered after changes
- [ ] **Test: Restore from localStorage on mount**: Verify data loaded from localStorage
- [ ] **Test: Clear localStorage on successful save**: Verify draft removed after server save
- [ ] **Test: Handle localStorage quota exceeded**: Verify error handled gracefully
- [ ] **Test: Debounce multiple rapid changes**: Verify only one save after multiple changes within debounce window

**Coverage**: Auto-save logic, localStorage integration

### Component: PageBuilder

**File**: `components/PageBuilder/PageBuilder.test.tsx`

- [ ] **Test: Render with empty page**: Verify Canvas shows empty state
- [ ] **Test: Render with widgets**: Verify all widgets rendered in Canvas
- [ ] **Test: Render Widget Palette**: Verify palette displayed with available widgets
- [ ] **Test: Handle drag from palette to canvas**: Simulate drag, verify widget added
- [ ] **Test: Handle widget reorder in canvas**: Simulate reorder drag, verify positions updated
- [ ] **Test: Open property editor on widget selection**: Click widget, verify PropertyEditor opens
- [ ] **Test: Close property editor**: Click close, verify PropertyEditor closes
- [ ] **Test: Save button click**: Click save, verify savePage API called
- [ ] **Test: Handle save error**: Mock API error, verify error message displayed
- [ ] **Test: Show dirty indicator**: Make changes, verify unsaved changes indicator shown
- [ ] **Test: Warn on navigation with unsaved changes**: Attempt to navigate, verify warning shown

**Coverage**: Component integration, user interactions, prop passing

### Component: Canvas

**File**: `components/PageBuilder/Canvas.test.tsx`

- [ ] **Test: Render empty state**: With no widgets, verify EmptyCanvas component shown
- [ ] **Test: Render widgets**: Verify all widgets rendered as CanvasWidget components
- [ ] **Test: Droppable area setup**: Verify useDroppable hook called with 'canvas' id
- [ ] **Test: SortableContext setup**: Verify widget IDs passed to SortableContext
- [ ] **Test: Widget selection**: Click on widget, verify onWidgetSelect callback invoked
- [ ] **Test: Widget removal**: Click remove button, verify onWidgetRemove callback invoked
- [ ] **Test: Selected widget highlight**: Verify selected widget has highlight styling

**Coverage**: Canvas rendering, droppable setup, event handling

### Component: CanvasWidget

**File**: `components/PageBuilder/CanvasWidget.test.tsx`

- [ ] **Test: Render widget**: Verify WidgetRenderer component rendered with correct props
- [ ] **Test: Show drag handle**: Verify drag handle visible and functional
- [ ] **Test: Show selection border**: When isSelected=true, verify border styling applied
- [ ] **Test: Show remove button**: Verify remove button visible on hover or when selected
- [ ] **Test: Click to select**: Click widget, verify onSelect callback invoked
- [ ] **Test: Click remove**: Click remove button, verify onRemove callback invoked
- [ ] **Test: Sortable setup**: Verify useSortable hook called with widget.id

**Coverage**: Widget wrapper functionality, sortable integration

### Component: WidgetPalette

**File**: `components/PageBuilder/WidgetPalette.test.tsx`

- [ ] **Test: Render all categories**: Verify all widget categories displayed
- [ ] **Test: Render widgets in categories**: Verify widgets grouped correctly
- [ ] **Test: Draggable setup**: Verify useDraggable hook called for each widget card
- [ ] **Test: Widget card display**: Verify icon and label displayed for each widget
- [ ] **Test: Drag feedback**: Simulate drag start, verify isDragging styling applied

**Coverage**: Palette rendering, categorization, draggable setup

### Component: PropertyEditor

**File**: `components/PageBuilder/PropertyEditor.test.tsx`

- [ ] **Test: Render when widget selected**: Verify editor panel displayed with widget info
- [ ] **Test: Do not render when no selection**: Verify null returned when widget is null
- [ ] **Test: Render form fields**: Verify SchemaFormGenerator called with correct schema and values
- [ ] **Test: Handle property change**: Simulate field change, verify onPropertyChange callback invoked
- [ ] **Test: Close editor**: Click close button, verify onClose callback invoked
- [ ] **Test: Display widget type**: Verify widget type label shown

**Coverage**: Property editor UI, form integration, callbacks

### Component: SchemaFormGenerator

**File**: `components/PageBuilder/SchemaFormGenerator.test.tsx`

- [ ] **Test: Generate text field**: For string schema field, verify TextField rendered
- [ ] **Test: Generate number field**: For number schema field, verify NumberField rendered
- [ ] **Test: Generate color field**: For hex color string, verify ColorField rendered
- [ ] **Test: Generate checkbox**: For boolean schema field, verify CheckboxField rendered
- [ ] **Test: Generate select**: For enum schema field, verify SelectField rendered
- [ ] **Test: Generate nested fields**: For object schema (e.g., spacing), verify nested fields rendered
- [ ] **Test: Handle optional fields**: Verify optional fields marked correctly
- [ ] **Test: Handle validation**: Simulate invalid input, verify validation error shown
- [ ] **Test: Call onChange**: Simulate field change, verify onChange callback with correct field name and value

**Coverage**: Dynamic form generation, field mapping, validation

### Component: WidgetRenderer

**File**: `components/WidgetRenderer/WidgetRenderer.test.tsx`

- [ ] **Test: Render hero_banner widget**: Verify HeroBannerWidget component rendered
- [ ] **Test: Render flash_sale widget**: Verify FlashSaleWidget component rendered
- [ ] **Test: Render product_grid widget**: Verify ProductGridWidget component rendered
- [ ] **Test: Render quick_links widget**: Verify QuickLinksWidget component rendered
- [ ] **Test: Handle unknown widget type**: Verify fallback/error component shown
- [ ] **Test: Apply common props**: Verify padding, margin, backgroundColor applied to wrapper

**Coverage**: Widget type routing, common props application

### Individual Widget Components

**Files**: `components/WidgetRenderer/HeroBannerWidget.test.tsx` (and others)

- [ ] **Test: Render with all props**: Verify all widget-specific props rendered correctly
- [ ] **Test: Render with minimal props**: Verify required props only, optional props have defaults
- [ ] **Test: Handle missing optional props**: Verify graceful degradation
- [ ] **Test: Apply custom styling**: Verify widget-specific styles applied

**Coverage**: Widget-specific rendering logic

### Utility: widget-helpers

**File**: `utils/widget-helpers.test.ts`

- [ ] **Test: recalculatePositions**: Verify positions updated to match array index
- [ ] **Test: createDefaultWidget**: Verify new widget created with UUID, default props, and correct type
- [ ] **Test: validateWidget**: Verify widget validation against schema
- [ ] **Test: findWidgetById**: Verify widget found by ID in array
- [ ] **Test: insertWidgetAtPosition**: Verify widget inserted at correct position, others shifted

**Coverage**: Widget manipulation utilities, validation

### API Client: pages

**File**: `api/pages.test.ts`

- [ ] **Test: fetchPage success**: Mock API response, verify page returned and validated
- [ ] **Test: fetchPage 404**: Mock 404 response, verify error thrown
- [ ] **Test: fetchPage network error**: Mock network failure, verify error thrown
- [ ] **Test: savePage success**: Mock PUT request, verify page saved and returned
- [ ] **Test: savePage validation error**: Mock validation failure, verify error handled
- [ ] **Test: createPage success**: Mock POST request, verify new page created

**Coverage**: API client functions, error handling, response validation

## Integration Tests

**How do we test component interactions?**

### Integration Test 1: Drag Widget from Palette to Canvas

**File**: `components/PageBuilder/integration/DragFromPalette.test.tsx`

- [ ] **Setup**: Render PageBuilder with empty page
- [ ] **Action**: Simulate drag of HeroBanner widget from palette
- [ ] **Action**: Simulate drop on canvas
- [ ] **Assert**: Verify new widget appears in canvas
- [ ] **Assert**: Verify widget has default props
- [ ] **Assert**: Verify isDirty flag set

### Integration Test 2: Reorder Widgets in Canvas

**File**: `components/PageBuilder/integration/ReorderWidgets.test.tsx`

- [ ] **Setup**: Render PageBuilder with 3 widgets
- [ ] **Action**: Simulate drag of widget at position 0
- [ ] **Action**: Simulate drop at position 2
- [ ] **Assert**: Verify widget moved to new position
- [ ] **Assert**: Verify other widget positions updated
- [ ] **Assert**: Verify isDirty flag set

### Integration Test 3: Edit Widget Properties

**File**: `components/PageBuilder/integration/EditProperties.test.tsx`

- [ ] **Setup**: Render PageBuilder with one widget
- [ ] **Action**: Click on widget to select
- [ ] **Assert**: Verify PropertyEditor opens
- [ ] **Action**: Change title field in property editor
- [ ] **Assert**: Verify widget props updated in canvas
- [ ] **Assert**: Verify isDirty flag set
- [ ] **Action**: Close property editor
- [ ] **Assert**: Verify PropertyEditor closes, selection cleared

### Integration Test 4: Remove Widget

**File**: `components/PageBuilder/integration/RemoveWidget.test.tsx`

- [ ] **Setup**: Render PageBuilder with 2 widgets
- [ ] **Action**: Select first widget
- [ ] **Action**: Click remove button
- [ ] **Assert**: Verify widget removed from canvas
- [ ] **Assert**: Verify remaining widget position updated to 0
- [ ] **Assert**: Verify selection cleared
- [ ] **Assert**: Verify isDirty flag set

### Integration Test 5: Save and Load Page

**File**: `components/PageBuilder/integration/SaveLoad.test.tsx`

- [ ] **Setup**: Mock API endpoints
- [ ] **Action**: Render PageBuilder with pageId
- [ ] **Assert**: Verify fetchPage API called
- [ ] **Assert**: Verify page data loaded into canvas
- [ ] **Action**: Add a widget to canvas
- [ ] **Action**: Click save button
- [ ] **Assert**: Verify savePage API called with correct data
- [ ] **Assert**: Verify isDirty flag cleared on success
- [ ] **Assert**: Verify success notification shown

### Integration Test 6: Validation Error Handling

**File**: `components/PageBuilder/integration/ValidationErrors.test.tsx`

- [ ] **Setup**: Render PageBuilder with one widget
- [ ] **Action**: Select widget and open property editor
- [ ] **Action**: Enter invalid value (e.g., invalid hex color)
- [ ] **Assert**: Verify validation error shown inline
- [ ] **Assert**: Verify widget not updated with invalid value
- [ ] **Action**: Attempt to save page with validation errors
- [ ] **Assert**: Verify save blocked, error message shown

### Integration Test 7: Auto-Save to localStorage

**File**: `components/PageBuilder/integration/AutoSave.test.tsx`

- [ ] **Setup**: Mock localStorage
- [ ] **Action**: Render PageBuilder and add widget
- [ ] **Action**: Wait for debounce timeout
- [ ] **Assert**: Verify page saved to localStorage
- [ ] **Action**: Unmount and remount PageBuilder
- [ ] **Assert**: Verify page restored from localStorage
- [ ] **Action**: Save to server
- [ ] **Assert**: Verify localStorage draft cleared

## End-to-End Tests

**What user flows need validation?**

### E2E Test 1: Complete Page Building Workflow

**Tool**: Playwright or Cypress

- [ ] **Step 1**: Navigate to page builder
- [ ] **Step 2**: Verify empty canvas displayed
- [ ] **Step 3**: Drag Hero Banner widget from palette to canvas
- [ ] **Step 4**: Verify widget appears in canvas
- [ ] **Step 5**: Click on widget to select
- [ ] **Step 6**: Edit widget title in property editor
- [ ] **Step 7**: Verify title updated in canvas preview
- [ ] **Step 8**: Drag Flash Sale widget to canvas below Hero Banner
- [ ] **Step 9**: Drag Quick Links widget to canvas
- [ ] **Step 10**: Reorder widgets by dragging Flash Sale to top
- [ ] **Step 11**: Click save button
- [ ] **Step 12**: Verify success message
- [ ] **Step 13**: Reload page
- [ ] **Step 14**: Verify all widgets and order persisted

### E2E Test 2: Error Recovery

- [ ] **Step 1**: Open page builder
- [ ] **Step 2**: Add several widgets
- [ ] **Step 3**: Simulate network error (block API)
- [ ] **Step 4**: Attempt to save
- [ ] **Step 5**: Verify error message shown
- [ ] **Step 6**: Verify retry button available
- [ ] **Step 7**: Restore network
- [ ] **Step 8**: Click retry
- [ ] **Step 9**: Verify save succeeds

### E2E Test 3: Keyboard Navigation (Accessibility)

- [ ] **Step 1**: Navigate to page builder using only keyboard
- [ ] **Step 2**: Tab through widget palette
- [ ] **Step 3**: Press Enter to initiate drag (keyboard-accessible drag)
- [ ] **Step 4**: Use arrow keys to position widget
- [ ] **Step 5**: Press Enter to drop
- [ ] **Step 6**: Tab to canvas widgets
- [ ] **Step 7**: Press Delete to remove widget
- [ ] **Step 8**: Verify widget removed

## Test Data

**What data do we use for testing?**

### Mock Widgets

```typescript
const mockHeroBanner: BaseWidget = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    type: "hero_banner",
    position: 0,
    commonProps: {
        padding: { top: 20, right: 20, bottom: 20, left: 20 },
        backgroundColor: "#FFFFFF"
    },
    props: {
        title: "Test Hero",
        subtitle: "Test Subtitle",
        ctaText: "Click Me",
        ctaLink: "https://example.com",
        imageUrl: "https://via.placeholder.com/800x400"
    }
};

const mockFlashSale: BaseWidget = {
    id: "223e4567-e89b-12d3-a456-426614174001",
    type: "flash_sale",
    position: 1,
    commonProps: {},
    props: {
        title: "Flash Sale!",
        endTime: "2025-12-31T23:59:59Z",
        discountPercent: 50
    }
};
```

### Mock Page Config

```typescript
const mockPageConfig: PageConfig = {
    id: "page-123",
    title: "Test Page",
    slug: "test-page",
    widgets: [mockHeroBanner, mockFlashSale],
    metadata: {
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-02T00:00:00Z",
        status: "draft"
    }
};
```

### Test Fixtures Directory

Create `__fixtures__` directory with reusable test data:

```
tests/
  __fixtures__/
    widgets.ts
    pages.ts
    schemas.ts
```

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test PageBuilder.test.tsx

# Run integration tests only
pnpm test --testPathPattern=integration
```

### Coverage Thresholds

Configure in `jest.config.js`:

```javascript
module.exports = {
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        "./src/hooks/": {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        }
    }
};
```

### Coverage Gaps

**Files/Functions Below 100% and Rationale**:

- TBD after initial test implementation
- Document any intentional gaps (e.g., error handling for edge cases)

### Test Reports

- **HTML Coverage Report**: Generated in `coverage/` directory
- **Console Output**: Summary of passed/failed tests
- **CI/CD Integration**: Tests run on every PR, block merge if failing

## Manual Testing

**What requires human validation?**

### UI/UX Testing Checklist

- [ ] **Visual Design**: All components match design system
- [ ] **Drag-and-drop Feel**: Dragging feels smooth and responsive
- [ ] **Drop Zones**: Drop zones are clearly visible and intuitive
- [ ] **Property Editor**: Form fields are easy to use and understand
- [ ] **Error Messages**: Errors are clear and actionable
- [ ] **Loading States**: Loading indicators appear for async operations
- [ ] **Animations**: Transitions are smooth, not jarring

### Accessibility Testing

- [ ] **Keyboard Navigation**: All features accessible via keyboard
- [ ] **Screen Reader**: Test with NVDA or JAWS
    - Widget palette is announced correctly
    - Drag operations are announced
    - Form fields have proper labels
- [ ] **Focus Management**: Focus is visible and logical
- [ ] **Color Contrast**: WCAG AA compliance (4.5:1 for text)
- [ ] **ARIA Labels**: All interactive elements have labels

### Browser/Device Compatibility

- [ ] **Chrome 90+**: Desktop (Windows, macOS, Linux)
- [ ] **Firefox 88+**: Desktop
- [ ] **Safari 14+**: macOS
- [ ] **Edge 90+**: Windows
- [ ] **Resolution**: Test at 1280px, 1920px, and 2560px widths

### Smoke Tests After Deployment

- [ ] Page builder loads without errors
- [ ] Can drag widget from palette to canvas
- [ ] Can save page
- [ ] Can load existing page
- [ ] No console errors

## Performance Testing

**How do we validate performance?**

### Load Testing Scenarios

- [ ] **Load page with 50 widgets**: Should load in < 2 seconds
- [ ] **Load page with 100 widgets**: Should load in < 5 seconds
- [ ] **Drag operation frame rate**: Maintain 60fps during drag
- [ ] **Save operation**: Complete in < 500ms
- [ ] **Property editor open**: Open in < 50ms

### Stress Testing

- [ ] Add 100 widgets rapidly
- [ ] Reorder widgets 50 times
- [ ] Open and close property editor 50 times
- [ ] Monitor memory usage over 30 minutes
- [ ] Verify no memory leaks

### Performance Benchmarks

Use Chrome DevTools Performance profiler:

- Record drag-and-drop operation
- Verify no frame drops (60fps = 16.67ms per frame)
- Verify render time < 100ms
- Verify JavaScript execution time < 50ms

### Optimization Verification

- [ ] Verify React.memo prevents unnecessary re-renders
- [ ] Verify useMemo caches expensive computations
- [ ] Verify useCallback prevents function re-creation
- [ ] Verify list virtualization (if implemented) works correctly

## Bug Tracking

**How do we manage issues?**

### Issue Tracking Process

1. **Discovery**: Bug found during testing
2. **Report**: Create issue in GitHub/Jira with:
    - Steps to reproduce
    - Expected vs actual behavior
    - Screenshots/videos
    - Browser/environment info
    - Severity level
3. **Triage**: Assign priority (P0-P3)
4. **Fix**: Developer implements fix
5. **Verify**: Tester verifies fix
6. **Close**: Issue marked as resolved

### Bug Severity Levels

- **P0 (Critical)**: App crashes, data loss, security vulnerability
- **P1 (High)**: Core functionality broken, no workaround
- **P2 (Medium)**: Functionality impaired, workaround exists
- **P3 (Low)**: Minor issue, cosmetic, edge case

### Regression Testing Strategy

- Maintain regression test suite
- Run full suite before each release
- Add test for each bug fix to prevent regression
- Automate as much as possible

---

## Testing Checklist

- [ ] All unit tests written and passing (100% coverage)
- [ ] All integration tests written and passing
- [ ] E2E tests implemented for critical paths
- [ ] Manual testing completed across browsers
- [ ] Accessibility testing completed (keyboard + screen reader)
- [ ] Performance testing completed (meets benchmarks)
- [ ] Test documentation updated
- [ ] Coverage report reviewed (no gaps without justification)
- [ ] Regression test suite updated
- [ ] Bug tracking process in place
