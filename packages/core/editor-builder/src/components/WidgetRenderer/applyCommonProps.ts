import type { CommonProps } from "@page-builder/api-types";
import type { CSSProperties } from "react";

/**
 * Convert common props to CSS styles
 */
export function applyCommonProps(commonProps: CommonProps): CSSProperties {
    const style: CSSProperties = {};

    // Apply padding
    if (commonProps.padding) {
        const { top, right, bottom, left } = commonProps.padding;
        if (top !== undefined) style.paddingTop = `${top}px`;
        if (right !== undefined) style.paddingRight = `${right}px`;
        if (bottom !== undefined) style.paddingBottom = `${bottom}px`;
        if (left !== undefined) style.paddingLeft = `${left}px`;
    }

    // Apply margin
    if (commonProps.margin) {
        const { top, right, bottom, left } = commonProps.margin;
        if (top !== undefined) style.marginTop = `${top}px`;
        if (right !== undefined) style.marginRight = `${right}px`;
        if (bottom !== undefined) style.marginBottom = `${bottom}px`;
        if (left !== undefined) style.marginLeft = `${left}px`;
    }

    // Apply background color
    if (commonProps.backgroundColor) {
        style.backgroundColor = commonProps.backgroundColor;
    }

    // Apply visibility
    if (commonProps.hidden) {
        style.display = "none";
    }

    return style;
}
