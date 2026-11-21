import { describe, expect, it } from "vitest";
import { hasValidApiKey } from "./api-key";

function request(authorization?: string) {
  return new Request("http://localhost/api/v1/products", {
    method: "POST",
    headers: authorization ? { authorization } : {},
  });
}

describe("hasValidApiKey", () => {
  it("accepts the right bearer key", () => {
    expect(hasValidApiKey(request("Bearer secret-key"), "secret-key")).toBe(
      true,
    );
  });

  it("accepts a lowercase scheme", () => {
    expect(hasValidApiKey(request("bearer secret-key"), "secret-key")).toBe(
      true,
    );
  });

  it("rejects a missing header", () => {
    expect(hasValidApiKey(request(), "secret-key")).toBe(false);
  });

  it("rejects a wrong key, including one of a different length", () => {
    expect(hasValidApiKey(request("Bearer secret-kez"), "secret-key")).toBe(
      false,
    );
    expect(hasValidApiKey(request("Bearer s"), "secret-key")).toBe(false);
  });

  it("rejects a key sent without the Bearer scheme", () => {
    expect(hasValidApiKey(request("secret-key"), "secret-key")).toBe(false);
  });

  it("rejects every request when no key is configured", () => {
    expect(hasValidApiKey(request("Bearer "), undefined)).toBe(false);
    expect(hasValidApiKey(request("Bearer anything"), "")).toBe(false);
  });
});
