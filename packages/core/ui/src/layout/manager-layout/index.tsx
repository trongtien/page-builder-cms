import * as React from "react";
import { Menu, X, ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { LayoutContext } from "../../contexts";
import type { LayoutConfig, MenuItem } from "../../types";
import { Button } from "../../common/Button";
import { Card } from "../../common/Card";

interface ManagerLayoutProps {
    children: React.ReactNode;
    config?: LayoutConfig;
}

const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children, config = {} }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [userMenuOpen, setUserMenuOpen] = React.useState(false);

    const toggleSidebar = React.useCallback(() => setSidebarOpen(!sidebarOpen), [sidebarOpen]);

    const contextValue = React.useMemo(
        () => ({
            sidebarOpen,
            toggleSidebar,
            config
        }),
        [sidebarOpen, toggleSidebar, config]
    );

    const { logo, title = "Manager", menuItems = [], user, showSearch = true, onLogout } = config;

    return (
        <LayoutContext.Provider value={contextValue}>
            <div className="min-h-screen bg-background">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed left-0 top-0 z-40 h-screen transition-transform",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full",
                        "w-64 border-r bg-card"
                    )}
                >
                    <div className="flex h-full flex-col">
                        {/* Logo/Brand */}
                        <div className="flex h-16 items-center border-b px-6">
                            {logo || (
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-primary" />
                                    <span className="text-lg font-semibold">{title}</span>
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto p-4">
                            <ul className="space-y-2">
                                {menuItems.map((item) => (
                                    <MenuItemComponent key={item.id} item={item} />
                                ))}
                            </ul>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className={cn("transition-all", sidebarOpen ? "ml-64" : "ml-0")}>
                    {/* Header */}
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-6">
                        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>

                        {/* Search */}
                        {showSearch && (
                            <div className="flex-1 max-w-md">
                                <input
                                    type="search"
                                    placeholder="Search..."
                                    className="w-full rounded-md border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        )}

                        <div className="ml-auto flex items-center gap-4">
                            {/* User Menu */}
                            {user && (
                                <div className="relative">
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    >
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="hidden md:inline">{user.name}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>

                                    {userMenuOpen && (
                                        <Card className="absolute right-0 top-full mt-2 w-48 shadow-lg">
                                            <div className="p-2">
                                                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                                                    <UserIcon className="h-4 w-4" />
                                                    Profile
                                                </button>
                                                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                                                    <Settings className="h-4 w-4" />
                                                    Settings
                                                </button>
                                                <hr className="my-2" />
                                                <button
                                                    onClick={onLogout}
                                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </LayoutContext.Provider>
    );
};

const MenuItemComponent: React.FC<{ item: MenuItem; depth?: number }> = ({ item, depth = 0 }) => {
    const [expanded, setExpanded] = React.useState(false);
    const hasChildren = item.children && item.children.length > 0;

    return (
        <li>
            <button
                onClick={() => hasChildren && setExpanded(!expanded)}
                className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    depth > 0 && "ml-4"
                )}
            >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
                {hasChildren && (
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                )}
            </button>
            {hasChildren && expanded && (
                <ul className="mt-1 space-y-1">
                    {item.children?.map((child) => (
                        <MenuItemComponent key={child.id} item={child} depth={depth + 1} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export { ManagerLayout };
export type { ManagerLayoutProps };
