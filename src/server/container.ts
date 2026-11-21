import "server-only";
import { getSupabase } from "@/server/db/supabase";
import { createSupabaseAccountRepository } from "@/server/repositories/account-repository";
import {
  type AccountService,
  createAccountService,
} from "@/server/services/account-service";

/**
 * Builds the real services. Created lazily so that importing a route does not
 * require the database env vars (e.g. during `next build` or in tests).
 */
export function getAccountService(): AccountService {
  return createAccountService({
    repository: createSupabaseAccountRepository(getSupabase()),
  });
}
