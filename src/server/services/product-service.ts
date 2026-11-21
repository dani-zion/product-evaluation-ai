import "server-only";
import type {
  CreateProductInput,
  ListProductsQuery,
  Product,
  ProductPage,
} from "@/features/products/schemas";
import { generateId as defaultGenerateId } from "@/lib/id";
import { InvalidCursorError } from "@/server/errors";
import type {
  ProductKey,
  ProductRepository,
  ProductRow,
} from "@/server/repositories/product-repository";

/** Opaque cursor: base64url of the last row's [created_at, id]. */
export function encodeCursor(key: ProductKey): string {
  return Buffer.from(JSON.stringify([key.createdAt, key.id])).toString(
    "base64url",
  );
}

// Strict shapes for the decoded cursor. The values end up inside a PostgREST
// filter string, so anything outside these character sets is rejected.
const CURSOR_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}(:?\d{2})?)$/;
const CURSOR_ID = /^[A-Za-z0-9_-]{1,64}$/;

/** Reverses encodeCursor. Throws InvalidCursorError for anything else. */
export function decodeCursor(cursor: string): ProductKey {
  let value: unknown;
  try {
    value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    throw new InvalidCursorError();
  }
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "string" &&
    typeof value[1] === "string" &&
    CURSOR_ID.test(value[1]) &&
    CURSOR_TIMESTAMP.test(value[0]) &&
    !Number.isNaN(Date.parse(value[0]))
  ) {
    return { createdAt: value[0], id: value[1] };
  }
  throw new InvalidCursorError();
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    externalLink: row.external_link,
    score: row.score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ProductServiceDeps = {
  repository: ProductRepository;
  generateId?: () => string;
};

export function createProductService({
  repository,
  generateId = defaultGenerateId,
}: ProductServiceDeps) {
  return {
    /** One page of products, newest first. Throws InvalidCursorError for a bad cursor. */
    async list({ limit, cursor }: ListProductsQuery): Promise<ProductPage> {
      const after = cursor ? decodeCursor(cursor) : null;
      // One extra row tells us whether another page exists.
      const rows = await repository.list({ limit: limit + 1, after });
      const page = rows.slice(0, limit);
      const last = page.at(-1);
      return {
        items: page.map(toProduct),
        nextCursor:
          rows.length > limit && last
            ? encodeCursor({ createdAt: last.created_at, id: last.id })
            : null,
      };
    },

    async create(input: CreateProductInput): Promise<Product> {
      const row = await repository.insert({
        id: generateId(),
        name: input.name,
        description: input.description ?? null,
        image_url: input.imageUrl ?? null,
        external_link: input.externalLink,
      });
      return toProduct(row);
    },

    async getById(id: string): Promise<Product | null> {
      const row = await repository.findById(id);
      return row ? toProduct(row) : null;
    },
  };
}

export type ProductService = ReturnType<typeof createProductService>;
