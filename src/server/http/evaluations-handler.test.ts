import { describe, expect, it, vi } from "vitest";
import type { Session } from "@/server/auth/session";
import type { EvaluationService } from "@/server/services/evaluation-service";
import { createTestEvaluationService } from "@/test/evaluation-fixtures";
import {
  adaAccount,
  makeEvaluationRow,
} from "@/test/in-memory-evaluation-repository";
import {
  createCreateEvaluationHandler,
  createListEvaluationsHandler,
} from "./evaluations-handler";

const adaSession: Session = {
  accountId: adaAccount.id,
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
};

function setup({
  session = adaSession,
  initial = [],
}: {
  session?: Session | null;
  initial?: ReturnType<typeof makeEvaluationRow>[];
} = {}) {
  const { service, rows } = createTestEvaluationService(initial);
  return {
    GET: createListEvaluationsHandler(() => service),
    POST: createCreateEvaluationHandler(
      () => service,
      async () => session,
    ),
    rows,
  };
}

function failingService(): EvaluationService {
  const fail = vi.fn().mockRejectedValue(new Error("connection refused"));
  return { list: fail, create: fail };
}

const get = (query = "") =>
  new Request(`http://localhost/api/v1/evaluations${query}`);

function post(body: unknown) {
  return new Request("http://localhost/api/v1/evaluations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = {
  productId: "product-000",
  score: 5,
  comment: "  Worth every cent.  ",
};

describe("GET /api/v1/evaluations", () => {
  it("returns 200 with an empty array when the product has no evaluations", async () => {
    const { GET } = setup();
    const response = await GET(get("?productId=product-000"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [] });
  });

  it("returns 200 with the product's evaluations, newest first", async () => {
    const { GET } = setup({
      initial: [
        makeEvaluationRow({ id: "old", created_at: "2026-11-01T00:00:00Z" }),
        makeEvaluationRow({ id: "new", created_at: "2026-11-05T00:00:00Z" }),
      ],
    });

    const response = await GET(get("?productId=product-000"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items.map((item: { id: string }) => item.id)).toEqual([
      "new",
      "old",
    ]);
    expect(body.items[0].author).toEqual({
      id: adaAccount.id,
      displayName: "Ada L.",
    });
  });

  it.each([
    "",
    "?productId=",
    "?productId=%20",
  ])("returns 400 when productId is missing (%j)", async (query) => {
    const { GET } = setup();
    const response = await GET(get(query));
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors.productId).toBeDefined();
  });

  it("returns 404 for an unknown product", async () => {
    const { GET } = setup();
    const response = await GET(get("?productId=nope"));
    expect(response.status).toBe(404);
  });

  it("returns 500 without leaking details when the database fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const GET = createListEvaluationsHandler(failingService);

    const response = await GET(get("?productId=product-000"));

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain(
      "connection refused",
    );
    consoleError.mockRestore();
  });
});

describe("POST /api/v1/evaluations", () => {
  it("returns 201 with the created evaluation", async () => {
    const { POST, rows } = setup();

    const response = await POST(post(valid));

    expect(response.status).toBe(201);
    const { evaluation } = await response.json();
    expect(evaluation).toMatchObject({
      id: rows[0].id,
      productId: "product-000",
      score: 5,
      comment: "Worth every cent.",
      author: { id: adaAccount.id, displayName: "Ada L." },
    });
    expect(rows[0].account_id).toBe(adaAccount.id);
  });

  it("returns 401 without a session and stores nothing", async () => {
    const { POST, rows } = setup({ session: null });
    const response = await POST(post(valid));
    expect(response.status).toBe(401);
    expect(rows).toHaveLength(0);
  });

  it.each([
    ["score 0", { ...valid, score: 0 }, "score"],
    ["score 6", { ...valid, score: 6 }, "score"],
    ["a short comment", { ...valid, comment: "  a " }, "comment"],
    ["no product id", { score: 3, comment: "Fine." }, "productId"],
  ])("returns 400 for %s", async (_name, body, field) => {
    const { POST, rows } = setup();
    const response = await POST(post(body));
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors[field]).toBeDefined();
    expect(rows).toHaveLength(0);
  });

  it("returns 400 for invalid JSON", async () => {
    const { POST } = setup();
    const response = await POST(post("{nope"));
    expect(response.status).toBe(400);
  });

  it("returns 404 for an unknown product", async () => {
    const { POST, rows } = setup();
    const response = await POST(post({ ...valid, productId: "nope" }));
    expect(response.status).toBe(404);
    expect(rows).toHaveLength(0);
  });

  it("returns 500 without leaking details when the database fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const POST = createCreateEvaluationHandler(
      failingService,
      async () => adaSession,
    );

    const response = await POST(post(valid));

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain(
      "connection refused",
    );
    consoleError.mockRestore();
  });
});
