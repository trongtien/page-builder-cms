import { z } from "zod";

// ============================================
// Base Schemas
// ============================================

/**
 * Spacing schema for padding/margin
 * Values in pixels, range 0-200
 */
export const spacingSchema = z.object({
    top: z.number().int().min(0).max(200).optional(),
    right: z.number().int().min(0).max(200).optional(),
    bottom: z.number().int().min(0).max(200).optional(),
    left: z.number().int().min(0).max(200).optional(),
});

/**
 * Common properties shared by all widgets
 */
export const commonPropsSchema = z.object({
    padding: spacingSchema.optional(),
    margin: spacingSchema.optional(),
    backgroundColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color")
        .optional(),
    hidden: z.boolean().optional(),
});

/**
 * Base widget schema with common fields
 */
export const baseWidgetSchema = z.object({
    id: z.string().uuid("Widget ID must be a valid UUID"),
    type: z.enum([
        "hero_banner",
        "flash_sale",
        "product_grid",
        "quick_links",
    ]),
    position: z.number().int().min(0, "Position must be non-negative"),
    commonProps: commonPropsSchema,
});

// ============================================
// Hero Banner Widget
// ============================================

/**
 * Hero Banner widget for promotional banners with images and CTAs
 */
export const heroBannerSchema = baseWidgetSchema.extend({
    type: z.literal("hero_banner"),
    props: z.object({
        imageUrl: z.string().url("Must be a valid image URL"),
        imageAlt: z.string().min(1, "Alt text is required for accessibility"),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        ctaText: z.string().optional(),
        ctaLink: z.string().url("CTA link must be a valid URL").optional(),
        textPosition: z
            .enum(["left", "center", "right"])
            .default("center"),
        overlayOpacity: z
            .number()
            .min(0, "Overlay opacity must be between 0 and 100")
            .max(100, "Overlay opacity must be between 0 and 100")
            .default(40),
    }),
});

// ============================================
// Flash Sale Widget
// ============================================

/**
 * Flash Sale widget with countdown timer and product display
 */
export const flashSaleSchema = baseWidgetSchema.extend({
    type: z.literal("flash_sale"),
    props: z.object({
        campaignId: z.string().uuid("Campaign ID must be a valid UUID"),
        countdownEndTime: z
            .string()
            .datetime("Must be a valid ISO 8601 datetime"),
        displayStyle: z.enum(["grid", "carousel"]).default("grid"),
        productsPerRow: z
            .number()
            .int()
            .min(2, "Must show at least 2 products per row")
            .max(6, "Cannot show more than 6 products per row")
            .default(4),
        showCountdown: z.boolean().default(true),
    }),
});

// ============================================
// Product Grid Widget
// ============================================

/**
 * Product Grid widget for displaying product collections
 */
export const productGridSchema = baseWidgetSchema.extend({
    type: z.literal("product_grid"),
    props: z.object({
        dataSource: z.enum(["featured", "best_sellers", "category", "custom"]),
        categoryId: z
            .string()
            .uuid("Category ID must be a valid UUID")
            .optional(),
        productIds: z.array(z.string().uuid()).optional(),
        limit: z
            .number()
            .int()
            .min(1, "Must display at least 1 product")
            .max(50, "Cannot display more than 50 products")
            .default(12),
        columns: z
            .number()
            .int()
            .min(1, "Must have at least 1 column")
            .max(6, "Cannot have more than 6 columns")
            .default(4),
    }),
});

// ============================================
// Quick Links Widget
// ============================================

/**
 * Individual link item schema
 */
export const linkItemSchema = z.object({
    id: z.string().uuid("Link ID must be a valid UUID"),
    label: z.string().min(1, "Link label is required"),
    url: z.string().url("Link URL must be valid"),
    icon: z.string().optional(), // Icon name from icon library
});

/**
 * Quick Links widget for navigation shortcuts
 */
export const quickLinksSchema = baseWidgetSchema.extend({
    type: z.literal("quick_links"),
    props: z.object({
        links: z
            .array(linkItemSchema)
            .min(1, "Must have at least one link")
            .max(12, "Cannot have more than 12 links"),
        layout: z.enum(["horizontal", "grid"]).default("horizontal"),
    }),
});

// ============================================
// Widget Discriminated Union
// ============================================

/**
 * Union of all widget types using discriminated union on 'type' field
 */
export const widgetSchema = z.discriminatedUnion("type", [
    heroBannerSchema,
    flashSaleSchema,
    productGridSchema,
    quickLinksSchema,
]);

// ============================================
// Page Configuration Schema
// ============================================

/**
 * Metadata for page configuration tracking
 */
export const pageMetadataSchema = z.object({
    createdBy: z.string().min(1, "Creator ID is required"),
    createdAt: z.string().datetime("Must be a valid ISO 8601 datetime"),
    updatedBy: z.string().min(1, "Updater ID is required"),
    updatedAt: z.string().datetime("Must be a valid ISO 8601 datetime"),
    publishedAt: z.string().datetime().optional(),
    version: z.number().int().min(1, "Version must be at least 1").default(1),
});

/**
 * Complete page configuration schema
 */
export const pageConfigSchema = z.object({
    id: z.string().uuid("Page ID must be a valid UUID"),
    slug: z
        .string()
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must be lowercase letters, numbers, and hyphens only"
        )
        .min(1, "Slug is required")
        .max(100, "Slug cannot exceed 100 characters"),
    title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title cannot exceed 200 characters"),
    status: z.enum(["draft", "published", "archived"]),
    widgets: z.array(widgetSchema),
    metadata: pageMetadataSchema,
});

// ============================================
// Type Exports (Inferred from Zod schemas)
// ============================================

export type Spacing = z.infer<typeof spacingSchema>;
export type CommonProps = z.infer<typeof commonPropsSchema>;
export type BaseWidget = z.infer<typeof baseWidgetSchema>;

export type HeroBannerWidget = z.infer<typeof heroBannerSchema>;
export type FlashSaleWidget = z.infer<typeof flashSaleSchema>;
export type ProductGridWidget = z.infer<typeof productGridSchema>;
export type LinkItem = z.infer<typeof linkItemSchema>;
export type QuickLinksWidget = z.infer<typeof quickLinksSchema>;

export type Widget = z.infer<typeof widgetSchema>;
export type PageMetadata = z.infer<typeof pageMetadataSchema>;
export type PageConfig = z.infer<typeof pageConfigSchema>;

// Widget type helpers
export type WidgetType = Widget["type"];
