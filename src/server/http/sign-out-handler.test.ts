import { describe, expect, it } from "vitest";
import { createSignOutHandler } from "./sign-out-handler";

describe("POST /api/v1/sign-out", () => {
  it("returns 204 and clears the session cookie", async () => {
    const POST = createSignOutHandler();

    const response = await POST();

    expect(response.status).toBe(204);
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toMatch(/^pe_session=;/);
    expect(setCookie).toMatch(/Max-Age=0/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/Path=\//);
  });
});
