import type { PageConfig } from "@page-builder/api-types";

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
    pageId,
    onSave: _onSave,
    onCancel: _onCancel,
    readOnly: _readOnly = false
}: PageBuilderProps) {
    // TODO: Implement page builder logic
    return (
        <div className="page-builder">
            <div className="text-gray-500">PageBuilder Component - Coming Soon</div>
            {pageId && <div className="text-sm">Loading page: {pageId}</div>}
        </div>
    );
}
