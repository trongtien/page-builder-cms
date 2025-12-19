---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement

**What problem are we solving?**

Marketing teams currently need developer assistance to create and modify promotional content (banners, flash sales, product grids) on the CMS platform. This creates bottlenecks, slows down campaign launches, and limits the ability to run A/B tests or quick promotional changes.

- **Who is affected?**: Marketing teams, content managers, and ultimately end users who experience delayed or less dynamic content
- **Current situation**: Marketing must submit tickets to developers, wait for implementation, then wait for deployment cycles. Simple changes like updating a banner image or reordering sections require code changes.
- **Core pain point**: Lack of self-service tools for non-technical users to build and manage dynamic page content

## Goals & Objectives

**What do we want to achieve?**

### Primary Goals

- Enable marketing teams to create, configure, and publish page layouts using pre-built widgets without developer assistance
- Implement a Server-Driven UI architecture where page configurations are stored as JSON and rendered dynamically
- Provide a drag-and-drop visual builder with live preview capabilities
- Ensure type-safe communication between frontend (TanStack Start) and backend (Golang) using shared schemas
- Create a reusable base form component library for consistent UI/UX across the admin interface

### Secondary Goals

- Support Dark Mode in all UI components
- Enable widget-level A/B testing capabilities
- Provide widget versioning and draft/publish workflow
- Implement responsive configuration (mobile vs desktop layouts)

### Non-Goals (Out of Scope for Phase 1)

- Custom widget creation by non-developers (Phase 2)
- Advanced animation/transition builders
- Multi-language content management (will use existing i18n system)
- Real-time collaborative editing (multiple users editing simultaneously)
- Widget marketplace or sharing between organizations

## User Stories & Use Cases

**How will users interact with the solution?**

### Marketing Team User Stories

1. **As a Marketing Manager**, I want to drag and drop widgets (Hero Banner, Flash Sale, Product Grid, Quick Links) onto a canvas so that I can build landing pages without coding.

2. **As a Marketing Manager**, I want to configure widget properties (background color, padding, text content, data sources) through intuitive forms so that I can customize content to match campaign branding.

3. **As a Marketing Manager**, I want to see a live preview of my changes as I configure widgets so that I can verify the layout before publishing.

4. **As a Marketing Manager**, I want to publish page configurations immediately or schedule them for future activation so that I can coordinate with campaign timings.

5. **As a Content Editor**, I want to reorder widgets by dragging them up/down so that I can adjust content priority without rebuilding the page.

6. **As a Marketing Manager**, I want to duplicate existing page configurations so that I can create variations quickly for A/B testing.

### End User Stories

7. **As a Site Visitor**, I want to see promotional content (Flash Sales, Banners, Product Grids) load quickly so that I have a smooth browsing experience.

8. **As a Mobile User**, I want promotional content to adapt to my screen size so that information is readable and actionable.

### Developer User Stories

9. **As a Frontend Developer**, I want type-safe widget definitions shared between frontend and backend so that I catch configuration errors at compile time.

10. **As a Backend Developer**, I want a clear API contract for saving/retrieving page configurations so that I can implement backend logic confidently.

11. **As a Developer**, I want to extend the widget system with new widget types following a documented pattern so that the system can grow with business needs.

### Key Workflows

**Workflow 1: Create New Landing Page**

1. Navigate to Admin Builder (`/admin/builder/new`)
2. Select widgets from left sidebar (Widget Picker)
3. Drag widget to canvas (center column)
4. Click widget to open Property Editor (right sidebar)
5. Configure properties using base form components
6. Preview changes in real-time
7. Click "Publish" to save configuration and make live

**Workflow 2: Edit Existing Page**

1. Navigate to Admin Builder with page ID (`/admin/builder/:pageId`)
2. System loads existing widget configuration from backend
3. User modifies widgets or properties
4. User clicks "Save Draft" (stores changes without publishing)
5. User clicks "Publish" when ready to go live

**Workflow 3: Configure Flash Sale Widget**

1. Drag "Flash Sale" widget to canvas
2. Property Editor shows form fields:
    - Campaign ID (select from existing campaigns)
    - Countdown end date/time
    - Background color
    - Display style (grid/carousel)
3. Widget fetches campaign products from API using campaign ID
4. Preview shows live countdown and product grid

### Edge Cases to Consider

- **Widget with missing data source**: Display placeholder with error message in preview
- **Invalid color values**: Validate hex codes, show error inline
- **Concurrent edits**: Last save wins (for Phase 1), show warning if page modified since last load
- **Large page configurations**: Paginate or virtualize widget list if 50+ widgets
- **Broken API during configuration**: Show cached data or error state, prevent publish
- **User leaves page without saving**: Show "unsaved changes" warning dialog
- **Widget deletion with dependencies**: Confirm action, check if widget is referenced elsewhere

## Success Criteria

**How will we know when we're done?**

### Functional Criteria

- [ ] Marketing team can create a new landing page with 4+ widgets without developer assistance (measured via user acceptance testing)
- [ ] Widget configurations are stored as JSON in Golang backend and retrieved on page load
- [ ] All base form components (Input, Select, Radio, Checkbox, Textarea) render with consistent styling and support Dark Mode
- [ ] Widget Renderer correctly displays Hero Banner, Flash Sale (with countdown), Product Grid (with dynamic data), and Quick Links
- [ ] Admin Builder supports drag-and-drop reordering with visual feedback
- [ ] Property Editor form updates propagate to live preview within 100ms
- [ ] Published pages load and render on frontend within 500ms (90th percentile)

### Usability Criteria

- [ ] Non-technical users can complete page creation workflow in under 10 minutes (after training)
- [ ] Zero TypeScript compilation errors related to widget type mismatches between frontend and backend schemas
- [ ] Dark Mode works correctly in all admin interface components

### Performance Benchmarks

- Page configuration API response time: < 200ms (median)
- Widget Renderer initial load: < 500ms
- Drag-and-drop interaction latency: < 50ms
- Form input to preview update: < 100ms

### Testing & Quality

- [ ] Unit test coverage ≥ 90% for base form components
- [ ] Integration tests cover save/load page configuration workflow
- [ ] E2E test covers full page creation and publish workflow
- [ ] Accessibility: Keyboard navigation works for all drag-and-drop and form interactions

## Constraints & Assumptions

**What limitations do we need to work within?**

### Technical Constraints

- Must use TanStack Start for frontend framework (existing project constraint)
- Backend is Golang (existing infrastructure)
- Must work with existing authentication system (assumed to be JWT-based)
- Must integrate with existing API schema in `packages/core/api-types`
- Browser support: Modern browsers only (Chrome, Firefox, Safari, Edge - last 2 versions)

### Business Constraints

- Phase 1 delivery target: 4 weeks
- Marketing team training required before rollout
- Cannot disrupt existing page rendering (requires backward compatibility or migration plan)

### Assumptions

- Golang backend team will implement API endpoints based on shared schema definitions
- Widget data sources (campaigns, products) have existing APIs we can consume
- Marketing team has design requirements for the 4 initial widget types
- Existing styling system (`formClasses`, `cn` utility) is available and documented
- TailwindCSS is configured for the project with Dark Mode support

### Risks

- **Risk**: Marketing team finds builder too complex → **Mitigation**: Conduct UX testing after base implementation, iterate on UI
- **Risk**: Performance degrades with large page configurations → **Mitigation**: Implement virtual scrolling and lazy loading early
- **Risk**: Type safety breaks with backend schema changes → **Mitigation**: Set up automated schema validation in CI/CD

## Questions & Open Items

**What do we still need to clarify?**

### Unresolved Questions

1. **Authentication/Authorization**: What permission levels exist? Can all marketing users edit all pages, or is there ownership/approval workflow?
2. **Versioning Strategy**: Should we implement version history (rollback capability) in Phase 1 or defer to Phase 2?
3. **Widget Data Sources**: What are the exact API endpoints and response formats for campaigns, products, etc.?
4. **Migration Plan**: Are there existing pages that need to be migrated to the new widget system, or is this greenfield?
5. **Responsive Breakpoints**: Should widgets have separate configurations for mobile/tablet/desktop, or rely on responsive CSS?

### Items Requiring Stakeholder Input

- Final list of widget types for Phase 1 (currently: Hero Banner, Flash Sale, Product Grid, Quick Links - confirm these)
- Property options for each widget type (need design mockups or specs)
- Approval workflow requirements (save draft vs publish permissions)
- Rollback/revert requirements for published pages

### Research Needed

- Investigate existing drag-and-drop libraries compatible with React 18 (dnd-kit, react-beautiful-dnd, react-dnd)
- Research TanStack Start SSR considerations for widget rendering
- Explore schema validation approaches (Zod, Yup, io-ts) for runtime type safety
- Review TailwindCSS Dark Mode implementation patterns for form components
