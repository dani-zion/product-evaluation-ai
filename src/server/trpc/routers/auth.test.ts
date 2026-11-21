import { TRPCError } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/lib/password";
import { type Session, verifySessionToken } from "@/server/auth/session";
import { createAccountService } from "@/server/services/account-service";
import {
  createCallerFactory,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/routers/_app";
import {
  createInMemoryAccountRepository,
  validSignUp,
} from "@/test/in-memory-account-repository";

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret-that-is-at-least-32-characters");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const adaSession: Session = {
  accountId: "acc_123",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
};

function setup({ session = null }: { session?: Session | null } = {}) {
  const { repository, rows } = createInMemoryAccountRepository();
  const service = createAccountService({
    repository,
    hashPassword: (password) => hashPassword(password, 4),
  });
  const sessionCookie = {
    set: vi.fn(async (_token: string) => {}),
    clear: vi.fn(async () => {}),
  };
  const ctx = {
    getAccountService: () => service,
    getProductService: (): never => {
      throw new Error("not used");
    },
    getEvaluationService: (): never => {
      throw new Error("not used");
    },
    session,
    sessionCookie,
  };
  const caller = createCallerFactory(appRouter)(ctx);
  return { caller, rows, sessionCookie, ctx };
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

describe("tRPC auth.signIn", () => {
  const credentials = {
    email: "ada@example.com",
    password: validSignUp.password,
  };

  it("returns the account and sets a valid session cookie", async () => {
    const { caller, rows, sessionCookie } = setup();
    await caller.auth.signUp(validSignUp);

    const result = await caller.auth.signIn(credentials);

    expect(result).toEqual({
      account: {
        id: rows[0].id,
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
      },
    });
    expect(sessionCookie.set).toHaveBeenCalledTimes(1);
    const token = sessionCookie.set.mock.calls[0][0];
    expect(await verifySessionToken(token)).toMatchObject({
      accountId: rows[0].id,
      email: "ada@example.com",
    });
  });

  it("fails with UNAUTHORIZED and the generic message for a wrong password", async () => {
    const { caller, sessionCookie } = setup();
    await caller.auth.signUp(validSignUp);

    const error = await caller.auth
      .signIn({ ...credentials, password: "wrong-password" })
      .catch((e) => e);

    expect(error).toBeInstanceOf(TRPCError);
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.message).toBe("Email or password is incorrect.");
    expect(sessionCookie.set).not.toHaveBeenCalled();
  });

  it("fails with UNAUTHORIZED for an unknown email", async () => {
    const { caller } = setup();

    await expect(caller.auth.signIn(credentials)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("fails with BAD_REQUEST for invalid input", async () => {
    const { caller } = setup();

    await expect(
      caller.auth.signIn({ email: "nope", password: "" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("tRPC auth.signOut", () => {
  it("clears the session cookie", async () => {
    const { caller, sessionCookie } = setup({ session: adaSession });

    await caller.auth.signOut();

    expect(sessionCookie.clear).toHaveBeenCalledTimes(1);
  });
});

describe("tRPC auth.me", () => {
  it("returns null for visitors", async () => {
    const { caller } = setup();
    expect(await caller.auth.me()).toBeNull();
  });

  it("returns the session account when signed in", async () => {
    const { caller } = setup({ session: adaSession });
    expect(await caller.auth.me()).toEqual(adaSession);
  });
});

describe("protectedProcedure", () => {
  const router = createTRPCRouter({
    whoami: protectedProcedure.query(({ ctx }) => ctx.session.accountId),
  });

  it("rejects calls without a session", async () => {
    const { ctx } = setup();
    const caller = createCallerFactory(router)(ctx);

    await expect(caller.whoami()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("passes the session through when signed in", async () => {
    const { ctx } = setup({ session: adaSession });
    const caller = createCallerFactory(router)(ctx);

    expect(await caller.whoami()).toBe("acc_123");
  });
});
