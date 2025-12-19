/**
 * Validation utilities and helper functions
 */

import type { z } from "zod";

/**
 * Result of a safe validation operation
 */
export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: Array<{ path: string; message: string }>;
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
    constructor(public errors: Array<{ path: string; message: string }>) {
        super("Validation failed");
        this.name = "ValidationError";
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Safely validate data against a schema without throwing
 * Returns a result object with success/errors
 *
 * @example
 * ```ts
 * const result = safeValidate(LoginRequestSchema, requestBody);
 * if (result.success) {
 *     console.log('Valid data:', result.data);
 * } else {
 *     console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    return {
        success: false,
        errors: result.error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message
        }))
    };
}

/**
 * Validate data and throw a ZodError on failure
 * Use this when you want Zod's default error handling
 *
 * @example
 * ```ts
 * try {
 *     const data = validateOrThrow(LoginRequestSchema, requestBody);
 *     // Use validated data
 * } catch (error) {
 *     // Handle ZodError
 * }
 * ```
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Validate data and throw a custom ValidationError on failure
 * Use this for consistent error formatting across the application
 *
 * @example
 * ```ts
 * try {
 *     const data = validateOrError(LoginRequestSchema, requestBody);
 *     // Use validated data
 * } catch (error) {
 *     if (error instanceof ValidationError) {
 *         // Handle formatted validation errors
 *         console.error(error.errors);
 *     }
 * }
 * ```
 */
export function validateOrError<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = safeValidate(schema, data);
    if (!result.success) {
        throw new ValidationError(result.errors!);
    }
    return result.data!;
}

/**
 * Create a type guard function from a schema
 *
 * @example
 * ```ts
 * const isLoginRequest = createTypeGuard(LoginRequestSchema);
 * if (isLoginRequest(data)) {
 *     // data is now typed as LoginRequest
 * }
 * ```
 */
export function createTypeGuard<T>(schema: z.ZodSchema<T>) {
    return (data: unknown): data is T => {
        return schema.safeParse(data).success;
    };
}

/**
 * Format Zod errors for API responses
 *
 * @example
 * ```ts
 * try {
 *     schema.parse(data);
 * } catch (error) {
 *     if (error instanceof z.ZodError) {
 *         const formatted = formatZodErrors(error);
 *         return res.status(400).json({ errors: formatted });
 *     }
 * }
 * ```
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!formatted[path]) {
            formatted[path] = [];
        }
        formatted[path].push(err.message);
    });

    return formatted;
}
