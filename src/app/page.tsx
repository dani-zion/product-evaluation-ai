import { SiteHeader } from "@/components/site-header";
import { ProductGrid } from "@/features/products/components/product-grid";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pt-14 pb-20 sm:px-10 sm:pt-20 lg:gap-14">
        <div className="flex flex-col items-start gap-4">
          <h1 className="font-display text-5xl sm:text-7xl">
            Products to evaluate
          </h1>
          <p className="max-w-[52ch] text-lg text-muted-foreground leading-relaxed">
            Open a product to see its score and what people say about it.
          </p>
        </div>
        <ProductGrid />
      </main>
    </>
  );
}
