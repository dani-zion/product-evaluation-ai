import "server-only";
import { getSupabase } from "@/server/db/supabase";
import { createSupabaseAccountRepository } from "@/server/repositories/account-repository";
import { createSupabaseEvaluationRepository } from "@/server/repositories/evaluation-repository";
import { createSupabaseProductRepository } from "@/server/repositories/product-repository";
import {
  type AccountService,
  createAccountService,
} from "@/server/services/account-service";
import {
  createEvaluationService,
  type EvaluationService,
} from "@/server/services/evaluation-service";
import {
  createProductService,
  type ProductService,
} from "@/server/services/product-service";

/**
 * Builds the real services. Created lazily so that importing a route does not
 * require the database env vars (e.g. during `next build` or in tests).
 */
export function getAccountService(): AccountService {
  return createAccountService({
    repository: createSupabaseAccountRepository(getSupabase()),
  });
}

export function getProductService(): ProductService {
  return createProductService({
    repository: createSupabaseProductRepository(getSupabase()),
  });
}

export function getEvaluationService(): EvaluationService {
  return createEvaluationService({
    repository: createSupabaseEvaluationRepository(getSupabase()),
    productService: getProductService(),
  });
}
