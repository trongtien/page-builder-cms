import { useState, useEffect, useCallback } from "react";

interface UseAsyncResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: () => Promise<void>;
}

export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true): UseAsyncResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(immediate);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await asyncFunction();
            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);

    return { data, loading, error, execute };
}
