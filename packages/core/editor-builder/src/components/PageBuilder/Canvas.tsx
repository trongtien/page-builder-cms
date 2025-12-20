import type { Widget } from "@page-builder/api-types";

/**
 * Canvas component props
 */
export interface CanvasProps {
    /** Array of widgets to render */
    widgets: Widget[];
    /** Currently selected widget ID */
    selectedWidgetId: string | null;
    /** Callback when widget is selected */
    onWidgetSelect: (widgetId: string) => void;
    /** Callback when widget is removed */
    onWidgetRemove: (widgetId: string) => void;
}

/**
 * Canvas - The main building area where widgets are dropped and arranged
 * Located on the left side of the page builder
 */
export function Canvas({
    widgets,
    selectedWidgetId: _selectedWidgetId,
    onWidgetSelect: _onWidgetSelect,
    onWidgetRemove: _onWidgetRemove
}: CanvasProps) {
    // TODO: Implement canvas with dnd-kit droppable
    return (
        <div className="canvas min-h-full p-4 bg-gray-50">
            <div className="text-gray-500">Canvas Component - Coming Soon</div>
            <div className="text-sm">Widgets: {widgets.length}</div>
        </div>
    );
}
