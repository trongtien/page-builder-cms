---
phase: testing
title: Testing Strategy
description: Define test cases and validation approach
---

# Testing Strategy: Floating Submenu Hook

## Testing Approach

**Primary Focus:** Integration testing via manual verification

**Why:**

- Hooks depend on browser interactions (hover, focus, positioning)
- Floating UI library already has unit tests
- Most value from testing real user interactions

**Secondary:** Unit tests for hook state management (future enhancement)

## Test Cases

### TC-1: Tooltip Display (Items without children)

**Given:** Sidebar is collapsed, menu item has no children  
**When:** User hovers over menu icon  
**Then:**

- Tooltip appears to the right of icon within 100ms
- Tooltip shows menu item label
- Tooltip has white background and border
- Tooltip maintains 4px offset from icon

**Edge Cases:**

- Rapid hover on/off (tooltip should cleanly show/hide)
- Hover while another tooltip is showing (should close previous)

### TC-2: Submenu Display (Items with children)

**Given:** Sidebar is collapsed, menu item has children  
**When:** User hovers over menu icon  
**Then:**

- Submenu appears to the right of icon within 50ms
- Submenu shows item label and child menu items
- Submenu has white background and border
- Submenu has 0px offset from icon (no gap)

**Edge Cases:**

- Rapid hover on/off
- Hover while another submenu is open

### TC-3: Smooth Hover Interaction

**Given:** Submenu is displayed  
**When:** User moves mouse from icon to submenu  
**Then:**

- Submenu remains open during mouse movement
- safePolygon allows diagonal mouse movement
- No flickering or closing during transition

**Critical:** This was the main issue we've been fixing

### TC-4: Submenu Interaction

**Given:** Submenu is displayed  
**When:** User hovers over submenu items  
**Then:**

- Submenu remains open
- User can click on submenu items
- Clicking a child item sets it as active

### TC-5: Submenu Closing

**Given:** Submenu is displayed  
**When:** User moves mouse away from both icon and submenu  
**Then:**

- Submenu closes after 300ms delay
- Delay gives user time to return if accidental

### TC-6: Tooltip Closing

**Given:** Tooltip is displayed  
**When:** User moves mouse away from icon  
**Then:**

- Tooltip closes after 200ms delay

### TC-7: Click Interaction

**Given:** Tooltip or submenu is displayed  
**When:** User clicks the icon  
**Then:**

- For items without children: Sets active item, tooltip may close
- For items with children: Toggles submenu, dispatches toggle action

### TC-8: Keyboard Navigation

**Given:** Sidebar menu item has focus  
**When:** User presses Tab/Enter/Escape  
**Then:**

- Tab moves focus to next item
- Enter activates the item
- Escape dismisses any open tooltip/submenu

### TC-9: Expanded Sidebar Behavior

**Given:** Sidebar is expanded (not collapsed)  
**When:** User interacts with menu items  
**Then:**

- No tooltips or floating submenus appear
- Normal accordion behavior (items expand inline)
- Children show below parent with indentation

### TC-10: Window Resize

**Given:** Tooltip or submenu is displayed  
**When:** User resizes browser window  
**Then:**

- Floating element repositions correctly
- autoUpdate keeps position in sync
- No visual glitches

### TC-11: Overflow/Flip Behavior

**Given:** Menu item is near edge of viewport  
**When:** Tooltip/submenu would overflow screen  
**Then:**

- flip() middleware repositions to fit
- shift() middleware adjusts position
- Element remains fully visible

## Accessibility Testing

### A11y-1: ARIA Roles

**Test:** Inspect elements with dev tools  
**Expected:**

- Tooltip has role="tooltip"
- Submenu has role="menu"
- Proper aria-describedby or aria-controls

### A11y-2: Keyboard Support

**Test:** Navigate using only keyboard  
**Expected:**

- All menu items reachable via Tab
- Enter activates items
- Escape closes floating elements

### A11y-3: Focus Management

**Test:** Tab through menu with screen reader  
**Expected:**

- Focus indicators visible
- Screen reader announces menu items
- Focus returns appropriately after interaction

## Performance Testing

### P-1: Bundle Size

**Test:** Run `pnpm build` and check output  
**Expected:**

- Total bundle size ~17-18KB (similar to before)
- Extracting to hooks should not increase size significantly

### P-2: Memory Leaks

**Test:** Repeatedly hover on/off for 30 seconds  
**Expected:**

- No memory growth in dev tools
- Floating UI properly cleans up listeners
- React properly unmounts components

### P-3: Animation Performance

**Test:** Monitor FPS during hover interactions  
**Expected:**

- Smooth 60fps animations
- No jank during position updates
- No layout thrashing

## Regression Testing

### R-1: Original Functionality Preserved

**Test:** Compare new behavior to old behavior  
**Expected:**

- Visual appearance identical
- Timing feels the same (delays match)
- All original features still work

### R-2: Context Integration

**Test:** Verify layout context still works  
**Expected:**

- Active menu item state managed correctly
- Expanded menu items state works
- Sidebar toggle works
- Dispatch actions reach reducer

### R-3: Build Process

**Test:** `pnpm build` completes successfully  
**Expected:**

- No TypeScript errors
- No ESLint warnings
- No build failures
- Proper tree-shaking

## Test Execution Log

### Test Run 1: (After Implementation)

**Date:** December 17, 2025  
**Environment:** Development (Vite HMR)

| Test ID | Status | Notes                               |
| ------- | ------ | ----------------------------------- |
| TC-1    | ⏳     | Pending                             |
| TC-2    | ⏳     | Pending                             |
| TC-3    | ⏳     | **Critical** - Main issue to verify |
| TC-4    | ⏳     | Pending                             |
| TC-5    | ⏳     | Pending                             |
| TC-6    | ⏳     | Pending                             |
| TC-7    | ⏳     | Pending                             |
| TC-8    | ⏳     | Pending                             |
| TC-9    | ⏳     | Pending                             |
| TC-10   | ⏳     | Pending                             |
| TC-11   | ⏳     | Pending                             |
| A11y-1  | ⏳     | Pending                             |
| A11y-2  | ⏳     | Pending                             |
| A11y-3  | ⏳     | Pending                             |
| P-1     | ⏳     | Pending                             |
| P-2     | ⏳     | Pending                             |
| P-3     | ⏳     | Pending                             |
| R-1     | ⏳     | Pending                             |
| R-2     | ⏳     | Pending                             |
| R-3     | ⏳     | Pending                             |

**Legend:** ✅ Pass | ❌ Fail | ⏳ Pending | ⚠️ Issue

## Known Issues

(To be filled during testing)

## Future Test Enhancements

- Add unit tests for hook state management
- Add React Testing Library tests for component integration
- Add automated accessibility tests (jest-axe)
- Add visual regression tests (Percy/Chromatic)
- Add E2E tests for full user workflows (Playwright)
