import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/lib/password";
import { verifySessionToken } from "@/server/auth/session";
import {
  type AccountService,
  createAccountService,
} from "@/server/services/account-service";
import {
  createInMemoryAccountRepository,
  validSignUp,
} from "@/test/in-memory-account-repository";
import { createSignInHandler } from "./sign-in-handler";

const credentials = {
  email: "ada@example.com",
  password: validSignUp.password,
};

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret-that-is-at-least-32-characters");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function setup() {
  const { repository, rows } = createInMemoryAccountRepository();
  const service = createAccountService({
    repository,
    hashPassword: (password) => hashPassword(password, 4),
  });
  await service.signUp(validSignUp);
  return { POST: createSignInHandler(() => service), rows };
}

function request(body: unknown) {
  return new Request("http://localhost/api/v1/sign-in", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function sessionCookieValue(setCookie: string | null) {
  return setCookie?.match(/pe_session=([^;]*)/)?.[1];
}

describe("POST /api/v1/sign-in", () => {
  it("returns 200 with the account and sets an HttpOnly session cookie", async () => {
    const { POST, rows } = await setup();

    const response = await POST(request(credentials));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      account: {
        id: rows[0].id,
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
      },
    });

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Path=\//);
    expect(setCookie).toMatch(/Max-Age=604800/);

    const session = await verifySessionToken(sessionCookieValue(setCookie));
    expect(session).toEqual({
      accountId: rows[0].id,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
    });
  });

  it("normalizes the email before checking it", async () => {
    const { POST } = await setup();
    const response = await POST(
      request({ ...credentials, email: "  ADA@example.com " }),
    );
    expect(response.status).toBe(200);
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const { POST } = await setup();
    const response = await POST(request("{not json"));
    expect(response.status).toBe(400);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("returns 400 with field errors for invalid data", async () => {
    const { POST } = await setup();

    const response = await POST(request({ email: "nope", password: "" }));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.fieldErrors.email).toBeDefined();
    expect(body.fieldErrors.password).toBeDefined();
  });

  it.each([
    ["a wrong password", { ...credentials, password: "wrong-password" }],
    ["an unknown email", { ...credentials, email: "nobody@example.com" }],
  ])("returns 401 for %s", async (_, body) => {
    const { POST } = await setup();

    const response = await POST(request(body));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Email or password is incorrect.",
    });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("returns 401 for an inactive account", async () => {
    const { POST, rows } = await setup();
    rows[0].active = false;

    const response = await POST(request(credentials));

    expect(response.status).toBe(401);
  });

  it("returns 500 without leaking details when the database fails", async () => {
    const failing = {
      signIn: vi.fn().mockRejectedValue(new Error("connection refused")),
    } as unknown as AccountService;
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const POST = createSignInHandler(() => failing);

    const response = await POST(request(credentials));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "We couldn't sign you in. Try again in a moment.",
    });
    consoleError.mockRestore();
  });
});
