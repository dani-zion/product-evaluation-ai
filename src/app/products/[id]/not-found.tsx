import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start gap-6 px-6 pt-14 pb-20 sm:px-10 sm:pt-20">
        <h1 className="font-display text-5xl sm:text-6xl">
          We couldn't find that product.
        </h1>
        <p className="max-w-[52ch] text-lg text-muted-foreground leading-relaxed">
          The link may be wrong, or the product may have been removed.
        </p>
        <Button
          className="h-11 px-5 text-sm"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back to all products
        </Button>
      </main>
    </>
  );
}
