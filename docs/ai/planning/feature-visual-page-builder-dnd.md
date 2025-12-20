---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown: Visual Page Builder with Drag-and-Drop

## Milestones

**What are the major checkpoints?**

- [ ] **Milestone 1**: Foundation & Setup (Package structure, dependencies, base components)
- [ ] **Milestone 2**: Core Drag-and-Drop (Palette to Canvas, basic reordering)
- [ ] **Milestone 3**: Widget Management (Selection, property editing, removal)
- [ ] **Milestone 4**: Data Persistence (Save/load pages, validation)
- [ ] **Milestone 5**: Polish & Testing (Error handling, accessibility, full test coverage)

## Task Breakdown

**What specific work needs to be done?**

### Phase 1: Foundation & Setup (Est: 4-6 hours)

- [ ] **Task 1.1**: Install and configure dnd-kit dependencies
    - Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` to `editor-builder`
    - Update package.json
    - Verify installation

- [ ] **Task 1.2**: Create page configuration schema in api-types
    - Create `packages/core/api-types/src/page/schema.ts`
    - Define `pageConfigSchema` with Zod
    - Export types
    - Add tests for schema validation

- [ ] **Task 1.3**: Set up base component structure
    - Create `packages/core/editor-builder/src/components/PageBuilder/` directory
    - Create `PageBuilder.tsx` (empty shell)
    - Create `Canvas.tsx` (empty shell)
    - Create `WidgetPalette.tsx` (empty shell)
    - Create `PropertyEditor.tsx` (empty shell)
    - Set up barrel exports

- [ ] **Task 1.4**: Create widget renderer components
    - Create `packages/core/editor-builder/src/components/WidgetRenderer/` directory
    - Create `WidgetRenderer.tsx` (factory component)
    - Create placeholder renderers for each widget type:
        - `HeroBannerWidget.tsx`
        - `FlashSaleWidget.tsx`
        - `ProductGridWidget.tsx`
        - `QuickLinksWidget.tsx`
    - Apply commonProps (padding, margin, backgroundColor)

- [ ] **Task 1.5**: Set up custom hooks directory
    - Create `packages/core/editor-builder/src/hooks/` directory
    - Create `usePageEditor.ts` (state management hook - stub)
    - Create `useDragAndDrop.ts` (dnd-kit integration - stub)

### Phase 2: Widget Palette (Est: 6-8 hours)

- [ ] **Task 2.1**: Implement WidgetPalette component
    - Create widget definition interface
    - Define available widgets with metadata (icon, label, category)
    - Render widget cards in categorized sections
    - Style with Tailwind CSS

- [ ] **Task 2.2**: Add drag functionality to palette widgets
    - Integrate `useDraggable` hook from dnd-kit
    - Create drag handle for each widget card
    - Add visual feedback on drag start
    - Show drag overlay with widget preview

- [ ] **Task 2.3**: Add widget categories and organization
    - Group widgets by category (Promotional, Content, etc.)
    - Add collapsible category sections
    - Add search/filter functionality (optional, low priority)

- [ ] **Task 2.4**: Style and polish widget palette
    - Add icons for each widget type
    - Implement hover states
    - Add tooltips with widget descriptions
    - Ensure responsive layout for palette

### Phase 3: Canvas & Drop Functionality (Est: 8-10 hours)

- [ ] **Task 3.1**: Implement Canvas component structure
    - Render list of widgets from editor state
    - Handle empty canvas state
    - Set up droppable area for canvas
    - Style canvas with Tailwind

- [ ] **Task 3.2**: Implement drop functionality for new widgets
    - Integrate `useDroppable` hook from dnd-kit
    - Handle `onDragEnd` event to add widget to canvas
    - Generate new widget with UUID and default props
    - Update widget positions after drop
    - Validate dropped widget data

- [ ] **Task 3.3**: Implement CanvasWidget wrapper component
    - Wrap each widget in canvas with drag handle
    - Add selection border/highlight
    - Add remove button
    - Show widget type label
    - Handle click to select

- [ ] **Task 3.4**: Add visual drop zones
    - Show insertion indicators between widgets
    - Highlight valid drop areas during drag
    - Show "drop here" placeholder
    - Handle edge cases (empty canvas, single widget)

### Phase 4: Widget Reordering (Est: 6-8 hours)

- [ ] **Task 4.1**: Implement sortable functionality in canvas
    - Integrate `useSortable` hook from dnd-kit
    - Enable drag-to-reorder for existing widgets
    - Update widget positions on reorder
    - Smooth animations during reorder

- [ ] **Task 4.2**: Implement collision detection
    - Configure collision detection strategy
    - Handle overlapping drop zones
    - Prioritize palette drops vs reorder drops
    - Test edge cases

- [ ] **Task 4.3**: Add DnD Context Provider
    - Create `DndContext` wrapper in PageBuilder
    - Configure sensors (mouse, touch, keyboard)
    - Set up drag overlay
    - Handle drag cancel scenarios

- [ ] **Task 4.4**: Optimize drag performance
    - Implement proper React keys
    - Use React.memo for widget components
    - Debounce state updates during drag
    - Profile and optimize re-renders

### Phase 5: Widget Selection & Property Editing (Est: 8-10 hours)

- [ ] **Task 5.1**: Implement widget selection
    - Add click handler to canvas widgets
    - Update selected widget in editor state
    - Show visual selection indicator
    - Clear selection on canvas click

- [ ] **Task 5.2**: Implement PropertyEditor component
    - Create side panel or modal for property editing
    - Show selected widget info (type, id)
    - Render close button
    - Style with Tailwind

- [ ] **Task 5.3**: Create dynamic form generator from Zod schema
    - Create `SchemaFormGenerator` component
    - Map Zod types to form fields (string → text, number → number, etc.)
    - Handle nested objects (commonProps, spacing)
    - Support enums (select dropdowns)
    - Handle optional fields

- [ ] **Task 5.4**: Implement specific property field components
    - `TextField` - for string inputs
    - `NumberField` - for number inputs with min/max
    - `ColorField` - for hex color with picker
    - `SpacingField` - for padding/margin (4 values)
    - `CheckboxField` - for boolean values
    - `SelectField` - for enum values

- [ ] **Task 5.5**: Connect property editor to widget state
    - Handle property change events
    - Validate changes against schema
    - Update widget in editor state
    - Show validation errors
    - Implement real-time or on-blur updates

- [ ] **Task 5.6**: Add common props editor
    - Create `CommonPropsEditor` component
    - Editor for padding (top, right, bottom, left)
    - Editor for margin (top, right, bottom, left)
    - Color picker for backgroundColor
    - Checkbox for hidden property

### Phase 6: Widget Removal (Est: 2-3 hours)

- [ ] **Task 6.1**: Add remove widget functionality
    - Add delete button to selected widget
    - Show confirmation dialog (optional)
    - Remove widget from editor state
    - Update positions of remaining widgets
    - Clear selection if removed widget was selected

- [ ] **Task 6.2**: Add keyboard shortcuts
    - Delete key to remove selected widget
    - Escape key to clear selection
    - Tab to navigate between widgets (accessibility)

### Phase 7: State Management (Est: 6-8 hours)

- [ ] **Task 7.1**: Implement usePageEditor hook
    - Define EditorState interface
    - Create reducer for editor actions (add, remove, reorder, update widget)
    - Implement action creators
    - Handle position recalculation
    - Implement dirty flag tracking

- [ ] **Task 7.2**: Add validation logic
    - Validate widget data against schemas before state updates
    - Validate entire page config before save
    - Show validation errors in UI
    - Prevent invalid operations

- [ ] **Task 7.3**: Implement undo/redo (optional, medium priority)
    - Track state history
    - Implement undo action
    - Implement redo action
    - Add keyboard shortcuts (Ctrl+Z, Ctrl+Y)
    - Limit history size

### Phase 8: Data Persistence (Est: 6-8 hours)

- [ ] **Task 8.1**: Create API client for pages
    - Create `packages/core/editor-builder/src/api/pages.ts`
    - Implement `fetchPage(pageId)` function
    - Implement `savePage(pageConfig)` function
    - Implement `createPage(pageData)` function
    - Handle errors and retries

- [ ] **Task 8.2**: Implement page loading in PageBuilder
    - Fetch page data on mount (if pageId provided)
    - Show loading state
    - Handle errors (404, network errors)
    - Populate editor state with loaded page

- [ ] **Task 8.3**: Implement save functionality
    - Add save button to PageBuilder toolbar
    - Validate page before save
    - Show saving state (spinner)
    - Handle save errors
    - Update metadata (updatedAt)
    - Clear dirty flag on success

- [ ] **Task 8.4**: Implement auto-save to localStorage
    - Save draft to localStorage on changes
    - Debounce auto-save (e.g., 2 seconds after last change)
    - Restore from localStorage on mount
    - Clear localStorage on successful save
    - Handle localStorage quota errors

- [ ] **Task 8.5**: Add unsaved changes warning
    - Track dirty flag
    - Show warning dialog on navigation away
    - Add browser beforeunload handler
    - Provide save/discard/cancel options

### Phase 9: Error Handling & Edge Cases (Est: 4-6 hours)

- [ ] **Task 9.1**: Implement error boundaries
    - Add React error boundary around PageBuilder
    - Show user-friendly error messages
    - Log errors for debugging
    - Provide recovery actions

- [ ] **Task 9.2**: Handle drag-and-drop edge cases
    - Dragging outside canvas
    - Dropping invalid widgets
    - Dragging while property editor is open
    - Simultaneous drags (shouldn't happen, but handle)
    - Network errors during drag operations

- [ ] **Task 9.3**: Handle empty states
    - Empty canvas with helpful instructions
    - Empty widget palette (shouldn't happen)
    - No selected widget
    - Failed to load page

- [ ] **Task 9.4**: Add loading and error states
    - Loading spinner for page fetch
    - Skeleton loaders for canvas
    - Error messages with retry actions
    - Network offline indicators

### Phase 10: Polish & Accessibility (Est: 6-8 hours)

- [ ] **Task 10.1**: Implement keyboard navigation
    - Tab through widgets
    - Arrow keys to move selection
    - Enter to select/open property editor
    - Delete to remove widget
    - Escape to close property editor
    - Keyboard shortcuts for common actions

- [ ] **Task 10.2**: Add ARIA labels and screen reader support
    - ARIA roles for canvas, palette, property editor
    - Announcements for drag operations
    - Labels for all interactive elements
    - Focus management
    - Semantic HTML

- [ ] **Task 10.3**: Improve visual feedback
    - Smooth transitions and animations
    - Clear hover states
    - Drag preview styling
    - Loading indicators
    - Success/error notifications

- [ ] **Task 10.4**: Add helpful UI elements
    - Tooltips for buttons
    - Help text for property fields
    - Onboarding tour (optional)
    - Empty state illustrations

- [ ] **Task 10.5**: Responsive styling (desktop only)
    - Ensure layout works on 1280px+ screens
    - Test on various monitor sizes
    - Handle very wide/tall monitors

### Phase 11: Testing (Est: 10-12 hours)

- [ ] **Task 11.1**: Write unit tests for hooks
    - Test `usePageEditor` hook
    - Test `useDragAndDrop` hook
    - Test state reducers
    - Test validation logic
    - Aim for 100% coverage

- [ ] **Task 11.2**: Write unit tests for components
    - Test PageBuilder component
    - Test Canvas component
    - Test WidgetPalette component
    - Test PropertyEditor component
    - Test WidgetRenderer components
    - Aim for 100% coverage

- [ ] **Task 11.3**: Write integration tests
    - Test drag from palette to canvas
    - Test widget reordering
    - Test widget selection and editing
    - Test widget removal
    - Test save/load operations

- [ ] **Task 11.4**: Write end-to-end tests (optional, low priority)
    - Test complete page building workflow
    - Test error scenarios
    - Test accessibility features

- [ ] **Task 11.5**: Manual testing
    - Test on different browsers
    - Test keyboard navigation
    - Test with screen reader
    - Test edge cases
    - Performance testing with many widgets

### Phase 12: Documentation (Est: 3-4 hours)

- [ ] **Task 12.1**: Write component documentation
    - JSDoc comments for all components
    - Props documentation
    - Usage examples
    - Document custom hooks

- [ ] **Task 12.2**: Create README for editor-builder package
    - Overview of page builder
    - Installation instructions
    - Basic usage example
    - API reference
    - Architecture diagram

- [ ] **Task 12.3**: Update implementation docs
    - Fill in `docs/ai/implementation/feature-visual-page-builder-dnd.md`
    - Document key patterns and decisions
    - Add troubleshooting section

- [ ] **Task 12.4**: Create demo/example
    - Create example page in host-root
    - Show how to integrate PageBuilder
    - Demonstrate all features

## Dependencies

**What needs to happen in what order?**

### Critical Path

1. Phase 1 (Foundation) must be completed first
2. Phase 2 (Widget Palette) and Phase 3 (Canvas) can be done in parallel after Phase 1
3. Phase 4 (Reordering) depends on Phase 3
4. Phase 5 (Property Editing) depends on Phase 3
5. Phase 6 (Widget Removal) depends on Phase 3
6. Phase 7 (State Management) can be done alongside Phases 2-6
7. Phase 8 (Data Persistence) depends on Phase 7
8. Phase 9 (Error Handling) can be done alongside other phases
9. Phase 10 (Polish) depends on most features being complete
10. Phase 11 (Testing) should be done incrementally, but final testing depends on all features
11. Phase 12 (Documentation) can be done last

### External Dependencies

- **Widget schemas**: Already exist in `@repo/api-types` ✅
- **UI components**: Available in `@repo/ui` ✅
- **Backend API**: May need to create new endpoints for page CRUD operations ⚠️
- **Authentication**: May need to integrate with existing auth system ⚠️

### Team/Resource Dependencies

- Frontend developer with React + TypeScript experience
- Familiarity with dnd-kit library (or time to learn)
- Access to design system and UI components
- Backend developer for API endpoints (if needed)

## Timeline & Estimates

**When will things be done?**

### High-Level Estimate

- **Total Estimated Effort**: 75-95 hours
- **With 1 full-time developer**: 2-3 weeks
- **With 1 part-time developer (50%)**: 4-6 weeks

### Phase Estimates

- Phase 1: Foundation - 4-6 hours (Day 1)
- Phase 2: Widget Palette - 6-8 hours (Day 1-2)
- Phase 3: Canvas & Drop - 8-10 hours (Day 2-3)
- Phase 4: Reordering - 6-8 hours (Day 3-4)
- Phase 5: Property Editing - 8-10 hours (Day 4-5)
- Phase 6: Widget Removal - 2-3 hours (Day 5)
- Phase 7: State Management - 6-8 hours (Day 6)
- Phase 8: Data Persistence - 6-8 hours (Day 7)
- Phase 9: Error Handling - 4-6 hours (Day 8)
- Phase 10: Polish & A11y - 6-8 hours (Day 8-9)
- Phase 11: Testing - 10-12 hours (Day 9-10)
- Phase 12: Documentation - 3-4 hours (Day 10)

### Milestones Timeline

- **Milestone 1**: End of Day 1
- **Milestone 2**: End of Day 4
- **Milestone 3**: End of Day 6
- **Milestone 4**: End of Day 7
- **Milestone 5**: End of Day 10

### Buffer

- Add 20-30% buffer for unknowns, debugging, and iteration

## Risks & Mitigation

**What could go wrong?**

### Risk 1: dnd-kit learning curve

**Impact**: High | **Probability**: Medium

- **Description**: Team may need time to learn dnd-kit library
- **Mitigation**: Allocate time for spike/prototyping; read official docs and examples first
- **Contingency**: Use simpler drag-and-drop approach if dnd-kit proves too complex

### Risk 2: Performance issues with many widgets

**Impact**: Medium | **Probability**: Medium

- **Description**: Canvas may lag with 50+ widgets
- **Mitigation**: Implement React.memo, virtualization, and performance profiling early
- **Contingency**: Add pagination or widget limit; implement lazy loading

### Risk 3: Complex property editing for diverse widget types

**Impact**: High | **Probability**: Medium

- **Description**: Dynamic form generation may not handle all widget schemas well
- **Mitigation**: Start with simple widgets; iterate on form generator; allow manual overrides
- **Contingency**: Create custom editors for complex widgets

### Risk 4: Backend API not ready

**Impact**: High | **Probability**: Low

- **Description**: Page CRUD endpoints may not exist yet
- **Mitigation**: Define API contract early; use mock API during development
- **Contingency**: Implement localStorage-only persistence first

### Risk 5: Browser compatibility issues

**Impact**: Medium | **Probability**: Low

- **Description**: Drag-and-drop may behave differently across browsers
- **Mitigation**: Test on all target browsers early; use polyfills if needed
- **Contingency**: Limit browser support to Chrome/Edge initially

### Risk 6: Scope creep

**Impact**: High | **Probability**: High

- **Description**: Feature requests may expand scope (templates, collaboration, responsive preview)
- **Mitigation**: Stick to defined requirements; defer enhancements to future phases
- **Contingency**: Re-prioritize tasks; push non-essential features to Phase 2

### Risk 7: Accessibility compliance

**Impact**: Medium | **Probability**: Medium

- **Description**: Making drag-and-drop accessible is challenging
- **Mitigation**: Use dnd-kit's accessibility features; test with screen readers; follow WCAG guidelines
- **Contingency**: Provide alternative non-drag interface for accessibility

## Resources Needed

**What do we need to succeed?**

### Team Members & Roles

- **Frontend Developer** (primary): Implement React components, hooks, and dnd-kit integration
- **UI/UX Designer** (supporting): Provide mockups, design system guidance, and usability feedback
- **Backend Developer** (supporting): Create page CRUD API endpoints (if needed)
- **QA Engineer** (supporting): Manual testing, accessibility testing, cross-browser testing

### Tools & Services

- **dnd-kit**: Drag-and-drop library (open source)
- **Zod**: Already in use for schema validation ✅
- **Tailwind CSS**: Already in use for styling ✅
- **React Testing Library**: For component tests ✅
- **Storybook** (optional): For component development and documentation

### Infrastructure

- **Development environment**: Local dev server ✅
- **Test environment**: For integration testing
- **Staging environment**: For QA and stakeholder review

### Documentation/Knowledge

- **dnd-kit documentation**: https://docs.dndkit.com/
- **Zod documentation**: https://zod.dev/
- **React accessibility guide**: https://react.dev/learn/accessibility
- **WCAG guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

### External Dependencies

- Confirm API endpoint specifications
- Confirm authentication/authorization requirements
- Access to design system documentation
