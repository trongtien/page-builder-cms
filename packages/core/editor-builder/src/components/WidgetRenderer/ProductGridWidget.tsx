import type { ProductGridWidget } from "@page-builder/api-types";
import { applyCommonProps } from "./applyCommonProps";

export interface ProductGridWidgetProps {
    widget: ProductGridWidget;
}

/**
 * ProductGridWidget Renderer
 * Displays a grid of products from various data sources
 */
export function ProductGridWidgetRenderer({ widget }: ProductGridWidgetProps) {
    const style = applyCommonProps(widget.commonProps);
    const { dataSource, categoryId, productIds, limit, columns } = widget.props;

    const gridCols =
        {
            1: "grid-cols-1",
            2: "grid-cols-2",
            3: "grid-cols-3",
            4: "grid-cols-4",
            5: "grid-cols-5",
            6: "grid-cols-6"
        }[columns] || "grid-cols-4";

    return (
        <div className="product-grid-widget" style={style}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-4">📦 Product Grid</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div>
                            <strong>Data Source:</strong> {dataSource}
                        </div>
                        <div>
                            <strong>Limit:</strong> {limit} products
                        </div>
                        <div>
                            <strong>Columns:</strong> {columns}
                        </div>
                        {categoryId && (
                            <div>
                                <strong>Category ID:</strong> {categoryId}
                            </div>
                        )}
                        {productIds && (
                            <div>
                                <strong>Custom Products:</strong> {productIds.length} selected
                            </div>
                        )}
                    </div>
                    <div className={`grid ${gridCols} gap-4 mt-6`}>
                        {Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-gray-100 h-32 rounded flex items-center justify-center text-gray-400"
                            >
                                Product {i + 1}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Products will be loaded from: {dataSource}</p>
                </div>
            </div>
        </div>
    );
}
