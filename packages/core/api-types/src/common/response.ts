/**
 * API response wrapper schemas
 */

import { z } from "zod";

/**
 * Generic success response schema
 * Used for successful API responses with data
 */
export const SuccessResponseSchema = z.object({
    success: z.literal(true),
    data: z.unknown()
});

/**
 * Creates a success response schema for a given data type
 *
 * @example
 * ```ts
 * const UserResponseSchema = createSuccessResponseSchema(UserSchema);
 * // Returns: { success: true, data: User }
 * ```
 */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
    return z.object({
        success: z.literal(true),
        data: dataSchema
    });
}

/**
 * Success response with no data (for operations like delete)
 */
export const EmptySuccessResponseSchema = z.object({
    success: z.literal(true),
    message: z.string().optional()
});

// Export inferred types
export type SuccessResponse<T = unknown> = {
    success: true;
    data: T;
};

export type EmptySuccessResponse = z.infer<typeof EmptySuccessResponseSchema>;
