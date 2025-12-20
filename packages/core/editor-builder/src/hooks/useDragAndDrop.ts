import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

/**
 * Drag state interface
 */
export interface DragState {
    /** Whether a drag operation is in progress */
    isDragging: boolean;
    /** ID of the widget being dragged (for canvas reordering) */
    draggedWidgetId: string | null;
    /** Type of widget being dragged (for palette) */
    draggedWidgetType: string | null;
}

/**
 * Drag handlers interface
 */
export interface DragHandlers {
    /** Handle drag start event */
    handleDragStart: (event: DragStartEvent) => void;
    /** Handle drag end event */
    handleDragEnd: (event: DragEndEvent) => void;
    /** Handle drag cancel event */
    handleDragCancel: () => void;
}

/**
 * Callbacks for drag operations
 */
export interface DragCallbacks {
    /** Called when a new widget is dropped on canvas */
    onWidgetAdd?: (widgetType: string, position: number) => void;
    /** Called when a widget is reordered in canvas */
    onWidgetReorder?: (widgetId: string, newPosition: number) => void;
}

/**
 * Return type for useDragAndDrop hook
 */
export interface UseDragAndDropReturn extends DragState {
    handlers: DragHandlers;
}

/**
 * useDragAndDrop Hook
 *
 * Manages drag-and-drop state and handlers for dnd-kit integration.
 * Handles both palette-to-canvas drops and canvas reordering.
 *
 * @param callbacks - Callbacks for drag operations
 * @returns Drag state and event handlers
 *
 * @example
 * ```tsx
 * const { isDragging, handlers } = useDragAndDrop({
 *   onWidgetAdd: (type, pos) => console.log('Add widget', type, pos),
 *   onWidgetReorder: (id, pos) => console.log('Reorder', id, pos)
 * });
 *
 * <DndContext
 *   onDragStart={handlers.handleDragStart}
 *   onDragEnd={handlers.handleDragEnd}
 *   onDragCancel={handlers.handleDragCancel}
 * >
 *   {children}
 * </DndContext>
 * ```
 */
export function useDragAndDrop(_callbacks: DragCallbacks = {}): UseDragAndDropReturn {
    // TODO: Implement actual logic in Phase 4

    const dragState: DragState = {
        isDragging: false,
        draggedWidgetId: null,
        draggedWidgetType: null
    };

    const handlers: DragHandlers = {
        handleDragStart: (event: DragStartEvent) => {
            console.log("TODO: handleDragStart", event);
        },
        handleDragEnd: (event: DragEndEvent) => {
            console.log("TODO: handleDragEnd", event);
        },
        handleDragCancel: () => {
            console.log("TODO: handleDragCancel");
        }
    };

    return {
        ...dragState,
        handlers
    };
}
