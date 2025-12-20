import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Widget } from "@page-builder/api-types";
import { WidgetRenderer } from "../WidgetRenderer";

/**
 * CanvasWidget component props
 */
export interface CanvasWidgetProps {
    /** The widget to render */
    widget: Widget;
    /** Whether this widget is currently selected */
    isSelected: boolean;
    /** Whether drag is currently active */
    isDragging: boolean;
    /** Callback when widget is clicked/selected */
    onSelect: (widgetId: string) => void;
    /** Callback when remove button is clicked */
    onRemove: (widgetId: string) => void;
}

/**
 * Get human-readable widget type label
 */
function getWidgetTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        hero_banner: "Hero Banner",
        flash_sale: "Flash Sale",
        product_grid: "Product Grid",
        quick_links: "Quick Links"
    };
    return labels[type] || type;
}

/**
 * CanvasWidget - Wrapper component for widgets in the canvas
 * Provides drag handle, selection, and remove functionality
 */
export function CanvasWidget({ widget, isSelected, isDragging, onSelect, onRemove }: CanvasWidgetProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: widget.id,
        data: {
            type: "canvas-widget",
            widget
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const handleClick = (e: React.MouseEvent) => {
        // Don't select if clicking the remove button
        if ((e.target as HTMLElement).closest(".remove-button")) {
            return;
        }
        onSelect(widget.id);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(widget.id);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={handleClick}
            className={`
                group relative mb-4 rounded-lg transition-all
                ${isSelected ? "ring-4 ring-blue-500 ring-offset-2" : "ring-1 ring-gray-200"}
                ${isDragging ? "opacity-50" : "opacity-100"}
                hover:ring-2 hover:ring-blue-300
            `}
        >
            {/* Widget Type Label & Controls */}
            <div className="absolute -top-3 left-2 z-10 flex items-center gap-2">
                <div className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white shadow-md">
                    {getWidgetTypeLabel(widget.type)}
                </div>
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab rounded bg-gray-700 px-2 py-1 text-xs text-white shadow-md hover:bg-gray-800 active:cursor-grabbing"
                    title="Drag to reorder"
                >
                    ⋮⋮
                </button>
                <button
                    onClick={handleRemove}
                    className="remove-button rounded bg-red-600 px-2 py-1 text-xs text-white shadow-md hover:bg-red-700"
                    title="Remove widget"
                >
                    ✕
                </button>
            </div>

            {/* Widget Content */}
            <div className="overflow-hidden rounded-lg">
                <WidgetRenderer widget={widget} />
            </div>
        </div>
    );
}
