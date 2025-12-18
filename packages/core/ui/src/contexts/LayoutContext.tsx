import { createContext } from "react";
import type { LayoutConfig } from "../types";

export type LegacyLayoutAction =
    | { type: "TOGGLE_SIDEBAR" }
    | { type: "SET_SIDEBAR"; payload: boolean }
    | { type: "TOGGLE_USER_MENU" }
    | { type: "SET_USER_MENU"; payload: boolean }
    | { type: "TOGGLE_MENU_ITEM"; payload: string }
    | { type: "SET_ACTIVE_ITEM"; payload: string };

export interface LayoutState {
    sidebarOpen: boolean;
    userMenuOpen: boolean;
    expandedMenuItems: Set<string>;
    activeMenuItem: string | null;
}

export interface LayoutContextType {
    state: LayoutState;
    dispatch: React.Dispatch<LegacyLayoutAction>;
    config: LayoutConfig;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const layoutReducer = (state: LayoutState, action: LegacyLayoutAction): LayoutState => {
    switch (action.type) {
        case "TOGGLE_SIDEBAR":
            return { ...state, sidebarOpen: !state.sidebarOpen };
        case "SET_SIDEBAR":
            return { ...state, sidebarOpen: action.payload };
        case "TOGGLE_USER_MENU":
            return { ...state, userMenuOpen: !state.userMenuOpen };
        case "SET_USER_MENU":
            return { ...state, userMenuOpen: action.payload };
        case "TOGGLE_MENU_ITEM": {
            const newExpanded = new Set(state.expandedMenuItems);
            if (newExpanded.has(action.payload)) {
                newExpanded.delete(action.payload);
            } else {
                newExpanded.add(action.payload);
            }
            return { ...state, expandedMenuItems: newExpanded };
        }
        case "SET_ACTIVE_ITEM":
            return { ...state, activeMenuItem: action.payload };
        default:
            return state;
    }
};
