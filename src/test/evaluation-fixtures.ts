import { createEvaluationService } from "@/server/services/evaluation-service";
import { createProductService } from "@/server/services/product-service";
import {
  createInMemoryEvaluationRepository,
  type makeEvaluationRow,
  testAccounts,
} from "@/test/in-memory-evaluation-repository";
import {
  createInMemoryProductRepository,
  makeProductRows,
} from "@/test/in-memory-product-repository";

/** An evaluation service over in-memory products (product-000, product-001) and evaluations. */
export function createTestEvaluationService(
  initial: ReturnType<typeof makeEvaluationRow>[] = [],
) {
  const products = createInMemoryProductRepository(makeProductRows(2));
  const evaluations = createInMemoryEvaluationRepository({
    initial,
    accounts: testAccounts,
  });
  const service = createEvaluationService({
    repository: evaluations.repository,
    productService: createProductService({ repository: products.repository }),
  });
  return { service, rows: evaluations.rows };
}
