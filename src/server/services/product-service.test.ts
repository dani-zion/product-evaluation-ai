import { describe, expect, it } from "vitest";
import { createProductSchema } from "@/features/products/schemas";
import { InvalidCursorError } from "@/server/errors";
import {
  createInMemoryProductRepository,
  makeProductRows,
  validProduct,
  validProductAsReturned,
} from "@/test/in-memory-product-repository";
import {
  createProductService,
  decodeCursor,
  encodeCursor,
} from "./product-service";

function setup(count = 0) {
  const { repository, rows } = createInMemoryProductRepository(
    makeProductRows(count),
  );
  return { service: createProductService({ repository }), rows };
}

describe("cursor", () => {
  it("round-trips", () => {
    const key = { createdAt: "2026-11-01T12:00:00.000Z", id: "abc_-123" };
    expect(decodeCursor(encodeCursor(key))).toEqual(key);
  });

  it("is opaque (no raw id or date in it)", () => {
    const cursor = encodeCursor({
      createdAt: "2026-11-01T12:00:00.000Z",
      id: "abc",
    });
    expect(cursor).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(cursor).not.toContain("abc");
  });

  it.each([
    "garbage",
    Buffer.from("{}").toString("base64url"),
    Buffer.from('["not a date","id"]').toString("base64url"),
    Buffer.from('["2026-11-01T12:00:00.000Z",""]').toString("base64url"),
    // Filter injection attempts: quotes, commas and parentheses are rejected.
    Buffer.from(
      JSON.stringify(["2026-11-01T12:00:00.000Z", 'x"),id.neq.("']),
    ).toString("base64url"),
    Buffer.from(
      JSON.stringify(['2026-11-01T12:00:00Z",or(id.neq.x)', "abc"]),
    ).toString("base64url"),
    // Supabase's own timestamp format is still accepted (see round-trip test).
  ])("rejects %s", (cursor) => {
    expect(() => decodeCursor(cursor)).toThrow(InvalidCursorError);
  });
});

describe("productService.list", () => {
  it("returns an empty page when there are no products", async () => {
    const { service } = setup();
    expect(await service.list({ limit: 12 })).toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it("returns newest first, with id as tie-breaker", async () => {
    const { service } = setup(4);
    const page = await service.list({ limit: 12 });
    expect(page.items.map((p) => p.id)).toEqual([
      "product-003",
      "product-002",
      "product-001",
      "product-000",
    ]);
    expect(page.nextCursor).toBeNull();
  });

  it("walks every product once, in a stable order, across pages", async () => {
    const { service } = setup(29);
    const seen: string[] = [];
    let cursor: string | null = null;
    let pages = 0;
    do {
      const page = await service.list({ limit: 12, cursor });
      seen.push(...page.items.map((p) => p.id));
      cursor = page.nextCursor;
      pages += 1;
    } while (cursor);

    expect(pages).toBe(3);
    expect(seen).toHaveLength(29);
    expect(new Set(seen).size).toBe(29);
    const all = await service.list({ limit: 50 });
    expect(seen).toEqual(all.items.map((p) => p.id));
  });

  it("returns nextCursor null on a last page that is exactly full", async () => {
    const { service } = setup(24);
    const first = await service.list({ limit: 12 });
    const second = await service.list({ limit: 12, cursor: first.nextCursor });
    expect(second.items).toHaveLength(12);
    expect(second.nextCursor).toBeNull();
  });

  it("does not repeat or skip products added while someone scrolls", async () => {
    const { service, rows } = setup(20);
    const first = await service.list({ limit: 10 });
    rows.push({
      ...rows[0],
      id: "newest",
      created_at: "2027-01-01T00:00:00.000Z",
    });
    const second = await service.list({ limit: 10, cursor: first.nextCursor });
    const ids = [...first.items, ...second.items].map((p) => p.id);
    expect(new Set(ids).size).toBe(20);
    expect(ids).not.toContain("newest");
  });

  it("maps rows to camelCase products", async () => {
    const { service, rows } = setup(1);
    const [product] = (await service.list({ limit: 1 })).items;
    expect(product).toEqual({
      id: rows[0].id,
      name: rows[0].name,
      description: rows[0].description,
      imageUrl: rows[0].image_url,
      externalLink: rows[0].external_link,
      score: rows[0].score,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
    });
  });

  it("rejects an invalid cursor", async () => {
    const { service } = setup(3);
    await expect(
      service.list({ limit: 12, cursor: "garbage" }),
    ).rejects.toBeInstanceOf(InvalidCursorError);
  });
});

describe("productService.create and getById", () => {
  it("stores the product with a nanoid id and no score", async () => {
    const { service, rows } = setup();

    const product = await service.create(
      createProductSchema.parse(validProduct),
    );

    expect(rows).toHaveLength(1);
    expect(product.id).toMatch(/^[A-Za-z0-9_-]{21}$/);
    expect(product).toMatchObject({ ...validProductAsReturned, score: null });
  });

  it("stores missing optional fields as null", async () => {
    const { service, rows } = setup();
    await service.create({
      name: "Kettle",
      link: "https://shop.example.com/kettle",
    });
    expect(rows[0].description).toBeNull();
    expect(rows[0].image_url).toBeNull();
  });

  it("finds a product by id, or returns null", async () => {
    const { service } = setup();
    const created = await service.create(validProduct);
    expect(await service.getById(created.id)).toEqual(created);
    expect(await service.getById("missing")).toBeNull();
  });
});
