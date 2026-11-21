import { TRPCError } from "@trpc/server";
import {
  createEvaluationSchema,
  listEvaluationsSchema,
} from "@/features/evaluations/schemas";
import { ProductNotFoundError } from "@/server/errors";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/trpc/init";

function toTRPCError(error: unknown, fallbackMessage: string): TRPCError {
  if (error instanceof ProductNotFoundError) {
    return new TRPCError({ code: "NOT_FOUND", message: error.message });
  }
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: fallbackMessage,
  });
}

export const evaluationsRouter = createTRPCRouter({
  /** Public: every evaluation of a product, newest first. */
  list: publicProcedure
    .input(listEvaluationsSchema)
    .query(async ({ ctx, input }) => {
      try {
        return {
          items: await ctx.getEvaluationService().list(input.productId),
        };
      } catch (error) {
        if (!(error instanceof ProductNotFoundError)) {
          console.error("list evaluations failed", error);
        }
        throw toTRPCError(
          error,
          "We couldn't load evaluations. Try again in a moment.",
        );
      }
    }),

  /** Signed-in accounts only: adds an evaluation by the caller. */
  create: protectedProcedure
    .input(createEvaluationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx
          .getEvaluationService()
          .create(ctx.session.accountId, input);
      } catch (error) {
        if (!(error instanceof ProductNotFoundError)) {
          console.error("create evaluation failed", error);
        }
        throw toTRPCError(
          error,
          "We couldn't add your evaluation. Try again in a moment.",
        );
      }
    }),
});
