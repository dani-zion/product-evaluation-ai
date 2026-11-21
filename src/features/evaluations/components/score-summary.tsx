"use client";

import { useEvaluations } from "@/features/evaluations/components/evaluations-provider";
import { EVALUATION_SCORE_MAX } from "@/features/evaluations/schemas";

const averageFormat = new Intl.NumberFormat("en", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** "4.3 / 5 · 12 evaluations" in a marker highlight, updated as evaluations are added. */
export function ScoreSummary() {
  const { summary } = useEvaluations();

  return (
    <p aria-live="polite" className="font-display text-3xl sm:text-4xl">
      {summary.average === null ? (
        <span className="text-muted-foreground">No evaluations yet</span>
      ) : (
        <span className="marker tabular-nums">
          {averageFormat.format(summary.average)} / {EVALUATION_SCORE_MAX} ·{" "}
          {summary.count} {summary.count === 1 ? "evaluation" : "evaluations"}
        </span>
      )}
    </p>
  );
}
