// API types
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
}
