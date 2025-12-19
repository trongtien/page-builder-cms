/**
 * Form Styling Configuration
 * Centralized Tailwind CSS classes for form components
 */

export const formClasses = {
    /**
     * Base checkbox styles
     */
    checkbox: [
        "h-4",
        "w-4",
        "rounded",
        "border-gray-300",
        "text-blue-600",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "dark:border-gray-600",
        "dark:bg-gray-700",
        "dark:focus:ring-offset-gray-800"
    ].join(" "),

    /**
     * Helper text styles
     */
    helperText: ["mt-1", "text-xs", "text-gray-500", "dark:text-gray-400"].join(" "),

    /**
     * Error message styles
     */
    error: ["mt-1", "text-xs", "text-red-600", "dark:text-red-400"].join(" ")
} as const;
