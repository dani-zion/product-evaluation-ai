import { describe, expect, it, vi } from "vitest";
import { signUpSchema } from "@/features/auth/schemas";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
} from "@/server/errors";
import {
  createInMemoryAccountRepository,
  validSignUp,
} from "@/test/in-memory-account-repository";
import { createAccountService } from "./account-service";

function setup() {
  const { repository, rows } = createInMemoryAccountRepository();
  const service = createAccountService({
    repository,
    hashPassword: (password) => hashPassword(password, 4), // fast in tests
  });
  return { service, rows };
}

const input = signUpSchema.parse(validSignUp);

describe("accountService.signUp", () => {
  it("stores a new active account with a nanoid id and hashed password", async () => {
    const { service, rows } = setup();

    await service.signUp(input);

    expect(rows).toHaveLength(1);
    const [row] = rows;
    expect(row.id).toMatch(/^[A-Za-z0-9_-]{21}$/);
    expect(row.first_name).toBe("Ada");
    expect(row.last_name).toBe("Lovelace");
    expect(row.email).toBe("ada@example.com");
    expect(row.active).toBe(true);
    expect(row.password).not.toBe(input.password);
    expect(row.password.startsWith(row.salt)).toBe(true);
    expect(await verifyPassword(input.password, row.password)).toBe(true);
  });

  it("returns the public account without password or salt", async () => {
    const { service, rows } = setup();

    const account = await service.signUp(input);

    expect(account).toEqual({
      id: rows[0].id,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      active: true,
      createdAt: rows[0].created_at,
    });
    expect(account).not.toHaveProperty("password");
    expect(account).not.toHaveProperty("salt");
  });

  it("rejects an email that is already in use", async () => {
    const { service, rows } = setup();
    await service.signUp(input);

    await expect(service.signUp(input)).rejects.toBeInstanceOf(
      EmailAlreadyInUseError,
    );
    expect(rows).toHaveLength(1);
  });

  it("gives each account a different id", async () => {
    const { service } = setup();
    const a = await service.signUp(input);
    const b = await service.signUp({ ...input, email: "grace@example.com" });
    expect(a.id).not.toBe(b.id);
  });
});

describe("accountService.signIn", () => {
  const credentials = {
    email: "ada@example.com",
    password: validSignUp.password,
  };

  async function signedUp() {
    const ctx = setup();
    const account = await ctx.service.signUp(input);
    return { ...ctx, account };
  }

  it("returns the public account for correct credentials", async () => {
    const { service, account } = await signedUp();

    const result = await service.signIn(credentials);

    expect(result).toEqual(account);
    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("salt");
  });

  it("rejects a wrong password", async () => {
    const { service } = await signedUp();

    await expect(
      service.signIn({ ...credentials, password: "wrong-password" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("rejects an unknown email, still running one password compare", async () => {
    const { repository } = createInMemoryAccountRepository();
    const verify = vi.fn().mockResolvedValue(false);
    const service = createAccountService({
      repository,
      verifyPassword: verify,
    });

    await expect(
      service.signIn({ ...credentials, email: "nobody@example.com" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify.mock.calls[0][1]).toMatch(/^\$2b\$12\$/);
  });

  it("rejects an inactive account even with the right password", async () => {
    const { service, rows } = await signedUp();
    rows[0].active = false;

    await expect(service.signIn(credentials)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it("uses the same message for every failure", async () => {
    const { service, rows } = await signedUp();
    const message = (promise: Promise<unknown>) =>
      promise.catch((error: Error) => error.message);

    const unknown = await message(
      service.signIn({ ...credentials, email: "nobody@example.com" }),
    );
    const wrong = await message(
      service.signIn({ ...credentials, password: "nope" }),
    );
    rows[0].active = false;
    const inactive = await message(service.signIn(credentials));

    expect([unknown, wrong, inactive]).toEqual([
      "Email or password is incorrect.",
      "Email or password is incorrect.",
      "Email or password is incorrect.",
    ]);
  });
});
