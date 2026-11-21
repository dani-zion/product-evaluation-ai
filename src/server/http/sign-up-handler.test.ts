import { describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/lib/password";
import {
  type AccountService,
  createAccountService,
} from "@/server/services/account-service";
import {
  createInMemoryAccountRepository,
  validSignUp,
} from "@/test/in-memory-account-repository";
import { createSignUpHandler } from "./sign-up-handler";

function setup() {
  const { repository, rows } = createInMemoryAccountRepository();
  const service = createAccountService({
    repository,
    hashPassword: (password) => hashPassword(password, 4),
  });
  return { POST: createSignUpHandler(() => service), rows };
}

function request(body: unknown) {
  return new Request("http://localhost/api/v1/sign-up", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/v1/sign-up", () => {
  it("returns 201 with the created account", async () => {
    const { POST, rows } = setup();

    const response = await POST(request(validSignUp));

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.account).toMatchObject({
      id: rows[0].id,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      active: true,
    });
    expect(JSON.stringify(body)).not.toContain(rows[0].password);
    expect(JSON.stringify(body)).not.toContain(validSignUp.password);
  });

  it("returns 400 with field errors for invalid data", async () => {
    const { POST, rows } = setup();

    const response = await POST(
      request({ ...validSignUp, email: "nope", confirmPassword: "different" }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.fieldErrors.email).toBeDefined();
    expect(body.fieldErrors.confirmPassword).toEqual([
      "Passwords do not match",
    ]);
    expect(rows).toHaveLength(0);
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const { POST } = setup();
    const response = await POST(request("{not json"));
    expect(response.status).toBe(400);
  });

  it("returns 400 when the email is already in use", async () => {
    const { POST, rows } = setup();
    await POST(request(validSignUp));

    const response = await POST(
      request({ ...validSignUp, email: "ADA@example.com" }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error:
        "An account with this email already exists. Use a different email.",
    });
    expect(rows).toHaveLength(1);
  });

  it("returns 500 without leaking details when the database fails", async () => {
    const failing = {
      signUp: vi.fn().mockRejectedValue(new Error("connection refused")),
    } as unknown as AccountService;
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const POST = createSignUpHandler(() => failing);

    const response = await POST(request(validSignUp));

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain(
      "connection refused",
    );
    consoleError.mockRestore();
  });
});
