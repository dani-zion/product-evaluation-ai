import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ProductNotFoundError } from "@/server/errors";

/** A row of the `product_feedback` table, joined with its author's name. */
export type EvaluationRow = {
  id: string;
  product_id: string;
  account_id: string;
  score: number;
  comment: string;
  created_at: string;
  /** From `accounts`; null only if the account row can't be read. */
  author: { first_name: string; last_name: string } | null;
};

export type NewEvaluationRow = Pick<
  EvaluationRow,
  "id" | "product_id" | "account_id" | "score" | "comment"
>;

export interface EvaluationRepository {
  /** Every evaluation of the product, newest first. */
  listByProduct(productId: string): Promise<EvaluationRow[]>;
  insert(evaluation: NewEvaluationRow): Promise<EvaluationRow>;
}

const FOREIGN_KEY_VIOLATION = "23503";

// Only the author's name is selected: the email and password never leave the database.
const SELECT_WITH_AUTHOR =
  "id, product_id, account_id, score, comment, created_at, author:accounts(first_name, last_name)";

export function createSupabaseEvaluationRepository(
  supabase: SupabaseClient,
): EvaluationRepository {
  return {
    async listByProduct(productId) {
      const { data, error } = await supabase
        .from("product_feedback")
        .select(SELECT_WITH_AUTHOR)
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
      if (error) throw error;
      return data as unknown as EvaluationRow[];
    },

    async insert(evaluation) {
      const { data, error } = await supabase
        .from("product_feedback")
        .insert(evaluation)
        .select(SELECT_WITH_AUTHOR)
        .single();
      // The product was deleted between the existence check and the insert.
      if (
        error?.code === FOREIGN_KEY_VIOLATION &&
        error.message.includes("product_id")
      ) {
        throw new ProductNotFoundError();
      }
      if (error) throw error;
      return data as unknown as EvaluationRow;
    },
  };
}
