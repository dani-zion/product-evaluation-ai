import { ProductNotFoundError } from "@/server/errors";
import type {
  EvaluationRepository,
  EvaluationRow,
} from "@/server/repositories/evaluation-repository";

type AuthorName = { first_name: string; last_name: string };

/** Same order as the database query: created_at desc, then id desc. */
function compare(a: EvaluationRow, b: EvaluationRow): number {
  if (a.created_at !== b.created_at) {
    return a.created_at < b.created_at ? 1 : -1;
  }
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

/**
 * Test double for the product_feedback table. `accounts` stands in for the
 * join on accounts; `productExists` for the product_id foreign key.
 */
export function createInMemoryEvaluationRepository({
  initial = [],
  accounts = {},
  productExists = () => true,
  now = () => new Date().toISOString(),
}: {
  initial?: EvaluationRow[];
  accounts?: Record<string, AuthorName>;
  productExists?: (productId: string) => boolean;
  now?: () => string;
} = {}) {
  const rows: EvaluationRow[] = [...initial];

  const repository: EvaluationRepository = {
    async listByProduct(productId) {
      return rows.filter((row) => row.product_id === productId).sort(compare);
    },
    async insert(evaluation) {
      if (!productExists(evaluation.product_id)) {
        throw new ProductNotFoundError();
      }
      const row: EvaluationRow = {
        ...evaluation,
        created_at: now(),
        author: accounts[evaluation.account_id] ?? null,
      };
      rows.push(row);
      return row;
    },
  };

  return { repository, rows };
}

export const adaAccount = {
  id: "acc_ada",
  first_name: "Ada",
  last_name: "Lovelace",
};

export const graceAccount = {
  id: "acc_grace",
  first_name: "Grace",
  last_name: "hopper",
};

export const testAccounts: Record<string, AuthorName> = {
  [adaAccount.id]: adaAccount,
  [graceAccount.id]: graceAccount,
};

/** An evaluation row for tests; override any field. */
export function makeEvaluationRow(
  overrides: Partial<EvaluationRow> & Pick<EvaluationRow, "id">,
): EvaluationRow {
  return {
    product_id: "product-000",
    account_id: adaAccount.id,
    score: 4,
    comment: "Solid build, battery lasts.",
    created_at: "2026-11-10T12:00:00.000Z",
    author: { first_name: "Ada", last_name: "Lovelace" },
    ...overrides,
  };
}
