import { MinusIcon, PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TallyMark } from "@/components/tally-logo";
import { SUMMARY_MIN_EVALUATIONS } from "@/features/summaries/schemas";
import { getCachedProductSummary } from "@/server/ai/cached-product-summary";

/**
 * Tally's AI summary of a product's evaluations, between the product details
 * and the evaluation list. Renders inside <Suspense> with
 * <ProductSummarySkeleton /> while the agent writes it.
 */
export async function ProductSummary({
  productId,
  fingerprint,
}: {
  productId: string;
  fingerprint: string;
}) {
  let result: Awaited<ReturnType<typeof getCachedProductSummary>>;
  try {
    result = await getCachedProductSummary(productId, fingerprint);
  } catch (error) {
    // Missing OPENAI_API_KEY, rate limits, model errors: the rest of the page
    // still works, so explain instead of failing it.
    // Log the message as a string: error objects serialize to {} in the
    // dev log file, which hid causes like an exhausted OpenAI quota.
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`product summary failed for ${productId}: ${reason}`);
    return (
      <SummaryPanel>
        <p className="text-muted-foreground">
          The summary isn't available right now. The evaluations below are still
          up to date.
        </p>
      </SummaryPanel>
    );
  }
  if (!result) return null;

  if (result.status === "not-enough-evaluations") {
    return (
      <SummaryPanel>
        <p className="text-muted-foreground">
          Tally writes a summary once a product has {SUMMARY_MIN_EVALUATIONS}{" "}
          evaluations.{" "}
          {result.evaluationCount === 0
            ? "Be the first to add one."
            : "One more and it's ready."}
        </p>
      </SummaryPanel>
    );
  }

  const { summary, evaluationCount } = result;
  return (
    <SummaryPanel
      note={`Written by AI from ${evaluationCount} evaluations. It can make mistakes, so check the evaluations below.`}
    >
      <p className="font-display text-3xl leading-[1.3] sm:text-4xl sm:leading-[1.3]">
        <span className="marker">{summary.verdict}</span>
      </p>
      {summary.pros.length > 0 || summary.cons.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
          <PointList
            title="What people like"
            points={summary.pros}
            icon={<PlusIcon aria-hidden className="size-4 text-sage" />}
          />
          <PointList
            title="What to watch for"
            points={summary.cons}
            empty="Nobody has raised a problem yet."
            icon={<MinusIcon aria-hidden className="size-4 text-destructive" />}
          />
        </div>
      ) : null}
    </SummaryPanel>
  );
}

function SummaryPanel({
  children,
  note,
}: {
  children: ReactNode;
  note?: string;
}) {
  return (
    <section
      aria-labelledby="summary-title"
      className="flex max-w-3xl flex-col gap-6 rounded-2xl border border-marker/35 bg-card p-6 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <TallyMark size={36} />
        <h2 id="summary-title" className="font-display text-3xl">
          Tally's summary
        </h2>
      </div>
      {children}
      {note ? (
        <p className="border-t pt-4 text-muted-foreground text-sm">{note}</p>
      ) : null}
    </section>
  );
}

function PointList({
  title,
  points,
  icon,
  empty,
}: {
  title: string;
  points: string[];
  icon: ReactNode;
  empty?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-medium">{title}</h3>
      {points.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <span className="mt-1">{icon}</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

/** Shown while the agent reads the evaluations (usually a few seconds). */
export function ProductSummarySkeleton() {
  return (
    <SummaryPanel>
      <div className="flex flex-col gap-3" aria-hidden>
        <div className="h-9 w-11/12 rounded bg-secondary motion-safe:animate-pulse" />
        <div className="h-9 w-2/3 rounded bg-secondary motion-safe:animate-pulse" />
      </div>
      <output className="block text-muted-foreground text-sm">
        Reading the evaluations…
      </output>
    </SummaryPanel>
  );
}
