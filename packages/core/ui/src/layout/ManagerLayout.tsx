import * as React from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { LayoutContext, layoutReducer, type LayoutState } from "../contexts";
import type { LayoutConfig } from "../types";
import { Button } from "../common/Button";
import { Sidebar } from "../molecules/Sidebar";
import { UserMenu } from "../molecules/UserMenu";

interface ManagerLayoutProps {
    children: React.ReactNode;
    config?: LayoutConfig;
}

const initialState: LayoutState = {
    sidebarOpen: true,
    userMenuOpen: false,
    expandedMenuItems: new Set(),
    activeMenuItem: null
};

const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children, config = {} }) => {
    const [state, dispatch] = React.useReducer(layoutReducer, initialState);

    const toggleSidebar = React.useCallback(() => {
        dispatch({ type: "TOGGLE_SIDEBAR" });
    }, []);

    const toggleUserMenu = React.useCallback(() => {
        dispatch({ type: "TOGGLE_USER_MENU" });
    }, []);

    const contextValue = React.useMemo(
        () => ({
            state,
            dispatch,
            config
        }),
        [state, config]
    );

    const { logo, title = "Manager", menuItems = [], user, showSearch = true, onLogout } = config;

    const memoizedMenuItems = React.useMemo(() => menuItems, [menuItems]);

    const handleLogout = React.useCallback(() => {
        dispatch({ type: "SET_USER_MENU", payload: false });
        onLogout?.();
    }, [onLogout]);

    return (
        <LayoutContext.Provider value={contextValue}>
            <div className="min-h-screen bg-background">
                <Sidebar isOpen={state.sidebarOpen} logo={logo} title={title} menuItems={memoizedMenuItems} />

                <div className={cn("transition-all", state.sidebarOpen ? "ml-64" : "ml-0")}>
                    {/* Header */}
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-6">
                        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                            {state.sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>

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
                                        onClick={toggleUserMenu}
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

                                    {state.userMenuOpen && (
                                        <UserMenu onLogout={handleLogout} onClose={toggleUserMenu} />
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

export { ManagerLayout };
export type { ManagerLayoutProps };
