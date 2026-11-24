import "server-only";
import type { Evaluation } from "@/features/evaluations/schemas";
import type { Product } from "@/features/products/schemas";
import {
  type ProductSummary,
  SUMMARY_MAX_EVALUATIONS,
  SUMMARY_MAX_POINTS,
  SUMMARY_MIN_EVALUATIONS,
} from "@/features/summaries/schemas";

/** Sends a prompt to the model and returns its structured summary. */
export type SummarizeFn = (prompt: string) => Promise<ProductSummary>;

export type SummaryResult =
  | { status: "ready"; summary: ProductSummary; evaluationCount: number }
  | { status: "not-enough-evaluations"; evaluationCount: number };

/**
 * Identifies one set of evaluations. Any new evaluation changes it, so a
 * summary cached under it is never stale.
 */
export function evaluationsFingerprint(evaluations: Evaluation[]): string {
  return `${evaluations.length}:${evaluations[0]?.id ?? "none"}`;
}

/**
 * Builds the prompt. Product details and comments are user-written, so they
 * go in as JSON data inside clearly marked tags, never as loose text.
 */
export function buildSummaryPrompt(
  product: Pick<Product, "name" | "description">,
  evaluations: Evaluation[],
): string {
  const data = {
    product: { name: product.name, description: product.description },
    evaluations: evaluations
      .slice(0, SUMMARY_MAX_EVALUATIONS)
      .map(({ score, comment }) => ({ score, comment })),
  };
  return [
    "Summarise these evaluations. Scores are from 1 (poor) to 5 (excellent).",
    "<data>",
    JSON.stringify(data, null, 2),
    "</data>",
  ].join("\n");
}

function tidy(summary: ProductSummary): ProductSummary {
  const points = (items: string[]) =>
    items
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, SUMMARY_MAX_POINTS);
  return {
    verdict: summary.verdict.trim(),
    pros: points(summary.pros),
    cons: points(summary.cons),
  };
}

export function createSummaryService({
  summarize,
}: {
  summarize: SummarizeFn;
}) {
  return {
    async summarize(
      product: Pick<Product, "name" | "description">,
      evaluations: Evaluation[],
    ): Promise<SummaryResult> {
      const evaluationCount = evaluations.length;
      if (evaluationCount < SUMMARY_MIN_EVALUATIONS) {
        return { status: "not-enough-evaluations", evaluationCount };
      }
      const summary = await summarize(buildSummaryPrompt(product, evaluations));
      return { status: "ready", summary: tidy(summary), evaluationCount };
    },
  };
}

export type SummaryService = ReturnType<typeof createSummaryService>;
