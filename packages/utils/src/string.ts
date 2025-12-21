export const truncate = (text: string, length: number, suffix = "..."): string => {
    if (text.length <= length) return text;
    return text.slice(0, length - suffix.length) + suffix;
};

export const capitalize = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const toCamelCase = (text: string): string => {
    return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => (index === 0 ? letter.toLowerCase() : letter.toUpperCase()))
        .replace(/\s+/g, "");
};

export const toKebabCase = (text: string): string => {
    return text
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/\s+/g, "-")
        .toLowerCase();
};

export const toSnakeCase = (text: string): string => {
    return text
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/\s+/g, "_")
        .toLowerCase();
};

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
