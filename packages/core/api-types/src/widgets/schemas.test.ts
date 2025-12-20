import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import {
    spacingSchema,
    commonPropsSchema,
    heroBannerSchema,
    flashSaleSchema,
    productGridSchema,
    quickLinksSchema,
    widgetSchema,
    pageConfigSchema,
    type Widget,
    type PageConfig
} from "./schemas";

describe("Widget Schemas", () => {
    describe("spacingSchema", () => {
        it("should accept valid spacing values", () => {
            const validSpacing = { top: 10, right: 20, bottom: 15, left: 5 };
            expect(() => spacingSchema.parse(validSpacing)).not.toThrow();
        });

        it("should accept partial spacing values", () => {
            const partialSpacing = { top: 10, bottom: 20 };
            expect(() => spacingSchema.parse(partialSpacing)).not.toThrow();
        });

        it("should reject negative values", () => {
            const invalidSpacing = { top: -5 };
            expect(() => spacingSchema.parse(invalidSpacing)).toThrow(ZodError);
        });

        it("should reject values above 200", () => {
            const invalidSpacing = { top: 201 };
            expect(() => spacingSchema.parse(invalidSpacing)).toThrow(ZodError);
        });

        it("should reject non-integer values", () => {
            const invalidSpacing = { top: 10.5 };
            expect(() => spacingSchema.parse(invalidSpacing)).toThrow(ZodError);
        });
    });

    describe("commonPropsSchema", () => {
        it("should accept valid common props", () => {
            const validProps = {
                padding: { top: 10, bottom: 10 },
                margin: { left: 5, right: 5 },
                backgroundColor: "#ff5733",
                hidden: false
            };
            expect(() => commonPropsSchema.parse(validProps)).not.toThrow();
        });

        it("should accept empty object", () => {
            expect(() => commonPropsSchema.parse({})).not.toThrow();
        });

        it("should reject invalid hex color format", () => {
            const invalidProps = { backgroundColor: "red" };
            expect(() => commonPropsSchema.parse(invalidProps)).toThrow(ZodError);
        });

        it("should reject hex color without hash", () => {
            const invalidProps = { backgroundColor: "ff5733" };
            expect(() => commonPropsSchema.parse(invalidProps)).toThrow(ZodError);
        });

        it("should reject short hex colors", () => {
            const invalidProps = { backgroundColor: "#fff" };
            expect(() => commonPropsSchema.parse(invalidProps)).toThrow(ZodError);
        });
    });

    describe("heroBannerSchema", () => {
        const validHeroBanner = {
            id: "550e8400-e29b-41d4-a716-446655440000",
            type: "hero_banner" as const,
            position: 0,
            commonProps: {},
            props: {
                imageUrl: "https://example.com/banner.jpg",
                imageAlt: "Promotional banner",
                title: "Welcome to our store",
                textPosition: "center" as const,
                overlayOpacity: 40
            }
        };

        it("should accept valid hero banner widget", () => {
            expect(() => heroBannerSchema.parse(validHeroBanner)).not.toThrow();
        });

        it("should accept hero banner with minimal props", () => {
            const minimal = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                type: "hero_banner" as const,
                position: 0,
                commonProps: {},
                props: {
                    imageUrl: "https://example.com/banner.jpg",
                    imageAlt: "Banner"
                }
            };
            const result = heroBannerSchema.parse(minimal);
            expect(result.props.textPosition).toBe("center"); // default
            expect(result.props.overlayOpacity).toBe(40); // default
        });

        it("should reject invalid image URL", () => {
            const invalid = {
                ...validHeroBanner,
                props: { ...validHeroBanner.props, imageUrl: "not-a-url" }
            };
            expect(() => heroBannerSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject empty alt text", () => {
            const invalid = {
                ...validHeroBanner,
                props: { ...validHeroBanner.props, imageAlt: "" }
            };
            expect(() => heroBannerSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject invalid text position", () => {
            const invalid = {
                ...validHeroBanner,
                props: { ...validHeroBanner.props, textPosition: "top" }
            };
            expect(() => heroBannerSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject overlay opacity below 0", () => {
            const invalid = {
                ...validHeroBanner,
                props: { ...validHeroBanner.props, overlayOpacity: -1 }
            };
            expect(() => heroBannerSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject overlay opacity above 100", () => {
            const invalid = {
                ...validHeroBanner,
                props: { ...validHeroBanner.props, overlayOpacity: 101 }
            };
            expect(() => heroBannerSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject invalid CTA link URL", () => {
            const invalid = {
                ...validHeroBanner,
                props: {
                    ...validHeroBanner.props,
                    ctaLink: "javascript:alert('xss')"
                }
            };
            expect(() => heroBannerSchema.parse(invalid)).toThrow(ZodError);
        });
    });

    describe("flashSaleSchema", () => {
        const validFlashSale = {
            id: "550e8400-e29b-41d4-a716-446655440001",
            type: "flash_sale" as const,
            position: 1,
            commonProps: {},
            props: {
                campaignId: "650e8400-e29b-41d4-a716-446655440000",
                countdownEndTime: "2024-12-31T23:59:59Z",
                displayStyle: "grid" as const,
                productsPerRow: 4,
                showCountdown: true
            }
        };

        it("should accept valid flash sale widget", () => {
            expect(() => flashSaleSchema.parse(validFlashSale)).not.toThrow();
        });

        it("should apply default values", () => {
            const minimal = {
                id: "550e8400-e29b-41d4-a716-446655440001",
                type: "flash_sale" as const,
                position: 1,
                commonProps: {},
                props: {
                    campaignId: "650e8400-e29b-41d4-a716-446655440000",
                    countdownEndTime: "2024-12-31T23:59:59Z"
                }
            };
            const result = flashSaleSchema.parse(minimal);
            expect(result.props.displayStyle).toBe("grid");
            expect(result.props.productsPerRow).toBe(4);
            expect(result.props.showCountdown).toBe(true);
        });

        it("should reject invalid campaign ID", () => {
            const invalid = {
                ...validFlashSale,
                props: { ...validFlashSale.props, campaignId: "not-a-uuid" }
            };
            expect(() => flashSaleSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject invalid datetime format", () => {
            const invalid = {
                ...validFlashSale,
                props: {
                    ...validFlashSale.props,
                    countdownEndTime: "2024-12-31"
                }
            };
            expect(() => flashSaleSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject invalid display style", () => {
            const invalid = {
                ...validFlashSale,
                props: { ...validFlashSale.props, displayStyle: "list" }
            };
            expect(() => flashSaleSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject products per row below 2", () => {
            const invalid = {
                ...validFlashSale,
                props: { ...validFlashSale.props, productsPerRow: 1 }
            };
            expect(() => flashSaleSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject products per row above 6", () => {
            const invalid = {
                ...validFlashSale,
                props: { ...validFlashSale.props, productsPerRow: 7 }
            };
            expect(() => flashSaleSchema.parse(invalid)).toThrow(ZodError);
        });
    });

    describe("productGridSchema", () => {
        const validProductGrid = {
            id: "550e8400-e29b-41d4-a716-446655440002",
            type: "product_grid" as const,
            position: 2,
            commonProps: {},
            props: {
                dataSource: "featured" as const,
                limit: 12,
                columns: 4
            }
        };

        it("should accept valid product grid widget", () => {
            expect(() => productGridSchema.parse(validProductGrid)).not.toThrow();
        });

        it("should accept category data source with categoryId", () => {
            const categoryGrid = {
                ...validProductGrid,
                props: {
                    dataSource: "category" as const,
                    categoryId: "750e8400-e29b-41d4-a716-446655440000",
                    limit: 12,
                    columns: 3
                }
            };
            expect(() => productGridSchema.parse(categoryGrid)).not.toThrow();
        });

        it("should accept custom data source with productIds", () => {
            const customGrid = {
                ...validProductGrid,
                props: {
                    dataSource: "custom" as const,
                    productIds: ["850e8400-e29b-41d4-a716-446655440000", "850e8400-e29b-41d4-a716-446655440001"],
                    limit: 12,
                    columns: 2
                }
            };
            expect(() => productGridSchema.parse(customGrid)).not.toThrow();
        });

        it("should reject invalid data source", () => {
            const invalid = {
                ...validProductGrid,
                props: { ...validProductGrid.props, dataSource: "random" }
            };
            expect(() => productGridSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject limit below 1", () => {
            const invalid = {
                ...validProductGrid,
                props: { ...validProductGrid.props, limit: 0 }
            };
            expect(() => productGridSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject limit above 50", () => {
            const invalid = {
                ...validProductGrid,
                props: { ...validProductGrid.props, limit: 51 }
            };
            expect(() => productGridSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject columns below 1", () => {
            const invalid = {
                ...validProductGrid,
                props: { ...validProductGrid.props, columns: 0 }
            };
            expect(() => productGridSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject columns above 6", () => {
            const invalid = {
                ...validProductGrid,
                props: { ...validProductGrid.props, columns: 7 }
            };
            expect(() => productGridSchema.parse(invalid)).toThrow(ZodError);
        });
    });

    describe("quickLinksSchema", () => {
        const validQuickLinks = {
            id: "550e8400-e29b-41d4-a716-446655440003",
            type: "quick_links" as const,
            position: 3,
            commonProps: {},
            props: {
                links: [
                    {
                        id: "950e8400-e29b-41d4-a716-446655440000",
                        label: "Shop Now",
                        url: "https://example.com/shop"
                    },
                    {
                        id: "950e8400-e29b-41d4-a716-446655440001",
                        label: "Contact Us",
                        url: "https://example.com/contact",
                        icon: "mail"
                    }
                ],
                layout: "horizontal" as const
            }
        };

        it("should accept valid quick links widget", () => {
            expect(() => quickLinksSchema.parse(validQuickLinks)).not.toThrow();
        });

        it("should accept grid layout", () => {
            const gridLayout = {
                ...validQuickLinks,
                props: { ...validQuickLinks.props, layout: "grid" as const }
            };
            expect(() => quickLinksSchema.parse(gridLayout)).not.toThrow();
        });

        it("should reject empty links array", () => {
            const invalid = {
                ...validQuickLinks,
                props: { ...validQuickLinks.props, links: [] }
            };
            expect(() => quickLinksSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject more than 12 links", () => {
            const tooManyLinks = Array.from({ length: 13 }, (_, i) => ({
                id: `950e8400-e29b-41d4-a716-44665544000${i}`,
                label: `Link ${i}`,
                url: `https://example.com/link${i}`
            }));
            const invalid = {
                ...validQuickLinks,
                props: { ...validQuickLinks.props, links: tooManyLinks }
            };
            expect(() => quickLinksSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject link with empty label", () => {
            const invalid = {
                ...validQuickLinks,
                props: {
                    ...validQuickLinks.props,
                    links: [
                        {
                            id: "950e8400-e29b-41d4-a716-446655440000",
                            label: "",
                            url: "https://example.com"
                        }
                    ]
                }
            };
            expect(() => quickLinksSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject link with invalid URL", () => {
            const invalid = {
                ...validQuickLinks,
                props: {
                    ...validQuickLinks.props,
                    links: [
                        {
                            id: "950e8400-e29b-41d4-a716-446655440000",
                            label: "Invalid",
                            url: "not-a-url"
                        }
                    ]
                }
            };
            expect(() => quickLinksSchema.parse(invalid)).toThrow(ZodError);
        });
    });

    describe("widgetSchema (discriminated union)", () => {
        it("should accept any valid widget type", () => {
            const heroBanner: Widget = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                type: "hero_banner",
                position: 0,
                commonProps: {},
                props: {
                    imageUrl: "https://example.com/banner.jpg",
                    imageAlt: "Banner",
                    textPosition: "center",
                    overlayOpacity: 40
                }
            };

            expect(() => widgetSchema.parse(heroBanner)).not.toThrow();
        });

        it("should reject widget with mismatched type and props", () => {
            const invalid = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                type: "hero_banner",
                position: 0,
                commonProps: {},
                props: {
                    // Flash sale props instead of hero banner props
                    campaignId: "650e8400-e29b-41d4-a716-446655440000",
                    countdownEndTime: "2024-12-31T23:59:59Z"
                }
            };
            expect(() => widgetSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject invalid widget ID", () => {
            const invalid = {
                id: "not-a-uuid",
                type: "hero_banner",
                position: 0,
                commonProps: {},
                props: {
                    imageUrl: "https://example.com/banner.jpg",
                    imageAlt: "Banner"
                }
            };
            expect(() => widgetSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject negative position", () => {
            const invalid = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                type: "hero_banner",
                position: -1,
                commonProps: {},
                props: {
                    imageUrl: "https://example.com/banner.jpg",
                    imageAlt: "Banner"
                }
            };
            expect(() => widgetSchema.parse(invalid)).toThrow(ZodError);
        });
    });

    describe("pageConfigSchema", () => {
        const validPageConfig: PageConfig = {
            id: "a50e8400-e29b-41d4-a716-446655440000",
            slug: "home-page",
            title: "Home Page",
            widgets: [
                {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    type: "hero_banner",
                    position: 0,
                    commonProps: {},
                    props: {
                        imageUrl: "https://example.com/banner.jpg",
                        imageAlt: "Welcome banner",
                        textPosition: "center",
                        overlayOpacity: 40
                    }
                }
            ],
            metadata: {
                createdBy: "user123",
                createdAt: "2024-01-01T00:00:00Z",
                updatedBy: "user123",
                updatedAt: "2024-01-01T00:00:00Z",
                status: "draft",
                version: 1
            },
            settings: {
                seoTitle: "Welcome Home",
                seoDescription: "Homepage description",
                allowIndexing: true
            }
        };

        it("should accept valid page config", () => {
            expect(() => pageConfigSchema.parse(validPageConfig)).not.toThrow();
        });

        it("should accept published status with publishedAt", () => {
            const published = {
                ...validPageConfig,
                metadata: {
                    ...validPageConfig.metadata,
                    status: "published" as const,
                    publishedAt: "2024-01-02T00:00:00Z"
                }
            };
            expect(() => pageConfigSchema.parse(published)).not.toThrow();
        });

        it("should accept page config without settings", () => {
            const { settings, ...withoutSettings } = validPageConfig;
            expect(() => pageConfigSchema.parse(withoutSettings)).not.toThrow();
        });

        it("should accept page config with empty widgets array", () => {
            const noWidgets = { ...validPageConfig, widgets: [] };
            expect(() => pageConfigSchema.parse(noWidgets)).not.toThrow();
        });

        it("should reject invalid page ID", () => {
            const invalid = { ...validPageConfig, id: "not-a-uuid" };
            expect(() => pageConfigSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject slug with uppercase letters", () => {
            const invalid = { ...validPageConfig, slug: "HomePage" };
            expect(() => pageConfigSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject slug with spaces", () => {
            const invalid = { ...validPageConfig, slug: "home page" };
            expect(() => pageConfigSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject slug with special characters", () => {
            const invalid = { ...validPageConfig, slug: "home_page!" };
            expect(() => pageConfigSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject empty title", () => {
            const invalid = { ...validPageConfig, title: "" };
            expect(() => pageConfigSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject title exceeding 200 characters", () => {
            const invalid = {
                ...validPageConfig,
                title: "a".repeat(201)
            };
            expect(() => pageConfigSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should reject invalid status", () => {
            const invalid = { ...validPageConfig, status: "pending" };
            expect(() => pageConfigSchema.parse(invalid)).toThrow(ZodError);
        });

        it("should accept empty widgets array", () => {
            const emptyWidgets = { ...validPageConfig, widgets: [] };
            expect(() => pageConfigSchema.parse(emptyWidgets)).not.toThrow();
        });

        it("should reject version below 1", () => {
            const invalid = {
                ...validPageConfig,
                metadata: { ...validPageConfig.metadata, version: 0 }
            };
            expect(() => pageConfigSchema.parse(invalid)).toThrow(ZodError);
        });
    });
});
