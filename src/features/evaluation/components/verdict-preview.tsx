import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const likes = ["Blocks engine and cabin noise", "About 30 hours per charge"];
const watchFor = [
  "Gets tight after an hour on larger heads",
  "No carrying case in the box",
];

/**
 * An example of what an evaluation looks like. Uses a fictional product so it
 * reads as an illustration, not a real review.
 */
export function VerdictPreview({ className }: { className?: string }) {
  return (
    <figure
      className={cn(
        "flex flex-col gap-5 rounded-2xl border bg-card p-6 sm:p-7",
        className,
      )}
    >
      <figcaption className="text-muted-foreground text-sm">
        Example evaluation
      </figcaption>

      <div className="flex items-baseline justify-between gap-4">
        <p className="font-semibold text-lg">Aero 2 wireless headphones</p>
        <p className="text-muted-foreground tabular-nums">$349</p>
      </div>

      <p className="font-display text-4xl">
        <span className="marker">Buy it if you fly often.</span>
      </p>

      <p className="max-w-[46ch] text-muted-foreground leading-relaxed">
        The noise cancelling is the best you will find at this price. If you
        have a larger head, try them on first.
      </p>

      <div className="grid gap-5 border-t pt-5 sm:grid-cols-2">
        <section aria-labelledby="likes" className="flex flex-col gap-2">
          <h3 id="likes" className="font-medium text-sm">
            What owners like
          </h3>
          <ul className="flex flex-col gap-1.5 text-sm">
            {likes.map((item) => (
              <li key={item} className="flex gap-2">
                <PlusIcon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-sage"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="watch-for" className="flex flex-col gap-2">
          <h3 id="watch-for" className="font-medium text-sm">
            What to watch for
          </h3>
          <ul className="flex flex-col gap-1.5 text-sm">
            {watchFor.map((item) => (
              <li key={item} className="flex gap-2">
                <MinusIcon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="text-muted-foreground text-xs">
        Based on 2,184 owner reviews and the manufacturer's spec sheet.
      </p>
    </figure>
  );
}
