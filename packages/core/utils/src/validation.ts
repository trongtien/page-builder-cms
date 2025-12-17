export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const isEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
};

export const isString = (value: unknown): value is string => {
    return typeof value === "string";
};

export const isNumber = (value: unknown): value is number => {
    return typeof value === "number" && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
    return typeof value === "boolean";
};
