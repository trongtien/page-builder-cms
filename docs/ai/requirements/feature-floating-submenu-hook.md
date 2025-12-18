---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding: Floating Submenu Hook

## Problem Statement

**What problem are we solving?**

- The floating submenu and tooltip logic is currently embedded directly in the `SidebarMenuItem` component, making it 80+ lines long and difficult to maintain
- The Floating UI configuration is not reusable - if we need floating menus in other components, we'd have to duplicate all the logic
- Testing is difficult because the floating behavior is tightly coupled with the component
- The current implementation has hover interaction issues where users cannot smoothly move from the trigger button to the floating menu

**Who is affected by this problem?**

- Developers maintaining and extending the UI component library
- Developers who want to add floating menus/tooltips to other components
- End users experiencing frustrating hover interactions in the collapsed sidebar

**What is the current situation/workaround?**

- All Floating UI hooks (useFloating, useHover, useFocus, etc.) are configured inline within SidebarMenuItem
- 40+ lines of floating UI logic duplicated for tooltip and submenu
- No abstraction or reusability

## Goals & Objectives

**What do we want to achieve?**

**Primary goals:**

- Extract floating UI logic into reusable custom hooks
- Reduce SidebarMenuItem component complexity by 50%+
- Create `useFloatingTooltip` hook for simple hover tooltips
- Create `useFloatingSubmenu` hook for interactive dropdown menus
- Improve hover interaction reliability

**Secondary goals:**

- Make floating menu logic testable in isolation
- Enable other components to easily add floating menus
- Document hook APIs for future developers

**Non-goals:**

- Changing the visual design or styling of menus
- Adding new features to the floating menus
- Refactoring other parts of the Sidebar component

## User Stories & Use Cases

**How will users interact with the solution?**

**Developer stories:**

- As a developer, I want to add a tooltip to any button by calling `useFloatingTooltip()` so I don't have to configure Floating UI manually
- As a developer, I want to add a dropdown menu by calling `useFloatingSubmenu()` so I can reuse the same hover behavior
- As a developer, I want the SidebarMenuItem code to be concise and readable so I can quickly understand what it does
- As a developer, I want to test floating menu behavior in isolation so I can write reliable unit tests

**End user stories:**

- As a user, I want to hover over a collapsed sidebar icon and see a tooltip so I know what the menu item is
- As a user, I want to hover over an icon with children and see a submenu so I can navigate to child pages
- As a user, I want to move my mouse from the icon to the submenu without it disappearing so I can click on submenu items

**Key workflows:**

1. Developer imports `useFloatingTooltip` or `useFloatingSubmenu` from hooks
2. Developer calls the hook with configuration options
3. Developer spreads the returned props onto their trigger button and floating element
4. End user hovers and interacts with smooth, reliable behavior

## Success Criteria

**How will we know when we're done?**

**Measurable outcomes:**

- [ ] `useFloatingTooltip` hook created and exported
- [ ] `useFloatingSubmenu` hook created and exported
- [ ] SidebarMenuItem component uses the new hooks
- [ ] SidebarMenuItem component reduced from ~180 lines to <120 lines
- [ ] Build succeeds with no TypeScript errors
- [ ] Hover interactions work smoothly - user can move mouse from button to floating menu
- [ ] Both tooltip (no children) and submenu (with children) render correctly

**Acceptance criteria:**

- Hooks encapsulate all Floating UI configuration
- Hooks return props objects that can be spread onto elements
- Original functionality preserved (placement, offsets, delays, safePolygon)
- Component code is more readable and maintainable

## Constraints & Assumptions

**What limitations do we need to work within?**

**Technical constraints:**

- Must use existing @floating-ui/react library (already installed)
- Must maintain React 19 compatibility
- Must work with existing TypeScript configuration
- Must not break existing layout context and reducer pattern

**Assumptions:**

- The Floating UI library configuration is correct (placement, middleware, etc.)
- Removing FloatingPortal was the right fix for hover issues
- The same hook APIs will work for future floating menu needs
- Performance impact of hooks vs inline is negligible

**Design constraints:**

- Keep the same visual appearance and behavior
- Maintain the same delay timings (tooltip: 100ms open, submenu: 50ms open)
- Keep safePolygon behavior for submenu
- Preserve focus and dismiss handlers

## Questions & Open Items

- Should hooks accept all Floating UI options or just common ones?
- Should we create separate hooks for tooltip vs submenu or one configurable hook?
    - **Decision**: Separate hooks for clarity and type safety
- Do we need to support nested submenus in the future?
- Should the hooks be exported from the main package or kept internal?
- Will other components need floating menus? (UserMenu, notifications, etc.)
