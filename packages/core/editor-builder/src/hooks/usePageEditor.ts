import { useCallback, useReducer } from "react";
import { ZodError } from "zod";
import type { PageConfig, Widget } from "@page-builder/api-types";
import { widgetSchema, pageConfigSchema } from "@page-builder/api-types";

/**
 * Validation error type
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Editor state interface
 */
export interface EditorState {
    /** Current page being edited */
    page: PageConfig | null;
    /** Currently selected widget ID */
    selectedWidgetId: string | null;
    /** Whether the page has unsaved changes */
    isDirty: boolean;
    /** Whether a save operation is in progress */
    isSaving: boolean;
    /** Whether the page is loading */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Validation errors for widgets */
    validationErrors: Map<string, ValidationError[]>;
}

/**
 * Editor action types
 */
type EditorAction =
    | { type: "SET_PAGE"; payload: PageConfig }
    | { type: "ADD_WIDGET"; payload: { widget: Widget; position?: number } }
    | { type: "REMOVE_WIDGET"; payload: { widgetId: string } }
    | { type: "REORDER_WIDGET"; payload: { widgetId: string; newPosition: number } }
    | { type: "UPDATE_WIDGET"; payload: { widgetId: string; updates: Partial<Widget> } }
    | { type: "SELECT_WIDGET"; payload: { widgetId: string | null } }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_SAVING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_VALIDATION_ERRORS"; payload: { widgetId: string; errors: ValidationError[] } }
    | { type: "CLEAR_VALIDATION_ERRORS"; payload: string }
    | { type: "CLEAR_DIRTY" };

/**
 * Validate a widget against its schema
 */
function validateWidget(widget: Widget): ValidationError[] {
    try {
        widgetSchema.parse(widget);
        return [];
    } catch (error) {
        if (error instanceof ZodError) {
            return error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message
            }));
        }
        return [{ field: "unknown", message: "Validation failed" }];
    }
}

/**
 * Validate entire page config
 */
function validatePage(page: PageConfig): boolean {
    try {
        pageConfigSchema.parse(page);
        return true;
    } catch {
        return false;
    }
}

/**
 * Recalculate widget positions to ensure no gaps
 */
function recalculatePositions(widgets: Widget[]): Widget[] {
    return widgets.map((widget, index) => ({
        ...widget,
        position: index
    }));
}

/**
 * Editor state reducer
 */
function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case "SET_PAGE":
            return {
                ...state,
                page: action.payload,
                isDirty: false,
                error: null
            };

        case "ADD_WIDGET": {
            if (!state.page) return state;

            const { widget, position } = action.payload;

            // Validate widget before adding
            const validationErrors = validateWidget(widget);
            if (validationErrors.length > 0) {
                const newValidationErrors = new Map(state.validationErrors);
                newValidationErrors.set(widget.id, validationErrors);
                return {
                    ...state,
                    error: "Widget validation failed",
                    validationErrors: newValidationErrors
                };
            }

            const newWidgets = [...state.page.widgets];

            if (position !== undefined && position >= 0 && position <= newWidgets.length) {
                newWidgets.splice(position, 0, widget);
            } else {
                newWidgets.push(widget);
            }

            // Clear validation errors for this widget
            const newValidationErrors = new Map(state.validationErrors);
            newValidationErrors.delete(widget.id);

            return {
                ...state,
                page: {
                    ...state.page,
                    widgets: recalculatePositions(newWidgets)
                },
                isDirty: true,
                validationErrors: newValidationErrors
            };
        }

        case "REMOVE_WIDGET": {
            if (!state.page) return state;

            const newWidgets = state.page.widgets.filter((w) => w.id !== action.payload.widgetId);

            return {
                ...state,
                page: {
                    ...state.page,
                    widgets: recalculatePositions(newWidgets)
                },
                selectedWidgetId: state.selectedWidgetId === action.payload.widgetId ? null : state.selectedWidgetId,
                isDirty: true
            };
        }

        case "REORDER_WIDGET": {
            if (!state.page) return state;

            const { widgetId, newPosition } = action.payload;
            const widgets = [...state.page.widgets];
            const oldIndex = widgets.findIndex((w) => w.id === widgetId);

            if (oldIndex === -1 || newPosition < 0 || newPosition >= widgets.length) {
                return state;
            }

            const [movedWidget] = widgets.splice(oldIndex, 1);
            widgets.splice(newPosition, 0, movedWidget);

            return {
                ...state,
                page: {
                    ...state.page,
                    widgets: recalculatePositions(widgets)
                },
                isDirty: true
            };
        }

        case "UPDATE_WIDGET": {
            if (!state.page) return state;

            const { widgetId, updates } = action.payload;
            const newValidationErrors = new Map(state.validationErrors);

            const widgets = state.page.widgets.map((w) => {
                if (w.id !== widgetId) return w;

                // Type-safe merge: ensure the widget type remains consistent
                const updatedWidget = {
                    ...w,
                    ...updates,
                    // Preserve the widget type to maintain discriminated union
                    type: w.type,
                    // Deep merge props if provided
                    props: updates.props ? { ...w.props, ...updates.props } : w.props,
                    // Deep merge commonProps if provided
                    commonProps: updates.commonProps ? { ...w.commonProps, ...updates.commonProps } : w.commonProps
                } as Widget;

                // Validate updated widget
                const validationErrors = validateWidget(updatedWidget);
                if (validationErrors.length > 0) {
                    newValidationErrors.set(widgetId, validationErrors);
                } else {
                    newValidationErrors.delete(widgetId);
                }

                return updatedWidget;
            });

            return {
                ...state,
                page: {
                    ...state.page,
                    widgets
                },
                isDirty: true,
                validationErrors: newValidationErrors
            };
        }

        case "SELECT_WIDGET":
            return {
                ...state,
                selectedWidgetId: action.payload.widgetId
            };

        case "SET_LOADING":
            return {
                ...state,
                isLoading: action.payload
            };

        case "SET_SAVING":
            return {
                ...state,
                isSaving: action.payload
            };

        case "SET_ERROR":
            return {
                ...state,
                error: action.payload
            };

        case "SET_VALIDATION_ERRORS": {
            const newValidationErrors = new Map(state.validationErrors);
            newValidationErrors.set(action.payload.widgetId, action.payload.errors);
            return {
                ...state,
                validationErrors: newValidationErrors
            };
        }

        case "CLEAR_VALIDATION_ERRORS": {
            const newValidationErrors = new Map(state.validationErrors);
            newValidationErrors.delete(action.payload);
            return {
                ...state,
                validationErrors: newValidationErrors
            };
        }

        case "CLEAR_DIRTY":
            return {
                ...state,
                isDirty: false
            };

        default:
            return state;
    }
}

/**
 * Editor actions interface
 */
export interface EditorActions {
    /** Add a new widget to the page */
    addWidget: (widget: Widget, position?: number) => void;
    /** Remove a widget from the page */
    removeWidget: (widgetId: string) => void;
    /** Reorder a widget to a new position */
    reorderWidget: (widgetId: string, newPosition: number) => void;
    /** Update widget properties */
    updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
    /** Select a widget for editing */
    selectWidget: (widgetId: string | null) => void;
    /** Save the current page */
    savePage: () => Promise<void>;
    /** Load a page by ID */
    loadPage: (pageId: string) => Promise<void>;
}

/**
 * Return type for usePageEditor hook
 */
export interface UsePageEditorReturn extends EditorState {
    actions: EditorActions;
}

/**
 * usePageEditor Hook
 *
 * Manages the state and actions for the page editor.
 * Handles widget CRUD operations, selection, and persistence.
 *
 * @param initialPage - Optional initial page config
 * @returns Editor state and action methods
 *
 * @example
 * ```tsx
 * const { page, selectedWidgetId, isDirty, actions } = usePageEditor(initialPage);
 *
 * // Add a widget
 * actions.addWidget(newWidget);
 *
 * // Select and update a widget
 * actions.selectWidget('widget-id');
 * actions.updateWidget('widget-id', { ...updates });
 * ```
 */
export function usePageEditor(initialPage?: PageConfig): UsePageEditorReturn {
    const [state, dispatch] = useReducer(editorReducer, {
        page: initialPage || null,
        selectedWidgetId: null,
        isDirty: false,
        isSaving: false,
        isLoading: false,
        error: null,
        validationErrors: new Map()
    });

    const actions: EditorActions = {
        addWidget: useCallback((widget: Widget, position?: number) => {
            dispatch({ type: "ADD_WIDGET", payload: { widget, position } });
        }, []),

        removeWidget: useCallback((widgetId: string) => {
            dispatch({ type: "REMOVE_WIDGET", payload: { widgetId } });
        }, []),

        reorderWidget: useCallback((widgetId: string, newPosition: number) => {
            dispatch({ type: "REORDER_WIDGET", payload: { widgetId, newPosition } });
        }, []),

        updateWidget: useCallback((widgetId: string, updates: Partial<Widget>) => {
            dispatch({ type: "UPDATE_WIDGET", payload: { widgetId, updates } });
        }, []),

        selectWidget: useCallback((widgetId: string | null) => {
            dispatch({ type: "SELECT_WIDGET", payload: { widgetId } });
        }, []),

        savePage: useCallback(async () => {
            if (!state.page) {
                dispatch({ type: "SET_ERROR", payload: "No page to save" });
                return;
            }

            // Validate entire page before saving
            if (!validatePage(state.page)) {
                dispatch({ type: "SET_ERROR", payload: "Page validation failed. Please fix errors before saving." });
                return;
            }

            // Check if any widgets have validation errors
            if (state.validationErrors.size > 0) {
                dispatch({
                    type: "SET_ERROR",
                    payload: `Cannot save: ${state.validationErrors.size} widget(s) have validation errors`
                });
                return;
            }

            try {
                dispatch({ type: "SET_SAVING", payload: true });
                dispatch({ type: "SET_ERROR", payload: null });

                // TODO: Implement API call in Phase 8
                // await savePageAPI(state.page);

                // Placeholder to simulate async operation
                await Promise.resolve();

                dispatch({ type: "CLEAR_DIRTY" });
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to save page";
                dispatch({ type: "SET_ERROR", payload: message });
            } finally {
                dispatch({ type: "SET_SAVING", payload: false });
            }
        }, [state.page]),

        loadPage: useCallback(async (pageId: string) => {
            try {
                dispatch({ type: "SET_LOADING", payload: true });
                dispatch({ type: "SET_ERROR", payload: null });

                // TODO: Implement API call in Phase 8
                // const page = await fetchPageAPI(pageId);
                // dispatch({ type: "SET_PAGE", payload: page });

                // Placeholder to simulate async operation
                await Promise.resolve();
                void pageId;
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to load page";
                dispatch({ type: "SET_ERROR", payload: message });
            } finally {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        }, [])
    };

    return {
        ...state,
        actions
    };
}
