import { useState } from "react";
import type { Widget } from "@page-builder/api-types";
import { CommonPropsEditor } from "../PropertyEditor/CommonPropsEditor";
import { TextField, NumberField, SelectField, CheckboxField } from "../PropertyEditor/fields";

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
 * Get human-readable widget type name
 */
function getWidgetTypeName(type: string): string {
    const names: Record<string, string> = {
        hero_banner: "Hero Banner",
        flash_sale: "Flash Sale",
        product_grid: "Product Grid",
        quick_links: "Quick Links"
    };
    return names[type] || type;
}

/**
 * PropertyEditor - Panel for editing widget properties
 * Opens when a widget is selected on the canvas
 */
export function PropertyEditor({ widget, onPropertyChange, onClose }: PropertyEditorProps) {
    const [activeTab, setActiveTab] = useState<"props" | "common">("props");

    if (!widget) {
        return null;
    }

    const updateProps = (propsUpdates: Record<string, unknown>) => {
        onPropertyChange(widget.id, {
            props: {
                ...(widget.props as Record<string, unknown>),
                ...propsUpdates
            }
        } as Partial<Widget>);
    };

    const updateCommonProps = (commonProps: typeof widget.commonProps) => {
        onPropertyChange(widget.id, { commonProps } as Partial<Widget>);
    };

    return (
        <div className="property-editor fixed right-0 top-0 z-20 h-screen w-96 overflow-y-auto border-l bg-white shadow-xl">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{getWidgetTypeName(widget.type)}</h2>
                        <p className="text-xs text-gray-500">ID: {widget.id.slice(0, 8)}...</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="Close property editor"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="mt-3 flex gap-2 border-b">
                    <button
                        onClick={() => setActiveTab("props")}
                        className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                            activeTab === "props"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Widget Properties
                    </button>
                    <button
                        onClick={() => setActiveTab("common")}
                        className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                            activeTab === "common"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Common Properties
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {activeTab === "props" && (
                    <div>
                        {/* Hero Banner Properties */}
                        {widget.type === "hero_banner" && (
                            <div className="space-y-4">
                                <TextField
                                    label="Image URL"
                                    value={widget.props.imageUrl}
                                    onChange={(imageUrl) => updateProps({ imageUrl })}
                                    required
                                />
                                <TextField
                                    label="Image Alt Text"
                                    value={widget.props.imageAlt}
                                    onChange={(imageAlt) => updateProps({ imageAlt })}
                                    required
                                />
                                <TextField
                                    label="Title"
                                    value={widget.props.title || ""}
                                    onChange={(title) => updateProps({ title })}
                                />
                                <TextField
                                    label="Subtitle"
                                    value={widget.props.subtitle || ""}
                                    onChange={(subtitle) => updateProps({ subtitle })}
                                />
                                <TextField
                                    label="CTA Text"
                                    value={widget.props.ctaText || ""}
                                    onChange={(ctaText) => updateProps({ ctaText })}
                                />
                                <TextField
                                    label="CTA Link"
                                    value={widget.props.ctaLink || ""}
                                    onChange={(ctaLink) => updateProps({ ctaLink })}
                                />
                                <SelectField
                                    label="Text Position"
                                    value={widget.props.textPosition}
                                    onChange={(textPosition) => updateProps({ textPosition })}
                                    options={[
                                        { value: "left", label: "Left" },
                                        { value: "center", label: "Center" },
                                        { value: "right", label: "Right" }
                                    ]}
                                />
                                <NumberField
                                    label="Overlay Opacity"
                                    value={widget.props.overlayOpacity}
                                    onChange={(overlayOpacity) => updateProps({ overlayOpacity })}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        )}

                        {/* Flash Sale Properties */}
                        {widget.type === "flash_sale" && (
                            <div className="space-y-4">
                                <TextField
                                    label="Campaign ID"
                                    value={widget.props.campaignId}
                                    onChange={(campaignId) => updateProps({ campaignId })}
                                    required
                                />
                                <TextField
                                    label="Countdown End Time"
                                    value={widget.props.countdownEndTime}
                                    onChange={(countdownEndTime) => updateProps({ countdownEndTime })}
                                    required
                                />
                                <SelectField
                                    label="Display Style"
                                    value={widget.props.displayStyle}
                                    onChange={(displayStyle) => updateProps({ displayStyle })}
                                    options={[
                                        { value: "grid", label: "Grid" },
                                        { value: "carousel", label: "Carousel" }
                                    ]}
                                />
                                <NumberField
                                    label="Products Per Row"
                                    value={widget.props.productsPerRow}
                                    onChange={(productsPerRow) => updateProps({ productsPerRow })}
                                    min={2}
                                    max={6}
                                />
                                <CheckboxField
                                    label="Show Countdown"
                                    value={widget.props.showCountdown}
                                    onChange={(showCountdown) => updateProps({ showCountdown })}
                                />
                            </div>
                        )}

                        {/* Product Grid Properties */}
                        {widget.type === "product_grid" && (
                            <div className="space-y-4">
                                <SelectField
                                    label="Data Source"
                                    value={widget.props.dataSource}
                                    onChange={(dataSource) => updateProps({ dataSource })}
                                    options={[
                                        { value: "featured", label: "Featured Products" },
                                        { value: "best_sellers", label: "Best Sellers" },
                                        { value: "category", label: "Category" },
                                        { value: "custom", label: "Custom" }
                                    ]}
                                />
                                {widget.props.dataSource === "category" && (
                                    <TextField
                                        label="Category ID"
                                        value={widget.props.categoryId || ""}
                                        onChange={(categoryId) => updateProps({ categoryId })}
                                    />
                                )}
                                {widget.props.dataSource === "custom" && (
                                    <TextField
                                        label="Product IDs (comma separated)"
                                        value={widget.props.productIds?.join(", ") || ""}
                                        onChange={(value) =>
                                            updateProps({
                                                productIds: value.split(",").map((id) => id.trim())
                                            })
                                        }
                                    />
                                )}
                                <NumberField
                                    label="Limit"
                                    value={widget.props.limit}
                                    onChange={(limit) => updateProps({ limit })}
                                    min={1}
                                    max={50}
                                />
                                <NumberField
                                    label="Columns"
                                    value={widget.props.columns}
                                    onChange={(columns) => updateProps({ columns })}
                                    min={1}
                                    max={6}
                                />
                            </div>
                        )}

                        {/* Quick Links Properties */}
                        {widget.type === "quick_links" && (
                            <div className="space-y-4">
                                <SelectField
                                    label="Layout"
                                    value={widget.props.layout}
                                    onChange={(layout) => updateProps({ layout })}
                                    options={[
                                        { value: "horizontal", label: "Horizontal" },
                                        { value: "grid", label: "Grid" }
                                    ]}
                                />
                                <div className="rounded-lg border border-gray-200 p-3">
                                    <p className="mb-2 text-sm font-medium text-gray-700">
                                        Links: {widget.props.links.length}
                                    </p>
                                    <p className="text-xs text-gray-500">Link editing coming in next phase</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "common" && (
                    <CommonPropsEditor value={widget.commonProps} onChange={updateCommonProps} />
                )}
            </div>
        </div>
    );
}
