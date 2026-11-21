import type { Session } from "@/server/auth/session";

export type HeaderAccountState =
  | { kind: "signed-in"; session: Session }
  | { kind: "visitor"; signInHref: string }
  | { kind: "hidden" };

/**
 * What the right side of the header shows: the account menu when signed in,
 * a "Sign in" link for visitors, and nothing for visitors on the auth pages
 * (they are already on the way to signing in).
 */
export function getHeaderAccountState(
  session: Session | null,
  pathname: string,
): HeaderAccountState {
  if (session) return { kind: "signed-in", session };
  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    return { kind: "hidden" };
  }
  const signInHref =
    pathname === "/"
      ? "/auth/sign-in"
      : `/auth/sign-in?next=${encodeURIComponent(pathname)}`;
  return { kind: "visitor", signInHref };
}
