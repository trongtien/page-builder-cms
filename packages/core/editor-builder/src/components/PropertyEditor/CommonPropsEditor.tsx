import type { CommonProps } from "@page-builder/api-types";
import { ColorField, SpacingField, CheckboxField } from "./fields";

/**
 * CommonPropsEditor component props
 */
export interface CommonPropsEditorProps {
    value: CommonProps;
    onChange: (value: CommonProps) => void;
}

/**
 * CommonPropsEditor - Editor for common widget properties
 * Handles padding, margin, backgroundColor, and hidden
 */
export function CommonPropsEditor({ value, onChange }: CommonPropsEditorProps) {
    return (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-sm font-semibold text-gray-700">Common Properties</h3>

            <SpacingField
                label="Padding (px)"
                value={value.padding}
                onChange={(padding) => onChange({ ...value, padding })}
            />

            <SpacingField
                label="Margin (px)"
                value={value.margin}
                onChange={(margin) => onChange({ ...value, margin })}
            />

            <ColorField
                label="Background Color"
                value={value.backgroundColor}
                onChange={(backgroundColor) => onChange({ ...value, backgroundColor })}
            />

            <CheckboxField
                label="Hidden"
                value={value.hidden || false}
                onChange={(hidden) => onChange({ ...value, hidden })}
                description="Hide this widget from the page"
            />
        </div>
    );
}
