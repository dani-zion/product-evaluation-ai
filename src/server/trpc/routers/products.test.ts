import { describe, expect, it, vi } from "vitest";
import {
  createProductService,
  type ProductService,
} from "@/server/services/product-service";
import { createCallerFactory } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/routers/_app";
import {
  createInMemoryProductRepository,
  makeProductRows,
} from "@/test/in-memory-product-repository";

function caller(service: ProductService) {
  return createCallerFactory(appRouter)({
    getAccountService: () => {
      throw new Error("not used");
    },
    getProductService: () => service,
    getEvaluationService: () => {
      throw new Error("not used");
    },
    session: null,
    sessionCookie: { set: async () => {}, clear: async () => {} },
  });
}

function setup(count = 0) {
  const { repository } = createInMemoryProductRepository(
    makeProductRows(count),
  );
  return caller(createProductService({ repository }));
}

describe("tRPC products.list", () => {
  it("returns an empty page when there are no products", async () => {
    expect(await setup().products.list({})).toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it("pages through every product with the cursor (infinite scroll)", async () => {
    const api = setup(30);
    const ids: string[] = [];
    let cursor: string | null | undefined;
    do {
      const page = await api.products.list({ limit: 12, cursor });
      ids.push(...page.items.map((p) => p.id));
      cursor = page.nextCursor;
    } while (cursor);
    expect(ids).toHaveLength(30);
    expect(new Set(ids).size).toBe(30);
  });

  it("fails with BAD_REQUEST for a bad cursor or limit", async () => {
    const api = setup(3);
    await expect(
      api.products.list({ cursor: "garbage" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(api.products.list({ limit: 100 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("fails with INTERNAL_SERVER_ERROR without leaking details", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const fail = vi.fn().mockRejectedValue(new Error("connection refused"));
    const api = caller({ list: fail, create: fail, getById: fail });

    const error = await api.products.list({}).catch((e) => e);

    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(error.message).not.toContain("connection refused");
    consoleError.mockRestore();
  });
});
