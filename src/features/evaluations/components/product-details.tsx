import { ArrowUpRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/features/products/components/product-image";
import type { Product } from "@/features/products/schemas";

/** The product's image, name, description, score summary and store link. */
export function ProductDetails({
  product,
  summary,
}: {
  product: Product;
  /** The rendered score summary. */
  summary: ReactNode;
}) {
  return (
    <section
      aria-labelledby="product-name"
      className="grid items-start gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12"
    >
      <ProductImage
        name={product.name}
        src={product.imageUrl}
        loading="eager"
        className="aspect-[4/3] rounded-2xl border"
      />
      <div className="flex flex-col items-start gap-5">
        <h1
          id="product-name"
          className="font-display break-words text-5xl sm:text-6xl lg:text-7xl"
        >
          {product.name}
        </h1>
        {product.description ? (
          <p className="max-w-[60ch] whitespace-pre-line text-lg text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        ) : null}
        <div className="pt-1">{summary}</div>
        <Button
          variant="outline"
          className="h-11 px-4 text-sm"
          nativeButton={false}
          render={
            // biome-ignore lint/a11y/useAnchorContent: Button renders the children inside
            <a
              href={product.externalLink}
              target="_blank"
              rel="noopener noreferrer nofollow"
            />
          }
        >
          View on store
          <ArrowUpRightIcon aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </Button>
      </div>
    </section>
  );
}
