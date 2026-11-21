"use client";

import Link from "next/link";
import { ProductImage } from "@/features/products/components/product-image";
import type { Product } from "@/features/products/schemas";

/**
 * One product in the home grid. The whole card is a single link to the
 * product's page; hover only changes the border colour.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card outline-none transition-colors hover:border-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ProductImage
        name={product.name}
        src={product.imageUrl}
        className="aspect-[4/3] border-b"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h2 className="line-clamp-2 font-semibold text-lg leading-snug">
          {product.name}
        </h2>
        {product.description ? (
          <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>
        ) : null}
        <ProductScore score={product.score} />
      </div>
    </Link>
  );
}

function ProductScore({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <p className="mt-auto pt-3 text-muted-foreground text-sm">
        No evaluations yet
      </p>
    );
  }
  return (
    <p className="mt-auto flex items-baseline gap-2 pt-3">
      <span className="sr-only">Average score:</span>
      <span className="font-display text-3xl text-marker tabular-nums">
        {score}
        <span className="text-muted-foreground text-xl">/5</span>
      </span>
    </p>
  );
}
