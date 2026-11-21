import { z } from "zod";

export const EVALUATION_SCORE_MIN = 1;
export const EVALUATION_SCORE_MAX = 5;
export const EVALUATION_COMMENT_MIN = 3;
export const EVALUATION_COMMENT_MAX = 1000;

export type EvaluationScore = 1 | 2 | 3 | 4 | 5;

/** What the API returns for an evaluation (camelCase, ISO dates). */
export type Evaluation = {
  id: string;
  productId: string;
  score: EvaluationScore;
  comment: string;
  createdAt: string;
  /** Public author details only: the email is never exposed. */
  author: { id: string; displayName: string };
};

const SCORE_MESSAGE = `Choose a score from ${EVALUATION_SCORE_MIN} to ${EVALUATION_SCORE_MAX}`;

const productIdSchema = z
  .string({ error: "Product id is required" })
  .trim()
  .min(1, "Product id is required")
  .max(64, "Product id is too long");

export const evaluationScoreSchema = z
  .number({ error: SCORE_MESSAGE })
  .int(SCORE_MESSAGE)
  .min(EVALUATION_SCORE_MIN, SCORE_MESSAGE)
  .max(EVALUATION_SCORE_MAX, SCORE_MESSAGE)
  .transform((score) => score as EvaluationScore);

export const evaluationCommentSchema = z
  .string({ error: "Write a comment" })
  .trim()
  .min(
    EVALUATION_COMMENT_MIN,
    `Write at least ${EVALUATION_COMMENT_MIN} characters`,
  )
  .max(
    EVALUATION_COMMENT_MAX,
    `Keep it to ${EVALUATION_COMMENT_MAX} characters or fewer`,
  );

/** The fields a person fills in on the evaluation form. */
export const evaluationFormSchema = z.object({
  score: evaluationScoreSchema,
  comment: evaluationCommentSchema,
});

export type EvaluationFormValues = z.input<typeof evaluationFormSchema>;
export type EvaluationFormInput = z.output<typeof evaluationFormSchema>;

/** Input for POST /api/v1/evaluations and tRPC evaluations.create. */
export const createEvaluationSchema = evaluationFormSchema.extend({
  productId: productIdSchema,
});

export type CreateEvaluationInput = z.output<typeof createEvaluationSchema>;

/** Query for GET /api/v1/evaluations and tRPC evaluations.list. */
export const listEvaluationsSchema = z.object({ productId: productIdSchema });

/**
 * The public name of an author: first name plus last initial ("Ada L.").
 * Falls back to whichever part exists.
 */
export function formatDisplayName(firstName: string, lastName: string): string {
  const first = firstName.trim();
  const initial = Array.from(lastName.trim())[0]?.toUpperCase();
  if (!first) return initial ? `${initial}.` : "Anonymous";
  return initial ? `${first} ${initial}.` : first;
}

/** Count and exact average of a set of evaluations; average is null when empty. */
export function summarizeScores(scores: readonly number[]): {
  count: number;
  average: number | null;
} {
  if (scores.length === 0) return { count: 0, average: null };
  const sum = scores.reduce((total, score) => total + score, 0);
  return { count: scores.length, average: sum / scores.length };
}
