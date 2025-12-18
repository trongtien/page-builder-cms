import * as React from "react";
import type { ManagerLayoutState, ManagerLayoutInstance, UseManagerLayoutOptions, LayoutAction } from "../types";

export type { ManagerLayoutState, ManagerLayoutInstance, UseManagerLayoutOptions };

const layoutReducer = (state: ManagerLayoutState, action: LayoutAction): ManagerLayoutState => {
    switch (action.type) {
        case "TOGGLE_SIDEBAR":
            return { ...state, isSidebarOpen: !state.isSidebarOpen };
        case "SET_SIDEBAR":
            return { ...state, isSidebarOpen: action.payload };
        case "SET_ACTIVE_ITEM":
            return { ...state, activeItemId: action.payload };
        case "TOGGLE_MENU_ITEM": {
            const newExpanded = new Set(state.expandedMenus);
            if (newExpanded.has(action.payload)) {
                newExpanded.delete(action.payload);
            } else {
                newExpanded.add(action.payload);
            }
            return { ...state, expandedMenus: newExpanded };
        }
        case "SET_EXPANDED_MENUS":
            return { ...state, expandedMenus: action.payload };
        case "SET_SEARCH_QUERY":
            return { ...state, searchQuery: action.payload };
        case "TOGGLE_USER_MENU":
            return { ...state, userMenuOpen: !state.userMenuOpen };
        case "SET_USER_MENU":
            return { ...state, userMenuOpen: action.payload };
        default:
            return state;
    }
};

export function useManagerLayout(options: UseManagerLayoutOptions = {}): ManagerLayoutInstance {
    const {
        config,
        defaultSidebarOpen = true,
        defaultActiveItem = null,
        onSidebarChange,
        onActiveItemChange
    } = options;

    const [state, dispatch] = React.useReducer(layoutReducer, {
        isSidebarOpen: config?.defaultActive ?? defaultSidebarOpen,
        activeItemId: config?.activeMenuSidebar ?? defaultActiveItem,
        expandedMenus: new Set<string>(),
        searchQuery: "",
        userMenuOpen: false
    });

    // Sync with config changes
    React.useEffect(() => {
        if (config?.activeMenuSidebar !== undefined && config.activeMenuSidebar !== state.activeItemId) {
            dispatch({ type: "SET_ACTIVE_ITEM", payload: config.activeMenuSidebar });
        }
    }, [config?.activeMenuSidebar, state.activeItemId]);

    // Callbacks
    const toggleSidebar = React.useCallback(() => {
        const newState = !state.isSidebarOpen;
        dispatch({ type: "TOGGLE_SIDEBAR" });
        onSidebarChange?.(newState);
        config?.onSidebarChange?.(newState);
    }, [state.isSidebarOpen, onSidebarChange, config]);

    const setSidebar = React.useCallback(
        (isOpen: boolean) => {
            dispatch({ type: "SET_SIDEBAR", payload: isOpen });
            onSidebarChange?.(isOpen);
            config?.onSidebarChange?.(isOpen);
        },
        [onSidebarChange, config]
    );

    const setActiveItem = React.useCallback(
        (itemId: string | null) => {
            dispatch({ type: "SET_ACTIVE_ITEM", payload: itemId });
            onActiveItemChange?.(itemId);
        },
        [onActiveItemChange]
    );

    const toggleMenuItem = React.useCallback((itemId: string) => {
        dispatch({ type: "TOGGLE_MENU_ITEM", payload: itemId });
    }, []);

    const setExpandedMenus = React.useCallback((menuIds: ReadonlySet<string>) => {
        dispatch({ type: "SET_EXPANDED_MENUS", payload: menuIds });
    }, []);

    const setSearchQuery = React.useCallback(
        (query: string) => {
            dispatch({ type: "SET_SEARCH_QUERY", payload: query });
            config?.onSearch?.(query);
        },
        [config]
    );

    const toggleUserMenu = React.useCallback(() => {
        dispatch({ type: "TOGGLE_USER_MENU" });
    }, []);

    const setUserMenu = React.useCallback((isOpen: boolean) => {
        dispatch({ type: "SET_USER_MENU", payload: isOpen });
    }, []);

    return React.useMemo(
        () => ({
            state,
            config: config ?? {},
            toggleSidebar,
            setSidebar,
            setActiveItem,
            toggleMenuItem,
            setExpandedMenus,
            setSearchQuery,
            toggleUserMenu,
            setUserMenu
        }),
        [
            state,
            config,
            toggleSidebar,
            setSidebar,
            setActiveItem,
            toggleMenuItem,
            setExpandedMenus,
            setSearchQuery,
            toggleUserMenu,
            setUserMenu
        ]
    );
}
