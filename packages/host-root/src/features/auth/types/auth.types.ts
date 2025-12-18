/**
 * Authentication type definitions
 */

import type { User } from "../../users/types/user.types";

// Re-export User type from users feature for convenience
export type { User };

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    expiresIn?: number; // Token expiration time in seconds
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

// Storage keys
export const AUTH_TOKEN_KEY = "auth_token";
export const AUTH_USER_KEY = "auth_user";
