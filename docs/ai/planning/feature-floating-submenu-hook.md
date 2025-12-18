---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown: Floating Submenu Hook

## Milestones

- [x] M1: Requirements and design documentation complete
- [ ] M2: Hooks implemented and tested
- [ ] M3: SidebarMenuItem refactored to use hooks
- [ ] M4: Build passes and hover interactions verified

## Task Breakdown

### Phase 1: Hook Implementation

**Task 1.1: Implement useFloatingTooltip hook**

- [ ] Create `packages/core/ui/src/hooks/useFloatingTooltip.tsx`
- [ ] Define TypeScript interfaces (UseFloatingTooltipOptions, UseFloatingTooltipReturn)
- [ ] Implement controlled/uncontrolled state pattern
- [ ] Configure useFloating with tooltip-specific options
- [ ] Add useHover and useRole hooks
- [ ] Return refs, styles, and prop getters
- **Estimate:** 30 minutes

**Task 1.2: Implement useFloatingSubmenu hook**

- [ ] Update `packages/core/ui/src/hooks/useFloatingSubmenu.tsx` (currently empty)
- [ ] Define TypeScript interfaces (UseFloatingSubmenuOptions, UseFloatingSubmenuReturn)
- [ ] Implement controlled/uncontrolled state pattern
- [ ] Configure useFloating with submenu-specific options (right-start placement, 0 offset)
- [ ] Add useHover with safePolygon, useFocus, useDismiss, useRole hooks
- [ ] Return refs, styles, and prop getters
- **Estimate:** 30 minutes

**Task 1.3: Export hooks from index**

- [ ] Add exports to `packages/core/ui/src/hooks/index.ts`
- [ ] Verify TypeScript compilation
- **Estimate:** 5 minutes

### Phase 2: Component Refactoring

**Task 2.1: Refactor SidebarMenuItem - Tooltip logic**

- [ ] Import useFloatingTooltip hook
- [ ] Replace inline tooltip Floating UI code with hook call
- [ ] Pass isOpen and onOpenChange for controlled state
- [ ] Spread returned props onto button and tooltip div
- [ ] Remove now-unused imports (some Floating UI hooks)
- **Estimate:** 20 minutes

**Task 2.2: Refactor SidebarMenuItem - Submenu logic**

- [ ] Import useFloatingSubmenu hook
- [ ] Replace inline submenu Floating UI code with hook call
- [ ] Pass isOpen and onOpenChange for controlled state
- [ ] Spread returned props onto button and submenu div
- [ ] Remove remaining unused Floating UI imports
- **Estimate:** 20 minutes

**Task 2.3: Code cleanup**

- [ ] Remove unused state variables if any
- [ ] Verify button className logic still works
- [ ] Ensure all props are properly typed
- [ ] Run Prettier/ESLint
- **Estimate:** 10 minutes

### Phase 3: Testing & Verification

**Task 3.1: Build verification**

- [ ] Run `pnpm build` in packages/core/ui
- [ ] Verify no TypeScript errors
- [ ] Check bundle size (should be similar: ~17KB)
- [ ] Verify exports are available
- **Estimate:** 5 minutes

**Task 3.2: Manual testing**

- [ ] Test tooltip on items without children (collapsed sidebar)
- [ ] Test submenu on items with children (collapsed sidebar)
- [ ] Verify smooth hover from button to floating element
- [ ] Test safePolygon diagonal mouse movement
- [ ] Test expanded sidebar still works (normal menu expansion)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- **Estimate:** 15 minutes

**Task 3.3: Edge case testing**

- [ ] Test rapid hover on/off
- [ ] Test clicking while tooltip/submenu is open
- [ ] Test window resize with menu open
- [ ] Test with very long menu labels
- **Estimate:** 10 minutes

### Phase 4: Documentation Updates

**Task 4.1: Update implementation notes**

- [ ] Document hook usage in `docs/ai/implementation/feature-floating-submenu-hook.md`
- [ ] Note any issues encountered
- [ ] Add code snippets showing usage
- **Estimate:** 15 minutes

**Task 4.2: Update testing notes**

- [ ] Document test cases in `docs/ai/testing/feature-floating-submenu-hook.md`
- [ ] Note any bugs found and fixed
- **Estimate:** 10 minutes

## Dependencies

**Task Dependencies:**

- Task 1.3 depends on Tasks 1.1 and 1.2 (need hooks before exporting)
- Task 2.1 and 2.2 depend on Task 1.3 (need hooks exported)
- Task 2.3 depends on Tasks 2.1 and 2.2 (cleanup after refactoring)
- Task 3.1 depends on Task 2.3 (build after all code changes)
- Task 3.2 depends on Task 3.1 (test after successful build)
- Task 4.x can happen alongside Phase 3

**External Dependencies:**

- @floating-ui/react package (already installed)
- React 19 (already in use)
- TypeScript configuration (already set up)

**No blockers identified**

## Timeline & Estimates

**Total Estimated Time:** ~2.5 hours

**Phase 1:** 65 minutes (hook implementation)
**Phase 2:** 50 minutes (refactoring)
**Phase 3:** 30 minutes (testing)
**Phase 4:** 25 minutes (documentation)

**Recommended Approach:**

1. **Sprint 1 (60 min):** Complete Phase 1 - get hooks working in isolation
2. **Sprint 2 (60 min):** Complete Phase 2 - refactor component
3. **Sprint 3 (30 min):** Complete Phase 3 - thorough testing
4. **Sprint 4 (20 min):** Complete Phase 4 - documentation wrap-up

**Buffer:** 30 minutes for unexpected issues

**Target Completion:** Same day (2-3 hours of focused work)

## Risk Assessment

**Risk 1: Hooks don't work as expected**

- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Design based on working Floating UI code, careful migration

**Risk 2: Props spreading breaks existing functionality**

- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Spread props correctly, test thoroughly

**Risk 3: TypeScript compilation errors**

- **Likelihood:** Low
- **Impact:** Low
- **Mitigation:** Follow Floating UI types carefully, test incrementally

**Risk 4: Hover interactions still broken**

- **Likelihood:** Low (already fixed by removing FloatingPortal)
- **Impact:** High
- **Mitigation:** Keep the same configuration that works, don't add Portal back

## Implementation Order

1. ✅ Document requirements
2. ✅ Document design
3. ✅ Document planning
4. → Implement useFloatingTooltip (Task 1.1)
5. → Implement useFloatingSubmenu (Task 1.2)
6. → Export hooks (Task 1.3)
7. → Refactor SidebarMenuItem for tooltip (Task 2.1)
8. → Refactor SidebarMenuItem for submenu (Task 2.2)
9. → Clean up code (Task 2.3)
10. → Build and test (Phase 3)
11. → Update docs (Phase 4)
