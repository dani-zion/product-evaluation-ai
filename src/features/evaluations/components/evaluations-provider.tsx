"use client";

import { createContext, type ReactNode, use, useMemo, useState } from "react";
import {
  type Evaluation,
  summarizeScores,
} from "@/features/evaluations/schemas";

/** An evaluation added on this page; `pending` until the server confirms it. */
export type AddedEvaluation = Evaluation & { pending: boolean };

type EvaluationsContextValue = {
  /** Evaluations added on this page, newest first. Not in the server list. */
  added: AddedEvaluation[];
  /** Count and exact average of every evaluation shown, added ones included. */
  summary: { count: number; average: number | null };
  /** Shows an evaluation at the top of the list before the server confirms it. */
  addPending: (evaluation: Evaluation) => void;
  /** Swaps the pending evaluation for the one the server stored. */
  confirm: (pendingId: string, evaluation: Evaluation) => void;
  /** Removes a pending evaluation whose request failed. */
  discard: (pendingId: string) => void;
};

const EvaluationsContext = createContext<EvaluationsContextValue | null>(null);

/**
 * Holds the evaluations added on this page so the list, the score summary and
 * the form stay in step without refetching the server list.
 */
export function EvaluationsProvider({
  initialScores,
  children,
}: {
  /** Scores of the evaluations rendered by the server. */
  initialScores: number[];
  children: ReactNode;
}) {
  const [added, setAdded] = useState<AddedEvaluation[]>([]);

  const value = useMemo<EvaluationsContextValue>(
    () => ({
      added,
      summary: summarizeScores([
        ...added.map((evaluation) => evaluation.score),
        ...initialScores,
      ]),
      addPending: (evaluation) =>
        setAdded((current) => [{ ...evaluation, pending: true }, ...current]),
      confirm: (pendingId, evaluation) =>
        setAdded((current) =>
          current.map((item) =>
            item.id === pendingId ? { ...evaluation, pending: false } : item,
          ),
        ),
      discard: (pendingId) =>
        setAdded((current) => current.filter((item) => item.id !== pendingId)),
    }),
    [added, initialScores],
  );

  return <EvaluationsContext value={value}>{children}</EvaluationsContext>;
}

export function useEvaluations(): EvaluationsContextValue {
  const value = use(EvaluationsContext);
  if (!value) {
    throw new Error("useEvaluations must be used inside <EvaluationsProvider>");
  }
  return value;
}
