import "server-only";
import {
  type CreateEvaluationInput,
  type Evaluation,
  type EvaluationScore,
  formatDisplayName,
} from "@/features/evaluations/schemas";
import { generateId as defaultGenerateId } from "@/lib/id";
import { ProductNotFoundError } from "@/server/errors";
import type {
  EvaluationRepository,
  EvaluationRow,
} from "@/server/repositories/evaluation-repository";
import type { ProductService } from "@/server/services/product-service";

function toEvaluation(row: EvaluationRow): Evaluation {
  return {
    id: row.id,
    productId: row.product_id,
    score: row.score as EvaluationScore,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
    author: {
      id: row.account_id,
      displayName: row.author
        ? formatDisplayName(row.author.first_name, row.author.last_name)
        : "Anonymous",
    },
  };
}

export type EvaluationServiceDeps = {
  repository: EvaluationRepository;
  /** Used to check that the product exists. */
  productService: Pick<ProductService, "getById">;
  generateId?: () => string;
};

export function createEvaluationService({
  repository,
  productService,
  generateId = defaultGenerateId,
}: EvaluationServiceDeps) {
  async function assertProductExists(productId: string): Promise<void> {
    if (!(await productService.getById(productId))) {
      throw new ProductNotFoundError();
    }
  }

  return {
    /** Every evaluation of the product, newest first. Throws ProductNotFoundError. */
    async list(productId: string): Promise<Evaluation[]> {
      const [, rows] = await Promise.all([
        assertProductExists(productId),
        repository.listByProduct(productId),
      ]);
      return rows.map(toEvaluation);
    },

    /** Adds an evaluation by the signed-in account. Throws ProductNotFoundError. */
    async create(
      accountId: string,
      input: CreateEvaluationInput,
    ): Promise<Evaluation> {
      await assertProductExists(input.productId);
      const row = await repository.insert({
        id: generateId(),
        product_id: input.productId,
        account_id: accountId,
        score: input.score,
        comment: input.comment,
      });
      return toEvaluation(row);
    },
  };
}

export type EvaluationService = ReturnType<typeof createEvaluationService>;
