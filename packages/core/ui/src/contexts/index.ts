import { createContext, useContext } from "react";
import type { LayoutConfig } from "../types";

export interface LayoutContextType {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    config: LayoutConfig;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);
