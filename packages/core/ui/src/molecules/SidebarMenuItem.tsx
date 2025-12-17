import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { LayoutContext } from "../contexts";
import type { MenuItem } from "../types";

interface MenuItemComponentProps {
    item: MenuItem;
    depth?: number;
}

const MenuItemComponent = React.memo<MenuItemComponentProps>(({ item, depth = 0 }) => {
    const { state, dispatch } = React.useContext(LayoutContext)!;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = state.expandedMenuItems.has(item.id);
    const isActive = state.activeMenuItem === item.id;

    const handleClick = React.useCallback(() => {
        if (hasChildren) {
            dispatch({ type: "TOGGLE_MENU_ITEM", payload: item.id });
        } else {
            dispatch({ type: "SET_ACTIVE_ITEM", payload: item.id });
        }
    }, [hasChildren, item.id, dispatch]);

    return (
        <li>
            <button
                onClick={handleClick}
                className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground font-medium",
                    depth > 0 && "ml-4"
                )}
            >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                )}
            </button>
            {hasChildren && isExpanded && (
                <ul className="mt-1 space-y-1">
                    {item.children?.map((child) => (
                        <MenuItemComponent key={child.id} item={child} depth={depth + 1} />
                    ))}
                </ul>
            )}
        </li>
    );
});
MenuItemComponent.displayName = "MenuItemComponent";

export { MenuItemComponent };
export type { MenuItemComponentProps };
