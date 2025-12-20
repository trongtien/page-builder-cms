import type { ApiError, RequestConfig } from "@/types/api.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const { method = "GET", headers = {}, body } = config;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...headers
                },
                ...(body !== undefined && { body: JSON.stringify(body) })
            });

            if (!response.ok) {
                const apiError: ApiError = {
                    message: `HTTP error! status: ${response.status}`,
                    status: response.status
                };
                throw new Error(JSON.stringify(apiError));
            }

            return (await response.json()) as T;
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }

    async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: "GET", ...(headers && { headers }) });
    }

    async post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: "POST", body, ...(headers && { headers }) });
    }

    async put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: "PUT", body, ...(headers && { headers }) });
    }

    async patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: "PATCH", body, ...(headers && { headers }) });
    }

    async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE", ...(headers && { headers }) });
    }
}

export const apiService = new ApiService();
