import { LayoutContext } from "@/contexts";
import { use } from "react";

export const useLayoutContext = () => {
    const context = use(LayoutContext);
    if (!context) {
        throw new Error("useLayoutContext must be used within LayoutProvider");
    }
    return context;
};
