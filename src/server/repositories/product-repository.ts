import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** A row of the `products` table. */
export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  external_link: string;
  score: number | null;
  created_at: string;
  updated_at: string;
};

export type NewProductRow = Pick<
  ProductRow,
  "id" | "name" | "description" | "image_url" | "external_link"
>;

/** Position of a row in the list order: (created_at desc, id desc). */
export type ProductKey = { createdAt: string; id: string };

export interface ProductRepository {
  /** Up to `limit` rows strictly after `after` in list order, newest first. */
  list(params: {
    limit: number;
    after: ProductKey | null;
  }): Promise<ProductRow[]>;
  insert(product: NewProductRow): Promise<ProductRow>;
  findById(id: string): Promise<ProductRow | null>;
}

export function createSupabaseProductRepository(
  supabase: SupabaseClient,
): ProductRepository {
  return {
    async list({ limit, after }) {
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(limit);

      if (after) {
        // Keyset: created_at < key OR (created_at = key AND id < key.id).
        // Values are double-quoted so PostgREST does not split on their characters.
        const createdAt = `"${after.createdAt}"`;
        const id = `"${after.id}"`;
        query = query.or(
          `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`,
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProductRow[];
    },

    async insert(product) {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data as ProductRow;
    },

    async findById(id) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as ProductRow | null;
    },
  };
}
