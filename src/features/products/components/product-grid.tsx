"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductCardSkeleton } from "@/features/products/components/product-card-skeleton";
import { useProducts } from "@/features/products/hooks/use-products";

const GRID = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";
/** Start loading the next page this far before the end of the list. */
const PRELOAD_MARGIN = "0px 0px 600px 0px";

function Skeletons({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
    <li key={index} aria-hidden>
      <ProductCardSkeleton />
    </li>
  ));
}

/** Every product, newest first, loading more as the visitor scrolls. */
export function ProductGrid() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isPending,
    refetch,
    isRefetching,
  } = useProducts();

  const products = data?.pages.flatMap((page) => page.items) ?? [];
  const pageCount = data?.pages.length ?? 0;
  const lastPageSize = data?.pages.at(-1)?.items.length ?? 0;

  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Index of the first card of a page requested with the "Load more" button,
  // so keyboard focus can move to it instead of being lost.
  const focusIndexRef = useRef<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const canLoadMore =
    hasNextPage && !isFetchingNextPage && !isFetchNextPageError;

  // Load the next page when the sentinel gets near the viewport. The observer
  // is recreated after each page, so it keeps loading until the screen is full.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      !canLoadMore ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage();
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, fetchNextPage]);

  // Announce each page added after the first, and move focus if the visitor
  // asked for it with the button.
  useEffect(() => {
    if (pageCount < 2) return;
    setAnnouncement(
      `Loaded ${lastPageSize} more ${lastPageSize === 1 ? "product" : "products"}`,
    );
    const index = focusIndexRef.current;
    if (index !== null) {
      focusIndexRef.current = null;
      listRef.current?.querySelectorAll("a")[index]?.focus();
    }
  }, [pageCount, lastPageSize]);

  function loadMore() {
    focusIndexRef.current = products.length;
    void fetchNextPage();
  }

  if (isPending) {
    return (
      <div aria-busy="true">
        <output className="sr-only">Loading products</output>
        <ul className={GRID}>
          <Skeletons count={6} />
        </ul>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-4 border-t pt-8"
      >
        <p className="font-display text-3xl">We couldn't load products.</p>
        <p className="max-w-[52ch] text-muted-foreground">
          Check your connection, then try again.
        </p>
        <Button
          variant="outline"
          size="lg"
          className="h-11 px-5"
          onClick={() => void refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? "Trying again…" : "Try again"}
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="border-t pt-8 font-display text-3xl">
        No products yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <ul ref={listRef} className={GRID} aria-busy={isFetchingNextPage}>
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
        {isFetchingNextPage ? <Skeletons count={3} /> : null}
      </ul>

      <div ref={sentinelRef} aria-hidden />

      <div className="flex flex-col items-start gap-3">
        {isFetchNextPageError ? (
          <p role="alert" className="text-muted-foreground">
            We couldn't load more products.
          </p>
        ) : null}
        {hasNextPage && !isFetchingNextPage ? (
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-5"
            onClick={loadMore}
          >
            {isFetchNextPageError ? "Try again" : "Load more products"}
          </Button>
        ) : null}
        {!hasNextPage ? (
          <p className="text-muted-foreground text-sm">
            You've seen every product.
          </p>
        ) : null}
      </div>

      <output className="sr-only" aria-live="polite">
        {announcement}
      </output>
    </div>
  );
}
