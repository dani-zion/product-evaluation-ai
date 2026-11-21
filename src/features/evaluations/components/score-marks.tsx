import { EVALUATION_SCORE_MAX } from "@/features/evaluations/schemas";
import { cn } from "@/lib/utils";

/** The score as five small marker strokes, filled up to the score. */
export function ScoreMarks({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`${score} out of ${EVALUATION_SCORE_MAX}`}
      className={cn("inline-flex items-center gap-1", className)}
    >
      {Array.from({ length: EVALUATION_SCORE_MAX }, (_, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed set of marks
          key={index}
          aria-hidden
          className={cn(
            "h-2 w-4 -skew-x-12 rounded-[2px]",
            index < score ? "bg-marker" : "bg-secondary",
          )}
        />
      ))}
    </span>
  );
}
