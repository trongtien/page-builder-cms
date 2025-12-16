export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
    fn: T,
    ms: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    return function (this: unknown, ...args: Parameters<T>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this as ThisParameterType<T>, args), ms);
    };
};

export const throttle = <T extends (...args: unknown[]) => unknown>(
    fn: T,
    ms: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return function (this: unknown, ...args: Parameters<T>) {
        if (!inThrottle) {
            fn.apply(this as ThisParameterType<T>, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), ms);
        }
    };
};

export const retry = async <T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (maxRetries <= 0) {
            throw error;
        }
        await delay(delayMs);
        return retry(fn, maxRetries - 1, delayMs * 2);
    }
};
