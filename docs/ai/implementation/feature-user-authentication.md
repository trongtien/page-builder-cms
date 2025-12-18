---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
feature: user-authentication
---

# Implementation Guide - User Authentication

## Development Setup

**Prerequisites:**

- Node.js 18+ installed
- pnpm package manager
- VS Code (recommended)
- Existing project dependencies installed

**Environment Setup:**

- No additional environment variables needed for mock authentication
- Future: Add `VITE_API_URL` for real backend integration

**Configuration:**

- Ensure TanStack Router is properly configured in `vite.config.ts`
- Verify Tailwind CSS is set up for styling

## Code Structure

**Directory Organization:**

```
src/
├── contexts/
│   └── AuthContext.tsx          # Auth state management
├── hooks/
│   └── auth/
│       ├── index.ts              # Export all auth hooks
│       ├── useAuth.ts            # Combined convenience hook
│       ├── useAuthState.ts       # Auth state hook
│       ├── useAuthActions.ts     # Auth actions hook
│       └── useAuthUser.ts        # Current user hook
├── services/
│   └── auth.service.ts           # Auth API calls and storage
├── routes/
│   ├── login.tsx                 # Login page route
│   ├── dashboard.tsx             # Protected route (updated)
│   └── __root.tsx                # Root layout (updated with provider)
├── types/
│   └── auth.types.ts             # Auth-related TypeScript types
└── main.tsx                      # App entry point (wrap with provider)
```

**Module Organization:**

- **Contexts**: Global state management (AuthContext)
- **Services**: Business logic and API communication (auth.service)
- **Hooks**: Reusable custom hooks (useAuth)
- **Routes**: Page components with TanStack Router integration
- **Types**: TypeScript type definitions

**Naming Conventions:**

- Types: PascalCase with descriptive names (User, AuthResponse, LoginCredentials)
- Services: camelCase functions (login, logout, getStoredToken)
- Components: PascalCase (AuthProvider, LoginPage)
- Hooks: camelCase with "use" prefix (useAuth)
- Constants: UPPER_SNAKE_CASE (AUTH_TOKEN_KEY)

## Implementation Notes

### Core Features

**Feature 1: Auth Context & State Management**

**Implementation Approach:**

- Use React Context API for global auth state
- Store user, token, isAuthenticated, isLoading in state
- Initialize state from localStorage on mount to persist sessions
- Provide login, logout, checkAuth methods via context

**Key Code Patterns:**

```typescript
// AuthContext.tsx structure - Compound pattern
const AuthStateContext = createContext<AuthState | undefined>(undefined);
const AuthActionsContext = createContext<AuthActions | undefined>(undefined);

export function AuthProvider({ children }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize from localStorage
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Memoize actions separately from state to prevent re-render cascades
  const actions = useMemo(() => ({
    login: async (credentials: LoginCredentials) => {
      const { token, user } = await authService.login(credentials);
      setStoredAuth(token, user);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    },
    logout: () => {
      authService.logout();
      setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },
    checkAuth: () => {
      const token = getStoredToken();
      const user = getStoredUser();
      setState(prev => ({ ...prev, isAuthenticated: !!(token && user) }));
    },
  }), []); // Actions don't depend on state

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}
```

**Feature 2: Mock Authentication Service**

**Implementation Approach:**

- Create auth.service.ts with login, logout, storage functions
- Mock API with hardcoded credentials (admin@example.com / password123)
- Simulate network delay with setTimeout (500ms)
- Generate mock JWT token (base64 encoded JSON for testing)
- Store token and user in localStorage

**Key Code Patterns:**

```typescript
// auth.service.ts
const MOCK_USER = {
    id: "user-123",
    email: "admin@example.com",
    name: "Admin User"
};

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (credentials.email === "admin@example.com" && credentials.password === "password123") {
        const token = generateMockToken(MOCK_USER);
        return { token, user: MOCK_USER };
    }
    throw new Error("Invalid credentials");
}

function generateMockToken(user: User): string {
    const payload = { sub: user.id, email: user.email, iat: Date.now() };
    return `mock.${btoa(JSON.stringify(payload))}.signature`;
}
```

**Feature 3: Login Page & Form**

**Implementation Approach:**

- Create TanStack Router route at `/login`
- Use controlled form components (email, password)
- Client-side validation (required fields, email format)
- Call useAuth().login() on form submission
- Handle loading state with disabled inputs and button
- Display error messages from API/auth context
- Redirect to dashboard or original route on success using redirect query param

**Key Code Patterns:**

```typescript
// login.tsx
export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: '/login' }); // Get ?redirect param

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.login(formData);
      const redirectTo = (search as any).redirect || '/dashboard';
      navigate({ to: redirectTo });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={formData.email} onChange={...} required />
      <input type="password" value={formData.password} onChange={...} required />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

**Feature 4: Route Protection**

**Implementation Approach:**

- Use TanStack Router's `beforeLoad` hook on protected routes
- Check auth context state (isAuthenticated)
- Redirect to `/login?redirect={currentPath}` if not authenticated
- Allow navigation if authenticated

**Key Code Patterns:**

```typescript
// dashboard.tsx (or route config)
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
    beforeLoad: async ({ context, location }) => {
        // Assuming auth context is passed via router context
        if (!context.auth.isAuthenticated) {
            throw redirect({
                to: "/login",
                search: { redirect: location.href }
            });
        }
    },
    component: DashboardPage
});
```

**Alternative: Router Context Setup**

```typescript
// __root.tsx - provide auth to all child routes
export const Route = createRootRoute({
    component: RootComponent,
    beforeLoad: () => {
        const auth = useAuth(); // Or pass auth from a higher level
        return { auth }; // Pass auth to child routes via context
    }
});
```

### Patterns & Best Practices

**Design Patterns:**

1. **Provider Pattern**: Auth context wraps the app to provide global state
2. **Compound Hooks Pattern**: Separate hooks for state vs actions to optimize re-renders
3. **Service Layer Pattern**: auth.service separates business logic from UI
4. **Guard Pattern**: beforeLoad acts as a route guard
5. **Split Context Pattern**: Separate state and actions contexts for better performance

**Compound Hooks Implementation:**

```typescript
// hooks/auth/useAuthState.ts
export function useAuthState() {
    const context = useContext(AuthStateContext);
    if (!context) {
        throw new Error("useAuthState must be used within AuthProvider");
    }
    return context;
}

// hooks/auth/useAuthActions.ts
export function useAuthActions() {
    const context = useContext(AuthActionsContext);
    if (!context) {
        throw new Error("useAuthActions must be used within AuthProvider");
    }
    return context;
}

// hooks/auth/useAuth.ts - Convenience hook
export function useAuth() {
    const state = useAuthState();
    const actions = useAuthActions();
    return { ...state, ...actions };
}

// hooks/auth/useAuthUser.ts - Derived hook
export function useAuthUser() {
    const { user } = useAuthState();
    return user;
}

// hooks/auth/index.ts
export { useAuth } from "./useAuth";
export { useAuthState } from "./useAuthState";
export { useAuthActions } from "./useAuthActions";
export { useAuthUser } from "./useAuthUser";
```

**Benefits of Compound Hooks:**

- Components only using actions don't re-render on state changes
- Components only reading user data don't re-render on loading state changes
- Better tree-shaking (unused hooks aren't bundled)
- More testable (can test hooks independently)
- Follows separation of concerns principle

**Code Style Guidelines:**

- Use TypeScript strict mode
- Prefer functional components and hooks
- Use async/await for promises (avoid .then())
- Handle errors with try-catch blocks
- Use optional chaining (?.) for safe property access
- Destructure props and context values

**Common Utilities/Helpers:**

```typescript
// Validate email format
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Parse JWT payload (for mock token inspection)
function parseJWT(token: string): any {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        return JSON.parse(atob(parts[1]));
    } catch {
        return null;
    }
}
```

## Integration Points

**API Integration:**

- Currently uses mock auth service
- To integrate real API, update `auth.service.ts`:

    ```typescript
    export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            throw new Error("Invalid credentials");
        }

        return response.json();
    }
    ```

**TanStack Router Integration:**

- Wrap app with AuthProvider in `main.tsx` or `__root.tsx`
- Pass auth context to routes via router context in root route
- Use beforeLoad for route protection
- Use useNavigate for programmatic navigation

**localStorage Integration:**

- Store token under key: `auth_token`
- Store user data under key: `auth_user`
- Clear both on logout
- Validate on app initialization

## Error Handling

**Error Handling Strategy:**

1. **Service Layer Errors**:
    - Wrap API calls in try-catch
    - Throw descriptive errors (e.g., "Invalid credentials", "Network error")
    - Let context layer handle errors

2. **Context Layer Errors**:
    - Catch errors from service calls
    - Update state with error message
    - Provide error via context for UI to display

3. **UI Layer Errors**:
    - Display error messages to users
    - Show field-level validation errors
    - Provide retry mechanisms

4. **Route Guard Errors**:
    - Redirect to login on authentication failure
    - Preserve original route in redirect URL

**Logging Approach:**

- Use console.error for development
- Future: Integrate with error tracking service (Sentry, etc.)

**Retry/Fallback Mechanisms:**

- Manual retry for login (user resubmits form)
- Auto-retry on network errors (optional, implement if needed)
- Fallback to memory-only storage if localStorage unavailable

## Performance Considerations

**Optimization Strategies:**

1. **Context Re-render Optimization**:
    - Use useMemo to memoize context value
    - Use useCallback for context methods
    - Split context if needed (auth state vs. auth methods)

2. **Auth Check Performance**:
    - Cache auth state, don't re-check on every render
    - Use isLoading flag to prevent premature redirects
    - Avoid checking localStorage on every route change

3. **Form Performance**:
    - Use controlled components efficiently
    - Debounce validation if needed (for complex rules)

**Caching Approach:**

- Auth state cached in React state (Context)
- Token cached in localStorage for persistence
- No server-side caching needed for MVP

**Resource Management:**

- Clean up event listeners on unmount (if any)
- Avoid memory leaks in async operations (use abort signals)

## Security Notes

**Authentication/Authorization:**

- JWT token used for authentication
- Token stored in localStorage (XSS vulnerability acknowledged)
- Token sent in Authorization header for API requests (future)
- No role-based access control in MVP (all authenticated users have same access)

**Input Validation:**

- Client-side email and password validation
- Server-side validation assumed (backend responsibility)
- Prevent injection attacks by using parameterized API calls

**Data Encryption:**

- HTTPS required in production (encrypt data in transit)
- No client-side encryption of token (stored as-is in localStorage)
- Backend should use bcrypt/scrypt for password hashing (not frontend concern)

**Secrets Management:**

- No API keys or secrets in frontend code
- Mock credentials hardcoded for development only
- Real credentials handled by backend authentication

**Known Security Limitations (MVP):**

- localStorage vulnerable to XSS attacks (mitigation: strict CSP, code review)
- No CSRF protection (not needed for JWT in Authorization header)
- No rate limiting on client side (backend responsibility)
- No multi-factor authentication
- Token expiration handling is basic (future: refresh tokens)

**Future Security Enhancements:**

- Move token storage to httpOnly cookies
- Implement refresh token mechanism
- Add CSRF protection
- Implement rate limiting
- Add MFA support
- Use security headers (CSP, X-Frame-Options)
