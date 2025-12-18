export interface MenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    path?: string;
    children?: MenuItem[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
}

export interface HeaderMenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: "default" | "destructive";
}

export interface ManagerLayoutActions {
    onLogout?: () => void;
    onSidebarChange?: (isOpen: boolean) => void;
    onHeaderMenuClick?: (menuId: string) => void;
    onSearch?: (query: string) => void;
}

export interface LayoutConfig extends ManagerLayoutActions {
    logo?: React.ReactNode;
    title?: string;
    menuItems?: MenuItem[];
    user?: User;
    showSearch?: boolean;
    defaultActive?: boolean;
    activeMenuSidebar?: string;
    headerMenuItems?: HeaderMenuItem[];
}

export interface ManagerLayoutState {
    isSidebarOpen: boolean;
    activeItemId: string | null;
    expandedMenus: Set<string>;
    searchQuery: string;
    userMenuOpen: boolean;
}

export interface ManagerLayoutInstance {
    state: ManagerLayoutState;
    config: LayoutConfig;
    toggleSidebar: () => void;
    setSidebar: (isOpen: boolean) => void;
    setActiveItem: (itemId: string | null) => void;
    toggleMenuItem: (itemId: string) => void;
    setExpandedMenus: (menuIds: Set<string>) => void;
    setSearchQuery: (query: string) => void;
    toggleUserMenu: () => void;
    setUserMenu: (isOpen: boolean) => void;
}

export interface UseManagerLayoutOptions {
    config?: LayoutConfig;
    defaultSidebarOpen?: boolean;
    defaultActiveItem?: string | null;
    onSidebarChange?: (isOpen: boolean) => void;
    onActiveItemChange?: (itemId: string | null) => void;
}

export type LayoutAction =
    | { type: "TOGGLE_SIDEBAR" }
    | { type: "SET_SIDEBAR"; payload: boolean }
    | { type: "SET_ACTIVE_ITEM"; payload: string | null }
    | { type: "TOGGLE_MENU_ITEM"; payload: string }
    | { type: "SET_EXPANDED_MENUS"; payload: Set<string> }
    | { type: "SET_SEARCH_QUERY"; payload: string }
    | { type: "TOGGLE_USER_MENU" }
    | { type: "SET_USER_MENU"; payload: boolean };
