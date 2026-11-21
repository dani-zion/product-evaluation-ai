import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSessionToken,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from "./session";

const SECRET = "test-secret-that-is-at-least-32-characters-long";

const account = {
  id: "acc_123",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
};

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", SECRET);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("session tokens", () => {
  it("round-trips the account", async () => {
    const token = await createSessionToken(account);

    expect(await verifySessionToken(token)).toEqual({
      accountId: "acc_123",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    });
  });

  it("returns null for a tampered token", async () => {
    const token = await createSessionToken(account);
    const [header, payload, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({
        ...JSON.parse(Buffer.from(payload, "base64url").toString()),
        sub: "someone-else",
      }),
    ).toString("base64url");

    expect(
      await verifySessionToken(`${header}.${forged}.${signature}`),
    ).toBeNull();
  });

  it("returns null for a token signed with another secret", async () => {
    const token = await new SignJWT({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("acc_123")
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("another-secret-another-secret-12345"));

    expect(await verifySessionToken(token)).toBeNull();
  });

  it("returns null for an expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await createSessionToken(account);

    vi.setSystemTime(
      new Date(
        Date.parse("2026-01-01T00:00:00Z") +
          (SESSION_MAX_AGE_SECONDS + 1) * 1000,
      ),
    );

    expect(await verifySessionToken(token)).toBeNull();
  });

  it("returns null for a missing or malformed token", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
    expect(await verifySessionToken("not-a-jwt")).toBeNull();
  });

  it("does not put password data in the token", async () => {
    const token = await createSessionToken({
      ...account,
      password: "hash",
      salt: "salt",
    } as typeof account);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );

    expect(Object.keys(payload).sort()).toEqual(
      ["email", "exp", "firstName", "iat", "lastName", "sub"].sort(),
    );
  });

  it("fails loudly when signing without a secret", async () => {
    vi.stubEnv("SESSION_SECRET", "");

    await expect(createSessionToken(account)).rejects.toThrow(/SESSION_SECRET/);
  });
});
