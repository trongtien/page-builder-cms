/**
 * useAuthActions hook
 * Access authentication actions only (never re-renders)
 */

import { useContext } from "react";
import { AuthActionsContext } from "../contexts/AuthContext";

export function useAuthActions() {
    const context = useContext(AuthActionsContext);
    if (!context) {
        throw new Error("useAuthActions must be used within AuthProvider");
    }
    return context;
}
