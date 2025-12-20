import type { Widget } from "@page-builder/api-types";
import { HeroBannerWidgetRenderer } from "./HeroBannerWidget";
import { FlashSaleWidgetRenderer } from "./FlashSaleWidget";
import { ProductGridWidgetRenderer } from "./ProductGridWidget";
import { QuickLinksWidgetRenderer } from "./QuickLinksWidget";

export interface WidgetRendererProps {
    widget: Widget;
}

/**
 * WidgetRenderer - Factory component that renders the appropriate widget based on type
 */
export function WidgetRenderer({ widget }: WidgetRendererProps) {
    switch (widget.type) {
        case "hero_banner":
            return <HeroBannerWidgetRenderer widget={widget} />;

        case "flash_sale":
            return <FlashSaleWidgetRenderer widget={widget} />;

        case "product_grid":
            return <ProductGridWidgetRenderer widget={widget} />;

        case "quick_links":
            return <QuickLinksWidgetRenderer widget={widget} />;

        default: {
            // TypeScript exhaustiveness check
            const _exhaustive: never = widget;
            return (
                <div className="unknown-widget bg-red-100 border border-red-400 text-red-700 p-4 rounded">
                    Unknown widget type: {(_exhaustive as Widget).type}
                </div>
            );
        }
    }
}
