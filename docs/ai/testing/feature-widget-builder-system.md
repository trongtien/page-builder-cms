---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals

**What level of testing do we aim for?**

- **Unit test coverage target**: 100% of new code (base form components, context actions, utility functions)
- **Integration test scope**: Critical paths (save/load page config, drag-and-drop, widget rendering with data fetching)
- **End-to-end test scenarios**: Complete user journeys (create page, edit page, publish page, view published page)
- **Alignment with requirements**: All acceptance criteria from requirements doc must have corresponding tests

### Coverage Breakdown by Component

- **Base Form Components**: 100% coverage (all props, states, interactions)
- **Widget Schemas (Zod)**: 100% coverage (valid/invalid data, edge cases)
- **Widget Renderer**: 90% coverage (all widget types, error boundaries)
- **Individual Widgets**: 85% coverage (rendering, data fetching, loading states)
- **Builder Context**: 100% coverage (all actions and state transitions)
- **Server Functions**: 90% coverage (success/error paths, validation)
- **Admin Builder UI**: 80% coverage (E2E tests cover most UI interactions)

## Unit Tests

**What individual components need testing?**

### Component/Module 1: Base Form Components

Location: `packages/core/ui/src/components/forms/`

#### Input Component

- [ ] Renders with label and helper text
- [ ] Displays error message when error prop provided
- [ ] Applies error styling when error prop provided
- [ ] Forwards ref correctly to input element
- [ ] Respects disabled state (visual and functional)
- [ ] Handles all input types (text, number, email, password)
- [ ] Dark Mode classes applied correctly
- [ ] onChange event handler works
- [ ] Custom className merged with base classes

#### Select Component

- [ ] Renders options from options prop
- [ ] Single select: Updates value on option selection
- [ ] Multi-select: Handles multiple selections (array value)
- [ ] Search functionality filters options (if implemented)
- [ ] Displays placeholder when no value selected
- [ ] Error state styling applied
- [ ] Disabled state prevents interaction
- [ ] Forwards ref correctly
- [ ] Dark Mode styling

#### Radio Component

- [ ] Renders all radio options
- [ ] Horizontal and vertical layout modes work
- [ ] Only one option selected at a time
- [ ] onChange handler receives correct value
- [ ] Disabled state for entire group
- [ ] Disabled state for individual options
- [ ] Label click selects radio

#### Checkbox Component

- [ ] Checked and unchecked states render correctly
- [ ] onChange handler toggles state
- [ ] Indeterminate state displays correctly
- [ ] Disabled state prevents interaction
- [ ] Label click toggles checkbox
- [ ] Forwards ref correctly

#### Textarea Component

- [ ] Renders with label and helper text
- [ ] Auto-resize expands as user types (if enabled)
- [ ] Max height enforced (if set)
- [ ] Error message displayed
- [ ] Disabled state works
- [ ] Character count displayed (if enabled)

### Component/Module 2: Widget Schemas (Zod)

Location: `packages/core/api-types/src/widgets/schemas.ts`

#### Base Schema Validation

- [ ] Valid baseWidget passes validation
- [ ] Invalid UUID rejected for id
- [ ] Negative position rejected
- [ ] Invalid backgroundColor format rejected (non-hex)
- [ ] Spacing values outside range (0-200) rejected

#### Hero Banner Schema

- [ ] Valid heroBannerWidget passes
- [ ] Invalid imageUrl rejected (not a URL)
- [ ] Empty imageAlt rejected
- [ ] Invalid textPosition rejected (not left/center/right)
- [ ] overlayOpacity out of range (0-100) rejected
- [ ] Optional fields (title, subtitle, cta) work when omitted

#### Flash Sale Schema

- [ ] Valid flashSaleWidget passes
- [ ] Invalid campaignId (not UUID) rejected
- [ ] Invalid countdownEndTime (not ISO 8601) rejected
- [ ] Invalid displayStyle rejected
- [ ] productsPerRow out of range (2-6) rejected
- [ ] Default values applied when fields omitted

#### Product Grid Schema

- [ ] Valid productGridWidget passes
- [ ] Invalid dataSource rejected
- [ ] categoryId required when dataSource is 'category' (conditional validation)
- [ ] productIds required when dataSource is 'custom'
- [ ] Limit and columns validated as positive integers

#### Quick Links Schema

- [ ] Valid quickLinksWidget passes
- [ ] Empty links array rejected
- [ ] Link without label or url rejected
- [ ] Invalid url format rejected
- [ ] layout enum validated

#### Page Config Schema

- [ ] Valid pageConfig passes
- [ ] Invalid slug format rejected (uppercase, spaces, special chars)
- [ ] Title too long (>200 chars) rejected
- [ ] Invalid status rejected
- [ ] widgets array validated (each widget schema)
- [ ] metadata dates validated as ISO 8601

### Component/Module 3: Widget Renderer

Location: `packages/host-root/src/components/widgets/`

#### WidgetRenderer

- [ ] Renders correct component for each widget type
- [ ] Filters out hidden widgets (commonProps.hidden = true)
- [ ] Sorts widgets by position ascending
- [ ] Error boundary catches widget render errors
- [ ] Error fallback displayed for broken widget
- [ ] Empty widgets array renders without error

#### WidgetWrapper

- [ ] Applies padding from commonProps.padding
- [ ] Applies margin from commonProps.margin
- [ ] Applies backgroundColor from commonProps.backgroundColor
- [ ] Handles partial spacing (only top/bottom set)
- [ ] Renders children correctly

### Component/Module 4: Individual Widgets

#### HeroBanner Component

- [ ] Renders image with correct src and alt
- [ ] Renders title, subtitle, and CTA when provided
- [ ] CTA button links to correct URL
- [ ] Text position (left/center/right) applies correct alignment
- [ ] Overlay opacity applied as CSS (RGBA or opacity)
- [ ] Responsive layout works on mobile/desktop
- [ ] Missing optional fields don't break render

#### FlashSale Component

- [ ] Fetches campaign data on mount using server function
- [ ] Loading skeleton displayed while fetching
- [ ] Error message displayed on fetch failure
- [ ] Countdown timer displays and updates every second
- [ ] Countdown shows "Expired" when time passes
- [ ] Grid layout renders products in specified columns
- [ ] Carousel layout renders and allows navigation
- [ ] showCountdown prop hides countdown when false
- [ ] Cleanup timer on unmount (no memory leak)

#### ProductGrid Component

- [ ] Fetches products based on dataSource prop
- [ ] Featured dataSource calls correct API endpoint
- [ ] Category dataSource passes categoryId to API
- [ ] Custom dataSource passes productIds to API
- [ ] Limits number of products to props.limit
- [ ] Responsive grid adapts to columns prop
- [ ] Loading skeleton displayed while fetching
- [ ] Error message on fetch failure
- [ ] Product card renders image, title, price

#### QuickLinks Component

- [ ] Renders all links from props.links array
- [ ] Horizontal layout displays inline
- [ ] Grid layout uses CSS grid
- [ ] Icons rendered when icon prop provided
- [ ] Links navigate to correct URL
- [ ] Accessible (aria-label, semantic anchor tags)

### Component/Module 5: Builder Context

Location: `packages/host-root/src/pages/admin/builder/components/BuilderContext.tsx`

#### Context State Management

- [ ] Initial state set from initialConfig prop
- [ ] setPageConfig updates state and clears isDirty flag
- [ ] addWidget adds widget to end of array (no position specified)
- [ ] addWidget inserts at specified position and renumbers
- [ ] updateWidget modifies correct widget by id
- [ ] updateWidget sets isDirty flag to true
- [ ] deleteWidget removes widget and renumbers positions
- [ ] deleteWidget clears selectedWidgetId if deleted widget was selected
- [ ] reorderWidget moves widget to new position and renumbers
- [ ] selectWidget updates selectedWidgetId
- [ ] saveConfig calls server function with current pageConfig
- [ ] saveConfig sets isSaving flag during operation
- [ ] saveConfig clears isDirty on success
- [ ] publishConfig updates status to 'published' and sets publishedAt
- [ ] publishConfig calls server function
- [ ] Error handling in save/publish (throws error for UI to catch)

### Component/Module 6: Server Functions

Location: `packages/host-root/src/server/widgets.ts`

#### getPageConfig

- [ ] Fetches from correct API endpoint with slug
- [ ] Includes Authorization header with token
- [ ] Validates response with Zod schema
- [ ] Throws error on 404 response
- [ ] Throws error on network failure
- [ ] Returns typed PageConfig

#### updatePageConfig

- [ ] Validates config with Zod before sending
- [ ] Sends PUT request to correct endpoint
- [ ] Includes Authorization header
- [ ] Includes Content-Type: application/json header
- [ ] Throws error on 400/403/500 response
- [ ] Returns updated config

#### createPageConfig

- [ ] Sends POST request to correct endpoint
- [ ] Validates response with Zod schema
- [ ] Generates id on server (not included in request)
- [ ] Returns created PageConfig with id and metadata

#### getCampaignData

- [ ] Fetches campaign by campaignId
- [ ] Includes authorization
- [ ] Throws on 404 (campaign not found)
- [ ] Returns campaign with products array

#### getProducts

- [ ] Builds query params from filters (featured, category, ids, limit)
- [ ] Fetches from products endpoint
- [ ] Returns array of products
- [ ] Handles empty results gracefully

## Integration Tests

**How do we test component interactions?**

### Integration Scenario 1: Load Page Config in Builder

- [ ] User navigates to `/admin/builder/:pageId`
- [ ] `getPageConfig` server function called with pageId
- [ ] Page config loaded into BuilderContext
- [ ] Widgets rendered in Canvas component
- [ ] First widget auto-selected (or no selection)
- [ ] No errors logged

### Integration Scenario 2: Drag and Drop Widget

- [ ] User drags widget from WidgetPicker to Canvas
- [ ] Drop zone highlights on drag over
- [ ] Widget added to pageConfig at drop position
- [ ] Canvas re-renders with new widget
- [ ] isDirty flag set to true
- [ ] "Unsaved changes" indicator appears

### Integration Scenario 3: Edit Widget Properties

- [ ] User selects widget in Canvas
- [ ] PropertyEditor renders with widget-specific form
- [ ] User changes a property (e.g., background color)
- [ ] onChange handler updates BuilderContext
- [ ] Canvas preview updates immediately (debounced)
- [ ] isDirty flag remains true

### Integration Scenario 4: Save Draft

- [ ] User clicks "Save Draft" button
- [ ] Validation runs on pageConfig (Zod schema)
- [ ] `updatePageConfig` server function called
- [ ] Success toast displayed
- [ ] isDirty flag cleared
- [ ] isSaving flag handled correctly (loading state)

### Integration Scenario 5: Publish Page

- [ ] User clicks "Publish" button
- [ ] Confirmation dialog shown (optional)
- [ ] pageConfig status changed to 'published'
- [ ] publishedAt timestamp added
- [ ] `updatePageConfig` called with updated config
- [ ] Success message shown
- [ ] isDirty flag cleared

### Integration Scenario 6: Widget Render with Data Fetching (Flash Sale)

- [ ] Flash Sale widget rendered on public page
- [ ] `getCampaignData` called with campaignId
- [ ] Loading skeleton shown initially
- [ ] Campaign data loaded and products displayed
- [ ] Countdown timer starts and updates
- [ ] No errors in console

### Integration Scenario 7: Error Handling in Builder

- [ ] API returns 500 error on save
- [ ] Error caught in BuilderContext
- [ ] Error toast displayed with message
- [ ] isSaving flag cleared
- [ ] User can retry save

### Integration Scenario 8: Reorder Widgets

- [ ] User drags widget up in Canvas
- [ ] Widget position changes in pageConfig
- [ ] All positions renumbered sequentially
- [ ] Canvas re-renders in new order
- [ ] isDirty flag set

### Integration Scenario 9: Delete Widget

- [ ] User clicks delete button on widget
- [ ] Confirmation dialog shown
- [ ] User confirms deletion
- [ ] Widget removed from pageConfig
- [ ] Positions renumbered
- [ ] Canvas re-renders without widget
- [ ] If widget was selected, selectedWidgetId cleared

## End-to-End Tests

**What user flows need validation?**

### E2E Test 1: Create New Page from Scratch

**Test Steps**:

1. Navigate to `/admin/builder/new`
2. Enter page title and slug in initial form
3. Click "Create Page"
4. Drag Hero Banner widget to canvas
5. Configure hero banner (image URL, title, CTA)
6. Drag Flash Sale widget below hero banner
7. Configure flash sale (select campaign, set countdown)
8. Click "Save Draft"
9. Verify success message
10. Navigate away and return to page
11. Verify widgets persist

**Assertions**:

- Page created with correct slug
- Widgets saved in correct order
- Properties saved correctly
- No console errors

### E2E Test 2: Edit Existing Page

**Test Steps**:

1. Navigate to `/admin/builder/home` (existing page)
2. Verify existing widgets loaded
3. Select first widget
4. Change background color in PropertyEditor
5. Verify preview updates
6. Click "Save Draft"
7. Reload page
8. Verify change persisted

**Assertions**:

- Existing config loaded correctly
- Changes reflected immediately in preview
- Changes persisted after save

### E2E Test 3: Publish Page and View Public

**Test Steps**:

1. Navigate to `/admin/builder/test-page`
2. Add Product Grid widget
3. Configure product grid (featured products, 4 columns)
4. Click "Publish"
5. Verify success message
6. Open new tab and navigate to `/test-page`
7. Verify Product Grid widget renders
8. Verify products fetched and displayed

**Assertions**:

- Page status changed to 'published'
- publishedAt timestamp set
- Public page renders widgets correctly
- Products fetched and displayed

### E2E Test 4: Drag to Reorder Widgets

**Test Steps**:

1. Navigate to page with 3+ widgets
2. Drag bottom widget to top position
3. Verify visual feedback during drag
4. Drop widget at top
5. Verify canvas updates order
6. Click "Save Draft"
7. Reload page
8. Verify order persisted

**Assertions**:

- Drag-and-drop interaction smooth (< 50ms latency)
- Visual feedback clear (drop zones, dragging state)
- Order saved correctly

### E2E Test 5: Validation and Error Handling

**Test Steps**:

1. Navigate to builder
2. Add Hero Banner widget
3. Enter invalid image URL (not a URL format)
4. Try to save
5. Verify validation error displayed inline
6. Correct the URL
7. Error clears
8. Save succeeds

**Assertions**:

- Validation error shown in real-time
- Save blocked with invalid data
- Error message descriptive

### E2E Test 6: Mobile Responsive Builder (Optional)

**Test Steps**:

1. Open builder on mobile viewport (375px width)
2. Verify 3-column layout stacks vertically
3. Verify widgets in canvas are scrollable
4. Tap widget to select
5. PropertyEditor opens (or in modal)
6. Edit property and save

**Assertions**:

- Layout adapts to mobile
- Touch interactions work
- Forms usable on mobile

### E2E Test 7: Keyboard Navigation (Accessibility)

**Test Steps**:

1. Navigate to builder
2. Use Tab key to navigate through UI
3. Use arrow keys to reorder selected widget
4. Use Enter to select widget
5. Use Delete key to delete selected widget
6. Use Ctrl+S to save

**Assertions**:

- All interactive elements focusable
- Keyboard shortcuts work
- Focus indicators visible

## Test Data

**What data do we use for testing?**

### Test Fixtures and Mocks

**Mock Page Config** (`tests/fixtures/mockPageConfig.ts`):

```typescript
export const mockPageConfig: PageConfig = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    slug: "test-page",
    title: "Test Page",
    status: "draft",
    widgets: [
        {
            id: "123e4567-e89b-12d3-a456-426614174001",
            type: "hero_banner",
            position: 0,
            commonProps: {
                padding: { top: 20, bottom: 20 },
                backgroundColor: "#f0f0f0"
            },
            props: {
                imageUrl: "https://example.com/banner.jpg",
                imageAlt: "Test Banner",
                title: "Welcome",
                textPosition: "center",
                overlayOpacity: 40
            }
        }
        // ... more widgets
    ],
    metadata: {
        createdBy: "test-user",
        createdAt: "2024-01-01T00:00:00Z",
        updatedBy: "test-user",
        updatedAt: "2024-01-01T00:00:00Z",
        version: 1
    }
};
```

**Mock Campaign Data** (`tests/fixtures/mockCampaign.ts`):

```typescript
export const mockCampaign = {
    id: "campaign-123",
    name: "Flash Sale 2024",
    endTime: "2024-12-31T23:59:59Z",
    products: [
        { id: "prod-1", name: "Product 1", price: 99.99, imageUrl: "..." },
        { id: "prod-2", name: "Product 2", price: 149.99, imageUrl: "..." }
    ]
};
```

**Mock API Handlers** (using MSW - `tests/mocks/handlers.ts`):

```typescript
import { rest } from "msw";

export const handlers = [
    rest.get("/api/pages/:slug", (req, res, ctx) => {
        const { slug } = req.params;
        return res(ctx.json(mockPageConfig));
    }),

    rest.put("/api/pages/:id", (req, res, ctx) => {
        return res(ctx.json({ success: true }));
    }),

    rest.get("/api/campaigns/:id", (req, res, ctx) => {
        return res(ctx.json(mockCampaign));
    }),

    rest.get("/api/products", (req, res, ctx) => {
        return res(ctx.json({ products: mockProducts }));
    })
];
```

### Seed Data Requirements

For E2E tests in staging environment:

- At least 3 pre-existing pages with various widget configurations
- At least 2 active campaigns with products
- At least 20 products in different categories
- Test user accounts with different roles (admin, editor, viewer)

### Test Database Setup

**For local development**:

- Use Docker Compose to spin up PostgreSQL with seed data
- Run migration scripts to create tables
- Seed with test page configs

```bash
# In docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: cms_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    volumes:
      - ./tests/seed.sql:/docker-entrypoint-initdb.d/seed.sql
```

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Coverage Commands and Thresholds

**Run unit tests with coverage**:

```bash
pnpm test -- --coverage
```

**Run integration tests**:

```bash
pnpm test:integration
```

**Run E2E tests**:

```bash
pnpm test:e2e
# or with specific browser
pnpm test:e2e --browser=chromium
```

**Coverage Thresholds** (in `vitest.config.ts` or `jest.config.js`):

```typescript
export default {
    test: {
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            statements: 90,
            branches: 85,
            functions: 90,
            lines: 90,
            exclude: ["tests/**", "**/*.test.ts", "**/*.test.tsx", "**/mocks/**"]
        }
    }
};
```

### Coverage Gaps

**Known gaps to address** (track during implementation):

- [ ] Error boundary fallback UI (hard to test, consider manual testing)
- [ ] Specific browser APIs (clipboard, drag-and-drop native events)
- [ ] SSR rendering edge cases (requires integration tests)
- [ ] Countdown timer accuracy over long durations (manual testing required)

**Rationale for gaps**:

- Some UI interactions require manual testing for confidence
- Browser-specific behaviors validated in E2E tests
- Diminishing returns on 100% coverage for trivial code paths

### Links to Test Reports

After running tests, reports available at:

- **Coverage HTML**: `coverage/index.html`
- **E2E Test Results**: `playwright-report/index.html` or Cypress dashboard
- **CI/CD Reports**: Link to GitHub Actions or GitLab CI artifacts

### Manual Testing Outcomes and Sign-Off

**UAT Checklist** (to be completed by Marketing team):

- [ ] Can create a new page without confusion
- [ ] Drag-and-drop feels intuitive
- [ ] Forms are easy to understand and fill out
- [ ] Preview accurately reflects final output
- [ ] Save/Publish actions work as expected
- [ ] No unexpected errors encountered

**Sign-off**:

- [ ] QA Engineer: All automated tests pass
- [ ] Product Manager: UAT completed successfully
- [ ] Tech Lead: Code review approved
- [ ] Marketing Team: Accepts feature for production use

## Manual Testing

**What requires human validation?**

### UI/UX Testing Checklist

**Visual Design**:

- [ ] All components match design mockups
- [ ] Spacing and alignment consistent
- [ ] Typography correct (font families, sizes, weights)
- [ ] Colors match brand guidelines
- [ ] Dark Mode looks polished (no broken contrast)

**Interactions**:

- [ ] Hover states on buttons and interactive elements
- [ ] Click feedback (button press, ripple effects if applicable)
- [ ] Drag-and-drop feels smooth (no jank, clear feedback)
- [ ] Loading spinners appear during async operations
- [ ] Toasts/notifications dismissible and readable

**Accessibility**:

- [ ] Tab order logical (follows visual flow)
- [ ] Focus indicators visible on all focusable elements
- [ ] Screen reader announces all content (test with NVDA/VoiceOver)
- [ ] ARIA labels present on icon buttons
- [ ] Color contrast ratios meet WCAG AA (check with tool like axe DevTools)
- [ ] Forms have associated labels (no floating placeholders as sole label)

**Usability**:

- [ ] Error messages helpful and actionable
- [ ] Empty states guide user on next action
- [ ] Confirmation dialogs for destructive actions (delete, discard changes)
- [ ] "Unsaved changes" warning prevents data loss
- [ ] Help text/tooltips available where needed

### Browser/Device Compatibility

**Desktop Browsers**:

- [ ] Chrome (latest 2 versions) - Windows, macOS
- [ ] Firefox (latest 2 versions) - Windows, macOS
- [ ] Safari (latest 2 versions) - macOS
- [ ] Edge (latest 2 versions) - Windows

**Mobile Devices** (responsive testing):

- [ ] iPhone (iOS Safari) - portrait and landscape
- [ ] Android (Chrome) - portrait and landscape
- [ ] Tablet (iPad, Android tablet) - both orientations

**Testing Tools**:

- BrowserStack or LambdaTest for cross-browser testing
- Chrome DevTools device emulation for quick responsive checks

### Smoke Tests After Deployment

**Critical Path Smoke Test** (run in production after deploy):

1. [ ] Navigate to homepage (`/`)
2. [ ] Verify widgets render correctly
3. [ ] Navigate to `/admin/builder/home`
4. [ ] Verify builder loads without errors
5. [ ] Make a minor change (e.g., change text)
6. [ ] Save draft
7. [ ] Verify save succeeds
8. [ ] Publish page
9. [ ] Verify publish succeeds
10. [ ] Check public page reflects change

**Monitoring Checks**:

- [ ] No 500 errors in logs
- [ ] API response times within SLA (< 500ms)
- [ ] No JavaScript errors in error tracking (Sentry)

## Performance Testing

**How do we validate performance?**

### Load Testing Scenarios

**Scenario 1: High Traffic on Public Pages**

- **Tool**: Apache JMeter or k6
- **Scenario**: 1000 concurrent users loading public page with 10 widgets
- **Expected**:
    - Median response time < 500ms
    - 95th percentile < 1000ms
    - Error rate < 1%

**Scenario 2: Concurrent Editors**

- **Scenario**: 50 users editing different pages simultaneously
- **Expected**:
    - Save operations complete in < 1s
    - No database locks or conflicts
    - All changes persisted correctly

### Stress Testing Approach

**Large Page Configuration**:

- Create page with 50 widgets
- Measure time to load in builder
- Measure time to render on public page
- Verify no browser freeze or crash

**Expected Performance**:

- Builder load time: < 3s
- Public page load time: < 2s
- Smooth scrolling (60 FPS)

### Performance Benchmarks

**Metrics to Track**:

- **Time to Interactive (TTI)**: < 2s on public pages
- **First Contentful Paint (FCP)**: < 1s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle Size**: < 200KB (gzipped) for initial load

**Tools**:

- Lighthouse for Core Web Vitals
- WebPageTest for detailed performance breakdown
- Chrome DevTools Performance tab for profiling

## Bug Tracking

**How do we manage issues?**

### Issue Tracking Process

**Bug Report Template**:

```markdown
## Description

[Clear description of the issue]

## Steps to Reproduce

1. Navigate to...
2. Click on...
3. Observe...

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Environment

- Browser: Chrome 120
- OS: Windows 11
- User Role: Editor

## Screenshots/Videos

[Attach if applicable]

## Severity

- [ ] Critical (blocks core functionality)
- [ ] High (major feature broken)
- [ ] Medium (minor feature broken or poor UX)
- [ ] Low (cosmetic issue)
```

**Tracking in GitHub Issues** (or Jira):

- Label: `bug`, `widget-builder`, severity label
- Assign to responsible developer
- Link to related feature branch or PR

### Bug Severity Levels

**Critical** (P0):

- Security vulnerabilities
- Data loss
- Complete feature outage
- **SLA**: Fix within 24 hours

**High** (P1):

- Core functionality broken (can't save, can't publish)
- Major usability issue (blocker for marketing team)
- **SLA**: Fix within 3 days

**Medium** (P2):

- Minor functionality broken (one widget type not rendering)
- Moderate usability issue (confusing UI)
- **SLA**: Fix in next sprint

**Low** (P3):

- Cosmetic issues
- Edge case bugs
- Nice-to-have improvements
- **SLA**: Backlog, prioritize as time allows

### Regression Testing Strategy

**After Bug Fixes**:

- Add regression test for the bug to prevent recurrence
- Run full test suite before merging fix
- Manually test related functionality

**Before Each Release**:

- Run all E2E tests
- Perform manual smoke tests
- Check no new errors in staging environment
- Review test coverage report (ensure no drops)

**Continuous Regression Testing**:

- Automated tests run on every commit (CI/CD)
- Nightly full test suite run (including performance tests)
- Monitor production for new errors (Sentry alerts)
