"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { PRODUCTS_DEFAULT_LIMIT } from "@/features/products/schemas";
import { useTRPC } from "@/lib/trpc/client";

/** All products, newest first, one page at a time (cursor pagination). */
export function useProducts() {
  const trpc = useTRPC();
  return useInfiniteQuery(
    trpc.products.list.infiniteQueryOptions(
      { limit: PRODUCTS_DEFAULT_LIMIT },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        // Fail fast to the error state instead of several backoff retries.
        retry: 1,
      },
    ),
  );
}
