import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  getEvaluationService,
  getProductService,
  getSummaryService,
} from "@/server/container";
import type { SummaryResult } from "@/server/services/summary-service";

/**
 * The product's AI summary, cached so each set of evaluations costs one model
 * call. `fingerprint` (see `evaluationsFingerprint`) is part of the cache key:
 * a new evaluation changes it, so the next visit writes a fresh summary while
 * unchanged products keep serving the cached one.
 *
 * Errors are thrown, not returned, so a failed call is never cached.
 */
export async function getCachedProductSummary(
  productId: string,
  fingerprint: string,
): Promise<SummaryResult | null> {
  "use cache";
  cacheLife("max");
  cacheTag(`product-summary:${productId}`);

  const [product, evaluations] = await Promise.all([
    getProductService().getById(productId),
    getEvaluationService().list(productId),
  ]);
  if (!product) return null;

  // Runs only on a cache miss (a new product or a new evaluation).
  console.info("product summary cache miss", { productId, fingerprint });
  return getSummaryService().summarize(product, evaluations);
}
