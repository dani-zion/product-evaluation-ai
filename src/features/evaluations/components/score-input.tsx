"use client";

import { type Ref, useId } from "react";
import {
  EVALUATION_SCORE_MAX,
  EVALUATION_SCORE_MIN,
} from "@/features/evaluations/schemas";
import { cn } from "@/lib/utils";

const SCORES = Array.from(
  { length: EVALUATION_SCORE_MAX - EVALUATION_SCORE_MIN + 1 },
  (_, index) => EVALUATION_SCORE_MIN + index,
);

/** Plain words for each score, shown under the choices. */
const SCORE_WORDS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

type ScoreInputProps = {
  name: string;
  /** The chosen score, or 0 when none is chosen yet. */
  value: number;
  onChange: (score: number) => void;
  onBlur: () => void;
  /** Receives the first choice, so the form can focus it on an error. */
  ref?: Ref<HTMLInputElement>;
  invalid?: boolean;
  disabled?: boolean;
  /** Id of the element that describes the group (e.g. its error). */
  describedBy?: string;
};

/**
 * Five large choices built on native radio inputs, so Tab enters the group
 * and the arrow keys move between scores. Choices up to the selected score are
 * tinted, the selected one is filled with the marker.
 */
export function ScoreInput({
  name,
  value,
  onChange,
  onBlur,
  ref,
  invalid = false,
  disabled = false,
  describedBy,
}: ScoreInputProps) {
  const legendId = useId();
  const word = SCORE_WORDS[value];

  return (
    <fieldset
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      className="flex flex-col gap-3"
    >
      <legend
        id={legendId}
        className="mb-3 flex w-full items-baseline justify-between gap-4 font-medium"
      >
        Your score
        <span
          aria-hidden
          className={cn(
            "font-normal text-sm",
            word ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {word
            ? `${value} out of ${EVALUATION_SCORE_MAX}, ${word}`
            : "Pick 1 to 5"}
        </span>
      </legend>
      <div className="grid grid-cols-5 gap-2">
        {SCORES.map((score, index) => {
          const checked = value === score;
          const reached = value >= score;
          return (
            <label
              key={score}
              className={cn(
                "relative flex h-14 cursor-pointer select-none items-center justify-center rounded-lg border bg-card transition-colors",
                "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
                reached && !checked && "border-marker/40 bg-marker/10",
                checked
                  ? "border-marker bg-marker text-ink"
                  : "hover:border-muted-foreground/60",
                invalid && !value && "border-destructive/60",
              )}
            >
              <input
                ref={index === 0 ? ref : undefined}
                type="radio"
                name={name}
                value={score}
                checked={checked}
                onChange={() => onChange(score)}
                onBlur={onBlur}
                className="sr-only"
              />
              <span aria-hidden className="font-display text-3xl tabular-nums">
                {score}
              </span>
              <span className="sr-only">
                {score} out of {EVALUATION_SCORE_MAX}, {SCORE_WORDS[score]}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
