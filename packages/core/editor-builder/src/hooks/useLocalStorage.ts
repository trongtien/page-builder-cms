import { useEffect, useCallback } from "react";
import type { PageConfig } from "@page-builder/api-types";

const STORAGE_KEY_PREFIX = "page-builder-draft";

/**
 * Get localStorage key for a page
 */
function getStorageKey(pageId: string): string {
    return `${STORAGE_KEY_PREFIX}-${pageId}`;
}

/**
 * Save page draft to localStorage
 */
export function savePageDraft(pageId: string, page: PageConfig): boolean {
    try {
        const key = getStorageKey(pageId);
        const data = JSON.stringify(page);
        localStorage.setItem(key, data);
        localStorage.setItem(`${key}-timestamp`, new Date().toISOString());
        return true;
    } catch (error) {
        // Handle quota exceeded or other localStorage errors
        console.error("Failed to save draft to localStorage:", error);
        return false;
    }
}

/**
 * Load page draft from localStorage
 */
export function loadPageDraft(pageId: string): PageConfig | null {
    try {
        const key = getStorageKey(pageId);
        const data = localStorage.getItem(key);
        if (!data) return null;

        return JSON.parse(data) as PageConfig;
    } catch (error) {
        console.error("Failed to load draft from localStorage:", error);
        return null;
    }
}

/**
 * Clear page draft from localStorage
 */
export function clearPageDraft(pageId: string): void {
    try {
        const key = getStorageKey(pageId);
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}-timestamp`);
    } catch (error) {
        console.error("Failed to clear draft from localStorage:", error);
    }
}

/**
 * Get draft timestamp
 */
export function getDraftTimestamp(pageId: string): string | null {
    try {
        const key = getStorageKey(pageId);
        return localStorage.getItem(`${key}-timestamp`);
    } catch {
        return null;
    }
}

/**
 * Hook for auto-saving page to localStorage with debouncing
 */
export function useAutoSave(
    pageId: string | undefined,
    page: PageConfig | null,
    isDirty: boolean,
    debounceMs: number = 2000
) {
    // Auto-save to localStorage when page changes
    useEffect(() => {
        if (!pageId || !page || !isDirty) return;

        const timeoutId = setTimeout(() => {
            const saved = savePageDraft(pageId, page);
            if (saved) {
                console.info(`Draft auto-saved to localStorage for page: ${pageId}`);
            }
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [pageId, page, isDirty, debounceMs]);

    // Load draft on mount
    const loadDraft = useCallback((id: string): PageConfig | null => {
        return loadPageDraft(id);
    }, []);

    // Clear draft
    const clearDraft = useCallback((id: string) => {
        clearPageDraft(id);
    }, []);

    return { loadDraft, clearDraft, getDraftTimestamp };
}
