import "server-only";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/server/auth/session";

/**
 * POST /api/v1/sign-out
 * - 204, and clears the session cookie (signed in or not)
 */
export function createSignOutHandler() {
  return async function POST(): Promise<Response> {
    const response = new NextResponse(null, { status: 204 });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      ...sessionCookieOptions(),
      maxAge: 0,
    });
    return response;
  };
}
