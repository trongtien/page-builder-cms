import * as React from "react";
import { cn } from "../lib/utils";
import type { MenuItem } from "../types";
import { SidebarMenuItem } from "./SidebarMenuItem";
import type { ManagerLayoutInstance } from "../hooks/useManagerLayout";

interface SidebarProps {
    isOpen: boolean;
    logo?: React.ReactNode;
    title?: string;
    menuItems?: ReadonlyArray<MenuItem>;
    children?: React.ReactNode;
    className?: string;
    layout?: ManagerLayoutInstance;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    logo,
    title = "Manager",
    menuItems = [],
    children,
    className,
    layout
}) => {
    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
                "border-r bg-card",
                isOpen ? "w-64" : "w-16",
                className
            )}
        >
            <div className="flex h-full flex-col">
                {/* Logo Section */}
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
                    {children ||
                        (layout && (
                            <ul className="space-y-1 p-2">
                                {menuItems.map((item) => (
                                    <SidebarMenuItem key={item.id} item={item} isCollapsed={!isOpen} layout={layout} />
                                ))}
                            </ul>
                        ))}
                </nav>
            </div>
        </aside>
    );
};

Sidebar.displayName = "Sidebar";

export { Sidebar };
export type { SidebarProps };
