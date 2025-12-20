import { useState, useCallback, memo, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragCancelEvent
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { PageConfig, Widget, WidgetType } from "@page-builder/api-types";
import { Canvas } from "./Canvas";
import { WidgetPalette } from "./WidgetPalette";
import { PropertyEditor } from "./PropertyEditor";
import { v4 as uuidv4 } from "uuid";

/**
 * PageBuilder component props
 */
export interface PageBuilderProps {
    /** Optional page ID to load existing page */
    pageId?: string;
    /** Callback when page is saved */
    onSave?: (page: PageConfig) => void;
    /** Callback when user cancels editing */
    onCancel?: () => void;
    /** If true, page is view-only */
    readOnly?: boolean;
}

/**
 * Generate default widget based on type
 */
function createDefaultWidget(type: WidgetType): Widget {
    const baseWidget = {
        id: uuidv4(),
        position: 0, // Will be updated when added to canvas
        commonProps: {
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            backgroundColor: undefined,
            hidden: false
        }
    };

    switch (type) {
        case "hero_banner":
            return {
                ...baseWidget,
                type: "hero_banner" as const,
                props: {
                    imageUrl: "https://via.placeholder.com/1200x400",
                    imageAlt: "Hero banner image",
                    title: "Welcome to Our Store",
                    subtitle: "Discover amazing products",
                    ctaText: "Shop Now",
                    ctaLink: "https://example.com/shop",
                    textPosition: "center" as const,
                    overlayOpacity: 30
                }
            };
        case "flash_sale":
            return {
                ...baseWidget,
                type: "flash_sale" as const,
                props: {
                    campaignId: uuidv4(),
                    countdownEndTime: new Date(Date.now() + 86400000).toISOString(),
                    displayStyle: "grid" as const,
                    productsPerRow: 4,
                    showCountdown: true
                }
            };
        case "product_grid":
            return {
                ...baseWidget,
                type: "product_grid" as const,
                props: {
                    dataSource: "featured" as const,
                    limit: 8,
                    columns: 4
                }
            };
        case "quick_links":
            return {
                ...baseWidget,
                type: "quick_links" as const,
                props: {
                    links: [
                        { id: uuidv4(), label: "Home", url: "/", icon: "🏠" },
                        { id: uuidv4(), label: "Products", url: "/products", icon: "📦" },
                        { id: uuidv4(), label: "About", url: "/about", icon: "ℹ️" }
                    ],
                    layout: "horizontal" as const
                }
            };
    }
}

/**
 * Memoized Canvas component for performance
 */
const MemoizedCanvas = memo(Canvas);

/**
 * Memoized WidgetPalette component for performance
 */
const MemoizedWidgetPalette = memo(WidgetPalette);

/**
 * Memoized PropertyEditor component for performance
 */
const MemoizedPropertyEditor = memo(PropertyEditor);

/**
 * PageBuilder - Root component for visual page builder with drag-and-drop
 *
 * @example
 * ```tsx
 * <PageBuilder
 *   pageId="123"
 *   onSave={(page) => console.log('Saved:', page)}
 * />
 * ```
 */
export function PageBuilder({
    pageId: _pageId,
    onSave: _onSave,
    onCancel: _onCancel,
    readOnly = false
}: PageBuilderProps) {
    // Editor state
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
    const [activeWidgetType, setActiveWidgetType] = useState<WidgetType | null>(null);

    // Configure DnD sensors with optimized settings
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8 // Require 8px movement before drag starts (prevents accidental drags)
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    // Handle drag start
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current as Record<string, unknown> | undefined;

        if (data?.type === "new-widget" && typeof data.widgetType === "string") {
            setActiveWidgetType(data.widgetType as WidgetType);
        } else if (data?.type === "canvas-widget") {
            const widget = data.widget as { type?: string } | undefined;
            if (widget && typeof widget.type === "string") {
                setActiveWidgetType(widget.type as WidgetType);
            }
        }
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveWidgetType(null);
            return;
        }

        const activeData = active.data.current;
        const overData = over.data.current;

        // Case 1: Dropping new widget from palette onto canvas
        if (
            activeData?.type === "new-widget" &&
            overData?.type === "canvas" &&
            typeof activeData.widgetType === "string"
        ) {
            const newWidget = createDefaultWidget(activeData.widgetType as WidgetType);
            setWidgets((prev) => [...prev, newWidget]);
            setSelectedWidgetId(newWidget.id);
        }

        // Case 2: Reordering existing widgets in canvas
        else if (activeData?.type === "canvas-widget" && active.id !== over.id) {
            setWidgets((prev) => {
                const oldIndex = prev.findIndex((w) => w.id === active.id);
                const newIndex = prev.findIndex((w) => w.id === over.id);

                if (oldIndex === -1 || newIndex === -1) {
                    return prev;
                }

                return arrayMove(prev, oldIndex, newIndex);
            });
        }

        setActiveWidgetType(null);
    }, []);

    // Handle drag cancel
    const handleDragCancel = useCallback((_event: DragCancelEvent) => {
        setActiveWidgetType(null);
    }, []);

    // Handle widget selection
    const handleWidgetSelect = useCallback((widgetId: string) => {
        setSelectedWidgetId(widgetId);
    }, []);

    // Handle widget removal
    const handleWidgetRemove = useCallback(
        (widgetId: string) => {
            setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
            if (selectedWidgetId === widgetId) {
                setSelectedWidgetId(null);
            }
        },
        [selectedWidgetId]
    );

    // Handle property changes
    const handlePropertyChange = useCallback((widgetId: string, updates: Partial<Widget>) => {
        setWidgets((prev) =>
            prev.map((w) => {
                if (w.id !== widgetId) return w;

                // Merge updates carefully to maintain type safety
                return {
                    ...w,
                    ...updates,
                    // Ensure props are merged properly
                    props: updates.props ? { ...w.props, ...updates.props } : w.props,
                    // Ensure commonProps are merged properly
                    commonProps: updates.commonProps ? { ...w.commonProps, ...updates.commonProps } : w.commonProps
                } as Widget;
            })
        );
    }, []);

    // Get selected widget
    const selectedWidget = selectedWidgetId ? widgets.find((w) => w.id === selectedWidgetId) || null : null;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input/textarea
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            switch (e.key) {
                case "Delete":
                case "Backspace":
                    // Delete selected widget
                    if (selectedWidgetId) {
                        e.preventDefault();
                        handleWidgetRemove(selectedWidgetId);
                    }
                    break;

                case "Escape":
                    // Clear selection
                    if (selectedWidgetId) {
                        e.preventDefault();
                        setSelectedWidgetId(null);
                    }
                    break;

                case "Tab":
                    // Navigate between widgets
                    if (widgets.length > 0) {
                        e.preventDefault();
                        const currentIndex = selectedWidgetId
                            ? widgets.findIndex((w) => w.id === selectedWidgetId)
                            : -1;

                        if (e.shiftKey) {
                            // Navigate backwards
                            const prevIndex = currentIndex <= 0 ? widgets.length - 1 : currentIndex - 1;
                            setSelectedWidgetId(widgets[prevIndex].id);
                        } else {
                            // Navigate forwards
                            const nextIndex = currentIndex >= widgets.length - 1 ? 0 : currentIndex + 1;
                            setSelectedWidgetId(widgets[nextIndex].id);
                        }
                    }
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedWidgetId, widgets, handleWidgetRemove]);

    if (readOnly) {
        // TODO: Implement read-only preview mode
        return <div className="page-builder-readonly">Read-only mode - Coming Soon</div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="page-builder flex h-screen overflow-hidden bg-white">
                {/* Canvas Area */}
                <div className="flex-1 overflow-hidden">
                    <MemoizedCanvas
                        widgets={widgets}
                        selectedWidgetId={selectedWidgetId}
                        isDragging={activeWidgetType !== null}
                        onWidgetSelect={handleWidgetSelect}
                        onWidgetRemove={handleWidgetRemove}
                    />
                </div>

                {/* Widget Palette */}
                <MemoizedWidgetPalette />

                {/* Property Editor (conditionally shown) */}
                {selectedWidget && (
                    <MemoizedPropertyEditor
                        widget={selectedWidget}
                        onPropertyChange={handlePropertyChange}
                        onClose={() => setSelectedWidgetId(null)}
                    />
                )}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeWidgetType ? (
                    <div className="rounded-lg border-2 border-blue-500 bg-white p-4 shadow-xl">
                        <div className="text-sm font-semibold text-blue-600">
                            {activeWidgetType.replace("_", " ").toUpperCase()}
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
