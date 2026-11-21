import { TRPCError } from "@trpc/server";
import { signUpSchema } from "@/features/auth/schemas";
import { EmailAlreadyInUseError } from "@/server/errors";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/init";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.getAccountService().signUp(input);
      } catch (error) {
        if (error instanceof EmailAlreadyInUseError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        console.error("sign-up failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "We couldn't create your account. Try again in a moment.",
        });
      }
    }),
});
