import { TRPCError } from "@trpc/server";
import { listProductsSchema } from "@/features/products/schemas";
import { InvalidCursorError } from "@/server/errors";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/init";

export const productsRouter = createTRPCRouter({
  /** Public, cursor-paginated product list for the home page (infinite query). */
  list: publicProcedure
    .input(listProductsSchema)
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.getProductService().list(input);
      } catch (error) {
        if (error instanceof InvalidCursorError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        console.error("list products failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "We couldn't load products. Try again in a moment.",
        });
      }
    }),
});
