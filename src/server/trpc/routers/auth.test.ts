import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { hashPassword } from "@/lib/password";
import { createAccountService } from "@/server/services/account-service";
import { createCallerFactory } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/routers/_app";
import {
  createInMemoryAccountRepository,
  validSignUp,
} from "@/test/in-memory-account-repository";

function setup() {
  const { repository, rows } = createInMemoryAccountRepository();
  const service = createAccountService({
    repository,
    hashPassword: (password) => hashPassword(password, 4),
  });
  const caller = createCallerFactory(appRouter)({
    getAccountService: () => service,
  });
  return { caller, rows };
}

describe("tRPC auth.signUp", () => {
  it("creates the account", async () => {
    const { caller, rows } = setup();

    const account = await caller.auth.signUp(validSignUp);

    expect(account.email).toBe("ada@example.com");
    expect(rows).toHaveLength(1);
  });

  it("fails with BAD_REQUEST for invalid input", async () => {
    const { caller, rows } = setup();

    await expect(
      caller.auth.signUp({ ...validSignUp, confirmPassword: "different" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(rows).toHaveLength(0);
  });

  it("fails with BAD_REQUEST for a duplicate email", async () => {
    const { caller } = setup();
    await caller.auth.signUp(validSignUp);

    const error = await caller.auth.signUp(validSignUp).catch((e) => e);

    expect(error).toBeInstanceOf(TRPCError);
    expect(error.code).toBe("BAD_REQUEST");
    expect(error.message).toBe(
      "An account with this email already exists. Use a different email.",
    );
  });
});
