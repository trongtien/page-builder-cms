---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
feature: user-authentication
---

# Testing Strategy - User Authentication

## Test Coverage Goals

**Coverage Targets:**

- **Unit Test Coverage**: 100% of new/changed code (auth service, context, hooks)
- **Integration Test Coverage**: All critical authentication paths (login, logout, route protection)
- **End-to-End Test Coverage**: Complete user journeys (login → navigate → logout)

**Alignment with Requirements:**

- ✅ Login with valid credentials works (Success Criteria)
- ✅ Login with invalid credentials shows error (Success Criteria)
- ✅ Protected routes redirect unauthenticated users (Success Criteria)
- ✅ Auth state persists across page refresh (Success Criteria)
- ✅ Logout clears state and redirects (Success Criteria)
- ✅ Post-login redirect to original route works (Success Criteria)

## Unit Tests

### Component/Module 1: Auth Service (`auth.service.ts`)

**Test Coverage:**

- [ ] **Test case 1**: `login()` with valid credentials returns token and user
    - Mock credentials: `admin@example.com` / `password123`
    - Expect: Returns `{ token: string, user: User }`
    - Covers: Happy path login flow

- [ ] **Test case 2**: `login()` with invalid credentials throws error
    - Mock credentials: `wrong@example.com` / `wrongpass`
    - Expect: Throws error with message "Invalid credentials"
    - Covers: Error handling for failed authentication

- [ ] **Test case 3**: `logout()` clears localStorage
    - Setup: Store token and user in localStorage
    - Action: Call logout()
    - Expect: localStorage.removeItem called for AUTH_TOKEN_KEY and AUTH_USER_KEY
    - Covers: Logout clears authentication artifacts

- [ ] **Test case 4**: `getStoredToken()` retrieves token from localStorage
    - Setup: Store token in localStorage
    - Expect: Returns stored token string
    - Covers: Token retrieval

- [ ] **Test case 5**: `getStoredUser()` retrieves user from localStorage
    - Setup: Store user JSON in localStorage
    - Expect: Returns parsed user object
    - Covers: User data retrieval

- [ ] **Test case 6**: `setStoredAuth()` stores token and user
    - Action: Call setStoredAuth(token, user)
    - Expect: localStorage.setItem called with correct keys and values
    - Covers: Auth persistence

- [ ] **Test case 7**: Storage functions handle localStorage unavailability
    - Setup: Mock localStorage to throw error (e.g., private browsing)
    - Expect: Functions don't crash, return null gracefully
    - Covers: Edge case for storage access

**Additional Coverage:**

- Mock `setTimeout` to test async delay in login
- Verify mock token format matches expected JWT structure

---

### Component/Module 2: Auth Context (`AuthContext.tsx`)

**Test Coverage:**

- [ ] **Test case 1**: AuthProvider initializes with loading state
    - Render: `<AuthProvider><TestComponent /></AuthProvider>`
    - Expect: Initial state has `isLoading: true, isAuthenticated: false`
    - Covers: Initial state setup

- [ ] **Test case 2**: AuthProvider loads auth from localStorage on mount
    - Setup: Pre-populate localStorage with token and user
    - Render: AuthProvider
    - Expect: State updates to `{ user, token, isAuthenticated: true, isLoading: false }`
    - Covers: Session persistence across page reloads

- [ ] **Test case 3**: `login()` method updates state on success
    - Setup: Mock authService.login to return token and user
    - Action: Call context.login(credentials)
    - Expect: State updates with user, token, isAuthenticated: true
    - Covers: Login flow updates context state

- [ ] **Test case 4**: `login()` method handles errors
    - Setup: Mock authService.login to throw error
    - Action: Call context.login(credentials)
    - Expect: Error is propagated, state remains unauthenticated
    - Covers: Error handling in login

- [ ] **Test case 5**: `logout()` method clears state and storage
    - Setup: Authenticate user first
    - Action: Call context.logout()
    - Expect: State resets to `{ user: null, token: null, isAuthenticated: false }`
    - Expect: authService.logout() called (clears localStorage)
    - Covers: Logout clears authentication

- [ ] **Test case 6**: Context value is memoized correctly
    - Setup: Render AuthProvider with React Testing Library
    - Action: Trigger re-render without state change
    - Expect: Context value reference remains stable (no unnecessary re-renders)
    - Covers: Performance optimization

**Additional Coverage:**

- Test AuthProvider with children components accessing context
- Verify useAuth hook throws error when used outside AuthProvider

---

### Component/Module 3: Compound Auth Hooks (`hooks/auth/`)

**Test Coverage:**

- [ ] **Test case 1**: useAuthState returns auth state when inside provider
    - Setup: Render hook inside AuthProvider
    - Expect: Returns { user, token, isAuthenticated, isLoading }
    - Covers: State access pattern

- [ ] **Test case 2**: useAuthActions returns auth actions when inside provider
    - Setup: Render hook inside AuthProvider
    - Expect: Returns { login, logout, checkAuth }
    - Covers: Actions access pattern

- [ ] **Test case 3**: useAuth returns combined state and actions
    - Setup: Render hook inside AuthProvider
    - Expect: Returns both state and actions
    - Covers: Convenience hook pattern

- [ ] **Test case 4**: useAuthUser returns current user
    - Setup: Render hook inside AuthProvider with authenticated user
    - Expect: Returns user object
    - Covers: Derived hook pattern

- [ ] **Test case 5**: Hooks throw error when outside provider
    - Setup: Render hooks without AuthProvider
    - Expect: Each hook throws appropriate error message
    - Covers: Error handling for misuse

- [ ] **Test case 6**: useAuthActions doesn't cause re-render on state change
    - Setup: Component using only useAuthActions
    - Action: Update auth state (login)
    - Expect: Component doesn't re-render (actions reference stable)
    - Covers: Performance optimization of compound pattern

---

### Component/Module 4: Login Page (`login.tsx`)

**Test Coverage:**

- [ ] **Test case 1**: Login form renders with email and password fields
    - Render: Login page
    - Expect: Email input, password input, submit button present
    - Covers: UI rendering

- [ ] **Test case 2**: Form validation prevents submission with empty fields
    - Render: Login page
    - Action: Submit form without filling fields
    - Expect: HTML5 validation triggers, form not submitted
    - Covers: Client-side validation

- [ ] **Test case 3**: Successful login redirects to dashboard
    - Setup: Mock auth.login to succeed
    - Action: Fill form, submit
    - Expect: useNavigate called with `{ to: '/dashboard' }`
    - Covers: Post-login redirect (happy path)

- [ ] **Test case 4**: Successful login redirects to original route
    - Setup: Mock useSearch to return `{ redirect: '/users' }`
    - Action: Fill form, submit
    - Expect: useNavigate called with `{ to: '/users' }`
    - Covers: Redirect parameter handling

- [ ] **Test case 5**: Failed login displays error message
    - Setup: Mock auth.login to throw error
    - Action: Fill form, submit
    - Expect: Error message displayed in UI
    - Covers: Error handling and user feedback

- [ ] **Test case 6**: Loading state disables form during submission
    - Setup: Mock auth.login with delay
    - Action: Submit form
    - Expect: Button disabled, button text changes to "Logging in..."
    - Covers: Loading state UX

**Additional Coverage:**

- Test email format validation (if implemented)
- Test form input change handlers
- Test keyboard navigation (enter key to submit)

---

## Integration Tests

### Integration Scenario 1: Complete Login Flow

- [ ] **Test**: User logs in and accesses protected route
    - Setup: Render app with routing and AuthProvider
    - Action: Navigate to /login, fill form with valid credentials, submit
    - Expect: Redirected to /dashboard, user info displayed
    - Covers: End-to-end login integration

### Integration Scenario 2: Route Protection

- [ ] **Test**: Unauthenticated user cannot access protected route
    - Setup: Render app without authentication
    - Action: Navigate to /dashboard
    - Expect: Redirected to /login with redirect param
    - Covers: Route guard functionality

### Integration Scenario 3: Logout Flow

- [ ] **Test**: Authenticated user logs out and cannot access protected routes
    - Setup: Authenticate user, navigate to dashboard
    - Action: Click logout button
    - Expect: Redirected to /login, subsequent dashboard access blocked
    - Covers: Logout clears auth state completely

### Integration Scenario 4: Session Persistence

- [ ] **Test**: Auth state persists after page refresh
    - Setup: Login user, store token in localStorage
    - Action: Simulate page refresh (remount app)
    - Expect: User remains authenticated, dashboard accessible
    - Covers: localStorage persistence integration

### Integration Scenario 5: API Failure Handling

- [ ] **Test**: Network error during login shows error message
    - Setup: Mock auth service to throw network error
    - Action: Submit login form
    - Expect: Error message displayed, user remains on login page
    - Covers: Network error handling

### Integration Scenario 6: Token Expiration (Future)

- [ ] **Test**: Expired token triggers logout and redirect
    - Setup: Store expired token in localStorage
    - Action: Navigate to protected route
    - Expect: Redirected to /login, token cleared
    - Covers: Token validation and expiration handling (implementation pending)

---

## End-to-End Tests

### User Flow 1: First-Time Login

**Steps:**

1. Open app in browser
2. Redirected to /login (no auth state)
3. Enter valid credentials (admin@example.com / password123)
4. Click login button
5. Redirected to /dashboard
6. See user info in navbar
7. Navigate to /users (protected route) - access granted

**Expected Outcome:**

- User successfully logs in and accesses protected routes
- Auth state persists across route changes

---

### User Flow 2: Login with Redirect

**Steps:**

1. Open app, try to access /dashboard directly (not authenticated)
2. Redirected to /login?redirect=/dashboard
3. Enter valid credentials and submit
4. Redirected back to /dashboard (not generic /home)

**Expected Outcome:**

- Original destination preserved in redirect parameter
- User lands on intended page after login

---

### User Flow 3: Invalid Login Attempt

**Steps:**

1. Navigate to /login
2. Enter invalid credentials (wrong@example.com / badpass)
3. Click login button
4. See error message: "Invalid credentials"
5. Form remains filled (email preserved)
6. Correct password and resubmit
7. Login succeeds

**Expected Outcome:**

- Error message displayed clearly
- User can retry without re-entering email
- Successful login works after correction

---

### User Flow 4: Logout

**Steps:**

1. Login successfully
2. Navigate to dashboard
3. Click logout button in navbar
4. Redirected to /login
5. Try to access /dashboard directly
6. Blocked and redirected back to /login

**Expected Outcome:**

- Logout completely clears auth state
- Protected routes become inaccessible
- User cannot bypass by typing URL directly

---

### User Flow 5: Session Persistence

**Steps:**

1. Login successfully
2. Navigate to /dashboard
3. Close browser tab
4. Reopen app in new tab
5. Automatically authenticated, dashboard accessible

**Expected Outcome:**

- Auth state restored from localStorage
- No re-login required
- User experience is seamless

---

## Test Data

**Test Fixtures:**

```typescript
// Valid mock user
const mockUser = {
    id: "user-123",
    email: "admin@example.com",
    name: "Admin User",
    avatar: "https://example.com/avatar.jpg"
};

// Valid credentials
const validCredentials = {
    email: "admin@example.com",
    password: "password123"
};

// Invalid credentials
const invalidCredentials = {
    email: "wrong@example.com",
    password: "wrongpass"
};

// Mock JWT token
const mockToken = "mock.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20ifQ.signature";
```

**Mocks:**

- Mock localStorage with jest-localstorage-mock or custom implementation
- Mock auth service functions with vi.fn() (Vitest) or jest.fn() (Jest)
- Mock TanStack Router hooks (useNavigate, useSearch) with testing library utilities

**Test Database Setup:**

- N/A (no database for MVP, all client-side)

---

## Test Reporting & Coverage

**Coverage Commands:**

```bash
# Run all tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test auth.service.test.ts

# Run tests in watch mode
pnpm test --watch

# Generate HTML coverage report
pnpm test --coverage --reporter=html
```

**Coverage Thresholds:**

```json
// vitest.config.ts or jest.config.js
{
    "coverage": {
        "branches": 100,
        "functions": 100,
        "lines": 100,
        "statements": 100
    }
}
```

**Coverage Gaps & Rationale:**

- If <100% coverage achieved, document here:
    - **File**: [filename]
    - **Lines not covered**: [line numbers]
    - **Reason**: [explanation - e.g., defensive code, error handling for rare edge case]
    - **Plan**: [when/if to cover - e.g., defer to v2, low priority]

**Test Reports:**

- Coverage report generated in `coverage/` directory
- HTML report available at `coverage/index.html`
- CI/CD pipeline should fail if coverage drops below threshold

---

## Manual Testing

### UI/UX Testing Checklist

- [ ] Login page layout is centered and visually appealing
- [ ] Form inputs have proper labels and placeholders
- [ ] Error messages are red and clearly visible
- [ ] Loading state shows button disabled with "Logging in..." text
- [ ] Successful login shows no flash of content before redirect
- [ ] Navbar displays user name when authenticated
- [ ] Logout button is easily accessible
- [ ] Responsive design works on mobile (320px width)
- [ ] Responsive design works on tablet (768px width)
- [ ] Keyboard navigation works (tab to inputs, enter to submit)

**Accessibility Checks:**

- [ ] All form inputs have associated labels (for screen readers)
- [ ] Error messages are announced by screen readers
- [ ] Login button has clear focus state
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Page titles are descriptive (e.g., "Login - Page Builder CMS")

### Browser/Device Compatibility

- [ ] **Chrome** (latest): All features work
- [ ] **Firefox** (latest): All features work
- [ ] **Safari** (latest): All features work
- [ ] **Edge** (latest): All features work
- [ ] **Mobile Safari** (iOS): Responsive design works
- [ ] **Chrome Mobile** (Android): Responsive design works

### Smoke Tests After Deployment

- [ ] Visit live URL, login page loads
- [ ] Login with valid credentials succeeds
- [ ] Navigate to protected route, access granted
- [ ] Logout works and clears session
- [ ] Page refresh maintains auth state
- [ ] No console errors in browser dev tools

---

## Performance Testing

### Load Testing Scenarios

- **Test**: Measure login API response time
    - Setup: Call login endpoint 100 times
    - Expect: Average response time < 500ms (mock API)
    - Future: Real API should respond < 2s

- **Test**: Measure auth state initialization time
    - Setup: Render AuthProvider with pre-stored token
    - Expect: Auth state loaded from localStorage < 100ms

### Stress Testing Approach

- **Test**: Rapid login/logout cycles
    - Action: Login and logout 50 times in succession
    - Expect: No memory leaks, no performance degradation

### Performance Benchmarks

- [ ] Login API call: < 2 seconds (production)
- [ ] Auth state init: < 100ms
- [ ] Route protection check: < 50ms
- [ ] No visible UI flicker during auth checks

---

## Bug Tracking

**Issue Tracking Process:**

1. Create GitHub/GitLab issue for any bug found during testing
2. Label with `bug`, `authentication`, priority level
3. Assign to developer
4. Link issue to testing documentation

**Bug Severity Levels:**

- **Critical**: Blocks authentication entirely (e.g., login always fails)
- **High**: Major functionality broken (e.g., logout doesn't clear state)
- **Medium**: Feature works but with issues (e.g., error message unclear)
- **Low**: Minor UX issue (e.g., button styling off)

**Regression Testing Strategy:**

- Re-run all integration tests after bug fixes
- Add new test case for each bug discovered (prevent regression)
- Verify bug fix in multiple browsers before closing issue

**Known Issues:**

- None (to be populated during testing phase)

---

## Test Execution Checklist

### Pre-Implementation

- [x] Requirements documented and reviewed
- [x] Design documented and reviewed
- [x] Test plan created (this document)

### During Implementation

- [ ] Write unit tests alongside code (TDD approach)
- [ ] Run tests frequently (`pnpm test --watch`)
- [ ] Ensure all tests pass before committing code

### Post-Implementation

- [ ] All unit tests written and passing
- [ ] All integration tests written and passing
- [ ] Code coverage meets 100% target
- [ ] Manual testing checklist completed
- [ ] Browser compatibility verified
- [ ] Accessibility checks passed
- [ ] Performance benchmarks met
- [ ] No console errors or warnings
- [ ] Documentation updated (implementation notes, known issues)

### Pre-Merge

- [ ] All tests pass in CI/CD pipeline
- [ ] Code review completed
- [ ] Test coverage report reviewed
- [ ] Manual smoke tests in staging environment
- [ ] Sign-off from stakeholder (if applicable)
