import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { WidgetType } from "@page-builder/api-types";

/**
 * Widget definition for palette
 */
export interface WidgetDefinition {
    type: WidgetType;
    label: string;
    category: "promotional" | "content" | "navigation";
    icon: string;
    description: string;
}

/**
 * WidgetPalette component props
 */
export interface WidgetPaletteProps {
    /** Available widgets to display */
    availableWidgets?: WidgetDefinition[];
    /** Callback when drag starts (optional) */
    onDragStart?: (widgetType: WidgetType) => void;
}

/**
 * Default widget definitions
 */
const DEFAULT_WIDGETS: WidgetDefinition[] = [
    {
        type: "hero_banner",
        label: "Hero Banner",
        category: "promotional",
        icon: "🖼️",
        description: "Large banner with image, text, and CTA button"
    },
    {
        type: "flash_sale",
        label: "Flash Sale",
        category: "promotional",
        icon: "⚡",
        description: "Campaign widget with countdown timer"
    },
    {
        type: "product_grid",
        label: "Product Grid",
        category: "content",
        icon: "📦",
        description: "Display products in a grid layout"
    },
    {
        type: "quick_links",
        label: "Quick Links",
        category: "navigation",
        icon: "🔗",
        description: "Navigation links with icons"
    }
];

/**
 * Category display names
 */
const CATEGORY_LABELS: Record<string, string> = {
    promotional: "🎯 Promotional",
    content: "📄 Content",
    navigation: "🧭 Navigation"
};

/**
 * DraggableWidgetCard - Individual widget card with drag functionality
 */
interface DraggableWidgetCardProps {
    widget: WidgetDefinition;
    onDragStart?: (widgetType: WidgetType) => void;
}

function DraggableWidgetCard({ widget, onDragStart }: DraggableWidgetCardProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette-${widget.type}`,
        data: {
            type: "new-widget",
            widgetType: widget.type
        }
    });

    const handleDragStart = () => {
        onDragStart?.(widget.type);
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`
                relative cursor-grab rounded-lg border-2 border-gray-200 bg-white p-4
                transition-all duration-200
                hover:border-blue-400 hover:shadow-md
                active:cursor-grabbing
                ${isDragging ? "opacity-50" : "opacity-100"}
            `}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onDragStart={handleDragStart}
        >
            <div className="flex items-center gap-3">
                <div className="text-3xl">{widget.icon}</div>
                <div className="flex-1">
                    <div className="font-semibold text-gray-900">{widget.label}</div>
                    <div className="text-xs text-gray-500">{widget.category}</div>
                </div>
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                    {widget.description}
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
}

/**
 * WidgetCategory - Collapsible category section
 */
interface WidgetCategoryProps {
    category: string;
    label: string;
    widgets: WidgetDefinition[];
    onDragStart?: (widgetType: WidgetType) => void;
}

function WidgetCategory({ category: _category, label, widgets, onDragStart }: WidgetCategoryProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (widgets.length === 0) return null;

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mb-3 flex w-full items-center justify-between rounded-md px-2 py-1 text-left font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
                <span>{label}</span>
                <span className="text-sm">{isExpanded ? "▼" : "▶"}</span>
            </button>

            {isExpanded && (
                <div className="space-y-3">
                    {widgets.map((widget) => (
                        <DraggableWidgetCard key={widget.type} widget={widget} onDragStart={onDragStart} />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * WidgetPalette - List of available widgets that can be dragged to canvas
 * Located on the right side of the page builder
 */
export function WidgetPalette({ availableWidgets = DEFAULT_WIDGETS, onDragStart }: WidgetPaletteProps) {
    // Group widgets by category
    const widgetsByCategory = availableWidgets.reduce(
        (acc, widget) => {
            if (!acc[widget.category]) {
                acc[widget.category] = [];
            }
            acc[widget.category].push(widget);
            return acc;
        },
        {} as Record<string, WidgetDefinition[]>
    );

    return (
        <div className="widget-palette h-full w-80 overflow-y-auto border-l bg-gray-50 p-4">
            <h2 className="mb-6 text-xl font-bold text-gray-900">Widget Library</h2>

            {/* Render categories */}
            {Object.entries(widgetsByCategory).map(([category, widgets]) => (
                <WidgetCategory
                    key={category}
                    category={category}
                    label={CATEGORY_LABELS[category] || category}
                    widgets={widgets}
                    onDragStart={onDragStart}
                />
            ))}
        </div>
    );
}
