import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

/** The signed-in account, as stored in the session cookie. */
export type Session = {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
};

/** The account fields a session is created from. */
export type SessionAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const SESSION_COOKIE_NAME = "pe_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const ALGORITHM = "HS256";
const MIN_SECRET_LENGTH = 32;

/**
 * Cookie flags for the session: not readable from scripts, not sent on
 * cross-site POSTs, HTTPS-only in production.
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Read at call time, not at import, so `next build` works without env vars.
 * Throws when the secret is missing or too short.
 */
function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters. Generate one with \`openssl rand -base64 32\` and add it to .env.local.`,
    );
  }
  return new TextEncoder().encode(secret);
}

/** Signs a session token (JWT) for the account. Never includes password data. */
export async function createSessionToken(
  account: SessionAccount,
): Promise<string> {
  return new SignJWT({
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(account.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

/** Returns the session in a token, or null if it is invalid, tampered or expired. */
export async function verifySessionToken(
  token: string | undefined | null,
): Promise<Session | null> {
  if (!token) return null;

  let secret: Uint8Array;
  try {
    secret = getSecret();
  } catch (error) {
    // Without a secret no token can be trusted. Treat everyone as signed out
    // rather than breaking every page; sign-in itself will fail loudly.
    console.error("session verification skipped", error);
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
    });
    const { sub, firstName, lastName, email } = payload;
    if (
      typeof sub !== "string" ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string"
    ) {
      return null;
    }
    return { accountId: sub, firstName, lastName, email };
  } catch {
    return null;
  }
}

/** Reads and verifies the session cookie of the current request. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

/** Sets the session cookie. Only works in a Route Handler or Server Function. */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
}

/** Clears the session cookie. Only works in a Route Handler or Server Function. */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}
