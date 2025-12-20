import type { QuickLinksWidget } from "@page-builder/api-types";
import { applyCommonProps } from "./applyCommonProps";

export interface QuickLinksWidgetProps {
    widget: QuickLinksWidget;
}

/**
 * QuickLinksWidget Renderer
 * Displays a collection of quick navigation links
 */
export function QuickLinksWidgetRenderer({ widget }: QuickLinksWidgetProps) {
    const style = applyCommonProps(widget.commonProps);
    const { links, layout } = widget.props;

    const layoutClass = layout === "horizontal" ? "flex flex-wrap gap-4" : "grid grid-cols-2 gap-4";

    return (
        <div className="quick-links-widget" style={style}>
            {links.length > 0 ? (
                <div className={layoutClass}>
                    {links.map((link) => (
                        <a
                            key={link.id}
                            href={link.url}
                            className="quick-link flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            {link.icon && <span className="text-xl">{link.icon}</span>}
                            <span className="font-medium">{link.label}</span>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                    Quick Links - No links added yet
                </div>
            )}
        </div>
    );
}
