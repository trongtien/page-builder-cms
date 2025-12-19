/**
 * Error response schemas
 */

import { z } from "zod";

/**
 * API error response schema
 * Used for all error responses
 */
export const ErrorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.unknown()).optional()
    })
});

export const ValidationErrorDetailsSchema = z.record(z.array(z.string()));

/**
 * Common error codes
 */
export const ErrorCode = {
    VALIDATION_ERROR: "VALIDATION_ERROR",
    NOT_FOUND: "NOT_FOUND",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    CONFLICT: "CONFLICT",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    BAD_REQUEST: "BAD_REQUEST"
} as const;

/**
 * Creates an error response schema with typed error details
 *
 * @example
 * ```ts
 * const ValidationErrorResponseSchema = createErrorResponseSchema(
 *     ValidationErrorDetailsSchema
 * );
 * ```
 */
export function createErrorResponseSchema<T extends z.ZodTypeAny>(detailsSchema?: T) {
    if (!detailsSchema) {
        return ErrorResponseSchema;
    }

    return z.object({
        success: z.literal(false),
        error: z.object({
            code: z.string(),
            message: z.string(),
            details: detailsSchema.optional()
        })
    });
}

// Export inferred types
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type ValidationErrorDetails = z.infer<typeof ValidationErrorDetailsSchema>;
export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
