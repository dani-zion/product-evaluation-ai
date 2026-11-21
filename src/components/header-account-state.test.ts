import { describe, expect, it } from "vitest";
import type { Session } from "@/server/auth/session";
import { getHeaderAccountState } from "./header-account-state";

const session: Session = {
  accountId: "acc_123",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
};

describe("getHeaderAccountState", () => {
  it("shows the account menu when signed in, on any page", () => {
    expect(getHeaderAccountState(session, "/")).toEqual({
      kind: "signed-in",
      session,
    });
    expect(getHeaderAccountState(session, "/auth/sign-up").kind).toBe(
      "signed-in",
    );
  });

  it("shows a sign-in link to visitors", () => {
    expect(getHeaderAccountState(null, "/")).toEqual({
      kind: "visitor",
      signInHref: "/auth/sign-in",
    });
  });

  it("brings visitors back to the page they were on", () => {
    expect(getHeaderAccountState(null, "/products/abc")).toEqual({
      kind: "visitor",
      signInHref: "/auth/sign-in?next=%2Fproducts%2Fabc",
    });
  });

  it("hides the sign-in link on auth pages", () => {
    expect(getHeaderAccountState(null, "/auth/sign-in").kind).toBe("hidden");
    expect(getHeaderAccountState(null, "/auth/sign-up").kind).toBe("hidden");
    expect(getHeaderAccountState(null, "/auth/sign-up/success").kind).toBe(
      "hidden",
    );
  });

  it("does not treat lookalike paths as auth pages", () => {
    expect(getHeaderAccountState(null, "/authors").kind).toBe("visitor");
  });
});
