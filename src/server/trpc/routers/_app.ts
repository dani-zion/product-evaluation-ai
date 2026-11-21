import { createTRPCRouter } from "@/server/trpc/init";
import { authRouter } from "@/server/trpc/routers/auth";
import { evaluationsRouter } from "@/server/trpc/routers/evaluations";
import { productsRouter } from "@/server/trpc/routers/products";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  products: productsRouter,
  evaluations: evaluationsRouter,
});

export type AppRouter = typeof appRouter;
