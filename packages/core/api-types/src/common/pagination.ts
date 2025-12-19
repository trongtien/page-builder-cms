/**
 * Pagination schemas for list endpoints
 */

import { z } from "zod";
import { PositiveIntSchema, NonNegativeIntSchema } from "./primitives";

/**
 * Pagination query parameters schema
 * Used for paginated list requests
 */
export const PaginationParamsSchema = z.object({
    /** Current page number (1-indexed) */
    page: PositiveIntSchema.default(1),
    /** Items per page (max 100) */
    limit: PositiveIntSchema.max(100, "Limit cannot exceed 100").default(20)
});

/**
 * Pagination metadata schema
 * Returned with paginated list responses
 */
export const PaginationMetaSchema = z.object({
    /** Current page number */
    page: PositiveIntSchema,
    /** Items per page */
    limit: PositiveIntSchema,
    /** Total number of items */
    total: NonNegativeIntSchema,
    /** Total number of pages */
    totalPages: NonNegativeIntSchema
});

/**
 * Creates a paginated response schema for a given item type
 *
 * @example
 * ```ts
 * const UserListResponseSchema = createPaginatedResponseSchema(UserSchema);
 * ```
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
    return z.object({
        success: z.literal(true),
        data: z.array(itemSchema),
        meta: PaginationMetaSchema
    });
}

// Export inferred types
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type PaginatedResponse<T> = {
    success: true;
    data: T[];
    meta: PaginationMeta;
};
