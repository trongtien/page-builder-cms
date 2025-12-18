---
phase: requirements
title: Requirements & Problem Understanding
description: Fix submenu interaction in collapsed sidebar
---

# Requirements: Fix Submenu Interaction

## Problem Statement

**What problem are we solving?**

- When hovering over a collapsed sidebar icon with children, the submenu dropdown appears
- However, when users try to click on submenu items, they cannot be selected/clicked
- The submenu appears to close or the clicks don't register on child items
- This prevents users from navigating to child pages via the collapsed sidebar

**Who is affected?**

- End users trying to navigate the application via collapsed sidebar
- Users who prefer a minimal sidebar UI

**Current situation:**

- Submenu renders with child MenuItemComponent instances
- Child items are rendered as buttons but clicks may not be working
- Possible issues: hover state closing submenu, click handlers not working, or button elements not receiving clicks

## Goals & Objectives

**Primary goals:**

- Make submenu items clickable when the parent icon is hovered
- Ensure clicks on submenu items trigger the SET_ACTIVE_ITEM action
- Maintain smooth hover experience (don't close submenu prematurely)
- Visual feedback when hovering/clicking submenu items

**Non-goals:**

- Changing the visual design of submenus
- Adding keyboard navigation (already handled by Floating UI)
- Nested submenus (out of scope)

## User Stories & Use Cases

**User Story 1:**

- As a user with a collapsed sidebar
- When I hover over an icon with children
- And the submenu appears to the right
- I want to click on any submenu item
- So that I can navigate to that page

**User Story 2:**

- As a user interacting with a submenu
- When I hover over submenu items
- I want visual feedback (hover state)
- So I know which item I'm about to click

**User Story 3:**

- As a user clicking a submenu item
- When I click it
- I want it to become the active menu item
- And the submenu should close
- And I should navigate to that page (if routing is configured)

## Success Criteria

- [ ] Submenu items are clickable
- [ ] Clicking a submenu item sets it as the active menu item
- [ ] Clicked submenu item shows active state (background color)
- [ ] Submenu remains open while hovering over it (safePolygon working)
- [ ] Submenu closes after clicking an item or moving mouse away
- [ ] Hover states work on submenu items (background changes)
- [ ] No console errors

## Constraints & Assumptions

**Constraints:**

- Must preserve existing hover behavior
- Must work with current Floating UI configuration
- Must not break expanded sidebar behavior

**Assumptions:**

- The issue is likely in click event handling for child menu items
- Child items at depth > 0 inside floating submenu need special handling
- The click might be calling handleClick incorrectly for child items

## Root Cause Analysis

Looking at the code:

1. Child menu items are rendered with `depth={depth + 1}` inside submenu
2. They will render as normal buttons (not collapsed mode)
3. Their `handleClick` should call `dispatch({ type: "SET_ACTIVE_ITEM", payload: child.id })`
4. But they might not be getting clicks, or clicks are bubbling incorrectly

**Possible causes:**

- Click events being prevented by Floating UI
- Button elements not properly receiving clicks
- Z-index or pointer-events CSS issue
- Event handlers not attached correctly
