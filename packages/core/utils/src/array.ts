export const unique = <T>(array: T[]): T[] => {
    return [...new Set(array)];
};

export const groupBy = <T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> => {
    return array.reduce(
        (result, item) => {
            const key = keyFn(item);
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(item);
            return result;
        },
        {} as Record<K, T[]>
    );
};

export const chunk = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

export const shuffle = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const randomItem = <T>(array: T[]): T | undefined => {
    return array[Math.floor(Math.random() * array.length)];
};
