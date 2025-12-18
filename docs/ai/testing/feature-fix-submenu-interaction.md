---
phase: testing
title: Testing Strategy
description: Verify submenu interaction fix works correctly
---

# Testing: Fix Submenu Interaction

## Test Cases

### TC-1: Submenu Opens on Hover

**Given:** Sidebar is collapsed, menu item has children  
**When:** User hovers over the menu icon  
**Then:**

- Submenu appears to the right within 50ms
- Submenu displays parent label and child items
- Submenu has proper styling (white background, border, shadow)

**Status:** ⏳ Pending manual test

---

### TC-2: Child Item is Clickable

**Given:** Submenu is open with multiple child items  
**When:** User clicks on a child menu item  
**Then:**

- Child item receives the click (button onClick fires)
- Active menu item updates in layout context
- Child item shows active state (bg-accent)

**Status:** ⏳ Pending manual test

---

### TC-3: Submenu Closes After Click

**Given:** Submenu is open  
**When:** User clicks on a child menu item  
**Then:**

- Submenu closes immediately after click
- Parent icon returns to normal state (no longer highlighted)
- Only the clicked child item shows active state

**Status:** ⏳ Pending manual test

---

### TC-4: Hover States on Child Items

**Given:** Submenu is open  
**When:** User hovers over different child items  
**Then:**

- Hovered item shows hover state (bg-accent)
- Other items remain in normal state
- Smooth transition between hover states

**Status:** ⏳ Pending manual test

---

### TC-5: Multiple Child Clicks

**Given:** Submenu is open  
**When:** User clicks child item A, then reopens and clicks child item B  
**Then:**

- Each click properly sets that item as active
- Previous active state is cleared
- Submenu closes after each click

**Status:** ⏳ Pending manual test

---

### TC-6: Submenu Stays Open on Hover

**Given:** Submenu is open  
**When:** User moves mouse from parent icon to submenu area  
**Then:**

- Submenu remains open (safePolygon working)
- User can hover over child items
- No flickering or closing during mouse movement

**Status:** ⏳ Pending manual test

---

### TC-7: Click Parent Icon While Submenu Open

**Given:** Submenu is open  
**When:** User clicks the parent icon (not a child)  
**Then:**

- Submenu toggles (should close)
- No navigation occurs (parent has children)

**Status:** ⏳ Pending manual test

---

### TC-8: Expanded Sidebar Still Works

**Given:** Sidebar is expanded (not collapsed)  
**When:** User clicks on parent items with children  
**Then:**

- Accordion behavior works (expands inline, no floating submenu)
- Child items are clickable inline
- Navigation works as expected

**Status:** ⏳ Pending manual test

---

### TC-9: Active State Persists

**Given:** User clicked a child item and submenu closed  
**When:** User hovers the same parent icon again  
**Then:**

- Submenu opens again
- Previously clicked child item still shows active state
- Other child items remain inactive

**Status:** ⏳ Pending manual test

---

### TC-10: Deep Child Items

**Given:** Submenu has child items  
**When:** Rendering child items at depth=1  
**Then:**

- Child buttons have proper padding (px-3 py-2)
- Child buttons have margin (ml-4) for indentation
- Clickable area is sufficient

**Status:** ⏳ Pending manual test

---

## Manual Testing Checklist

### Setup

- [ ] Start dev server (`pnpm dev` in host-root or render-root)
- [ ] Navigate to page with ManagerLayout
- [ ] Collapse the sidebar (click toggle button)

### Test Sequence

1. **Hover Test**
    - [ ] Hover over icon without children → tooltip appears
    - [ ] Hover over icon with children → submenu appears
    - [ ] Move mouse away → submenu closes after delay

2. **Click Test**
    - [ ] Hover over icon with children → submenu appears
    - [ ] Click on first child item
    - [ ] Verify child item shows active state (blue/accent background)
    - [ ] Verify submenu closes
    - [ ] Check console for "SET_ACTIVE_ITEM" action

3. **Multi-Click Test**
    - [ ] Hover over same icon → submenu reopens
    - [ ] Previous clicked item should still be active
    - [ ] Click different child item
    - [ ] Verify new item becomes active, old one is deactivated

4. **Hover States Test**
    - [ ] Open submenu
    - [ ] Hover over each child item
    - [ ] Verify hover background color appears
    - [ ] Verify hover is smooth (no lag)

5. **Expanded Sidebar Test**
    - [ ] Expand sidebar (click toggle)
    - [ ] Click parent with children → should expand accordion
    - [ ] Click child items inline
    - [ ] Verify clicks work and active states update

### Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Edge

### Accessibility

- [ ] Tab to menu items with keyboard
- [ ] Press Enter on parent → submenu appears (Floating UI)
- [ ] Tab to child items in submenu
- [ ] Press Enter on child item → activates and closes
- [ ] Press Escape → closes submenu

## Expected Results

**Before Fix:**

- Child items in submenu were not clickable
- Clicks didn't register or submenu closed too quickly
- Users couldn't navigate to child pages

**After Fix:**

- ✅ Child items are fully clickable
- ✅ Clicking sets active menu item
- ✅ Submenu closes after click
- ✅ Active state persists across submenu reopens
- ✅ Hover states work properly
- ✅ No console errors

## Code Changes Summary

1. **Added `onItemClick` prop** to MenuItemComponentProps
2. **Updated `handleClick`** to call `onItemClick?.()` after setting active item
3. **Passed callback** to child items: `onItemClick={() => setShowSubmenu(false)}`
4. **Fixed button styling** - added `px-3` padding, removed extra space in className

## Performance Check

- [ ] Bundle size: ~18KB (acceptable increase from 17KB)
- [ ] No memory leaks on repeated interactions
- [ ] Smooth 60fps animations
- [ ] No console warnings

## Known Issues

(None expected - simple callback addition)

## Test Results

| Test ID | Status | Notes                               |
| ------- | ------ | ----------------------------------- |
| TC-1    | ⏳     | Awaiting manual test                |
| TC-2    | ⏳     | **Critical** - Main fix to verify   |
| TC-3    | ⏳     | **Critical** - Submenu should close |
| TC-4    | ⏳     | Awaiting manual test                |
| TC-5    | ⏳     | Awaiting manual test                |
| TC-6    | ⏳     | Regression test (safePolygon)       |
| TC-7    | ⏳     | Edge case                           |
| TC-8    | ⏳     | Regression test                     |
| TC-9    | ⏳     | State persistence                   |
| TC-10   | ⏳     | Visual/UX check                     |

**Legend:** ✅ Pass | ❌ Fail | ⏳ Pending | ⚠️ Issue
