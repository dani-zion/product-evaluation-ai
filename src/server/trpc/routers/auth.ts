import { TRPCError } from "@trpc/server";
import { signInSchema, signUpSchema } from "@/features/auth/schemas";
import { createSessionToken } from "@/server/auth/session";
import {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
} from "@/server/errors";
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

  /** Same rules as POST /api/v1/sign-in. Sets the session cookie on success. */
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, firstName, lastName, email } = await ctx
          .getAccountService()
          .signIn(input);
        const account = { id, firstName, lastName, email };
        await ctx.sessionCookie.set(await createSessionToken(account));
        return { account };
      } catch (error) {
        if (error instanceof InvalidCredentialsError) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: error.message });
        }
        console.error("sign-in failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "We couldn't sign you in. Try again in a moment.",
        });
      }
    }),

  signOut: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.sessionCookie.clear();
    return null;
  }),

  /** The signed-in account, or null for visitors. */
  me: publicProcedure.query(({ ctx }) => ctx.session),
});
