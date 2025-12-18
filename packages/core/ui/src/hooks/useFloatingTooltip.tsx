import { useState } from "react";
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useHover,
    useRole,
    useInteractions,
    type Placement
} from "@floating-ui/react";

export interface UseFloatingTooltipOptions {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    offset?: number;
    openDelay?: number;
    closeDelay?: number;
}

export interface UseFloatingTooltipReturn {
    refs: {
        setReference: (node: HTMLElement | null) => void;
        setFloating: (node: HTMLElement | null) => void;
    };
    floatingStyles: React.CSSProperties;
    getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
    getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
    isOpen: boolean;
}

export const useFloatingTooltip = (options: UseFloatingTooltipOptions = {}): UseFloatingTooltipReturn => {
    const {
        isOpen: controlledOpen,
        onOpenChange: setControlledOpen,
        placement = "right",
        offset: offsetValue = 4,
        openDelay = 100,
        closeDelay = 200
    } = options;

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpen = controlledOpen ?? uncontrolledOpen;
    const setIsOpen = setControlledOpen ?? setUncontrolledOpen;

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement,
        whileElementsMounted: autoUpdate,
        middleware: [offset(offsetValue), flip(), shift({ padding: 8 })]
    });

    const hover = useHover(context, {
        delay: { open: openDelay, close: closeDelay },
        move: false
    });

    const role = useRole(context, { role: "tooltip" });

    const { getReferenceProps, getFloatingProps } = useInteractions([hover, role]);

    return {
        refs,
        floatingStyles,
        getReferenceProps,
        getFloatingProps,
        isOpen
    };
};
