import { describe, expect, it, vi } from "vitest";
import {
  createProductService,
  type ProductService,
} from "@/server/services/product-service";
import {
  createInMemoryProductRepository,
  makeProductRows,
  validProduct,
  validProductAsReturned,
} from "@/test/in-memory-product-repository";
import {
  createCreateProductHandler,
  createListProductsHandler,
} from "./products-handler";

const API_KEY = "test-products-key";

function setup(count = 0) {
  const { repository, rows } = createInMemoryProductRepository(
    makeProductRows(count),
  );
  const service = createProductService({ repository });
  return {
    GET: createListProductsHandler(() => service),
    POST: createCreateProductHandler(
      () => service,
      () => API_KEY,
    ),
    rows,
  };
}

function failingService(): ProductService {
  const fail = vi.fn().mockRejectedValue(new Error("connection refused"));
  return { list: fail, create: fail, getById: fail };
}

const get = (query = "") =>
  new Request(`http://localhost/api/v1/products${query}`);

function post(body: unknown, authorization = `Bearer ${API_KEY}`) {
  return new Request("http://localhost/api/v1/products", {
    method: "POST",
    headers: { "content-type": "application/json", authorization },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("GET /api/v1/products", () => {
  it("returns 200 with an empty array when there are no products", async () => {
    const { GET } = setup();
    const response = await GET(get());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [], nextCursor: null });
  });

  it("returns 200 with a page and a cursor to the next one", async () => {
    const { GET } = setup(15);

    const first = await GET(get());
    expect(first.status).toBe(200);
    const page1 = await first.json();
    expect(page1.items).toHaveLength(12);
    expect(page1.nextCursor).toEqual(expect.any(String));

    const second = await GET(
      get(`?cursor=${encodeURIComponent(page1.nextCursor)}`),
    );
    const page2 = await second.json();
    expect(page2.items).toHaveLength(3);
    expect(page2.nextCursor).toBeNull();
  });

  it("honours the limit", async () => {
    const { GET } = setup(15);
    const body = await (await GET(get("?limit=5"))).json();
    expect(body.items).toHaveLength(5);
  });

  it("returns 400 for a bad cursor", async () => {
    const { GET } = setup(3);
    const response = await GET(get("?cursor=garbage"));
    expect(response.status).toBe(400);
  });

  it.each(["0", "51", "abc"])("returns 400 for limit=%s", async (limit) => {
    const { GET } = setup(3);
    const response = await GET(get(`?limit=${limit}`));
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors.limit).toBeDefined();
  });

  it("returns 500 without leaking details when the database fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const GET = createListProductsHandler(failingService);

    const response = await GET(get());

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain(
      "connection refused",
    );
    consoleError.mockRestore();
  });
});

describe("POST /api/v1/products", () => {
  it("returns 201 with the created product", async () => {
    const { POST, rows } = setup();

    const response = await POST(post(validProduct));

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.product).toMatchObject({
      id: rows[0].id,
      ...validProductAsReturned,
      score: null,
    });
  });

  it("returns 400 with field errors for invalid fields", async () => {
    const { POST, rows } = setup();

    const response = await POST(
      post({ name: "", image: "http://x.example.com/a.jpg" }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(Object.keys(body.fieldErrors).sort()).toEqual([
      "image",
      "link",
      "name",
    ]);
    expect(rows).toHaveLength(0);
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const { POST } = setup();
    expect((await POST(post("{nope"))).status).toBe(400);
  });

  it("returns 401 without an API key", async () => {
    const { POST, rows } = setup();
    const response = await POST(post(validProduct, ""));
    expect(response.status).toBe(401);
    expect(rows).toHaveLength(0);
  });

  it("returns 401 with a wrong API key", async () => {
    const { POST, rows } = setup();
    const response = await POST(post(validProduct, "Bearer wrong-key"));
    expect(response.status).toBe(401);
    expect(rows).toHaveLength(0);
  });

  it("returns 401 when no API key is configured on the server", async () => {
    const { repository } = createInMemoryProductRepository();
    const POST = createCreateProductHandler(
      () => createProductService({ repository }),
      () => undefined,
    );
    expect((await POST(post(validProduct, "Bearer "))).status).toBe(401);
  });

  it("returns 500 without leaking details when the database fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const POST = createCreateProductHandler(failingService, () => API_KEY);

    const response = await POST(post(validProduct));

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain(
      "connection refused",
    );
    consoleError.mockRestore();
  });
});
