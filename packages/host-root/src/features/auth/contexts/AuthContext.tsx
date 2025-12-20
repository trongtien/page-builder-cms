import { createContext, useState, useEffect, useMemo, type ReactNode } from "react";
import type { AuthState, AuthActions, LoginCredentials } from "../types/auth.types";
import * as authService from "../services/auth.service";

export const AuthStateContext = createContext<AuthState | undefined>(undefined);
export const AuthActionsContext = createContext<AuthActions | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true
    });

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const token = authService.getStoredToken();
        const user = authService.getStoredUser();

        if (token && user) {
            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
        } else {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    // Memoize actions separately from state to prevent re-render cascades
    // Actions don't depend on state, so they remain stable
    const actions = useMemo<AuthActions>(
        () => ({
            login: async (credentials: LoginCredentials) => {
                try {
                    setState((prev) => ({ ...prev, isLoading: true }));
                    const { token, user } = await authService.login(credentials);
                    authService.setStoredAuth(token, user);
                    setState({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (error) {
                    setState((prev) => ({ ...prev, isLoading: false }));
                    throw error;
                }
            },
            logout: () => {
                authService.logout();
                setState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false
                });
            },
            checkAuth: () => {
                const token = authService.getStoredToken();
                const user = authService.getStoredUser();
                setState((prev) => ({
                    ...prev,
                    user: user || null,
                    token: token || null,
                    isAuthenticated: !!(token && user)
                }));
            }
        }),
        []
    );

    return (
        <AuthStateContext.Provider value={state}>
            <AuthActionsContext.Provider value={actions}>{children}</AuthActionsContext.Provider>
        </AuthStateContext.Provider>
    );
}
