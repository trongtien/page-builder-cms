import * as React from "react";
import { cn } from "../lib/utils";
import type { MenuItem } from "../types";
import { MenuItemComponent } from "./SidebarMenuItem";

interface SidebarProps {
    isOpen: boolean;
    logo?: React.ReactNode;
    title?: string;
    menuItems?: MenuItem[];
}

const Sidebar = React.memo<SidebarProps>(
    ({ isOpen, logo, title = "Manager", menuItems = [] }) => {
        return (
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
                    "border-r bg-card",
                    isOpen ? "w-64" : "w-16"
                )}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center border-b px-3">
                        {isOpen ? (
                            logo || (
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-primary" />
                                    <span className="text-lg font-semibold">{title}</span>
                                </div>
                            )
                        ) : (
                            <div className="h-8 w-8 rounded-lg bg-primary" />
                        )}
                    </div>

                    <nav className="flex-1 overflow-y-auto">
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <MenuItemComponent key={item.id} item={item} isCollapsed={!isOpen} />
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.isOpen === nextProps.isOpen &&
            prevProps.logo === nextProps.logo &&
            prevProps.title === nextProps.title &&
            prevProps.menuItems === nextProps.menuItems
        );
    }
);
Sidebar.displayName = "Sidebar";

export { Sidebar };
export type { SidebarProps };
