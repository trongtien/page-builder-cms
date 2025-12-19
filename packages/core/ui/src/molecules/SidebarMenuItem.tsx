import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { useFloatingTooltip, useFloatingSubmenu } from "../hooks";
import type { MenuItem } from "../types";
import type { ManagerLayoutInstance } from "../hooks/useManagerLayout";

interface SidebarMenuItemProps {
    item: MenuItem;
    depth?: number;
    isCollapsed?: boolean;
    layout: ManagerLayoutInstance;
    onItemClick?: () => void;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
    item,
    depth = 0,
    isCollapsed = false,
    onItemClick,
    layout
}) => {
    const { state, setActiveItem, toggleMenuItem } = layout;
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [showSubmenu, setShowSubmenu] = React.useState(false);

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = state.expandedMenus.has(item.id);
    const isActive = state.activeItemId === item.id;

    // Floating UI hooks
    const tooltip = useFloatingTooltip({
        isOpen: showTooltip,
        onOpenChange: setShowTooltip
    });

    const submenu = useFloatingSubmenu({
        isOpen: showSubmenu,
        onOpenChange: setShowSubmenu
    });

    const handleClick = React.useCallback(() => {
        if (!hasChildren) {
            setActiveItem(item.id);
            onItemClick?.();
            return;
        }

        if (isCollapsed) {
            setShowSubmenu(!showSubmenu);
        } else {
            toggleMenuItem(item.id);
        }
    }, [hasChildren, item.id, isCollapsed, showSubmenu, setActiveItem, toggleMenuItem, onItemClick]);

    if (isCollapsed && depth === 0) {
        return (
            <li className="p-0">
                <button
                    ref={hasChildren ? submenu.refs.setReference : tooltip.refs.setReference}
                    {...(hasChildren ? submenu.getReferenceProps() : tooltip.getReferenceProps())}
                    onClick={handleClick}
                    className={cn(
                        "flex w-full items-center justify-center rounded-lg py-4 text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        (isActive || tooltip.isOpen || submenu.isOpen) && "bg-accent text-accent-foreground font-medium"
                    )}
                >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                </button>

                {!hasChildren && tooltip.isOpen && (
                    <div
                        ref={tooltip.refs.setFloating}
                        style={tooltip.floatingStyles}
                        {...tooltip.getFloatingProps()}
                        className="z-50 whitespace-nowrap rounded-md bg-white px-3 py-2 text-sm shadow-lg border text-foreground"
                    >
                        {item.label}
                    </div>
                )}

                {hasChildren && submenu.isOpen && (
                    <div
                        ref={submenu.refs.setFloating}
                        style={submenu.floatingStyles}
                        {...submenu.getFloatingProps()}
                        className="z-50 w-48 rounded-md bg-white shadow-lg border pointer-events-auto"
                    >
                        <div className="p-2">
                            <div className="font-medium text-sm px-3 py-2 border-b mb-1 text-foreground">
                                {item.label}
                            </div>
                            <ul className="space-y-1">
                                {item.children?.map((child) => (
                                    <SidebarMenuItem
                                        key={child.id}
                                        item={child}
                                        depth={depth + 1}
                                        isCollapsed={false}
                                        onItemClick={() => setShowSubmenu(false)}
                                        layout={layout}
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </li>
        );
    }

    return (
        <li className="p-0">
            <button
                onClick={handleClick}
                className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
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
                        <SidebarMenuItem
                            key={child.id}
                            item={child}
                            depth={depth + 1}
                            isCollapsed={isCollapsed}
                            layout={layout}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

SidebarMenuItem.displayName = "SidebarMenuItem";

export { SidebarMenuItem };
export type { SidebarMenuItemProps };

// Keep old export name for backward compatibility
export { SidebarMenuItem as MenuItemComponent };
export type { SidebarMenuItemProps as MenuItemComponentProps };
