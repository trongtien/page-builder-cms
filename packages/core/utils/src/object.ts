export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (Array.isArray(obj)) {
        const clonedArray = obj.map((item: unknown) => deepClone(item));
        return clonedArray as unknown as T;
    }
    if (obj instanceof Object) {
        const clonedObj = {} as T;
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
};

export const deepMerge = <T extends Record<string, unknown>>(target: T, source: Partial<T>): T => {
    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            const sourceValue = source[key as keyof typeof source];
            if (isObject(sourceValue)) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: sourceValue });
                } else {
                    const targetValue = target[key as keyof T];
                    if (isObject(targetValue) && isObject(sourceValue)) {
                        (output as Record<string, unknown>)[key] = deepMerge(
                            targetValue as Record<string, unknown>,
                            sourceValue as Record<string, unknown>
                        );
                    }
                }
            } else {
                Object.assign(output, { [key]: sourceValue });
            }
        });
    }

    return output;
};

export const isObject = (obj: unknown): obj is Record<string, unknown> => {
    return obj !== null && typeof obj === "object" && !Array.isArray(obj);
};

export const omit = <T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
};

export const pick = <T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
};
