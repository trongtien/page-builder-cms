/**
 * Common primitive schemas used across the API
 *
 * These are reusable schema building blocks for common data types.
 */

import { z } from "zod";

/**
 * UUID v4 string schema
 * @example "123e4567-e89b-12d3-a456-426614174000"
 */
export const UuidSchema = z.string().uuid("Invalid UUID format");

/**
 * Email address schema
 * @example "user@example.com"
 */
export const EmailSchema = z.string().email("Invalid email format");

/**
 * URL slug schema (lowercase alphanumeric with hyphens)
 * @example "my-page-title"
 */
export const SlugSchema = z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format (use lowercase letters, numbers, and hyphens only)");

/**
 * HTTP/HTTPS URL schema
 * @example "https://example.com/path"
 */
export const UrlSchema = z.string().url("Invalid URL format");

/**
 * ISO 8601 datetime string schema
 * @example "2024-01-01T00:00:00Z"
 */
export const TimestampSchema = z.string().datetime("Invalid datetime format (ISO 8601 required)");

/**
 * Non-empty string schema
 */
export const NonEmptyStringSchema = z.string().min(1, "String cannot be empty");

/**
 * Positive integer schema
 */
export const PositiveIntSchema = z.number().int("Must be an integer").positive("Must be positive");

/**
 * Non-negative integer schema (includes zero)
 */
export const NonNegativeIntSchema = z.number().int("Must be an integer").nonnegative("Must be non-negative");

// Export inferred types
export type Uuid = z.infer<typeof UuidSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type Slug = z.infer<typeof SlugSchema>;
export type Url = z.infer<typeof UrlSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
