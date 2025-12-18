import * as React from "react";
import { cn } from "../lib/utils";
import type { MenuItem, User, HeaderMenuItem, LayoutConfig } from "../types";
import { useManagerLayout, type ManagerLayoutInstance } from "../hooks/useManagerLayout";
import { Sidebar } from "../molecules/Sidebar";
import { HeaderMenu } from "../molecules/HeaderMenu";
import { SidebarMenuItem } from "../molecules/SidebarMenuItem";

interface ManagerLayoutContextValue {
    layout: ManagerLayoutInstance;
}

const ManagerLayoutContext = React.createContext<ManagerLayoutContextValue | undefined>(undefined);

const useManagerLayoutContext = () => {
    const context = React.useContext(ManagerLayoutContext);
    if (!context) {
        throw new Error("ManagerLayout components must be used within ManagerLayout.Root");
    }
    return context;
};

interface ManagerLayoutRootProps {
    children: React.ReactNode;
    layout: ManagerLayoutInstance;
    className?: string;
}

const ManagerLayoutRoot: React.FC<ManagerLayoutRootProps> = ({ children, layout, className }) => {
    const contextValue = React.useMemo(() => ({ layout }), [layout]);

    return (
        <ManagerLayoutContext.Provider value={contextValue}>
            <div className={cn("min-h-screen bg-background", className)}>{children}</div>
        </ManagerLayoutContext.Provider>
    );
};

interface ManagerLayoutSidebarProps {
    children?: React.ReactNode;
    logo?: React.ReactNode;
    title?: string;
    menuItems?: ReadonlyArray<MenuItem>;
    className?: string;
}

const ManagerLayoutSidebar: React.FC<ManagerLayoutSidebarProps> = ({
    children,
    logo,
    title = "Manager",
    menuItems = [],
    className
}) => {
    const { layout } = useManagerLayoutContext();
    const { state, config } = layout;

    const finalLogo = logo ?? config.logo;
    const finalTitle = title ?? config.title ?? "Manager";
    const finalMenuItems = menuItems.length > 0 ? menuItems : (config.menuItems ?? []);

    return (
        <Sidebar
            isOpen={state.isSidebarOpen}
            logo={finalLogo}
            title={finalTitle}
            menuItems={finalMenuItems}
            className={className}
            layout={layout}
        >
            {children}
        </Sidebar>
    );
};

interface ManagerLayoutMenuItemProps {
    item: MenuItem;
    depth?: number;
    isCollapsed?: boolean;
    onItemClick?: () => void;
}

const ManagerLayoutMenuItem: React.FC<ManagerLayoutMenuItemProps> = (props) => {
    const { layout } = useManagerLayoutContext();
    return <SidebarMenuItem {...props} layout={layout} />;
};

interface ManagerLayoutHeaderProps {
    children?: React.ReactNode;
    showSearch?: boolean;
    user?: User;
    headerMenuItems?: ReadonlyArray<HeaderMenuItem>;
    onLogout?: () => void;
    className?: string;
}

const ManagerLayoutHeader: React.FC<ManagerLayoutHeaderProps> = ({
    children,
    showSearch,
    user,
    headerMenuItems,
    onLogout,
    className
}) => {
    const { layout } = useManagerLayoutContext();
    const { state, config, toggleSidebar, setSearchQuery, toggleUserMenu, setUserMenu } = layout;

    const finalShowSearch = showSearch ?? config.showSearch ?? false;
    const finalUser = user ?? config.user;
    const finalHeaderMenuItems = headerMenuItems ?? config.headerMenuItems;

    const handleLogout = React.useCallback(() => {
        setUserMenu(false);
        onLogout?.();
        config.onLogout?.();
    }, [onLogout, config, setUserMenu]);

    const handleHeaderMenuClick = React.useCallback(
        (menuId: string) => {
            setUserMenu(false);
            config.onHeaderMenuClick?.(menuId);
        },
        [config, setUserMenu]
    );

    const handleSearch = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
        },
        [setSearchQuery]
    );

    return (
        <HeaderMenu
            sidebarOpen={state.isSidebarOpen}
            userMenuOpen={state.userMenuOpen}
            showSearch={finalShowSearch}
            user={finalUser}
            searchQuery={state.searchQuery}
            onToggleSidebar={toggleSidebar}
            onToggleUserMenu={toggleUserMenu}
            onLogout={handleLogout}
            headerMenuItems={finalHeaderMenuItems}
            onHeaderMenuClick={handleHeaderMenuClick}
            onSearch={handleSearch}
            className={className}
        >
            {children}
        </HeaderMenu>
    );
};

interface ManagerLayoutContentProps {
    children: React.ReactNode;
    className?: string;
}

const ManagerLayoutContent: React.FC<ManagerLayoutContentProps> = ({ children, className }) => {
    const { layout } = useManagerLayoutContext();
    const { state } = layout;

    return (
        <div className={cn("transition-all duration-300", state.isSidebarOpen ? "ml-64" : "ml-16")}>
            <main className={cn("p-6", className)}>{children}</main>
        </div>
    );
};

const ManagerLayout = {
    Root: ManagerLayoutRoot,
    Sidebar: ManagerLayoutSidebar,
    Header: ManagerLayoutHeader,
    Content: ManagerLayoutContent,
    MenuItem: ManagerLayoutMenuItem
} as const;

export { useManagerLayout, ManagerLayout };
export type {
    ManagerLayoutInstance,
    ManagerLayoutRootProps,
    ManagerLayoutSidebarProps,
    ManagerLayoutHeaderProps,
    ManagerLayoutContentProps
};
