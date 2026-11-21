import { describe, expect, it } from "vitest";
import { signUpSchema } from "@/features/auth/schemas";
import { hashPassword, verifyPassword } from "@/lib/password";
import { EmailAlreadyInUseError } from "@/server/errors";
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
