/**
 * Widget definition for palette
 */
export interface WidgetDefinition {
    type: string;
    label: string;
    category: string;
    icon?: string;
    description?: string;
}

/**
 * WidgetPalette component props
 */
export interface WidgetPaletteProps {
    /** Available widgets to display */
    availableWidgets?: WidgetDefinition[];
    /** Callback when drag starts (optional) */
    onDragStart?: (widgetType: string) => void;
}

/**
 * WidgetPalette - List of available widgets that can be dragged to canvas
 * Located on the right side of the page builder
 */
export function WidgetPalette({
    availableWidgets: _availableWidgets = [],
    onDragStart: _onDragStart
}: WidgetPaletteProps) {
    // TODO: Implement widget palette with dnd-kit draggable
    return (
        <div className="widget-palette w-80 border-l bg-white p-4">
            <h2 className="text-lg font-bold mb-4">Widgets</h2>
            <div className="text-gray-500 text-sm">Widget Palette - Coming Soon</div>
        </div>
    );
}
