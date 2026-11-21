"use client";

import type { ReactNode } from "react";
import { EvaluationItem } from "@/features/evaluations/components/evaluation-item";
import { useEvaluations } from "@/features/evaluations/components/evaluations-provider";

/**
 * Evaluations added on this page, shown above the server-rendered list. They
 * are always by the signed-in account, so they share its avatar.
 */
export function AddedEvaluations({ avatar }: { avatar: ReactNode }) {
  const { added } = useEvaluations();
  return added.map((evaluation) => (
    <EvaluationItem
      key={evaluation.id}
      evaluation={evaluation}
      avatar={avatar}
      pending={evaluation.pending}
    />
  ));
}

/** The empty state, hidden as soon as an evaluation is added on the page. */
export function EvaluationsEmpty() {
  const { added } = useEvaluations();
  if (added.length > 0) return null;
  return (
    <p className="rounded-xl border border-dashed px-5 py-8 text-muted-foreground">
      No evaluations yet. Be the first.
    </p>
  );
}
