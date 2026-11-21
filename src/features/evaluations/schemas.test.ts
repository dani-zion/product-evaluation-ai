import { describe, expect, it } from "vitest";
import {
  createEvaluationSchema,
  EVALUATION_COMMENT_MAX,
  listEvaluationsSchema,
  summarizeScores,
} from "./schemas";

const valid = {
  productId: "product-000",
  score: 5,
  comment: "Great value.",
};

describe("createEvaluationSchema", () => {
  it.each([1, 2, 3, 4, 5])("accepts score %i", (score) => {
    expect(createEvaluationSchema.safeParse({ ...valid, score }).success).toBe(
      true,
    );
  });

  it.each([
    0,
    6,
    2.5,
    -1,
    "3",
    null,
    undefined,
  ])("rejects score %j", (score) => {
    const result = createEvaluationSchema.safeParse({ ...valid, score });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["score"]);
  });

  it("trims the comment", () => {
    const result = createEvaluationSchema.parse({
      ...valid,
      comment: "   Great value.  \n",
    });
    expect(result.comment).toBe("Great value.");
  });

  it("checks the comment length after trimming", () => {
    const tooShort = createEvaluationSchema.safeParse({
      ...valid,
      comment: "  ok    ",
    });
    expect(tooShort.success).toBe(false);

    expect(
      createEvaluationSchema.safeParse({ ...valid, comment: "  abc  " })
        .success,
    ).toBe(true);

    const padded = `  ${"a".repeat(EVALUATION_COMMENT_MAX)}  `;
    expect(
      createEvaluationSchema.safeParse({ ...valid, comment: padded }).success,
    ).toBe(true);

    expect(
      createEvaluationSchema.safeParse({
        ...valid,
        comment: "a".repeat(EVALUATION_COMMENT_MAX + 1),
      }).success,
    ).toBe(false);
  });

  it("requires a product id", () => {
    expect(
      createEvaluationSchema.safeParse({ ...valid, productId: "  " }).success,
    ).toBe(false);
    expect(listEvaluationsSchema.safeParse({}).success).toBe(false);
  });
});

describe("summarizeScores", () => {
  it("returns a null average without scores", () => {
    expect(summarizeScores([])).toEqual({ count: 0, average: null });
  });

  it("returns the exact average", () => {
    expect(summarizeScores([5, 4, 4])).toEqual({
      count: 3,
      average: 13 / 3,
    });
  });
});
