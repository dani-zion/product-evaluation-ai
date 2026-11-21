import "server-only";
import { initTRPC } from "@trpc/server";
import { ZodError, z } from "zod";
import { getAccountService } from "@/server/container";
import type { AccountService } from "@/server/services/account-service";

export type TRPCContext = {
  getAccountService: () => AccountService;
};

export function createTRPCContext(): TRPCContext {
  return { getAccountService };
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
