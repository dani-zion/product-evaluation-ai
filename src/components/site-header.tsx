import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto w-full max-w-6xl px-6 pt-6 sm:px-10 sm:pt-8">
      <Link
        href="/"
        className="font-display rounded-sm text-2xl text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
      >
        Product Evaluation AI
      </Link>
    </header>
  );
}
