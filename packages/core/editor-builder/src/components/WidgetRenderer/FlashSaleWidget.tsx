import type { FlashSaleWidget } from "@page-builder/api-types";
import { applyCommonProps } from "./applyCommonProps";

export interface FlashSaleWidgetProps {
    widget: FlashSaleWidget;
}

/**
 * FlashSaleWidget Renderer
 * Displays time-limited flash sale promotions with countdown
 */
export function FlashSaleWidgetRenderer({ widget }: FlashSaleWidgetProps) {
    const style = applyCommonProps(widget.commonProps);
    const { campaignId, countdownEndTime, displayStyle, productsPerRow, showCountdown } = widget.props;

    return (
        <div
            className="flash-sale-widget bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white"
            style={style}
        >
            <div className="text-center mb-6">
                <h3 className="text-3xl font-bold mb-2">⚡ Flash Sale!</h3>
                {showCountdown && <div className="text-lg">Ends: {new Date(countdownEndTime).toLocaleString()}</div>}
            </div>

            <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-white/80 text-sm mb-2">Campaign ID: {campaignId}</div>
                <div className="text-white/80 text-sm mb-2">
                    Display: {displayStyle} | {productsPerRow} per row
                </div>
                <div className="text-white/60 text-xs mt-4">Products will be loaded from the campaign</div>
            </div>
        </div>
    );
}
