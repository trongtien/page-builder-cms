/**
 * useAuthUser hook
 * Access current user only (optimized for components that only need user data)
 */

import { useAuthState } from "./useAuthState";

export function useAuthUser() {
    const { user } = useAuthState();
    return user;
}
