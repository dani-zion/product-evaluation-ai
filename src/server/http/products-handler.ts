import "server-only";
import { z } from "zod";
import {
  createProductSchema,
  listProductsSchema,
} from "@/features/products/schemas";
import { InvalidCursorError } from "@/server/errors";
import { hasValidApiKey } from "@/server/http/api-key";
import type { ProductService } from "@/server/services/product-service";

/**
 * GET /api/v1/products?limit=12&cursor=<opaque>
 * - 200 `{ items, nextCursor }` (`items` is `[]` when there are no products)
 * - 400 for an invalid `limit` or `cursor`
 * - 500 for unexpected server errors
 */
export function createListProductsHandler(getService: () => ProductService) {
  return async function GET(request: Request): Promise<Response> {
    const params = new URL(request.url).searchParams;
    const parsed = listProductsSchema.safeParse({
      limit: params.get("limit") ?? undefined,
      cursor: params.get("cursor") ?? undefined,
    });
    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid query",
          fieldErrors: z.flattenError(parsed.error).fieldErrors,
        },
        { status: 400 },
      );
    }

    try {
      const page = await getService().list(parsed.data);
      return Response.json(page);
    } catch (error) {
      if (error instanceof InvalidCursorError) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      console.error("list products failed", error);
      return Response.json(
        { error: "We couldn't load products. Try again in a moment." },
        { status: 500 },
      );
    }
  };
}

/**
 * POST /api/v1/products (for external clients such as n8n)
 * Requires `Authorization: Bearer <PRODUCTS_API_KEY>`.
 * - 201 `{ product }`
 * - 400 for invalid JSON or invalid fields
 * - 401 for a missing or wrong API key
 * - 500 for unexpected server errors
 */
export function createCreateProductHandler(
  getService: () => ProductService,
  getApiKey: () => string | undefined = () => process.env.PRODUCTS_API_KEY,
) {
  return async function POST(request: Request): Promise<Response> {
    if (!hasValidApiKey(request, getApiKey())) {
      return Response.json(
        { error: "Missing or invalid API key" },
        { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid product data",
          fieldErrors: z.flattenError(parsed.error).fieldErrors,
        },
        { status: 400 },
      );
    }

    try {
      const product = await getService().create(parsed.data);
      return Response.json({ product }, { status: 201 });
    } catch (error) {
      console.error("create product failed", error);
      return Response.json(
        { error: "We couldn't create the product. Try again in a moment." },
        { status: 500 },
      );
    }
  };
}
