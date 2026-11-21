import "server-only";
import { z } from "zod";
import {
  createEvaluationSchema,
  listEvaluationsSchema,
} from "@/features/evaluations/schemas";
import { getSession, type Session } from "@/server/auth/session";
import { ProductNotFoundError } from "@/server/errors";
import type { EvaluationService } from "@/server/services/evaluation-service";

/**
 * GET /api/v1/evaluations?productId=<id>
 * - 200 `{ items }`, newest first (`items` is `[]` when there are none)
 * - 400 when `productId` is missing
 * - 404 when the product doesn't exist
 * - 500 for unexpected server errors
 */
export function createListEvaluationsHandler(
  getService: () => EvaluationService,
) {
  return async function GET(request: Request): Promise<Response> {
    const params = new URL(request.url).searchParams;
    const parsed = listEvaluationsSchema.safeParse({
      productId: params.get("productId") ?? undefined,
    });
    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid query",
          fieldErrors: z.flattenError(parsed.error).fieldErrors,
        },
        { status: 400 },
      );
    }

    try {
      const items = await getService().list(parsed.data.productId);
      return Response.json({ items });
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        return Response.json({ error: error.message }, { status: 404 });
      }
      console.error("list evaluations failed", error);
      return Response.json(
        { error: "We couldn't load evaluations. Try again in a moment." },
        { status: 500 },
      );
    }
  };
}

/**
 * POST /api/v1/evaluations with `{ productId, score, comment }`
 * Requires the session cookie.
 * - 201 `{ evaluation }`
 * - 400 for invalid JSON or invalid fields
 * - 401 when the caller isn't signed in
 * - 404 when the product doesn't exist
 * - 500 for unexpected server errors
 */
export function createCreateEvaluationHandler(
  getService: () => EvaluationService,
  readSession: () => Promise<Session | null> = getSession,
) {
  return async function POST(request: Request): Promise<Response> {
    const session = await readSession();
    if (!session) {
      return Response.json(
        { error: "Sign in to add an evaluation." },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const parsed = createEvaluationSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid evaluation data",
          fieldErrors: z.flattenError(parsed.error).fieldErrors,
        },
        { status: 400 },
      );
    }

    try {
      const evaluation = await getService().create(
        session.accountId,
        parsed.data,
      );
      return Response.json({ evaluation }, { status: 201 });
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        return Response.json({ error: error.message }, { status: 404 });
      }
      console.error("create evaluation failed", error);
      return Response.json(
        { error: "We couldn't add your evaluation. Try again in a moment." },
        { status: 500 },
      );
    }
  };
}
