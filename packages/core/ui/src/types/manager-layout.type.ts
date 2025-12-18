// ============================================================================
// Menu & Navigation Types
// ============================================================================

/**
 * Represents a menu item in the sidebar navigation.
 * Supports hierarchical structure through children property.
 *
 * @example
 * ```ts
 * const menuItem: MenuItem = {
 *   id: 'dashboard',
 *   label: 'Dashboard',
 *   icon: <HomeIcon />,
 *   path: '/dashboard',
 *   children: [...]
 * };
 * ```
 */
export interface MenuItem {
    /** Unique identifier for the menu item */
    readonly id: string;
    /** Display label for the menu item */
    label: string;
    /** Optional icon element to display */
    icon?: React.ReactNode;
    /** Optional navigation path */
    path?: string;
    /** Optional nested menu items */
    children?: ReadonlyArray<MenuItem>;
}

/**
 * Represents a menu item in the header navigation.
 * Used for user menu actions and quick access items.
 */
export interface HeaderMenuItem {
    /** Unique identifier for the header menu item */
    readonly id: string;
    /** Display label for the menu item */
    label: string;
    /** Optional icon element to display */
    icon?: React.ReactNode;
    /** Click handler for the menu item */
    onClick?: () => void;
    /** Visual variant of the menu item */
    variant?: "default" | "destructive";
}

// ============================================================================
// User Types
// ============================================================================

/**
 * Represents a user in the system.
 * Contains essential user information displayed in the layout.
 */
export interface User {
    /** Unique identifier for the user */
    readonly id: string;
    /** User's display name */
    name: string;
    /** User's email address */
    email: string;
    /** Optional URL to user's avatar image */
    avatar?: string;
    /** Optional user role/permission level */
    role?: string;
}

// ============================================================================
// Layout Configuration Types
// ============================================================================

/**
 * Callback actions for layout events.
 * These handlers allow parent components to respond to layout state changes.
 */
export interface ManagerLayoutActions {
    /** Called when user initiates logout */
    onLogout?: () => void;
    /** Called when sidebar open/close state changes */
    onSidebarChange?: (isOpen: boolean) => void;
    /** Called when a header menu item is clicked */
    onHeaderMenuClick?: (menuId: string) => void;
    /** Called when search query changes */
    onSearch?: (query: string) => void;
}

/**
 * Complete configuration object for the Manager Layout.
 * Extends ManagerLayoutActions to include all layout customization options.
 *
 * @example
 * ```ts
 * const config: LayoutConfig = {
 *   title: 'Admin Dashboard',
 *   logo: <Logo />,
 *   menuItems: [...],
 *   user: { id: '1', name: 'John', email: 'john@example.com' },
 *   showSearch: true,
 *   onLogout: () => console.log('Logout'),
 * };
 * ```
 */
export interface LayoutConfig extends ManagerLayoutActions {
    /** Logo element displayed in the sidebar header */
    logo?: React.ReactNode;
    /** Application title displayed in the sidebar */
    title?: string;
    /** Navigation menu items for the sidebar */
    menuItems?: ReadonlyArray<MenuItem>;
    /** Current user information */
    user?: User;
    /** Whether to show the search input in the header */
    showSearch?: boolean;
    /** Initial sidebar open state (defaults to true) */
    defaultActive?: boolean;
    /** ID of the initially active menu item */
    activeMenuSidebar?: string;
    /** Menu items for the header user menu */
    headerMenuItems?: ReadonlyArray<HeaderMenuItem>;
}

// ============================================================================
// Layout State Management Types
// ============================================================================

/**
 * Internal state of the Manager Layout.
 * Managed by the useManagerLayout hook's reducer.
 */
export interface ManagerLayoutState {
    /** Whether the sidebar is currently open */
    isSidebarOpen: boolean;
    /** ID of the currently active menu item */
    activeItemId: string | null;
    /** Set of menu item IDs that are currently expanded */
    readonly expandedMenus: ReadonlySet<string>;
    /** Current search query string */
    searchQuery: string;
    /** Whether the user menu dropdown is currently open */
    userMenuOpen: boolean;
}

/**
 * Discriminated union of all possible layout state actions.
 * Used by the layout reducer to handle state updates.
 */
export type LayoutAction =
    | { readonly type: "TOGGLE_SIDEBAR" }
    | { readonly type: "SET_SIDEBAR"; readonly payload: boolean }
    | { readonly type: "SET_ACTIVE_ITEM"; readonly payload: string | null }
    | { readonly type: "TOGGLE_MENU_ITEM"; readonly payload: string }
    | { readonly type: "SET_EXPANDED_MENUS"; readonly payload: ReadonlySet<string> }
    | { readonly type: "SET_SEARCH_QUERY"; readonly payload: string }
    | { readonly type: "TOGGLE_USER_MENU" }
    | { readonly type: "SET_USER_MENU"; readonly payload: boolean };

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Options for configuring the useManagerLayout hook.
 * Allows customization of initial state and behavior.
 */
export interface UseManagerLayoutOptions {
    /** Layout configuration object */
    config?: LayoutConfig;
    /** Initial sidebar open state (overrides config.defaultActive) */
    defaultSidebarOpen?: boolean;
    /** Initial active menu item ID (overrides config.activeMenuSidebar) */
    defaultActiveItem?: string | null;
    /** Callback when sidebar state changes */
    onSidebarChange?: (isOpen: boolean) => void;
    /** Callback when active menu item changes */
    onActiveItemChange?: (itemId: string | null) => void;
}

/**
 * Return value from the useManagerLayout hook.
 * Provides access to layout state and control methods.
 *
 * @example
 * ```ts
 * const layout = useManagerLayout({ config });
 *
 * // Access state
 * console.log(layout.state.isSidebarOpen);
 *
 * // Control layout
 * layout.toggleSidebar();
 * layout.setActiveItem('dashboard');
 * ```
 */
export interface ManagerLayoutInstance {
    /** Current layout state */
    readonly state: ManagerLayoutState;
    /** Layout configuration */
    readonly config: LayoutConfig;
    /** Toggle sidebar open/closed */
    toggleSidebar: () => void;
    /** Set sidebar to a specific state */
    setSidebar: (isOpen: boolean) => void;
    /** Set the active menu item by ID */
    setActiveItem: (itemId: string | null) => void;
    /** Toggle a menu item's expanded state */
    toggleMenuItem: (itemId: string) => void;
    /** Set which menu items are expanded */
    setExpandedMenus: (menuIds: ReadonlySet<string>) => void;
    /** Update the search query */
    setSearchQuery: (query: string) => void;
    /** Toggle user menu dropdown */
    toggleUserMenu: () => void;
    /** Set user menu to a specific state */
    setUserMenu: (isOpen: boolean) => void;
}
