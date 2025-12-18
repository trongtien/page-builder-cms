import * as React from "react";
import { Menu, Search, User as UserIcon, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import type { User, HeaderMenuItem } from "../types";

interface HeaderMenuProps {
    sidebarOpen: boolean;
    userMenuOpen: boolean;
    showSearch?: boolean;
    user?: User;
    searchQuery?: string;
    onToggleSidebar: () => void;
    onToggleUserMenu: () => void;
    onLogout?: () => void;
    headerMenuItems?: HeaderMenuItem[];
    onHeaderMenuClick?: (menuId: string) => void;
    onSearch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children?: React.ReactNode;
    className?: string;
}

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
    sidebarOpen,
    userMenuOpen,
    showSearch = false,
    user,
    searchQuery = "",
    onToggleSidebar,
    onToggleUserMenu,
    onLogout,
    headerMenuItems,
    onHeaderMenuClick,
    onSearch,
    children,
    className
}) => {
    const handleLogout = React.useCallback(() => {
        onLogout?.();
    }, [onLogout]);

    const handleMenuItemClick = React.useCallback(
        (menuId: string) => {
            onHeaderMenuClick?.(menuId);
        },
        [onHeaderMenuClick]
    );

    return (
        <header
            className={cn(
                "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6",
                "transition-all duration-300",
                sidebarOpen ? "ml-64" : "ml-16",
                className
            )}
        >
            {children || (
                <>
                    {/* Sidebar Toggle */}
                    <button
                        onClick={onToggleSidebar}
                        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Search Bar */}
                    {showSearch && (
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={onSearch}
                                    className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex-1" />

                    {/* User Menu */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={onToggleUserMenu}
                                className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent"
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <UserIcon className="h-4 w-4" />
                                    </div>
                                )}
                                <span className="text-sm font-medium">{user.name}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {/* User Dropdown */}
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-card shadow-lg">
                                    <div className="p-3 border-b">
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                        {user.role && <p className="text-xs text-muted-foreground mt-1">{user.role}</p>}
                                    </div>
                                    <div className="p-2">
                                        {headerMenuItems?.map((menuItem) => (
                                            <button
                                                key={menuItem.id}
                                                onClick={() => {
                                                    menuItem.onClick?.();
                                                    handleMenuItemClick(menuItem.id);
                                                }}
                                                className={cn(
                                                    "flex w-full items-center gap-2 rounded px-2 py-2 text-sm hover:bg-accent",
                                                    menuItem.variant === "destructive" &&
                                                        "text-destructive hover:bg-destructive/10"
                                                )}
                                            >
                                                {menuItem.icon}
                                                {menuItem.label}
                                            </button>
                                        ))}
                                        {handleLogout && (
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
                                            >
                                                Logout
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </header>
    );
};
