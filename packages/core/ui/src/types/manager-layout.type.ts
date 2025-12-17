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

export interface LayoutConfig {
    logo?: React.ReactNode;
    title?: string;
    menuItems?: MenuItem[];
    user?: User;
    showSearch?: boolean;
    onLogout?: () => void;
}
