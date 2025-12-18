import { useState } from "react";
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useHover,
    useFocus,
    useDismiss,
    useRole,
    useInteractions,
    safePolygon,
    type Placement
} from "@floating-ui/react";

export interface UseFloatingSubmenuOptions {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    offset?: number;
    openDelay?: number;
    closeDelay?: number;
}

export interface UseFloatingSubmenuReturn {
    refs: {
        setReference: (node: HTMLElement | null) => void;
        setFloating: (node: HTMLElement | null) => void;
    };
    floatingStyles: React.CSSProperties;
    getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
    getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
    isOpen: boolean;
}

export const useFloatingSubmenu = (options: UseFloatingSubmenuOptions = {}): UseFloatingSubmenuReturn => {
    const {
        isOpen: controlledOpen,
        onOpenChange: setControlledOpen,
        placement = "right-start",
        offset: offsetValue = 0,
        openDelay = 50,
        closeDelay = 300
    } = options;

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpen = controlledOpen ?? uncontrolledOpen;
    const setIsOpen = setControlledOpen ?? setUncontrolledOpen;

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement,
        whileElementsMounted: autoUpdate,
        middleware: [offset(offsetValue), flip(), shift({ padding: 0 })]
    });

    const hover = useHover(context, {
        delay: { open: openDelay, close: closeDelay },
        handleClose: safePolygon()
    });

    const focus = useFocus(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "menu" });

    const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

    return {
        refs,
        floatingStyles,
        getReferenceProps,
        getFloatingProps,
        isOpen
    };
};
