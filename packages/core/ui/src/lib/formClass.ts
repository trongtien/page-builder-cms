/**
 * Form Styling Configuration
 * Centralized Tailwind CSS classes for form components
 */

export const formClasses = {
    /**
     * Label styles
     */
    label: ["block", "text-sm", "font-medium", "text-gray-900", "dark:text-gray-200", "mb-1"].join(" "),

    /**
     * Base input styles
     */
    input: [
        "w-full",
        "rounded-md",
        "border",
        "border-gray-300",
        "bg-white",
        "px-3",
        "py-2",
        "text-sm",
        "text-gray-900",
        "placeholder:text-gray-400",
        "focus:border-blue-500",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-60",
        "dark:border-gray-600",
        "dark:bg-gray-800",
        "dark:text-gray-100",
        "dark:placeholder:text-gray-500",
        "dark:focus:ring-offset-gray-900"
    ].join(" "),

    /**
     * Base select styles
     */
    select: [
        "w-full",
        "rounded-md",
        "border",
        "border-gray-300",
        "bg-white",
        "px-3",
        "py-2",
        "text-sm",
        "text-gray-900",
        "focus:border-blue-500",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-60",
        "dark:border-gray-600",
        "dark:bg-gray-800",
        "dark:text-gray-100",
        "dark:focus:ring-offset-gray-900"
    ].join(" "),

    /**
     * Base radio styles
     */
    radio: [
        "h-4",
        "w-4",
        "border-gray-300",
        "text-blue-600",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-60",
        "dark:border-gray-600",
        "dark:bg-gray-700",
        "dark:focus:ring-offset-gray-800"
    ].join(" "),

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
     * Base textarea styles
     */
    textarea: [
        "w-full",
        "rounded-md",
        "border",
        "border-gray-300",
        "bg-white",
        "px-3",
        "py-2",
        "text-sm",
        "text-gray-900",
        "placeholder:text-gray-400",
        "focus:border-blue-500",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-60",
        "dark:border-gray-600",
        "dark:bg-gray-800",
        "dark:text-gray-100",
        "dark:placeholder:text-gray-500",
        "dark:focus:ring-offset-gray-900"
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
