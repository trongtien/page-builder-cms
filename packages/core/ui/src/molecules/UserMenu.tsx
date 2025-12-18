import * as React from "react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Card } from "../common/Card";
import type { HeaderMenuItem } from "../types";

interface UserMenuProps {
    onLogout: () => void;
    onClose: () => void;
    customMenuItems?: HeaderMenuItem[];
    onMenuItemClick?: (menuId: string) => void;
}

const UserMenu = React.memo<UserMenuProps>(({ onLogout, onClose, customMenuItems, onMenuItemClick }) => {
    const handleProfileClick = React.useCallback(() => {
        onClose();
    }, [onClose]);

    const handleSettingsClick = React.useCallback(() => {
        onClose();
    }, [onClose]);

    const handleCustomMenuClick = React.useCallback(
        (menuId: string, onClick?: () => void) => {
            onClose();
            onClick?.();
            onMenuItemClick?.(menuId);
        },
        [onClose, onMenuItemClick]
    );

    return (
        <Card className="absolute right-0 top-full mt-2 w-48 shadow-lg">
            <div className="p-2">
                {customMenuItems && customMenuItems.length > 0 ? (
                    // Render custom menu items
                    <>
                        {customMenuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleCustomMenuClick(item.id, item.onClick)}
                                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent ${
                                    item.variant === "destructive" ? "text-destructive" : ""
                                }`}
                            >
                                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                                {item.label}
                            </button>
                        ))}
                    </>
                ) : (
                    // Render default menu items
                    <>
                        <button
                            onClick={handleProfileClick}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                        >
                            <UserIcon className="h-4 w-4" />
                            Profile
                        </button>
                        <button
                            onClick={handleSettingsClick}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                        >
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
                    </>
                )}
            </div>
        </Card>
    );
});
UserMenu.displayName = "UserMenu";

export { UserMenu };
export type { UserMenuProps };
