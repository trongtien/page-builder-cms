/**
 * Auth Feature Module
 * Central export point for authentication functionality
 */

// Types
export type { User, LoginCredentials, AuthResponse, AuthState, AuthActions } from "./types/auth.types";
export { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "./types/auth.types";

// Services
export * as authService from "./services/auth.service";

// Context & Provider
export { AuthProvider, AuthStateContext, AuthActionsContext } from "./contexts/AuthContext";

// Hooks
export { useAuth } from "./hooks/useAuth";
export { useAuthState } from "./hooks/useAuthState";
export { useAuthActions } from "./hooks/useAuthActions";
export { useAuthUser } from "./hooks/useAuthUser";

// Components
export { LoginForm } from "./components/LoginForm";
