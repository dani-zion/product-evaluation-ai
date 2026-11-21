import { describe, expect, it } from "vitest";
import type { Session } from "@/server/auth/session";
import { createCallerFactory } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/routers/_app";
import { createTestEvaluationService } from "@/test/evaluation-fixtures";
import { adaAccount } from "@/test/in-memory-evaluation-repository";

const adaSession: Session = {
  accountId: adaAccount.id,
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
};

function setup(session: Session | null = null) {
  const { service, rows } = createTestEvaluationService();
  const caller = createCallerFactory(appRouter)({
    getAccountService: () => {
      throw new Error("not used");
    },
    getProductService: () => {
      throw new Error("not used");
    },
    getEvaluationService: () => service,
    session,
    sessionCookie: { set: async () => {}, clear: async () => {} },
  });
  return { caller, rows };
}

const valid = {
  productId: "product-000",
  score: 4,
  comment: "Does what it says.",
};

describe("tRPC evaluations.create", () => {
  it("fails with UNAUTHORIZED without a session and stores nothing", async () => {
    const { caller, rows } = setup(null);
    await expect(caller.evaluations.create(valid)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(rows).toHaveLength(0);
  });

  it("adds the evaluation as the signed-in account", async () => {
    const { caller } = setup(adaSession);

    const evaluation = await caller.evaluations.create(valid);

    expect(evaluation).toMatchObject({
      productId: "product-000",
      score: 4,
      author: { id: adaAccount.id, displayName: "Ada L." },
    });
    const { items } = await caller.evaluations.list({
      productId: "product-000",
    });
    expect(items.map((item) => item.id)).toEqual([evaluation.id]);
  });

  it("fails with BAD_REQUEST and field errors for invalid input", async () => {
    const { caller } = setup(adaSession);
    const error = await caller.evaluations
      .create({ ...valid, score: 6 })
      .catch((e) => e);
    expect(error.code).toBe("BAD_REQUEST");
  });

  it("fails with NOT_FOUND for an unknown product", async () => {
    const { caller } = setup(adaSession);
    await expect(
      caller.evaluations.create({ ...valid, productId: "nope" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("tRPC evaluations.list", () => {
  it("is public and returns an empty list", async () => {
    const { caller } = setup(null);
    expect(await caller.evaluations.list({ productId: "product-001" })).toEqual(
      { items: [] },
    );
  });

  it("fails with NOT_FOUND for an unknown product", async () => {
    const { caller } = setup(null);
    await expect(
      caller.evaluations.list({ productId: "nope" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
