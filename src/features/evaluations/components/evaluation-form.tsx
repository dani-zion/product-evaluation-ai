"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useEvaluations } from "@/features/evaluations/components/evaluations-provider";
import { ScoreInput } from "@/features/evaluations/components/score-input";
import { useCreateEvaluation } from "@/features/evaluations/hooks/use-create-evaluation";
import {
  EVALUATION_COMMENT_MAX,
  type EvaluationFormInput,
  type EvaluationFormValues,
  evaluationFormSchema,
} from "@/features/evaluations/schemas";
import { cn } from "@/lib/utils";

type EvaluationFormProps = {
  productId: string;
  /** The signed-in account, shown as the author of the optimistic item. */
  viewer: { id: string; displayName: string };
};

const UNAUTHORIZED_MESSAGE =
  "Your session has ended. Sign in again to add your evaluation.";

/** Score and comment for signed-in accounts; the item appears in the list at once. */
export function EvaluationForm({ productId, viewer }: EvaluationFormProps) {
  const { addPending, confirm, discard } = useEvaluations();
  const createEvaluation = useCreateEvaluation();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EvaluationFormValues, unknown, EvaluationFormInput>({
    resolver: zodResolver(evaluationFormSchema),
    // Show errors after a field is left, then update them as the person types.
    mode: "onTouched",
    shouldFocusError: true,
    defaultValues: { score: 0, comment: "" },
  });

  function onSubmit(values: EvaluationFormInput) {
    setServerError(null);
    const pendingId = `pending-${crypto.randomUUID()}`;
    addPending({
      id: pendingId,
      productId,
      score: values.score,
      comment: values.comment,
      createdAt: new Date().toISOString(),
      author: viewer,
    });

    createEvaluation.mutate(
      { productId, ...values },
      {
        onSuccess: (evaluation) => {
          confirm(pendingId, evaluation);
          form.reset();
          toast.success("Evaluation added");
        },
        onError: (error) => {
          discard(pendingId);
          const fieldErrors = error.data?.fieldErrors;
          if (fieldErrors) {
            for (const field of ["score", "comment"] as const) {
              const message = fieldErrors[field]?.[0];
              if (message) form.setError(field, { message });
            }
          }
          setServerError(
            error.data?.code === "UNAUTHORIZED"
              ? UNAUTHORIZED_MESSAGE
              : error.message,
          );
        },
      },
    );
  }

  const pending = createEvaluation.isPending;

  return (
    <form
      noValidate
      aria-labelledby="evaluation-form-title"
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6 rounded-2xl border bg-card p-6 sm:p-8"
    >
      <h2 id="evaluation-form-title" className="font-display text-3xl">
        Add your evaluation
      </h2>
      <FieldGroup className="gap-7">
        {serverError && (
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/10 px-4 py-3"
          >
            <CircleAlertIcon />
            <AlertTitle>Your evaluation wasn't added</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <Controller
          name="score"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <ScoreInput
                ref={field.ref}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={fieldState.invalid}
                disabled={pending}
                describedBy={fieldState.invalid ? "score-error" : undefined}
              />
              {fieldState.invalid && (
                <FieldError id="score-error" errors={[fieldState.error]} />
              )}
            </div>
          )}
        />
        <Controller
          name="comment"
          control={form.control}
          render={({ field, fieldState }) => {
            const length = field.value.length;
            const over = length > EVALUATION_COMMENT_MAX;
            return (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-baseline justify-between gap-4">
                  <FieldLabel htmlFor="comment">Comment</FieldLabel>
                  <span
                    id="comment-count"
                    className={cn(
                      "text-sm tabular-nums",
                      over ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {length} / {EVALUATION_COMMENT_MAX}
                  </span>
                </div>
                <Textarea
                  {...field}
                  id="comment"
                  rows={4}
                  placeholder="What stood out, good or bad?"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? "comment-error comment-count"
                      : "comment-count"
                  }
                  disabled={pending}
                  className="min-h-32 bg-background px-3 py-2.5 text-base md:text-base dark:bg-background"
                />
                {fieldState.invalid && (
                  <FieldError id="comment-error" errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />
        <Button
          type="submit"
          className="h-12 w-full text-base sm:w-auto sm:self-start sm:px-6"
          disabled={pending}
        >
          {pending && <Loader2Icon className="animate-spin" />}
          {pending ? "Adding" : "Add evaluation"}
        </Button>
      </FieldGroup>
    </form>
  );
}
