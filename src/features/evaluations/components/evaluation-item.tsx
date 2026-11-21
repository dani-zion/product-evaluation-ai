import { format, formatDistanceToNow } from "date-fns";
import type { ReactNode } from "react";
import { ScoreMarks } from "@/features/evaluations/components/score-marks";
import type { Evaluation } from "@/features/evaluations/schemas";
import { cn } from "@/lib/utils";

type EvaluationItemProps = {
  evaluation: Evaluation;
  /** The author's rendered <UserAvatar />. */
  avatar: ReactNode;
  /** True while the evaluation is still being saved. */
  pending?: boolean;
};

/**
 * One evaluation: author, score, date, then the comment. Has no client-only
 * code, so it renders on the server for the list and in the browser for
 * evaluations added on the page.
 */
export function EvaluationItem({
  evaluation,
  avatar,
  pending = false,
}: EvaluationItemProps) {
  const createdAt = new Date(evaluation.createdAt);

  return (
    <li
      aria-busy={pending || undefined}
      className={cn(
        "flex gap-4 border-b py-6 first:pt-2 last:border-b-0",
        pending && "opacity-60",
      )}
    >
      {/* The name is right next to it, so the avatar is decorative here. */}
      <span aria-hidden className="shrink-0">
        {avatar}
      </span>
      <article className="flex min-w-0 flex-1 flex-col gap-2">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-semibold">{evaluation.author.displayName}</h3>
          <ScoreMarks score={evaluation.score} />
          {pending ? (
            <span className="text-muted-foreground text-sm">Adding</span>
          ) : (
            <time
              dateTime={evaluation.createdAt}
              title={format(createdAt, "PPP 'at' p")}
              className="text-muted-foreground text-sm"
            >
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </time>
          )}
        </header>
        <p className="max-w-[68ch] whitespace-pre-line break-words leading-relaxed">
          {evaluation.comment}
        </p>
      </article>
    </li>
  );
}
