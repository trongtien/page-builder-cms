import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Widget } from "@page-builder/api-types";
import { CanvasWidget } from "./CanvasWidget";

/**
 * Canvas component props
 */
export interface CanvasProps {
    /** Array of widgets to render */
    widgets: Widget[];
    /** Currently selected widget ID */
    selectedWidgetId: string | null;
    /** Whether a drag operation is in progress */
    isDragging?: boolean;
    /** Callback when widget is selected */
    onWidgetSelect: (widgetId: string) => void;
    /** Callback when widget is removed */
    onWidgetRemove: (widgetId: string) => void;
}

/**
 * Canvas - The main building area where widgets are dropped and arranged
 * Located on the left side of the page builder
 */
export function Canvas({ widgets, selectedWidgetId, isDragging = false, onWidgetSelect, onWidgetRemove }: CanvasProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: "canvas-droppable",
        data: {
            type: "canvas"
        }
    });

    const widgetIds = widgets.map((w) => w.id);

    return (
        <div
            ref={setNodeRef}
            className={`
                canvas relative min-h-screen overflow-y-auto bg-gray-50 p-6
                transition-colors
                ${isOver ? "bg-blue-50" : "bg-gray-50"}
            `}
        >
            {/* Empty State */}
            {widgets.length === 0 && (
                <div
                    className={`
                        flex min-h-[400px] flex-col items-center justify-center
                        rounded-lg border-2 border-dashed
                        transition-all
                        ${isOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}
                    `}
                >
                    <div className="text-center">
                        <div className="mb-2 text-4xl">📦</div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-700">
                            {isDragging ? "Drop widget here" : "Empty Canvas"}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {isDragging
                                ? "Release to add widget to canvas"
                                : "Drag widgets from the palette to get started"}
                        </p>
                    </div>
                </div>
            )}

            {/* Widget List with Sortable Context */}
            {widgets.length > 0 && (
                <div className="relative">
                    <SortableContext items={widgetIds} strategy={verticalListSortingStrategy}>
                        {widgets.map((widget) => (
                            <CanvasWidget
                                key={widget.id}
                                widget={widget}
                                isSelected={widget.id === selectedWidgetId}
                                isDragging={isDragging}
                                onSelect={onWidgetSelect}
                                onRemove={onWidgetRemove}
                            />
                        ))}
                    </SortableContext>

                    {/* Drop Zone Indicator (when dragging from palette) */}
                    {isDragging && isOver && (
                        <div className="mt-4 rounded-lg border-2 border-dashed border-blue-500 bg-blue-50 p-8 text-center">
                            <div className="text-blue-600">↓ Drop here to add widget ↓</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
