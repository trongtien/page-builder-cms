---
phase: implementation
title: Implementation Notes
description: Track implementation progress, decisions, and issues
---

# Implementation Notes: Floating Submenu Hook

## Implementation Log

### Session 1: Hook Implementation (In Progress)

**Date:** December 17, 2025

**Tasks Completed:**

- Created requirements documentation
- Created design documentation
- Created planning documentation

**Next Steps:**

- Implement useFloatingTooltip hook
- Implement useFloatingSubmenu hook
- Update SidebarMenuItem to use hooks

## Code Structure

### useFloatingTooltip Hook

**Location:** `packages/core/ui/src/hooks/useFloatingTooltip.tsx`

**Key Implementation Details:**

- Supports both controlled and uncontrolled state
- Default placement: "right"
- Default offset: 4px for visual separation
- Delays: 100ms open, 200ms close (less urgent than submenu)
- Uses useHover for mouse interactions
- Uses useRole for accessibility (role="tooltip")
- Returns refs, styles, and prop getters for easy spreading

**Usage Example:**

```typescript
const tooltip = useFloatingTooltip({
  isOpen: showTooltip,
  onOpenChange: setShowTooltip
});

<button ref={tooltip.refs.setReference} {...tooltip.getReferenceProps()}>
  Hover me
</button>

{tooltip.isOpen && (
  <div
    ref={tooltip.refs.setFloating}
    style={tooltip.floatingStyles}
    {...tooltip.getFloatingProps()}
  >
    Tooltip content
  </div>
)}
```

### useFloatingSubmenu Hook

**Location:** `packages/core/ui/src/hooks/useFloatingSubmenu.tsx`

**Key Implementation Details:**

- Supports both controlled and uncontrolled state
- Default placement: "right-start" for aligned dropdown
- Default offset: 0px for no gap (enables smooth hover)
- Delays: 50ms open, 300ms close (quick access, delayed close)
- Uses useHover with safePolygon for diagonal mouse movement
- Uses useFocus for keyboard navigation
- Uses useDismiss for Escape key and outside clicks
- Uses useRole for accessibility (role="menu")
- Returns refs, styles, and prop getters

**Usage Example:**

```typescript
const submenu = useFloatingSubmenu({
  isOpen: showSubmenu,
  onOpenChange: setShowSubmenu
});

<button ref={submenu.refs.setReference} {...submenu.getReferenceProps()}>
  Menu
</button>

{submenu.isOpen && (
  <div
    ref={submenu.refs.setFloating}
    style={submenu.floatingStyles}
    {...submenu.getFloatingProps()}
  >
    <ul>...</ul>
  </div>
)}
```

## Technical Decisions

**Decision 1: Controlled vs Uncontrolled Pattern**

- Implemented both patterns using the same technique as React's controlled inputs
- If isOpen/onOpenChange provided, use them (controlled)
- Otherwise, use internal useState (uncontrolled)
- Allows flexibility for different use cases

**Decision 2: Default Values**

- Based on currently working configuration in SidebarMenuItem
- Tooltip: More conservative delays, larger offset
- Submenu: Aggressive open delay, zero offset for smooth hover
- Can be overridden via options

**Decision 3: Type Exports**

- Export both option and return types
- Enables consumers to type their own wrappers
- Better IDE autocomplete

**Decision 4: No FloatingPortal**

- Don't include portal in hooks
- Let consumer decide if portal is needed
- Previous testing showed inline rendering works better

## Issues & Resolutions

### Issue 1: (Placeholder - track as implementation progresses)

**Problem:** TBD

**Solution:** TBD

**Learning:** TBD

## Testing Notes

### Manual Testing Checklist

- [ ] Tooltip appears on hover (items without children)
- [ ] Submenu appears on hover (items with children)
- [ ] Smooth mouse movement from button to floating element
- [ ] safePolygon allows diagonal mouse movement
- [ ] Delays feel appropriate (not too slow, not too fast)
- [ ] Keyboard Tab/Enter/Escape work
- [ ] Focus states work correctly
- [ ] Clicking dismisses as expected
- [ ] Multiple rapid hovers don't cause glitches
- [ ] Expanded sidebar still works (normal behavior)

### Performance Testing

- [ ] Bundle size remains acceptable (~17KB)
- [ ] No memory leaks on repeated hover
- [ ] Smooth 60fps animations
- [ ] No console errors or warnings

## Code Snippets

### Before (SidebarMenuItem - 180 lines)

```typescript
// 40+ lines of Floating UI configuration for tooltip
const {
    refs: tooltipRefs,
    floatingStyles: tooltipStyles,
    context: tooltipContext
} = useFloating({...});

const tooltipHover = useHover(tooltipContext, {...});
const tooltipFocus = useFocus(tooltipContext);
// ... more hooks

const { getReferenceProps: getTooltipReferenceProps, ... } = useInteractions([...]);

// Another 40+ lines for submenu
// ...
```

### After (SidebarMenuItem - target <120 lines)

```typescript
// Simple hook calls
const tooltip = useFloatingTooltip({
    isOpen: showTooltip,
    onOpenChange: setShowTooltip
});

const submenu = useFloatingSubmenu({
    isOpen: showSubmenu,
    onOpenChange: setShowSubmenu
});
```

## Remaining Work

See [planning document](../planning/feature-floating-submenu-hook.md) for detailed task list.

**Current Status:** Phase 1 starting (hook implementation)
