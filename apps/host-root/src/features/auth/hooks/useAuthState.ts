/**
 * useAuthState hook
 * Access authentication state only (optimized for re-rendering)
 */

import { useContext } from "react";
import { AuthStateContext } from "../contexts/AuthContext";

export function useAuthState() {
    const context = useContext(AuthStateContext);
    if (!context) {
        throw new Error("useAuthState must be used within AuthProvider");
    }
    return context;
}
