import { describe, expect, it } from "vitest";
import { formatDisplayName } from "@/features/evaluations/schemas";
import { ProductNotFoundError } from "@/server/errors";
import { createProductService } from "@/server/services/product-service";
import {
  adaAccount,
  createInMemoryEvaluationRepository,
  graceAccount,
  makeEvaluationRow,
  testAccounts,
} from "@/test/in-memory-evaluation-repository";
import {
  createInMemoryProductRepository,
  makeProductRows,
} from "@/test/in-memory-product-repository";
import { createEvaluationService } from "./evaluation-service";

function setup(initial = [] as ReturnType<typeof makeEvaluationRow>[]) {
  const products = createInMemoryProductRepository(makeProductRows(2));
  const productService = createProductService({
    repository: products.repository,
  });
  const { repository, rows } = createInMemoryEvaluationRepository({
    initial,
    accounts: testAccounts,
  });
  let counter = 0;
  const service = createEvaluationService({
    repository,
    productService,
    generateId: () => `eval-${++counter}`,
  });
  return { service, rows };
}

const input = {
  productId: "product-000",
  score: 4 as const,
  comment: "Comfortable for long calls.",
};

describe("EvaluationService.create", () => {
  it("stores the evaluation and returns it with the author's public name", async () => {
    const { service, rows } = setup();

    const evaluation = await service.create(adaAccount.id, input);

    expect(evaluation).toEqual({
      id: "eval-1",
      productId: "product-000",
      score: 4,
      comment: "Comfortable for long calls.",
      createdAt: expect.any(String),
      author: { id: adaAccount.id, displayName: "Ada L." },
    });
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(evaluation)).not.toContain("@");
  });

  it("throws ProductNotFoundError for an unknown product", async () => {
    const { service, rows } = setup();

    await expect(
      service.create(adaAccount.id, { ...input, productId: "nope" }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
    expect(rows).toHaveLength(0);
  });

  it("allows several evaluations of a product by the same account", async () => {
    const { service } = setup();
    await service.create(adaAccount.id, input);
    await service.create(adaAccount.id, { ...input, score: 2 });
    expect(await service.list("product-000")).toHaveLength(2);
  });
});

describe("EvaluationService.list", () => {
  it("returns an empty list for a product without evaluations", async () => {
    const { service } = setup();
    expect(await service.list("product-001")).toEqual([]);
  });

  it("returns only the product's evaluations, newest first", async () => {
    const { service } = setup([
      makeEvaluationRow({ id: "a", created_at: "2026-11-01T10:00:00.000Z" }),
      makeEvaluationRow({ id: "b", created_at: "2026-11-03T10:00:00.000Z" }),
      makeEvaluationRow({ id: "c", created_at: "2026-11-02T10:00:00.000Z" }),
      makeEvaluationRow({ id: "other", product_id: "product-001" }),
    ]);

    const items = await service.list("product-000");

    expect(items.map((item) => item.id)).toEqual(["b", "c", "a"]);
  });

  it("formats each author's display name", async () => {
    const { service } = setup([
      makeEvaluationRow({
        id: "a",
        account_id: graceAccount.id,
        author: graceAccount,
      }),
      makeEvaluationRow({ id: "b", account_id: "gone", author: null }),
    ]);

    const names = (await service.list("product-000")).map(
      (item) => item.author.displayName,
    );

    expect(names.sort()).toEqual(["Anonymous", "Grace H."]);
  });

  it("throws ProductNotFoundError for an unknown product", async () => {
    const { service } = setup();
    await expect(service.list("nope")).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
  });
});

describe("formatDisplayName", () => {
  it.each([
    ["Ada", "Lovelace", "Ada L."],
    ["  Grace ", " hopper", "Grace H."],
    ["Ada", "", "Ada"],
    ["", "Lovelace", "L."],
    ["", "", "Anonymous"],
    ["Zoë", "Émile", "Zoë É."],
  ])("formats %j %j as %j", (first, last, expected) => {
    expect(formatDisplayName(first, last)).toBe(expected);
  });
});
