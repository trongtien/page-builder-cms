/**
 * Common types for configuration
 */

export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}
