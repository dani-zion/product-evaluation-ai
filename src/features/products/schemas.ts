import { z } from "zod";

export const PRODUCT_NAME_MAX = 200;
export const PRODUCT_DESCRIPTION_MAX = 2000;
export const PRODUCTS_DEFAULT_LIMIT = 12;
export const PRODUCTS_MAX_LIMIT = 50;

/** What the API returns for a product (camelCase, ISO dates). */
export type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  externalLink: string;
  /** Average evaluation score, 1–5. `null` when nobody has evaluated it yet. */
  score: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductPage = {
  items: Product[];
  nextCursor: string | null;
};

/**
 * Characters a real URL never contains unencoded. `z.url()` alone accepts
 * them (it parses like a browser address bar), which let scraped page text
 * such as "https://shop/[img]Product name 42% off" through as a "link".
 */
const UNSAFE_URL_CHARACTERS = /[\s[\]<>"{}|\\^`]/;

const absoluteUrl = (protocol: RegExp, message: string) =>
  z
    .string()
    .trim()
    .refine((value) => !UNSAFE_URL_CHARACTERS.test(value), message)
    .pipe(z.url({ protocol, message }));

/** Empty strings and null mean "not given" for optional fields. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) =>
      value === null || (typeof value === "string" && value.trim() === "")
        ? undefined
        : value,
    schema.optional(),
  );

/**
 * Input for POST /api/v1/products. Field names match what the n8n ingestion
 * workflow sends (`name`, `link`, `image`); the API response still uses
 * `externalLink` and `imageUrl` (see `Product`).
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(
      PRODUCT_NAME_MAX,
      `Name must be at most ${PRODUCT_NAME_MAX} characters`,
    ),
  description: optional(
    z
      .string()
      .trim()
      .max(
        PRODUCT_DESCRIPTION_MAX,
        `Description must be at most ${PRODUCT_DESCRIPTION_MAX} characters`,
      ),
  ),
  image: optional(
    absoluteUrl(/^https$/, "Image must be an absolute https:// URL"),
  ),
  link: absoluteUrl(/^https?$/, "Link must be an absolute http(s):// URL"),
});

export type CreateProductInput = z.output<typeof createProductSchema>;

/** Query for listing products (REST query string and tRPC input). */
export const listProductsSchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(PRODUCTS_MAX_LIMIT, `Limit must be at most ${PRODUCTS_MAX_LIMIT}`)
    .default(PRODUCTS_DEFAULT_LIMIT),
  cursor: z.string().min(1).nullish(),
});

export type ListProductsInput = z.input<typeof listProductsSchema>;
export type ListProductsQuery = z.output<typeof listProductsSchema>;
