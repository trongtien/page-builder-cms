/**
 * Authentication service
 * Handles login, logout, and token storage
 */

import type { LoginCredentials, AuthResponse, User } from "../types/auth.types";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../types/auth.types";

// Mock user for testing
const MOCK_USER: User = {
    id: "user-123",
    email: "admin@example.com",
    name: "Admin User",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff"
};

/**
 * Mock login function
 * Simulates API authentication with hardcoded credentials
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate credentials
    if (credentials.email === "admin@example.com" && credentials.password === "password123") {
        const token = generateMockToken(MOCK_USER);
        return {
            token,
            user: MOCK_USER,
            expiresIn: 86400 // 24 hours
        };
    }

    throw new Error("Invalid credentials");
}

/**
 * Logout function
 * Clears authentication data from storage
 */
export function logout(): void {
    clearStoredAuth();
}

/**
 * Generate a mock JWT token
 */
function generateMockToken(user: User): string {
    const payload = {
        sub: user.id,
        email: user.email,
        iat: Date.now(),
        exp: Date.now() + 86400000 // 24 hours
    };
    return `mock.${btoa(JSON.stringify(payload))}.signature`;
}

/**
 * Get stored token from localStorage
 */
export function getStoredToken(): string | null {
    try {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
        console.error("Failed to get token from localStorage:", error);
        return null;
    }
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): User | null {
    try {
        const userJson = localStorage.getItem(AUTH_USER_KEY);
        return userJson ? (JSON.parse(userJson) as User) : null;
    } catch (error) {
        console.error("Failed to get user from localStorage:", error);
        return null;
    }
}

/**
 * Store authentication data in localStorage
 */
export function setStoredAuth(token: string, user: User): void {
    try {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error("Failed to store auth data in localStorage:", error);
    }
}

/**
 * Clear authentication data from localStorage
 */
export function clearStoredAuth(): void {
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
        console.error("Failed to clear auth data from localStorage:", error);
    }
}
