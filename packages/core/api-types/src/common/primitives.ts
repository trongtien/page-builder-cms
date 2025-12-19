import { z } from "zod";
import {
    INVALID_EMAIL,
    INVALID_URL,
    INVALID_UUID,
    INVALID_SLUG,
    EMPTY_STRING,
    NOT_POSITIVE_INT,
    NOT_NON_NEGATIVE_INT,
    INVALID_TIMESTAMP
} from "./message-error";

/**
 * UUID v4 string schema
 * @example "123e4567-e89b-12d3-a456-426614174000"
 */
export const UuidSchema = z.string().uuid(INVALID_UUID);

/**
 * Email address schema
 * @example "user@example.com"
 */
export const EmailSchema = z.string().email(INVALID_EMAIL);

/**
 * URL slug schema (lowercase alphanumeric with hyphens)
 * @example "my-page-title"
 */
export const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, INVALID_SLUG);

/**
 * HTTP/HTTPS URL schema
 * @example "https://example.com/path"
 */
export const UrlSchema = z.string().url(INVALID_URL);

/**
 * ISO 8601 datetime string schema
 * @example "2024-01-01T00:00:00Z"
 */
export const TimestampSchema = z.string().datetime(INVALID_TIMESTAMP);

/**
 * Non-empty string schema
 */
export const NonEmptyStringSchema = z.string().min(1, EMPTY_STRING);

/**
 * Positive integer schema
 */
export const PositiveIntSchema = z.number().int(NOT_POSITIVE_INT).positive("Must be positive");

/**
 * Non-negative integer schema (includes zero)
 */
export const NonNegativeIntSchema = z.number().int("Must be an integer").nonnegative(NOT_NON_NEGATIVE_INT);

// Export inferred types
export type Uuid = z.infer<typeof UuidSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type Slug = z.infer<typeof SlugSchema>;
export type Url = z.infer<typeof UrlSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
