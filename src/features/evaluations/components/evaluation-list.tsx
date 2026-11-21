import type { ReactNode } from "react";
import { UserAvatar } from "@/components/user-avatar";
import {
  AddedEvaluations,
  EvaluationsEmpty,
} from "@/features/evaluations/components/added-evaluations";
import { EvaluationItem } from "@/features/evaluations/components/evaluation-item";
import type { Evaluation } from "@/features/evaluations/schemas";

const AVATAR_SIZE = 40;

type EvaluationListProps = {
  /** Evaluations from the server, newest first. */
  evaluations: Evaluation[];
  /** The signed-in account's avatar, for evaluations added on the page. */
  viewerAvatar: ReactNode;
};

/** Every evaluation of the product, newest first. Avatars render on the server. */
export function EvaluationList({
  evaluations,
  viewerAvatar,
}: EvaluationListProps) {
  return (
    <>
      <ol aria-label="Evaluations, newest first" className="flex flex-col">
        <AddedEvaluations avatar={viewerAvatar} />
        {evaluations.map((evaluation) => (
          <EvaluationItem
            key={evaluation.id}
            evaluation={evaluation}
            avatar={
              <UserAvatar
                seed={evaluation.author.id}
                name={evaluation.author.displayName}
                size={AVATAR_SIZE}
              />
            }
          />
        ))}
      </ol>
      {evaluations.length === 0 && <EvaluationsEmpty />}
    </>
  );
}

export function EvaluationAvatar({
  seed,
  name,
}: {
  seed: string;
  name: string;
}) {
  return <UserAvatar seed={seed} name={name} size={AVATAR_SIZE} />;
}
