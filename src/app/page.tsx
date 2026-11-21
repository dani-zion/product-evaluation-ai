import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { VerdictPreview } from "@/features/evaluation/components/verdict-preview";

const steps = [
  {
    title: "Paste a product link",
    body: "Any product page from the store you are shopping on.",
  },
  {
    title: "We read the reviews and specs",
    body: "Thousands of owner reviews, checked against what the manufacturer claims.",
  },
  {
    title: "Get a verdict",
    body: "Who the product suits, who should skip it, and why, in plain words.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 pt-14 pb-20 sm:px-10 sm:pt-20 lg:gap-28">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <h1 className="font-display text-5xl sm:text-7xl">
              Know what you're buying before you buy it.
            </h1>
            <p className="max-w-[52ch] text-lg text-muted-foreground leading-relaxed">
              Paste a product link. We read the reviews and specs and tell you,
              in plain words, whether it's right for you.
            </p>
            <Button
              size="lg"
              className="mt-2 h-12 px-6 text-base"
              nativeButton={false}
              render={<Link href="/auth/sign-up" />}
            >
              Create your free account
            </Button>
          </div>
          <VerdictPreview />
        </section>

        <section aria-labelledby="how-it-works" className="flex flex-col gap-8">
          <h2 id="how-it-works" className="font-display text-4xl">
            How it works
          </h2>
          <ol className="grid gap-8 border-t pt-8 md:grid-cols-3 md:gap-10">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="font-display w-7 shrink-0 text-4xl text-marker tabular-nums leading-none"
                >
                  {index + 1}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="max-w-[36ch] text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </>
  );
}
