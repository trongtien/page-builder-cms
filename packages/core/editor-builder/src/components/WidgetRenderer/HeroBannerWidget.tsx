import type { HeroBannerWidget } from "@page-builder/api-types";
import { applyCommonProps } from "./applyCommonProps";

export interface HeroBannerWidgetProps {
    widget: HeroBannerWidget;
}

/**
 * HeroBannerWidget Renderer
 * Displays promotional hero banners with images and CTAs
 */
export function HeroBannerWidgetRenderer({ widget }: HeroBannerWidgetProps) {
    const style = applyCommonProps(widget.commonProps);
    const { imageUrl, imageAlt, title, subtitle, ctaText, ctaLink, textPosition, overlayOpacity } = widget.props;

    return (
        <div className="hero-banner-widget relative overflow-hidden rounded-lg" style={style}>
            {/* Background Image */}
            {imageUrl && <img src={imageUrl} alt={imageAlt || "Hero banner"} className="w-full h-64 object-cover" />}

            {/* Overlay */}
            {overlayOpacity !== undefined && (
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
                />
            )}

            {/* Content */}
            <div
                className={`absolute inset-0 flex flex-col justify-center p-8 ${
                    textPosition === "left"
                        ? "items-start text-left"
                        : textPosition === "right"
                          ? "items-end text-right"
                          : "items-center text-center"
                }`}
            >
                {title && <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>}
                {subtitle && <p className="text-xl text-white mb-6">{subtitle}</p>}
                {ctaText && ctaLink && (
                    <a
                        href={ctaLink}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {ctaText}
                    </a>
                )}
            </div>

            {/* Placeholder if no image */}
            {!imageUrl && (
                <div className="bg-gray-200 h-64 flex items-center justify-center text-gray-500">
                    Hero Banner - No image set
                </div>
            )}
        </div>
    );
}
