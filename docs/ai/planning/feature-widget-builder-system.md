---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones

**What are the major checkpoints?**

- [ ] **Milestone 1: Foundation** (Week 1) - Base form components and shared schemas ready
- [ ] **Milestone 2: Widget System** (Week 2) - Widget renderer and core widgets implemented
- [ ] **Milestone 3: Admin Builder** (Week 3) - Drag-and-drop builder with live preview functional
- [ ] **Milestone 4: Integration & Polish** (Week 4) - Backend integration, testing, and deployment

## Task Breakdown

**What specific work needs to be done?**

### Phase 1: Foundation (Week 1 - 5 days)

#### 1.1 Setup Shared API Types Package

- [ ] Create `packages/core/api-types/src/widgets/` directory structure
- [ ] Define TypeScript interfaces for all widget types (Hero Banner, Flash Sale, Product Grid, Quick Links)
- [ ] Define `PageConfig` and base `Widget` interfaces
- [ ] Create Zod schemas for all widget types
- [ ] Export type definitions and schemas from `packages/core/api-types/src/index.ts`
- [ ] Write unit tests for Zod schema validation (edge cases, invalid data)
- **Estimate**: 1 day

#### 1.2 Create Base Form Components

- [ ] Setup `packages/core/ui/src/components/forms/` directory
- [ ] Create `formClasses.ts` with shared Tailwind classes for inputs, labels, error states
- [ ] Implement `Input.tsx` with forwardRef, variants (text, number, email, password), error/helper text
- [ ] Implement `Select.tsx` with single/multi-select support, search functionality
- [ ] Implement `Radio.tsx` with group layout options (horizontal/vertical)
- [ ] Implement `Checkbox.tsx` with indeterminate state support
- [ ] Implement `Textarea.tsx` with auto-resize option
- [ ] Test Dark Mode for all components
- [ ] Write Storybook stories for each component (if Storybook is set up)
- [ ] Write unit tests for all form components (user interactions, validation states)
- **Estimate**: 2.5 days

#### 1.3 Setup Backend API Contracts

- [ ] Document API endpoints for Golang backend team (OpenAPI spec or markdown)
- [ ] Define authentication/authorization requirements
- [ ] Share Zod schemas with backend team (export JSON schema if needed)
- [ ] Coordinate on error response formats
- [ ] Setup mock API endpoints for local development (MSW or json-server)
- **Estimate**: 0.5 day

#### 1.4 Setup TanStack Start Server Functions

- [ ] Create `packages/host-root/src/server/widgets.ts` file
- [ ] Implement `getPageConfig(slug)` server function
- [ ] Implement `updatePageConfig(pageId, config)` server function
- [ ] Implement `createPageConfig(config)` server function
- [ ] Implement `getCampaignData(campaignId)` server function (for Flash Sale)
- [ ] Implement `getProducts(filters)` server function (for Product Grid)
- [ ] Add error handling and logging
- [ ] Configure environment variables for API base URL
- **Estimate**: 1 day

### Phase 2: Widget System (Week 2 - 5 days)

#### 2.1 Create Widget Renderer Core

- [ ] Create `packages/host-root/src/components/widgets/` directory
- [ ] Implement `WidgetRenderer.tsx` with widget type mapping logic
- [ ] Add error boundary for individual widget errors
- [ ] Implement common widget wrapper (handles padding, margin, background color from `commonProps`)
- [ ] Write unit tests for widget type mapping and error boundaries
- **Estimate**: 0.5 day

#### 2.2 Implement Hero Banner Widget

- [ ] Create `HeroBanner.tsx` component
- [ ] Implement image rendering with alt text
- [ ] Implement text overlay (title, subtitle, CTA button)
- [ ] Implement text positioning (left, center, right)
- [ ] Implement overlay opacity control
- [ ] Make responsive (mobile, tablet, desktop)
- [ ] Write unit tests for prop variations
- **Estimate**: 1 day

#### 2.3 Implement Flash Sale Widget

- [ ] Create `FlashSale.tsx` component
- [ ] Implement countdown timer (use library like react-countdown or custom hook)
- [ ] Fetch campaign data using `getCampaignData` server function
- [ ] Implement product grid layout
- [ ] Implement carousel layout (use library like swiper or embla-carousel)
- [ ] Handle loading and error states for campaign data
- [ ] Write unit tests for countdown logic and data fetching
- **Estimate**: 1.5 days

#### 2.4 Implement Product Grid Widget

- [ ] Create `ProductGrid.tsx` component
- [ ] Fetch products using `getProducts` server function based on `dataSource` prop
- [ ] Implement responsive grid layout (columns adjust by breakpoint)
- [ ] Implement product card component (image, title, price)
- [ ] Handle loading skeleton and error states
- [ ] Write unit tests for different data sources (featured, category, custom IDs)
- **Estimate**: 1 day

#### 2.5 Implement Quick Links Widget

- [ ] Create `QuickLinks.tsx` component
- [ ] Implement horizontal and grid layouts
- [ ] Render link items with optional icons (use icon library like lucide-react)
- [ ] Make accessible (proper anchor tags, ARIA labels)
- [ ] Write unit tests for layout variations
- **Estimate**: 0.5 day

#### 2.6 Create Public Page Route

- [ ] Create `packages/host-root/src/pages/$slug.tsx` (dynamic route)
- [ ] Load page config using `getPageConfig(slug)` server function
- [ ] Pass widgets to `WidgetRenderer`
- [ ] Handle 404 for non-existent pages
- [ ] Add meta tags (title, description) from page config
- [ ] Test SSR rendering of widgets
- **Estimate**: 0.5 day

### Phase 3: Admin Builder (Week 3 - 5 days)

#### 3.1 Setup Builder Page Structure

- [ ] Create `packages/host-root/src/pages/admin/builder/$pageId.tsx`
- [ ] Implement 3-column grid layout (responsive - stack on mobile)
- [ ] Create `BuilderContext.tsx` for state management
- [ ] Implement `BuilderProvider` with state (pageConfig, selectedWidget, isDirty)
- [ ] Add actions (addWidget, updateWidget, deleteWidget, reorderWidget, selectWidget)
- [ ] Write unit tests for context actions
- **Estimate**: 1 day

#### 3.2 Implement Widget Picker (Left Sidebar)

- [ ] Create `WidgetPicker.tsx` component
- [ ] Render list of available widget types with icons and descriptions
- [ ] Make widget cards draggable (use @dnd-kit/core)
- [ ] Add "Add Widget" button as alternative to drag (for accessibility)
- [ ] Style for Dark Mode
- **Estimate**: 1 day

#### 3.3 Implement Canvas (Center Preview)

- [ ] Create `Canvas.tsx` component
- [ ] Render widgets from `pageConfig` state
- [ ] Implement drop zones between widgets (use @dnd-kit/sortable)
- [ ] Highlight selected widget
- [ ] Add "Delete" and "Move Up/Down" buttons on widget hover
- [ ] Implement drag-to-reorder functionality
- [ ] Add empty state when no widgets present
- [ ] Write integration tests for drag-and-drop interactions
- **Estimate**: 1.5 days

#### 3.4 Implement Property Editor (Right Sidebar)

- [ ] Create `PropertyEditor.tsx` component
- [ ] Dynamically render form fields based on selected widget type
- [ ] Use base form components (Input, Select, Checkbox, etc.)
- [ ] Implement form state management (react-hook-form or manual)
- [ ] Update `pageConfig` state on form change (debounced for performance)
- [ ] Add "Common Properties" section (padding, margin, background color)
- [ ] Validate inputs using Zod schemas
- [ ] Display validation errors inline
- [ ] Write unit tests for form validation and state updates
- **Estimate**: 1.5 days

#### 3.5 Implement Toolbar Actions

- [ ] Create `ToolbarActions.tsx` component in header
- [ ] Implement "Save Draft" button (calls `updatePageConfig` with status='draft')
- [ ] Implement "Publish" button (calls `updatePageConfig` with status='published')
- [ ] Show loading spinner during save operations
- [ ] Show success/error toast notifications
- [ ] Implement "Preview Mode" toggle (hides builder UI chrome)
- [ ] Add "Unsaved Changes" warning on page navigation (use beforeunload)
- [ ] Write integration tests for save operations
- **Estimate**: 1 day

### Phase 4: Integration & Polish (Week 4 - 5 days)

#### 4.1 Backend Integration

- [ ] Replace mock API with real Golang backend endpoints
- [ ] Test all server functions with real API
- [ ] Handle authentication errors (redirect to login)
- [ ] Handle authorization errors (show permission denied message)
- [ ] Add retry logic for transient failures
- [ ] Test with different user roles (admin, editor, viewer)
- **Estimate**: 1 day

#### 4.2 Performance Optimization

- [ ] Implement lazy loading for widget components (React.lazy)
- [ ] Add virtual scrolling for canvas if 20+ widgets (use react-virtualized or similar)
- [ ] Optimize form debouncing (find optimal delay)
- [ ] Add memoization to prevent unnecessary re-renders (React.memo, useMemo)
- [ ] Measure and optimize bundle size (code splitting)
- [ ] Test with large page configurations (50 widgets)
- **Estimate**: 1 day

#### 4.3 Accessibility & UX Polish

- [ ] Implement keyboard shortcuts (Save: Ctrl+S, Delete: Del, Undo: Ctrl+Z if implemented)
- [ ] Add keyboard navigation for drag-and-drop (arrow keys to reorder)
- [ ] Test with screen reader (NVDA or VoiceOver)
- [ ] Ensure all interactive elements have focus indicators
- [ ] Check color contrast ratios
- [ ] Add loading skeletons for better perceived performance
- [ ] Add animations/transitions (smooth drag, fade-in on add)
- **Estimate**: 1 day

#### 4.4 Testing & Quality Assurance

- [ ] Write E2E tests for full page creation workflow (Playwright or Cypress)
- [ ] Write E2E test for editing existing page
- [ ] Write E2E test for drag-and-drop reordering
- [ ] Write E2E test for publishing page
- [ ] Run all unit and integration tests
- [ ] Perform manual testing on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (responsive layout)
- [ ] Conduct user acceptance testing with marketing team
- [ ] Fix all critical and high-priority bugs
- **Estimate**: 1.5 days

#### 4.5 Documentation & Deployment

- [ ] Write user guide for marketing team (how to use builder)
- [ ] Create video walkthrough of builder features
- [ ] Document widget property options
- [ ] Update README with setup instructions
- [ ] Add inline help text in builder UI (tooltips, help icons)
- [ ] Prepare deployment plan (environment variables, database migrations)
- [ ] Deploy to staging environment
- [ ] Conduct staging testing
- [ ] Deploy to production
- [ ] Monitor for errors after deployment
- **Estimate**: 0.5 day

## Dependencies

**What needs to happen in what order?**

### Critical Path

1. **Shared Schemas (1.1)** must be completed before:
    - Widget components (2.1-2.5)
    - Property Editor (3.4)
    - Backend integration (4.1)

2. **Base Form Components (1.2)** must be completed before:
    - Property Editor (3.4)

3. **Widget Renderer Core (2.1)** must be completed before:
    - Individual widget components (2.2-2.5)
    - Canvas (3.3)
    - Public page route (2.6)

4. **Builder Context (3.1)** must be completed before:
    - Widget Picker (3.2)
    - Canvas (3.3)
    - Property Editor (3.4)
    - Toolbar Actions (3.5)

5. **All Phase 1-3 tasks** must be completed before:
    - Backend integration (4.1)
    - E2E testing (4.4)

### External Dependencies

- **Golang Backend API**: Backend team needs to implement endpoints by end of Week 2 for testing in Week 3
- **Design Assets**: Need widget icons and example images by start of Week 2
- **User Acceptance Testing**: Marketing team availability for UAT in Week 4

### Team/Resource Dependencies

- Frontend Developer 1: Focus on Base Components (1.2) and Widget Renderer (2.1-2.5)
- Frontend Developer 2: Focus on Admin Builder UI (3.1-3.5)
- Backend Developer: Implement API endpoints and database schema
- Designer: Provide UI mockups and design tokens by Week 1
- QA Engineer: Write E2E tests and conduct UAT in Week 4

## Timeline & Estimates

**When will things be done?**

### Week 1: Foundation (5 days)

- **Day 1**: Setup shared schemas (1.1)
- **Day 2-3**: Create base form components (1.2)
- **Day 4**: Setup server functions and API contracts (1.3, 1.4)
- **Day 5**: Testing and refinement

**Deliverable**: Base form components library, shared type system, mock API setup

### Week 2: Widget System (5 days)

- **Day 1**: Widget renderer core and Hero Banner (2.1, 2.2)
- **Day 2-3**: Flash Sale widget with countdown (2.3)
- **Day 4**: Product Grid widget (2.4)
- **Day 5**: Quick Links widget and public page route (2.5, 2.6)

**Deliverable**: Functional widget rendering system on public pages

### Week 3: Admin Builder (5 days)

- **Day 1**: Builder page structure and context (3.1)
- **Day 2**: Widget Picker and Canvas structure (3.2, 3.3 partial)
- **Day 3**: Drag-and-drop functionality (3.3 complete)
- **Day 4**: Property Editor forms (3.4)
- **Day 5**: Toolbar actions and save/publish (3.5)

**Deliverable**: Fully functional admin builder interface

### Week 4: Integration & Polish (5 days)

- **Day 1**: Backend integration (4.1)
- **Day 2**: Performance optimization (4.2)
- **Day 3**: Accessibility and UX polish (4.3)
- **Day 4**: Testing and bug fixes (4.4)
- **Day 5**: Documentation and deployment (4.5)

**Deliverable**: Production-ready feature with documentation

### Buffer Time

- 2-3 days buffer included in estimates for unknowns and bug fixes
- If ahead of schedule, prioritize Phase 2 features: widget templates, version history

## Risks & Mitigation

**What could go wrong?**

### Technical Risks

**Risk 1**: Drag-and-drop library integration issues with TanStack Start SSR

- **Likelihood**: Medium
- **Impact**: High (blocks admin builder)
- **Mitigation**:
    - Research @dnd-kit SSR compatibility in Week 1
    - Have fallback to client-side only rendering for builder pages
    - Test early with prototype in Week 2

**Risk 2**: Performance degradation with large widget configurations

- **Likelihood**: Medium
- **Impact**: Medium (poor UX for complex pages)
- **Mitigation**:
    - Implement virtual scrolling early (Week 3)
    - Set hard limit on widgets per page (e.g., 50)
    - Conduct load testing with 50+ widgets in Week 3

**Risk 3**: Type safety breaks between frontend and backend

- **Likelihood**: Low (with Zod schemas)
- **Impact**: High (runtime errors in production)
- **Mitigation**:
    - Share Zod schemas with backend team
    - Implement automated schema validation in CI/CD
    - Add comprehensive integration tests

**Risk 4**: Countdown timer accuracy issues in Flash Sale widget

- **Likelihood**: Medium
- **Impact**: Medium (inaccurate sale end times)
- **Mitigation**:
    - Use server time for countdown calculations
    - Implement time sync mechanism
    - Test with different timezones

### Resource Risks

**Risk 5**: Backend API endpoints delayed

- **Likelihood**: Medium
- **Impact**: High (blocks integration testing)
- **Mitigation**:
    - Use mock API for frontend development
    - Clearly document API contracts early
    - Have daily sync meetings with backend team in Week 2

**Risk 6**: Marketing team unavailable for UAT

- **Likelihood**: Low
- **Impact**: Medium (delayed feedback)
- **Mitigation**:
    - Schedule UAT sessions in advance
    - Create self-service testing guide
    - Record video demo for asynchronous feedback

### Dependency Risks

**Risk 7**: Design assets not ready on time

- **Likelihood**: Low
- **Impact**: Low (can use placeholders)
- **Mitigation**:
    - Use placeholder icons/images initially
    - Define design token contract early
    - Designer provides tokens before assets

**Risk 8**: Scope creep (additional widget types requested)

- **Likelihood**: High
- **Impact**: Medium (timeline slip)
- **Mitigation**:
    - Clearly communicate Phase 1 scope
    - Create backlog for Phase 2 features
    - Make widget system extensible for easy additions

## Resources Needed

**What do we need to succeed?**

### Team Members and Roles

- **Frontend Developer 1** (Full-time, 4 weeks): Base components, widget renderer
- **Frontend Developer 2** (Full-time, 4 weeks): Admin builder UI
- **Backend Developer** (Half-time, 2 weeks): API endpoints and database
- **Designer/UX** (Part-time, Week 1): UI mockups, design tokens
- **QA Engineer** (Part-time, Week 4): E2E testing, UAT coordination
- **Product Manager** (Part-time, ongoing): Requirements clarification, UAT sign-off

### Tools and Services

- **@dnd-kit/core**: Drag-and-drop library (install via pnpm)
- **zod**: Schema validation (already in project)
- **TanStack Query**: Server state management (assumed already in project)
- **react-countdown** or **date-fns**: Countdown timer utilities
- **embla-carousel** or **swiper**: Carousel for Flash Sale widget
- **lucide-react**: Icon library for UI elements
- **MSW** or **json-server**: Mock API for local development
- **Playwright** or **Cypress**: E2E testing framework

### Infrastructure

- **Staging Environment**: For testing before production
- **CDN**: For serving widget images (assumed already configured)
- **Database**: PostgreSQL for page configurations (backend responsibility)

### Documentation/Knowledge

- **TanStack Start SSR Docs**: For server function patterns
- **@dnd-kit Documentation**: For drag-and-drop implementation
- **Zod Documentation**: For schema definitions
- **Existing Design System Docs**: For Tailwind class usage and Dark Mode patterns
- **API Contract Examples**: From existing project for consistency
