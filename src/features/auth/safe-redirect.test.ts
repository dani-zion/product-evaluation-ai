import { describe, expect, it } from "vitest";
import { getSafeRedirect } from "./safe-redirect";

describe("getSafeRedirect", () => {
  it("allows same-site relative paths", () => {
    expect(getSafeRedirect("/products/x")).toBe("/products/x");
    expect(getSafeRedirect("/products/x?tab=reviews#top")).toBe(
      "/products/x?tab=reviews#top",
    );
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "/\r/evil.com",
    "/ /evil.com",
    "/x\\..\\..\\evil",
    "",
    null,
    undefined,
  ])("rejects %s", (value) => {
    expect(getSafeRedirect(value)).toBe("/");
  });
});
