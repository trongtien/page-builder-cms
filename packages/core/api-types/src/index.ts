/**
 * @page-builder/api-types
 *
 * Shared API types and Zod validation schemas for the page-builder CMS.
 * This package provides type-safe API contracts and runtime validation
 * shared across all applications in the monorepo.
 */

// Common schemas and utilities
export * from "./common";

// Domain-specific schemas
export * from "./auth";
export * from "./page";
export * from "./content";
export * from "./media";

// Validation utilities
export * from "./utils";
