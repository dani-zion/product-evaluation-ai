import { EmailAlreadyInUseError } from "@/server/errors";
import type {
  AccountRepository,
  AccountRow,
} from "@/server/repositories/account-repository";

/** Test double for the accounts table, including its unique email constraint. */
export function createInMemoryAccountRepository() {
  const rows: AccountRow[] = [];

  const repository: AccountRepository = {
    async emailExists(email) {
      return rows.some((row) => row.email === email);
    },
    async findByEmail(email) {
      return rows.find((row) => row.email === email) ?? null;
    },
    async insert(account) {
      if (rows.some((row) => row.email === account.email)) {
        throw new EmailAlreadyInUseError();
      }
      const now = new Date().toISOString();
      const row: AccountRow = {
        created_at: now,
        updated_at: now,
        ...account,
      };
      rows.push(row);
      return row;
    },
  };

  return { repository, rows };
}

export const validSignUp = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  password: "correct-horse-battery",
  confirmPassword: "correct-horse-battery",
};
