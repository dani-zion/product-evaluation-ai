import "server-only";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";
import {
  clearSessionCookie,
  getSession,
  type Session,
  setSessionCookie,
} from "@/server/auth/session";
import {
  getAccountService,
  getEvaluationService,
  getProductService,
} from "@/server/container";
import type { AccountService } from "@/server/services/account-service";
import type { EvaluationService } from "@/server/services/evaluation-service";
import type { ProductService } from "@/server/services/product-service";

/** Writes the session cookie. Injected so procedures can be tested without a request. */
export type SessionCookieWriter = {
  set: (token: string) => Promise<void>;
  clear: () => Promise<void>;
};

export type TRPCContext = {
  getAccountService: () => AccountService;
  getProductService: () => ProductService;
  getEvaluationService: () => EvaluationService;
  /** The signed-in account, or null for visitors. */
  session: Session | null;
  sessionCookie: SessionCookieWriter;
};

export async function createTRPCContext(): Promise<TRPCContext> {
  return {
    getAccountService,
    getProductService,
    getEvaluationService,
    session: await getSession(),
    sessionCookie: { set: setSessionCookie, clear: clearSessionCookie },
  };
}

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    const fieldErrors: Record<string, string[] | undefined> | null =
      error.cause instanceof ZodError
        ? z.flattenError(error.cause).fieldErrors
        : null;
    return { ...shape, data: { ...shape.data, fieldErrors } };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

/** A procedure for signed-in accounts only. `ctx.session` is never null in it. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Sign in to continue.",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});
