import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EmailAlreadyInUseError } from "@/server/errors";

/** A row of the `accounts` table. */
export type AccountRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  salt: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type NewAccountRow = Omit<AccountRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
};

export interface AccountRepository {
  emailExists(email: string): Promise<boolean>;
  insert(account: NewAccountRow): Promise<AccountRow>;
}

const UNIQUE_VIOLATION = "23505";

export function createSupabaseAccountRepository(
  supabase: SupabaseClient,
): AccountRepository {
  return {
    async emailExists(email) {
      const { data, error } = await supabase
        .from("accounts")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (error) throw error;
      return data !== null;
    },

    async insert(account) {
      const { data, error } = await supabase
        .from("accounts")
        .insert(account)
        .select()
        .single();
      // Two sign-ups with the same email at the same moment both pass
      // emailExists(); the unique constraint catches the second one.
      if (error?.code === UNIQUE_VIOLATION) throw new EmailAlreadyInUseError();
      if (error) throw error;
      return data as AccountRow;
    },
  };
}
