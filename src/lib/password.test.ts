import bcrypt from "bcrypt";
import { describe, expect, it } from "vitest";
import { BCRYPT_COST, hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("returns a bcrypt hash and the salt used to create it", async () => {
    const { hash, salt } = await hashPassword("correct-horse-battery");

    expect(salt).toMatch(new RegExp(`^\\$2b\\$${BCRYPT_COST}\\$.{22}$`));
    // bcrypt embeds the salt at the start of the hash.
    expect(hash.startsWith(salt)).toBe(true);
    expect(bcrypt.getRounds(hash)).toBe(BCRYPT_COST);
  });

  it("never returns the plain password", async () => {
    const { hash, salt } = await hashPassword("correct-horse-battery");
    expect(hash).not.toContain("correct-horse-battery");
    expect(salt).not.toContain("correct-horse-battery");
  });

  it("uses a new salt for every hash", async () => {
    const first = await hashPassword("same-password", 4);
    const second = await hashPassword("same-password", 4);
    expect(first.salt).not.toBe(second.salt);
    expect(first.hash).not.toBe(second.hash);
  });

  it("verifies the right password and rejects a wrong one", async () => {
    const { hash } = await hashPassword("correct-horse-battery", 4);
    expect(await verifyPassword("correct-horse-battery", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces the stored hash again from the stored salt", async () => {
    const { hash, salt } = await hashPassword("correct-horse-battery", 4);
    expect(await bcrypt.hash("correct-horse-battery", salt)).toBe(hash);
  });
});
