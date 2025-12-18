// Global type definitions
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

// Re-export auth types from auth feature
export type { User, LoginCredentials, AuthResponse, AuthState, AuthActions } from "../features/auth";
export { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "../features/auth";
