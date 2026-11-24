import type {
  ProductRepository,
  ProductRow,
} from "@/server/repositories/product-repository";

/** Same order as the database index: created_at desc, then id desc. */
function compare(a: ProductRow, b: ProductRow): number {
  if (a.created_at !== b.created_at) {
    return a.created_at < b.created_at ? 1 : -1;
  }
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

/** Test double for the products table. */
export function createInMemoryProductRepository(initial: ProductRow[] = []) {
  const rows: ProductRow[] = [...initial];

  const repository: ProductRepository = {
    async list({ limit, after }) {
      return [...rows]
        .sort(compare)
        .filter(
          (row) =>
            !after ||
            row.created_at < after.createdAt ||
            (row.created_at === after.createdAt && row.id < after.id),
        )
        .slice(0, limit);
    },
    async insert(product) {
      const now = new Date().toISOString();
      const row: ProductRow = {
        score: null,
        created_at: now,
        updated_at: now,
        ...product,
      };
      rows.push(row);
      return row;
    },
    async findById(id) {
      return rows.find((row) => row.id === id) ?? null;
    },
  };

  return { repository, rows };
}

/**
 * `count` product rows, one second apart. Every pair shares a timestamp so
 * tests also cover the id tie-breaker.
 */
export function makeProductRows(count: number): ProductRow[] {
  const start = Date.parse("2026-11-01T12:00:00.000Z");
  return Array.from({ length: count }, (_, index) => {
    const createdAt = new Date(
      start + Math.floor(index / 2) * 1000,
    ).toISOString();
    return {
      id: `product-${String(index).padStart(3, "0")}`,
      name: `Product ${index}`,
      description: index % 3 === 0 ? null : `Description ${index}`,
      image_url: null,
      external_link: `https://example.com/products/${index}`,
      score: index % 4 === 0 ? null : (index % 5) + 1,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}

export const validProduct = {
  name: "Aero 2 wireless headphones",
  description: "Over-ear, noise cancelling, about 30 hours per charge.",
  image: "https://images.example.com/aero-2.jpg",
  link: "https://shop.example.com/aero-2",
};

/** `validProduct` as the API returns it (response field names). */
export const validProductAsReturned = {
  name: validProduct.name,
  description: validProduct.description,
  imageUrl: validProduct.image,
  externalLink: validProduct.link,
};
