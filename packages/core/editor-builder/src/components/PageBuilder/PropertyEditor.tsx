import type { Widget } from "@page-builder/api-types";

/**
 * PropertyEditor component props
 */
export interface PropertyEditorProps {
    /** Currently selected widget to edit */
    widget: Widget | null;
    /** Callback when widget properties change */
    onPropertyChange: (widgetId: string, updates: Partial<Widget>) => void;
    /** Callback when editor is closed */
    onClose: () => void;
}

/**
 * PropertyEditor - Panel for editing widget properties
 * Opens when a widget is selected on the canvas
 */
export function PropertyEditor({ widget, onPropertyChange: _onPropertyChange, onClose }: PropertyEditorProps) {
    if (!widget) {
        return null;
    }

    // TODO: Implement property editor with dynamic form generation
    return (
        <div className="property-editor fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">Edit Widget</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close property editor"
                >
                    ✕
                </button>
            </div>
            <div className="p-4">
                <div className="text-gray-500">Property Editor - Coming Soon</div>
                <div className="text-sm">Widget: {widget.type}</div>
            </div>
        </div>
    );
}
