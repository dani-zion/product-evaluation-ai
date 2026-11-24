import { z } from "zod";

/** Summaries need at least this many evaluations to say anything useful. */
export const SUMMARY_MIN_EVALUATIONS = 2;
/** The newest evaluations the agent reads; older ones are left out. */
export const SUMMARY_MAX_EVALUATIONS = 60;
export const SUMMARY_MAX_POINTS = 3;

/**
 * What the summary agent returns. Kept free of length constraints so it works
 * with OpenAI's strict structured outputs; limits are applied after parsing.
 */
export const productSummarySchema = z.object({
  verdict: z
    .string()
    .describe(
      "One plain sentence, at most 20 words, saying who the product suits based on the evaluations.",
    ),
  pros: z
    .array(z.string())
    .describe(
      "Up to 3 things evaluators like, each a short phrase of at most 8 words.",
    ),
  cons: z
    .array(z.string())
    .describe(
      "Up to 3 things evaluators warn about, each a short phrase of at most 8 words. Empty if there are none.",
    ),
});

export type ProductSummary = z.output<typeof productSummarySchema>;
